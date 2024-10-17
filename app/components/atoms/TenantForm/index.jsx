import React from 'react';

import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';

const TenantForm = ({ id, children, onSubmit, isDirty }) => {
  return (
    <React.Fragment>
      {isDirty ? (
        <Alert
          severity="warning"
          id="save-changes-warning"
          sx={{
            left: '50%',
            width: 'fit-content',
            position: 'sticky',
            top: '68px',
            transform: 'translateX(-50%)',
            zIndex: 1000
          }}
        >
          Please Save Changes
        </Alert>
      ) : null}
      <form id={id} onSubmit={onSubmit}>
        <Box
          aria-required="true"
          aria-label={'(*) indicates required field'}
          component="p"
        >
          (*) indicates required field
        </Box>
        {children}
      </form>
    </React.Fragment>
  );
};

export default TenantForm;
