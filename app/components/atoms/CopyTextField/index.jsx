import React from 'react';
import TextField from '@mui/material/TextField';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { PositionedSnackbar } from '../../molecules';

const CopyToClipboardTextField = (props) => {
  const [open, setOpen] = React.useState(false);
  const handleClickToCopy = () => {
    setOpen(true);
    props?.value && navigator.clipboard.writeText(props.value);
  };

  return (
    <React.Fragment>
      <TextField
        {...props}
        InputProps={{
          ...props.InputProps,
          endAdornment: (
            <ContentCopyIcon
              sx={{ cursor: 'pointer' }}
              onClick={handleClickToCopy}
            />
          )
        }}
      />
      <PositionedSnackbar
        open={open}
        autoHideDuration={2000}
        message={props?.message ? props.message : 'Copied to clipboard.'}
        severity="success"
        onClose={() => setOpen(false)}
      />
    </React.Fragment>
  );
};

export default CopyToClipboardTextField;
