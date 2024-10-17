import React from 'react';
import { Controller } from 'react-hook-form';

import Button from '@mui/material/Button';

const TenantFileField = ({
  control,
  error,
  label,
  name,
    variant,
  accept,
  ...props
}) => (

  <Button
    variant={variant}
    component="label"
    error={error}
    {...props}
  >
    <Controller
      name={name}
      control={control}
      render={({ field  }) => (
        <input
          type="file"
          accept={accept}
          hidden
          onChange={(e) => {field.onChange(e.target.files); }}
        />
      )}
    />
    {label}
  </Button>
);

export default TenantFileField;