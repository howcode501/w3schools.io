import React from 'react';
//import initStore from '../store';
//import axios from 'axios';
import { Container, Typography } from '@mui/material';
import Avatar from '@mui/material/Avatar';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import styles from '../../pages-css/login.module.scss';
import NonDashboardLayout from '../../Layouts/NonDashboardLayout';

const EmailAuth = () => {
  return (
    <Container component="main" maxWidth="xs">
      <div className={styles.mainBox}>
        <Avatar className={styles.loginAvatar}>
          <LockOutlinedIcon />
        </Avatar>
        <Typography
          component="div"
          variant="h5"
          className={styles.loginTitle}
          id="auth-link-sent-message"
        >
          An Email has been sent to you, <br />
          Please click the link in the email!
        </Typography>
      </div>
    </Container>
  );
};

EmailAuth.Layout = NonDashboardLayout;

export default EmailAuth;
