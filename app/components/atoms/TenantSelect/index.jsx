import React from 'react';
import {
  FormControl,
  FormHelperText,
  InputLabel,
  MenuItem,
  Select
} from '@mui/material';
import { Controller } from 'react-hook-form';

const TenantSelect = ({
  control,
  children,
  error,
  label,
  name,
  options,
  onSelect,
  fullWidth,
  variant,
  placeholder,
  ...props
}) => (
  <FormControl fullWidth={fullWidth} sx={{ mt: 2 }} error={error}>
    <InputLabel>{label}</InputLabel>
    <Controller
      name={name}
      control={control}
      render={({ field }) => (
        <Select
          {...field}
          label={label}
          fullWidth={fullWidth}
          variant={variant ? variant : 'outlined'}
          {...props}
        >
          {placeholder ? (
            <MenuItem key={0} value={-1}>
              {placeholder}
            </MenuItem>
          ) : null}
          {options?.length
            ? options.map((option) => (
                <MenuItem
                  key={option.id || option.name}
                  value={option.id || option.name}
                  onClick={() => onSelect && onSelect(option.id)}
                >
                  {option.display_name || option.name}
                </MenuItem>
              ))
            : null}
          {children ? children : null}
        </Select>
      )}
    />
    <FormHelperText>{error?.message || null}</FormHelperText>
  </FormControl>
);

export default TenantSelect;
