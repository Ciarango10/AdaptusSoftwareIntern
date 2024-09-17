const s3_driver = {
  add: (path, unscannedFiles) => {
    return new Promise((resolve, reject) => {
      if (!unscannedFiles || unscannedFiles.length === 0) {
        reject(new Error({ message: "No files provided to add", status: "error" }));
      }
      setTimeout(() => {
        console.log(`Files uploaded to ${path}`);
        resolve(unscannedFiles);
      }, 1000)
    });
  },
};

module.exports = s3_driver;
