import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { Container, TextField, Typography } from '@mui/material';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import styles from '../../../pages-css/login.module.scss';
import { useRouter } from 'next/router';
import { API_ROOT } from '../../../helpers/config';
import NonDashboardLayout from '../../../Layouts/NonDashboardLayout';
import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';
import { validatePassword } from '../../../helpers/functions';
import CustomerLogo from '../../../components/customer_logo';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';

const Login = () => {
  const [data, setData] = useState({ password: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [errorP, setErrorP] = useState();
  const [errorTextP, setErrorTextP] = useState();
  // const [error, setError] = useState();
  const [error1, setError1] = useState();
  const [errorText, setErrorText] = useState();
  const [status, setStatus] = useState();
  const [statusMsg, setStatusMsg] = useState();
  const [alert, alertShow] = useState(false);

  // const [count, setCount] = useState("3");
  const [req, setInvalidReq] = useState();
  //const[ms,setMs]=useState();
  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setData((data) => ({ ...data, [name]: value }));
  }, []);
  useEffect(() => {
    if (data.password !== undefined && data.password !== '') {
      // validate password //
      const response = validatePassword(data.password);
      if (!response.status) {
        setErrorP(true);
        setErrorTextP(response.msg);
      } else {
        setErrorP(false);
        setErrorTextP('');
      }
    }
    if (
      data.newpassword2 !== undefined &&
      data.newpassword2 !== data.password
    ) {
      setError1(true);
      setErrorText("Password don't match");
    } else {
      setError1(false);
      setErrorText('');
    }
  }, [handleChange, data]);

  const router = useRouter();
  const reset = router.query.token;

  useEffect(() => {
    const reset = window.location.href.split('/').pop();
    axios
      .get(`${API_ROOT}/auth/reset-password/${reset}`)
      .then((res) => {
        if (res.status === 200) {
          setInvalidReq(true);
        } else {
          // router.push({
          //   pathname: '/password/forgot-password',
          //   query: { ...router.query, isinvalid: 1 }
          // });
          // setInvalidReq(false);
        }
      })
      .catch(() => {
        // router.push({
        //   pathname: '/password/forgot-password',
        //   query: { ...router.query, isinvalid: 1 }
        // });
        // setInvalidReq(false);
      });
  }, [router]);
  const HandleSubmit = (e) => {
    e.preventDefault();

    // validate password //
    const response = validatePassword(data.password);
    if (!response.status) {
      setErrorP(true);
      setErrorTextP(response.msg);
    } else if (data.newpassword2 !== data.password) {
      setError1(true);
      setErrorText("Password don't match");
    } else {
      setError1(false);
      setErrorText('');
      setIsLoading(true);
      axios
        .patch(`${API_ROOT}/auth/reset-password/${reset}`, data)
        .then((res) => {
          if (res.status === 200) {
            setData({ password: '', newpassword2: '' });
            router.push('/');
            alertShow(true);
            setStatus('success');
            setStatusMsg(res.data.message);
            setIsLoading(true);
          }
        })
        .catch((err) => {
          alertShow(true);
          setStatus('error');
          setStatusMsg(err.response.data.error.message);
          setIsLoading(true);
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
            {req == true ? (
              <>
                <Avatar className={styles.loginAvatar}>
                  <LockOutlinedIcon />
                </Avatar>
                <Typography
                  component="div"
                  variant="h5"
                  className={styles.loginTitle}
                  id="reset-password-title"
                >
                  Reset Password
                </Typography>
                {alert == true ? (
                  <Alert severity={status} id="reset-password-status-alert">
                    <AlertTitle>{status}</AlertTitle>

                    {statusMsg}
                  </Alert>
                ) : (
                  ''
                )}
                <form noValidate className={styles.loginForm}>
                  <TextField
                    variant="outlined"
                    margin="normal"
                    required
                    fullWidth
                    name="password"
                    label="Password"
                    type="password"
                    id="password"
                    value={data?.password}
                    onChange={handleChange}
                    autoComplete="password"
                    error={errorP}
                    helperText={errorTextP}
                  />
                  <TextField
                    variant="outlined"
                    margin="normal"
                    required
                    fullWidth
                    name="newpassword2"
                    label="Re-Type New Password"
                    type="password"
                    id="newpassword2"
                    value={data?.newpassword2}
                    onChange={handleChange}
                    autoComplete="newpassword2"
                    error={error1}
                    helperText={errorText}
                  />
                  <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    disabled={isLoading}
                    onClick={HandleSubmit}
                    className={styles.loginButton}
                    id="reset-password-btn"
                  >
                    Reset Password
                  </Button>
                </form>
              </>
            ) : (
              <>{/*<h1 style={{textAlign: 'center'}}>{ms}</h1>*/}</>
            )}
          </div>
        </Grid>
      </Grid>
    </Container>
  );
};
Login.Layout = NonDashboardLayout;

export default Login;
