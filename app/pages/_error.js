/*
 * File Created for APP Inc
 * Project: nextjs-spike
 * User: ***
 * Date: 8/30/2021
 */

import React, { useEffect, useState } from 'react';

import CssBaseline from '@mui/material/CssBaseline';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import styles from '../pages-css/login.module.scss';
import NonDashboardLayout from '../Layouts/NonDashboardLayout';
import CustomerLogo from '../components/customer_logo';
import { useApi } from '../hooks';

const ErrorPage = () => {
  const [isLogin, setIsLogin] = useState(false);
  const { get } = useApi();

  useEffect(() => {
    async function fetchData() {
      return await get('/auth/refresh-token')
        .then(async (res) => {
          // eslint-disable-next-line no-unsafe-optional-chaining
          let { accessToken } = res?.data;
          if (accessToken) {
            setIsLogin(true);
          }
        })
        .catch(() => {
          setIsLogin(false);
        });
    }
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const handleRedirect = (e) => {
    e.preventDefault();
    if (isLogin) {
      window.location.href = '/';
    } else {
      window.location.href = '/';
    }
  };
  return (
    <Container component="main" maxWidth="xl">
      <Box sx={{ mt: 5, ml: 30 }}>
        <CustomerLogo />
      </Box>
      <Grid container sx={{ justifyContent: 'center', mt: -11 }}>
        <Grid item xs={3.5}>
          <CssBaseline />
          <div className={styles.mainBox} style={{ marginTop: 100 }}>
            <Typography
              component="div"
              variant="h5"
              className={styles.loginTitle}
              id="page-not-found-text"
            >
              Page you are looking for doesn&apos;t exist
              <br />
              <br />
              <Typography
                component="div"
                variant="h5"
                sx={{
                  color: 'blue',
                  textDecoration: 'underline',
                  cursor: 'pointer'
                }}
                onClick={handleRedirect}
                id="back-to-login-or-main"
              >
                Return to {isLogin ? 'main page' : 'login page'}
              </Typography>
            </Typography>
          </div>
        </Grid>
      </Grid>
    </Container>
  );
};

ErrorPage.Layout = NonDashboardLayout;

export default ErrorPage;
