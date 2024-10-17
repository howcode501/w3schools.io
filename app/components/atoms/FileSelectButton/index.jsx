import React from 'react';

import Button from '@mui/material/Button';

const FileSelectButton = ({ id, accept, title, onChange, ...btnProps }) => {
  const handleChangeFile = (event) => {
    const file = event.target.files[0];
    if (file && onChange) {
      onChange(file);
    }

    // Reset file select Input
    const emptyFile = new File([null], null, {
      type: 'text/plain'
    });
    const dataTransfer = new DataTransfer();
    dataTransfer.items.add(emptyFile);
    event.target.files = dataTransfer.files;
  };

  return (
    <Button
      variant="outlined"
      color="primary"
      size="small"
      id={`${id}_btn`}
      component="label"
      {...btnProps}
    >
      {title}
      <input
        type="file"
        hidden
        id={`${id}_input`}
        accept={accept}
        onChange={handleChangeFile}
      />
    </Button>
  );
};
export default FileSelectButton;
