import React, { useState, useEffect } from 'react';
import { Container, Typography } from '@mui/material';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import styles from '../../pages-css/login.module.scss';
import NonDashboardLayout from '../../Layouts/NonDashboardLayout';
import { TenantTextField } from '../../components';

import * as yup from 'yup';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { AUTH_ENDPOINT, GOOGLE_RECAPTCHA } from '../../helpers/config';
import axios from 'axios';
import Alert from '@mui/material/Alert';
import { useRouter } from 'next/router';
import CustomerLogo from '../../components/customer_logo';

//NextJS Imports
import Link from 'next/link';

const ForgotPassword = () => {
  const [error, setError] = useState(null);
  const [submitStatus, setSubmitStatus] = useState(false);
  const [moveForward, setMoveForward] = useState(true);
  const [emailLinkError, setEmailLinkError] = useState(null);
  let router = useRouter();

  // Validation Schema
  const validationSchema = yup.object({
    username: yup
      .string('Email Address')
      .trim()
      .email('Enter a valid email')
      .min(3, 'Email should be of minimum 3 characters in length.')
      .max(75, 'Email should be less than 75 characters in length.')
      .required('An Email Address is required to login.')
      .test(
        'validator',
        'We were unable to find an account matching the information you entered.',
        async (value, { createError }) => {
          if (value !== undefined && value !== '') {
            const result = await validateUsername(value);
            if (!result.status) {
              return createError({ message: result.message });
            }
          }
          // WHEN THE VALUE IS EMPTY RETURN `true` by default
          return true;
        }
      )
  });

  useEffect(() => {
    if (router.asPath == '/password/forgot-password?isinvalid=1') {
      setEmailLinkError('Link valid for one time use only.');
    }
  }, [router.asPath]);

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
      rememberMe: false
    }
  });

  function validateUsername(valueToCheck) {
    return new Promise((resolve) => {
      //Use Google Recaptcha to check for Humans
      if (GOOGLE_RECAPTCHA && GOOGLE_RECAPTCHA !== '') {
        //eslint-disable-next-line
        grecaptcha.ready(function () {
          //eslint-disable-next-line
          grecaptcha
            .execute(GOOGLE_RECAPTCHA, { action: 'submit' })
            .then((token) => {
              //Prepare for transit
              let data = {};
              data.recaptcha = token;
              data.username = valueToCheck.toString().toLowerCase().trim();
              axios
                .request({
                  url: `${AUTH_ENDPOINT}/check-user`,
                  method: 'post',
                  data,
                  withCredentials: true
                })
                .then((res) => {
                  if (res.status === 200) {
                    if (res.data.valid) {
                      if (
                        res.data.method !== 'password' &&
                        res.data.method !== 'password-otp'
                      ) {
                        resolve({
                          status: false,
                          message:
                            'Access denied!  Please contact your Administrator.'
                        });
                      }
                      resolve({ status: true });
                    } else {
                      resolve({ status: false });
                    }
                  }
                })
                .catch(function (error) {
                  resolve({
                    status: true,
                    message: error.response.data.error
                  });
                });
            })
            .catch(function (error) {
              resolve({ status: false, message: error.response.data.error });
            });
        });
      }
    });
  }

  const SendPasswordReset = async (data) => {
    setSubmitStatus(true);

    //Use Google Recaptcha to check for Humans
    if (GOOGLE_RECAPTCHA && GOOGLE_RECAPTCHA !== '' && moveForward === true) {
      //eslint-disable-next-line
      grecaptcha.ready(function () {
        //eslint-disable-next-line
        grecaptcha
          .execute(GOOGLE_RECAPTCHA, { action: 'submit' })
          .then((token) => {
            //Build the data that will get sent to the API
            data.recaptcha = token;
            SendPasswordReset2(data);
          })
          .catch(function () {
            setSubmitStatus(false);
            setMoveForward(false);
            setError(
              'There was an error validating you are human. - Recaptcha Error'
            );
          });
      });
    } else if (moveForward === true) {
      SendPasswordReset2(data);
    }
  };

  // Once Recaptcha work is done, we send the submitted username to the server and determine its availability
  const SendPasswordReset2 = async (data) => {
    //If it's okay to move forward, send the data to the API
    if (moveForward === true) {
      axios
        .request({
          url: `${AUTH_ENDPOINT}/forgot-password`,
          method: 'post',
          data,
          withCredentials: true
        })
        .then(() => {
          router.push({ pathname: '/password/confirm1' });
        })
        .catch(() => {
          router.push({ pathname: '/password/confirm1' });
        });
    }
  };

  return (
    <Container component="main" maxWidth="xl">
      <Box sx={{ mt: 5, ml: 30 }}>
        <CustomerLogo />
      </Box>
      <Grid container sx={{ justifyContent: 'center', mt: -11 }}>
        <Grid item xs={3.5}>
          <div className={styles.mainBox}>
            <Avatar className={styles.loginAvatar}>
              <LockOutlinedIcon />
            </Avatar>
            <Typography
              component="div"
              variant="h5"
              className={styles.loginTitle}
              id="forgot-password-title"
            >
              Forgot Password
            </Typography>
            {error && (
              <Alert severity="error" id={'error-text'}>
                {error}
              </Alert>
            )}
            {emailLinkError && (
              <>
                <br />
                <Alert severity="error" id={'error-text'}>
                  {emailLinkError}
                </Alert>
              </>
            )}
            <form
              key={1}
              onSubmit={handleSubmit((data) => SendPasswordReset(data))}
              id={'login-form'}
            >
              <TenantTextField
                id={'username-field'}
                name={'username'}
                control={control}
                label={'Email Address'}
                variant="outlined"
                margin="normal"
                fullWidth
                error={!!errors.username}
                autoComplete={'email'}
                helperText={errors.username ? errors.username?.message : null}
              />
              <Button
                type="submit"
                fullWidth
                variant="contained"
                disabled={submitStatus}
                className={styles.loginButton}
                id={'login-button-next-step'}
              >
                Send Password Reset Email
              </Button>
              <Grid container sx={{ pt: '10px' }}>
                <Grid
                  item
                  xs
                  sx={{
                    textAlign: 'center',
                    fontSize: '19px',
                    fontWeight: '800'
                  }}
                >
                  <Link id="back-to-login-link" href="/" variant="body2">
                    Back To Login
                  </Link>
                </Grid>
              </Grid>
            </form>
          </div>
        </Grid>
      </Grid>
    </Container>
  );
};

ForgotPassword.Layout = NonDashboardLayout;

export default ForgotPassword;
