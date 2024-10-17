import React from 'react';

import { FormControlLabel, Switch } from '@mui/material';
import { Controller } from 'react-hook-form';

const TenantSwitch = ({ control, defaultValue, label, name, ...props }) => (
  <Controller
    as={Switch}
    name={name}
    control={control}
    defaultValue={defaultValue}
    render={({ field: { onChange, value } }) => (
      <FormControlLabel
        control={<Switch checked={value} onChange={onChange} />}
        label={label}
        {...props}
      />
    )}
  />
);

export default TenantSwitch;
