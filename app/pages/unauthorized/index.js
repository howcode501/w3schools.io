/*
 * File Created for APP Inc
 * Project: nextjs-spike
 * User: ***
 * Date: 01/10/2021
 */

import React from 'react';
import { Container, Typography } from '@mui/material';
import styles from '../../pages-css/login.module.scss';
import dashboardLayout from '../../Layouts/dashboardLayout';
const Unauthorized = () => {
  return (
    <Container component="main" maxWidth="xs">
      <div className="mt-15">
        <Typography
          component="div"
          variant="h5"
          className={styles.loginTitle}
          id="page-forbidden-text"
        >
          Sorry, You are not authorized to access this page.
        </Typography>
      </div>
    </Container>
  );
};

Unauthorized.Layout = dashboardLayout;

export default Unauthorized;
