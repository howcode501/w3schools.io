import { useState, forwardRef } from 'react';
import Snackbar from '@mui/material/Snackbar';
import MuiAlert from '@mui/material/Alert';

export default function PositionedSnackbar(props) {
  const [state, setState] = useState({
    open: props.open,
    vertical: props?.anchorOrigin?.vertical
      ? props?.anchorOrigin?.vertical
      : 'top',
    horizontal: props?.anchorOrigin?.horizontal
      ? props?.anchorOrigin?.horizontal
      : 'right'
  });
  const { vertical, horizontal } = state;

  const handleSnackbarClose = () => {
    setState({ ...state, open: false });
  };

  //MUI alert
  const Alert = forwardRef(function Alert(props, ref) {
    return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
  });

  return (
    <div>
      <Snackbar
        open={state.open}
        autoHideDuration={3000}
        onClose={props?.onClose ? props.onClose : handleSnackbarClose}
        anchorOrigin={{ vertical, horizontal }}
        sx={{ marginTop: '4rem' }}
        {...props}
      >
        <Alert severity={props?.severity} sx={{ width: '100%' }}>
          {props?.message}
        </Alert>
      </Snackbar>
    </div>
  );
}
