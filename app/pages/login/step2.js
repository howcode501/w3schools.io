//Import React
import React, { useEffect } from 'react';
import { connect, useDispatch } from 'react-redux';
import axios from 'axios';

//Import NextJS Components
import { useRouter } from 'next/router';
import Link from 'next/link';

//Import Material Stuff
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import { TenantTextField } from '../../components';

//Import Application Code
import { API_ROOT } from '../../helpers/config';
import styles from '../../pages-css/login.module.scss';
import NonDashboardLayout from '../../Layouts/NonDashboardLayout';
import TokenService from '../../services/token';
import CustomerLogo from '../../components/customer_logo';

import { useForm } from 'react-hook-form';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';

const Step2 = (props) => {
  const router = useRouter();
  const dispatch = useDispatch();

  //Once loaded, check Redux for a username, if there add it to data
  useEffect(() => {
    /* props.login.client.username
        ? setData((data) => ({...data, username: props.login.client.username}))
        : null; */

    setValue('username', props.login.client.username, true);

    // Restrict re-captcha to login pages //
    toggleCaptchaBadge(true);
    return () => toggleCaptchaBadge(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props]);

  const getCookieValue = (name) =>
    document.cookie.match('(^|;)\\s*' + name + '\\s*=\\s*([^;]+)')?.pop() || '';

  //TODO Password Strength Validation.  We will probably want to validate it here, just to make sure it matches our validation schema
  const validationSchema = yup.object({
    password: yup
      .string('Enter Password')
      .trim()
      .max(100, 'Passwords should be less than 100 Characters.')
      .required('Password is required')
  });

  const {
    handleSubmit,
    control,
    setValue,
    formState: { errors }
  } = useForm({
    mode: 'onSubmit',
    reValidateMode: 'onChange',
    resolver: yupResolver(validationSchema),
    defaultValues: {
      password: '',
      username: '',
      rememberMe: false
    }
  });

  const sendToDatabase = (data) => {
    // Handle user name invalid case
    if (!props.login.client.valid) {
      router.push('/login/nomatch');
      return;
    }

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
        router.push('/login/nomatch');
      });
  };

  // Restrict Re-captcha to login steps
  const toggleCaptchaBadge = (show) => {
    const badge = document.getElementsByClassName('grecaptcha-badge')[0];
    if (badge && badge instanceof HTMLElement) {
      badge.style.visibility = show ? 'visible' : 'hidden';
    }
  };
  return props?.login?.client?.username == '' ||
    props?.login?.client?.username == undefined ? (
    <Container component="main" maxWidth="xs">
      <div>
        <Avatar className={styles.loginAvatar}>
          <LockOutlinedIcon />
        </Avatar>
        <Typography
          id="login-step2-title"
          component="div"
          variant="h5"
          align={'center'}
        >
          Login - Step 2<br />
        </Typography>
        <Typography
          component="div"
          variant="h5"
          align={'center'}
          sx={{ mt: 10 }}
          id="login-error-message-text"
        >
          It appears we are experiencing difficulty signing you in.
          <br />
          Error: NU01
          <br />
          Click on the link to go to the login page
          <br />
          <br />
          <Link href="/">Login</Link>
          <br />
          <br />
          If this problem persists, please contact us at{' '}
          <a href={'https://thoughtcastowners.com'}>thoughtcastowners.com</a>
        </Typography>
      </div>
    </Container>
  ) : (
    <Container component="main" maxWidth="xl">
      <Box sx={{ mt: 5, ml: 30 }}>
        <CustomerLogo />
      </Box>
      <Grid container sx={{ justifyContent: 'center', mt: -11 }}>
        <Grid item xs={3.5}>
          <div>
            <Avatar className={styles.loginAvatar}>
              <LockOutlinedIcon />
            </Avatar>
            <Typography
              id="login-step2-status-text"
              component="div"
              variant="h5"
              align={'center'}
            >
              Login - Step 2<br />
              Signing in as {props?.login?.client?.username}
            </Typography>
            <form
              key={1}
              id="login-step2-form"
              onSubmit={handleSubmit((data) => sendToDatabase(data))}
            >
              <input
                type="hidden"
                name="username"
                id="user-name-field-hidden"
              />
              <input
                type="hidden"
                name="rememberMe"
                id="user-remember-field-hidden"
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
              />
              <Button
                type="submit"
                fullWidth
                variant="contained"
                className={styles.loginButton}
                id="login-button"
              >
                Login
              </Button>
              <Grid container style={{ paddingTop: 10 }}>
                <Grid item xs>
                  <Link
                    href="/password/forgot-password"
                    variant="body2"
                    id={'login-forgot-password-link'}
                  >
                    Forgot Password?
                  </Link>
                </Grid>
              </Grid>
            </form>
          </div>
        </Grid>
      </Grid>
    </Container>
  );
  /*  );*/
};

Step2.Layout = NonDashboardLayout;

export default connect((state) => state)(Step2);
