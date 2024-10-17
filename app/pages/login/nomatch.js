import React from 'react';
import { Container, Typography } from '@mui/material';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import styles from '../../pages-css/login.module.scss';
import NonDashboardLayout from '../../Layouts/NonDashboardLayout';
import CustomerLogo from '../../components/customer_logo';

const Step3 = () => {
  //const auth = useProvideAuth();

  return (
    <Container component="main" maxWidth="xl">
      <Box sx={{ mt: 5, ml: 30 }}>
        <CustomerLogo />
      </Box>
      <Grid container sx={{ justifyContent: 'center', mt: -11 }}>
        <Grid item xs={3.5}>
          <div className={styles.mainBox}>
            <Avatar className={styles.loginAvatar} id="login-avatar">
              <LockOutlinedIcon />
            </Avatar>
            <Typography
              component="div"
              variant="h5"
              className={styles.loginTitle}
              id="login-issue-title"
            >
              There was a problem
            </Typography>
            <br />
            <br />
            <Typography
              component="div"
              variant="h6"
              className={styles.loginTitle}
              id="login-failed-alert-text"
            >
              Username or password is invalid,
              <br /> please try again!
              <br />
              <br />
              <a href={'/'} id="login-try-again-link">
                Click Here to Try Again
              </a>
            </Typography>
          </div>
        </Grid>
      </Grid>
    </Container>
  );
};

Step3.Layout = NonDashboardLayout;

export default Step3;
