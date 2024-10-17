//React Imports
import React, { useState, useEffect } from 'react';

//Material UI Imports
import Grid from '@mui/material/Grid';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';

import { TenantTextField } from '../components';

//Material UI Icon Imports
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';

//Application Imports
import styles from '../pages-css/login.module.scss';
import NonDashboardLayout from '../Layouts/NonDashboardLayout';
import { setUsername } from '../store/reducers/login/actions';
import { API_ROOT } from '../helpers/config';

//NextJS Imports
import { useRouter } from 'next/router';
import Link from 'next/link';

//External Module Imports
import { connect, useDispatch } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as yup from 'yup';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import axios from 'axios';
import CustomerLogo from '../components/customer_logo';
import { useApi } from '../hooks';
import TokenService from '../services/token';

const Index = () => {
  const [error, setError] = useState(null);
  let router = useRouter();
  const dispatch = useDispatch();
  const { get } = useApi();
  // Validation Schema
  const validationSchema = yup.object({
    username: yup
      .string('Email Address')
      .email('Enter a valid email')
      .trim()
      .required('An Email Address is required to login.'),
    password: yup
      .string('Enter Password')
      .trim()
      .min(8, 'Password must be at least 8 characters')
      .required('Password is required')
  });

  // Restrict Re-captcha to login steps
  const toggleCaptchaBadge = (show) => {
    const badge = document.getElementsByClassName('grecaptcha-badge')[0];
    if (badge && badge instanceof HTMLElement) {
      badge.style.visibility = show ? 'visible' : 'hidden';
    }
  };

  //
  const {
    handleSubmit,
    control,
    formState: { errors }
  } = useForm({
    mode: 'onSubmit',
    reValidateMode: 'onChange',
    resolver: yupResolver(validationSchema),
    defaultValues: {
      username: '',
      password: '',
      rememberMe: false
    }
  });

  useEffect(() => {
    // Restrict re-captcha to login pages //
    toggleCaptchaBadge(true);
    async function fetchData() {
      if (router.asPath == '/login') {
        await get('/auth/refresh-token')
          .then((res) => {
            let { accessToken } = res.data;
            TokenService.getDecodedToken(accessToken);
            router.push('/applications');
          })
          .catch(() => {});
      }
    }
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router.asPath]);

  const getCookieValue = (name) =>
    document.cookie.match('(^|;)\\s*' + name + '\\s*=\\s*([^;]+)')?.pop() || '';

  const sendToDatabase = (data) => {
    axios
      .request({
        url: `${API_ROOT}/auth/login`,
        method: 'post',
        data,
        withCredentials: true
      })
      .then((res) => {
        if (res.status === 200) {
          let { accessToken } = res.data;

          //Set the session variables for them
          const userData = TokenService.getDecodedToken(accessToken);

          // Update global user state
          dispatch({
            type: 'UPDATE_ACCESS_TOKEN',
            isLogin: true,
            token: accessToken,
            userData: userData
          });

          //Now let's check and see if a redirect cookie has been set, if not go to the main page
          if (getCookieValue('open-redirect')) {
            //Extract the cookie from the URL
            const redirectUrl = decodeURIComponent(
              decodeURI(getCookieValue('open-redirect'))
            );

            //Delete the cookie
            document.cookie =
              'open-redirect= ;path=/;expires=Thu, 01 Jan 1970 00:00:00 GMT;';

            //Redirect the user to the cookie URL
            if (
              userData?.roles.includes('msp') ||
              userData?.roles.includes('administrator')
            ) {
              router.push('/users');
            } else {
              router.push(redirectUrl);
            }
          } else {
            if (
              userData?.roles.includes('msp') ||
              userData?.roles.includes('administrator')
            ) {
              router.push('/users');
            } else {
              router.push('/applications');
            }
          }
        }
      })
      .catch(function () {
        setError('Invalid email or password. Please try again!');
      });
  };

  return (
    <Container component="main" maxWidth="xl" id="login-container">
      <Box sx={{ mt: 5, ml: 30 }}>
        <CustomerLogo />
      </Box>
      <Grid container sx={{ justifyContent: 'center', mt: -11 }}>
        <Grid item xs={3.5}>
          <div className={styles.mainBox} id="main-box">
            <Avatar className={styles.loginAvatar} id={'login-avatar'}>
              <LockOutlinedIcon id={'login-avatar-lock-icon'} />
            </Avatar>
            <Typography
              id={'login-title'}
              component="div"
              variant="h5"
              className={styles.loginTitle}
            >
              ThoughtCast Portal Login
            </Typography>
            {error && (
              <Alert severity="error" id={'error-text'}>
                {error}
              </Alert>
            )}
            <form
              key={1}
              onSubmit={handleSubmit((data) => sendToDatabase(data))}
              id={'login-form'}
            >
              <TenantTextField
                id={'username-field'}
                name={'username'}
                control={control}
                label={'Email Address *'}
                variant="outlined"
                margin="normal"
                fullWidth
                error={!!errors.username}
                autoComplete={'off'}
                helperText={errors.username ? errors.username?.message : null}
                InputLabelProps={{ shrink: true }}
              />
              <TenantTextField
                type={'password'}
                id="password"
                name={'password'}
                control={control}
                label={'Password *'}
                variant="outlined"
                margin="normal"
                fullWidth
                error={!!errors.password}
                helperText={errors.password ? errors.password?.message : null}
                autoComplete="off"
                InputLabelProps={{ shrink: true }}
              />
              <Button
                id="login-button-next-step"
                type="submit"
                fullWidth
                variant="contained"
                className={styles.loginButton}
              >
                Log In &gt;&gt;
              </Button>
              <Grid container style={{ paddingTop: 10 }}>
                <Grid item xs>
                  <Link
                    id="login-forgot-password-link"
                    href="/password/forgot-password"
                    variant="body2"
                  >
                    Forgot Password?
                  </Link>
                </Grid>
              </Grid>
              <Button
                sx={{ mt: 4 }}
                id="signup-button"
                fullWidth
                href="/signup"
                variant="outlined"
              >
                Activate New Account
              </Button>
            </form>
          </div>
        </Grid>
      </Grid>
    </Container>
  );
};

Index.Layout = NonDashboardLayout;

const mapDispatchToProps = (dispatch) => {
  return {
    setUsername: bindActionCreators(setUsername, dispatch)
  };
};

export default connect((state) => state, mapDispatchToProps)(Index);
