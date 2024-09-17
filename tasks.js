module.exports = (resources) => {
  const my = {};
  const shared = {
    PATH: "s3://my-bucket/adaptus",
    S3_DRIVER: require("./s3_driver"), // Shared module for handling interactions with AWS S3
  };

  // ============================================================================

  my.run = async (input) => {
    const { bundled_config, _debug } = resources;
    let output = {};

    try {
      // Load, validate, and set up input data
      const data = await setup(await validate(await load(input)));

      // Business logic: Filter out file IDs that have not been scanned and do not have errors
      const unscannedFiles = data.files.filter(
        (fileId) =>
          !data.scanned_files.includes(fileId) &&
          !data.errored_files.includes(fileId)
      );

      // Upload the unscanned files to AWS S3
      output = await shared.S3_DRIVER.add(shared.PATH, unscannedFiles);
    } catch (e) {
      if (e.message) {
        throw new Error(e.message);
      }
      // Default case
      _debug(e.stack);
      throw e;
    }

    return output;

    async function load(input = {}) {
      const config = {};
      config.files = input.files;
      config.scanned_files = input.scanned_files;
      config.errored_files = input.errored_files;
      return config;
    }

    async function setup(config) {
      const data = { ...config };
      // Ensure all files IDs are strings
      data.files = data.files.map((fileId) =>
        typeof fileId === "string" ? fileId : fileId.toString()
      );
      data.scanned_files = data.scanned_files.map((fileId) =>
        typeof fileId === "string" ? fileId : fileId.toString()
      );
      data.errored_files = data.errored_files.map((fileId) =>
        typeof fileId === "string" ? fileId : fileId.toString()
      );
      return data;
    }

    async function validate(config) {
      [
        [config.files, "Files"],
        [config.scanned_files, "Scanned Files"],
        [config.errored_files, "Errored Files"],
      ].forEach(([item, name]) => {
        if (!item) {
          throw new Error("MissingInput: " + name);
        }
      });

      if (config.files.length === 0) throw new Error("Files are needed"); // Ensure there are files to process
      return config;
    }
  };

  return my;
};
