import useApi from './useApi';

const useS3Uploader = () => {
  const { del, post } = useApi();

  const removeHandler = (name) => {
    return del('/api/upload/attachment', { data: name });
  };

  const uploadHandler = ({
    blob,
    contentType,
    ext,
    path,
    pageType,
    fileName
  }) => {
    return new Promise((resolve, reject) => {
      post('/api/upload/attachment', {
        contentType,
        ext,
        path,
        pageType,
        fileName
      })
        .then(async (res) => {
          const url = `${res.data.url}/${res.data.fields.key}`;
          const data = res?.data;
          const fileName1 = `${res.data.fields.key}`;
          const file = new File([blob], fileName1);
          const formData = new FormData();
          Object.keys(res.data.fields).forEach((key) => {
            formData.append(key, res.data.fields[key]);
          });
          formData.append('file', file);

          // Call api to update the S3 bucket with the file
          await fetch(`${res.data.url}`, {
            method: 'POST',
            body: formData
          }).then((res) => {
            if (res.status === 204) {
              resolve(data);
            }
          });
        })
        .catch((e) => {
          reject(e);
        });
    });
  };

  const uploadImageHandler = async (blob, path, pageType) => {
    if (!blob) return null;
    let contentType = '';
    let ext = '';
    let blobData = '';
    let fileName = '';

    if (blob.type) {
      fileName = blob.name;
      contentType = blob.type;
      ext = contentType.split('/')[1];
      blobData = blob;
    } else {
      //converting the file reader data to binary format
      const binary = atob(blob.split(',')[1]);
      contentType = blob.split(';')[0].split(':')[1];
      ext = contentType.split('/')[1];
      const array = [];
      for (let i = 0; i < binary.length; i++) {
        array.push(binary.charCodeAt(i));
      }
      blobData = new Blob([new Uint8Array(array)], { type: contentType });
    }

    const data = await uploadHandler({
      blob: blobData,
      contentType,
      path,
      ext,
      pageType,
      fileName
    });

    return data;
  };

  return [uploadImageHandler, removeHandler];
};

export default useS3Uploader;
