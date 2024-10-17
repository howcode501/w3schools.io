const useFileToBlob = () => {
  const fileToBlobHandler = (file) => {
    return new Promise((resolve, reject) => {
      if (!file) {
        reject('File is missing');
      }

      file
        .arrayBuffer()
        .then((arrayBuffer) => {
          const blob = new Blob([new Uint8Array(arrayBuffer)], {
            type: file.type
          });
          resolve(blob);
        })
        .catch((e) => reject(e));
    });
  };

  return [fileToBlobHandler];
};

export default useFileToBlob;
