import Resizer from 'react-image-file-resizer';

const useResizeImageHandler = () => {
  const handleResizeImage = ({
    file,
    maxWidth,
    maxHeight,
    compressFormat = 'PNG',
    quality = 100,
    rotation = 0,
    outputType = 'base64',
    minWidth,
    minHeight
  }) =>
    new Promise((resolve) => {
      Resizer.imageFileResizer(
        file,
        maxWidth,
        maxHeight,
        compressFormat,
        quality,
        rotation,
        (uri) => {
          resolve(uri);
        },
        outputType,
        minWidth,
        minHeight
      );
    });

  return handleResizeImage;
};

export default useResizeImageHandler;
