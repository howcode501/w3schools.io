/*
 * File Created for APP Inc
 * Project: app
 * User: ***
 * Date: 9/24/2021
 */
import { createTheme } from '@mui/material/styles';
import { red } from '@mui/material/colors';

// Create a theme instance.
const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#085394'
    },
    secondary: {
      main: '#9FC5F8'
    },
    error: {
      main: red.A700
    },
    tonalOffset: 0.3,
    text: {
      secondary: '#333'
    }
  }
});

export default theme;
