/*
 * File Created for APP Inc
 * Project: nextjs-spike
 * User: ***
 * Date: 8/30/2021
 */

import React from 'react';
//import initStore from '../store';
//import axios from 'axios';
import { Container, Typography } from '@mui/material';
import Avatar from '@mui/material/Avatar';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import styles from '../../pages-css/login.module.scss';
import NonDashboardLayout from '../../Layouts/NonDashboardLayout';

const Step3 = () => {
  //const auth = useProvideAuth();
  //const router = useRouter();

  return (
    <Container component="main" maxWidth="xs">
      <div className={styles.mainBox}>
        <Avatar className={styles.loginAvatar}>
          <LockOutlinedIcon />
        </Avatar>
        <Typography
          id="reset-password-confirm-email-title"
          component="div"
          variant="h5"
          className={styles.loginTitle}
        >
          Email on the Way!
        </Typography>
        <br />
        <br />
        <Typography
          id="reset-password-guide-text"
          component="div"
          variant="h6"
          className={styles.loginTitle}
        >
          If there is an account that matches your email in our system, we will
          send a password reset email right away.
          <br />
          <br />
          <a id="goto-login-link" href={'/'}>
            Click Here to go to Login
          </a>
        </Typography>
      </div>
    </Container>
  );
};

Step3.Layout = NonDashboardLayout;

export default Step3;
