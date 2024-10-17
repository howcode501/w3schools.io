import React from 'react';

import { TextField } from '@mui/material';
import { Controller } from 'react-hook-form';

const TenantTextField = ({
  control,
  error,
  label,
  name,
  variant,
  ...props
}) => (
  <Controller
    as={TextField}
    name={name}
    control={control}
    render={({ field: { onChange, value, onBlur } }) => (
      <TextField
        onChange={onChange}
        onBlur={onBlur}
        value={value}
        error={error}
        helperText={error?.message}
        label={label}
        variant={variant ? variant : 'outlined'}
        margin="normal"
        {...props}
      />
    )}
  />
);

export default TenantTextField;
