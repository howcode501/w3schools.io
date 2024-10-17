import React from 'react';

//Material UI Imports
import TextField from '@mui/material/TextField';
import { styled } from '@mui/material/styles';

const CustomTextField = (props) => {
  const CustomDisableInput = styled(TextField)(() => ({
    'label,MuiFormLabel-root.MuiInputLabel-root.MuiInputLabel-formControl.MuiInputLabel-animated.MuiInputLabel-shrink.MuiInputLabel-outlined.MuiFormLabel-colorPrimary.Mui-disabled.MuiFormLabel-filled.MuiInputLabel-root.MuiInputLabel-formControl.MuiInputLabel-animated.MuiInputLabel-shrink.MuiInputLabel-outlined,.MuiInputBase-input.Mui-disabled':
      {
        WebkitTextFillColor: '#000',
        color: '#000'
      }
  }));

  return (
    <>
      <CustomDisableInput {...props} />
    </>
  );
};

export default CustomTextField;
