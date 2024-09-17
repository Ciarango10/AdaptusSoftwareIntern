const tasks = require("./tasks");
const s3_driver = require('./s3_driver');

test("should throw error when files array is missing", async () => {
  const input = {
    scanned_files: ["file1", "file2"],
    errored_files: ["file3"],
  };

  const instance = tasks({ _debug: console.error });
  await expect(instance.run(input)).rejects.toThrow("MissingInput: Files");
});

test("should throw error when scanned_files array is missing", async () => {
  const input = {
    files: ["file1", "file2"],
    errored_files: ["file3"],
  };

  const instance = tasks({ _debug: console.error });
  await expect(instance.run(input)).rejects.toThrow("MissingInput: Scanned Files");
});

test("should throw error when errored_files array is missing", async () => {
  const input = {
    files: ["file1", "file2"],
    scanned_files: ["file3"],
  };

  const instance = tasks({ _debug: console.error });
  await expect(instance.run(input)).rejects.toThrow("MissingInput: Errored Files");
});

test("should throw error when files array is empty", async () => {
  const input = {
    files: [],
    scanned_files: ["file1", "file2"],
    errored_files: ["file3"],
  };

  const instance = tasks({ _debug: console.error });
  await expect(instance.run(input)).rejects.toThrow("Files are needed");
});

test('should convert integer file IDs to strings', async () => {
    jest.spyOn(s3_driver, 'add').mockResolvedValue(["123"]);

    const input = {
      files: [123, "file1", "file2"],
      scanned_files: ["file1"],
      errored_files: ["file2"]
    };
  
    const instance = tasks({ _debug: console.error });
    const result = await instance.run(input);
    
    expect(result).toEqual(["123"]);
});

test('should upload unscanned files to S3', async () => {
    jest.spyOn(s3_driver, 'add').mockResolvedValue(["file4"]);

    const input = {
      files: ["file1", "file2", "file3", "file4"],
      scanned_files: ["file1", "file2"],
      errored_files: ["file3"]
    };
  
    const instance = tasks({ _debug: console.error });
    const result = await instance.run(input);
    
    expect(result).toEqual(["file4"]);
});

test('should throw error when S3 upload fails', async () => {
    jest.spyOn(s3_driver, 'add').mockImplementation(() => {
        return Promise.reject(new Error("No files provided to upload"));
    });

    const input = {
      files: ["file1", "file2", "file3"],
      scanned_files: ["file1", "file2"],
      errored_files: ["file3"]
    };
  
    const instance = tasks({ _debug: console.error });
    await expect(instance.run(input)).rejects.toThrow("No files provided to upload");
});