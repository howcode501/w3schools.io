//React Imports
import React, { useState } from 'react';

//Material UI Imports
import Grid from '@mui/material/Grid';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';

//Material UI Icon Imports
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import { TenantTextField } from '../../components';

//Application Imports
import styles from '../../pages-css/login.module.scss';
import NonDashboardLayout from '../../Layouts/NonDashboardLayout';
import { setUsername } from '../../store/reducers/login/actions';
import { AUTH_ENDPOINT, GOOGLE_RECAPTCHA } from '../../helpers/config';

//NextJS Imports
import { useRouter } from 'next/router';

//External Module Imports
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as yup from 'yup';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import axios from 'axios';
import CustomerLogo from '../../components/customer_logo';
import { useApi, useCacheAsyncValidator } from '../../hooks';
import { EMOJIS_REGEX } from '../../helpers/constants';

const Index = () => {
  const [error, setError] = useState(null);
  const [submitStatus, setSubmitStatus] = useState(false);
  const [moveForward, setMoveForward] = useState(true);
  const [code, setCode] = useState(false);
  const [showCodeForm, setShowCodeForm] = useState(true);
  const [showSignUpForm, setShowSignUpForm] = useState(false);
  let router = useRouter();
  const { post } = useApi();
  // Validation Schema
  const validationSchema = yup.object({
    code: yup
      .string('Activation code')
      .trim()
      .required('An Activation Code is required to Signup.')
  });

  function notValidUsername(valueToCheck) {
    return new Promise((resolve) => {
      if (!valueToCheck) {
        return true;
      }

      post(`${AUTH_ENDPOINT}/validate-user`, {
        email: valueToCheck.toString().toLowerCase().trim()
      }).then((res) => {
        if (res.status === 200) {
          if (res.data.data.exists) {
            resolve(false);
          } else {
            resolve(true);
          }
        } else {
          resolve(true);
        }
      });
    });
  }

  const [userEmailTest] = useCacheAsyncValidator(notValidUsername);

  const validationSchema2 = yup.object({
    email: yup
      .string('Enter your email')
      .email('Enter a valid email')
      // eslint-disable-next-line no-useless-escape
      .matches(/^([A-Za-z0-9_\-\.])+\@([A-Za-z0-9_\-\.])+\.([A-Za-z]{2,4})$/)
      .required('Email is required')
      .trim()
      .test(
        'validator',
        'A user with the same email already exists. Please choose another email.',
        userEmailTest
      ),
    first_name: yup
      .string('Name Should contain letters.')
      .min(3, 'First Name should be of minimum 3 characters length')
      .max(150, 'First Name should be less than 150 Characters')
      .required('First Name is required')
      .matches(
        EMOJIS_REGEX,
        'Emojis are not allowed in First Name. Please choose another name.'
      ),
    last_name: yup
      .string('Name Should contain letters.')
      .min(3, 'Last Name should be of minimum 3 characters length')
      .max(150, 'Last Name should be less than 150 Characters')
      .required('Last Name is required')
      .matches(
        EMOJIS_REGEX,
        'Emojis are not allowed in Last Name. Please choose another name.'
      ),
    password: yup
      .string('Password')
      .required('Password is required')
      .trim()
      .max(100, 'Passwords should be less than 100 Characters.')
      // eslint-disable-next-line no-useless-escape
      .matches(
        /^.*(?=.{8,})((?=.*[!@#$%^&*()\-_=+{}|`~[\]\\;:?"'/,<.>]){1})(?=.*\d)((?=.*[a-z]){1})((?=.*[A-Z]){1}).*$/,
        {
          excludeEmptyString: true,
          message:
            'Passwords must be 8 characters or more, have a mixture of both uppercase and lowercase letters, have a mixture of letters and numbers, and include at least one special character. e.g., ! @ # ? ]'
        }
      )
      .when('isPasswordModalOpen', {
        is: true,
        then: yup.string().required('Password is required')
      }),
    passwordVerify: yup
      .string()
      .trim()
      .oneOf([yup.ref('password')], 'Passwords must match')
  });

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
      code: ''
    }
  });

  const {
    handleSubmit: handleSubmit2,
    control: control2,
    formState: { errors: errors2 }
  } = useForm({
    mode: 'onSubmit',
    reValidateMode: 'onChange',
    resolver: yupResolver(validationSchema2),
    defaultValues: {
      code: '',
      email: '',
      first_name: '',
      last_name: '',
      password: '',
      passwordVerify: ''
    }
  });

  // Checks to see if there is a Recaptcha variable set in the config, if so, it utilizes it here.
  const CheckCode = async (data) => {
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
            CheckCode2(data);
          })
          .catch(function (error) {
            setSubmitStatus(false);
            //eslint-disable-next-line
            console.log('Error: ' + error.response.data.error);
            setMoveForward(false);
            setError(
              'There was an error validating you are human. - Recaptcha Error'
            );
          });
      });
    } else if (moveForward === true) {
      CheckCode2(data);
    }
  };

  // Once Recaptcha work is done, we send the submitted username to the server and determine its availability
  const CheckCode2 = async (data) => {
    data.code = data?.code.toUpperCase();
    //If it's okay to move forward, send the data to the API
    if (moveForward === true) {
      axios
        .request({
          url: `${AUTH_ENDPOINT}/check-code`,
          method: 'post',
          data,
          withCredentials: true
        })
        .then((res) => {
          if (res.status === 200) {
            setError('');
            setCode(res.data);
            setSubmitStatus(false);
            setShowCodeForm(false);
            setShowSignUpForm(true);
          } else {
            setError(
              'There was a problem communicating with the  System, Please Try Again Later.'
            );
            setSubmitStatus(false);
          }
        })
        .catch(function (error) {
          setSubmitStatus(false);
          setError(error.response.data.error);
        });
    }
  };

  const Signup = async (data) => {
    data.code = code;
    if (!code?.code) {
      router.push('/');
    }
    //If it's okay to move forward, send the data to the API
    if (moveForward === true) {
      axios
        .request({
          url: `${AUTH_ENDPOINT}/create-user`,
          method: 'post',
          data,
          withCredentials: true
        })
        .then((res) => {
          if (res.status === 200) {
            router.push('/');
          } else {
            setError(
              'There was a problem communicating with the  System, Please Try Again Later.'
            );
            setSubmitStatus(false);
          }
        })
        .catch(function (error) {
          setSubmitStatus(false);
          setError(error.response.data.error);
        });
    }
  };

  return (
    <Container component="main" maxWidth="xl" id="signup-container">
      <Box sx={{ mt: 5, ml: 30 }}>
        <CustomerLogo />
      </Box>
      <Grid container sx={{ justifyContent: 'center', mt: -11 }}>
        <Grid item xs={4}>
          <div className={styles.mainBox} id="main-box">
            <Avatar className={styles.loginAvatar} id={'signup-avatar'}>
              <LockOutlinedIcon id={'signup-avatar-lock-icon'} />
            </Avatar>
            <Typography
              id={'signup-title'}
              component="div"
              variant="h5"
              className={styles.loginTitle}
            >
              Signup - Step 1
            </Typography>
            {code ? (
              <>
                <Typography
                  id={'signup-code-active'}
                  component="p"
                  variant="string"
                  className={styles.loginTitle}
                >
                  Your Code is Active!
                </Typography>
                <Typography
                  id={'signup-code-active1'}
                  component="p"
                  variant="string"
                  className={styles.loginTitle}
                >
                  You are Activating the Following:
                </Typography>
                <Typography
                  id={'signup-code-active2'}
                  component="p"
                  variant="string"
                  className={styles.loginTitle}
                >
                  Subscriptions:
                  <br></br>
                  {code?.subscriptions?.map((Subscription) => {
                    return Subscription?.subscription_name;
                  })}
                </Typography>
                <Typography
                  id={'signup-code-active3'}
                  component="p"
                  variant="string"
                  className={styles.loginTitle}
                >
                  Products:
                </Typography>
                <Typography
                  id={'signup-code-active4'}
                  component="p"
                  variant="string"
                  className={styles.loginTitle}
                >
                  {code?.products?.map((product) => {
                    const appString = product?.apps
                      ?.map((app) => {
                        return app?.app_name;
                      })
                      .filter((a) => a)
                      .join(', ')
                      .toString();
                    const featuresString = product?.features
                      ?.map((feature) => {
                        return feature?.feature_name;
                      })
                      .filter((a) => a)
                      .join(', ')
                      .toString();
                    const finalString =
                      appString && featuresString
                        ? `${appString}, ${featuresString}`
                        : appString
                        ? appString
                        : featuresString
                        ? featuresString
                        : '';

                    return product?.product_name + ': ' + finalString;
                  })}
                </Typography>
              </>
            ) : (
              ''
            )}
            {error && (
              <Alert severity="error" id={'error-text'}>
                {error}
              </Alert>
            )}
            {showCodeForm === true ? (
              <form
                key={1}
                onSubmit={handleSubmit((data) => CheckCode(data))}
                id={'code-form'}
              >
                <TenantTextField
                  id={'code-field'}
                  name={'code'}
                  control={control}
                  label={'Enter Activation Code'}
                  variant="outlined"
                  margin="normal"
                  fullWidth
                  autoComplete={'code'}
                  error={!!errors.code}
                  helperText={errors.code ? errors.code?.message : null}
                  inputProps={{ style: { textTransform: 'uppercase' } }}
                />
                <Button
                  id="promo-code-button-next-step"
                  type="submit"
                  fullWidth
                  variant="contained"
                  disabled={submitStatus}
                  className={styles.loginButton}
                >
                  Next Step &gt;&gt;
                </Button>
              </form>
            ) : (
              ''
            )}
            {showSignUpForm === true ? (
              <form
                key={2}
                onSubmit={handleSubmit2((data) => Signup(data))}
                id={'signup-form'}
              >
                <TenantTextField
                  id="create-user-email"
                  name={'email'}
                  control={control2}
                  label={'Email Address *'}
                  variant="outlined"
                  margin="normal"
                  fullWidth
                  error={!!errors2.email}
                  helperText={errors2.email ? errors2.email?.message : null}
                />
                <TenantTextField
                  id="create-user-firstname"
                  name={'first_name'}
                  control={control2}
                  label={'First Name *'}
                  variant="outlined"
                  margin="normal"
                  fullWidth
                  error={!!errors2.first_name}
                  helperText={
                    errors2.first_name ? errors2.first_name?.message : null
                  }
                />
                <TenantTextField
                  id="create-user-lastname"
                  name={'last_name'}
                  control={control2}
                  label={'Last Name *'}
                  variant="outlined"
                  margin="normal"
                  fullWidth
                  error={!!errors2.last_name}
                  helperText={
                    errors2.last_name ? errors2.last_name?.message : null
                  }
                />
                <TenantTextField
                  id="create-user-password"
                  type={'password'}
                  name={'password'}
                  control={control2}
                  label={'Password *'}
                  variant="outlined"
                  margin="normal"
                  fullWidth
                  error={!!errors2.password}
                  helperText={
                    errors2.password ? errors2.password?.message : null
                  }
                  autoComplete="new-password"
                />
                <TenantTextField
                  id="create-user-password-confirm"
                  type={'password'}
                  name={'passwordVerify'}
                  control={control2}
                  label={'Re-Enter Password *'}
                  variant="outlined"
                  margin="normal"
                  fullWidth
                  error={!!errors2.passwordVerify}
                  helperText={
                    errors2.passwordVerify
                      ? errors2.passwordVerify?.message
                      : null
                  }
                  autoComplete="new-password"
                />
                <Button
                  id="create-account-button"
                  type="submit"
                  fullWidth
                  variant="contained"
                  disabled={submitStatus}
                  className={styles.loginButton}
                >
                  Create Account
                </Button>
              </form>
            ) : (
              ''
            )}
            <Button
              sx={{ mt: 4 }}
              id="login-button"
              fullWidth
              href="/"
              variant="outlined"
            >
              Back To Login
            </Button>
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
