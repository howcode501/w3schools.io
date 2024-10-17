//Section Import
//React Imports
import React, { useEffect } from 'react';
import { useState } from 'react';

//Material UI Imports
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

import Grid from '@mui/material/Grid';
// import Avatar from '@mui/material/Avatar';

import Container from '@mui/material/Container';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';

import PaymentMethodGrid from '../../components/payment_method_grid';

//Application Imports
import { useApi } from '../../hooks';
//NextJS Imports
import { useRouter } from 'next/router';
//External Module Imports
import { connect } from 'react-redux';
import { Controller, useForm } from 'react-hook-form';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import TokenService from '../../services/token';
import PositionedSnackbar from '../../components/snackbar';
import CustomTextField from '../../components/core/custom_textfield';

//Section Main Function
const Profile = () => {
  const [password, setPassword] = useState('');
  const [verifyPassword, setVerifyPassword] = useState('');
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  //Used to determine loading or not
  const [passwordOpen, setPasswordOpen] = React.useState(false);
  const [managePaymentMethodDialog, setManagePaymentMethodDialog] =
    React.useState(false);
  // Getting userRole data from useContext hook
  const userRole = TokenService.getUser();

  //Initialize the API
  const { get, patch } = useApi();

  //Get the ID Called in the URL
  const router = useRouter();
  const { id } = router.query;

  //API is used to Grab the User's Data
  useEffect(() => {
    get(`/api/users/profile`).then((response) => {
      let user = response.data.data.user;
      //Set the basics first
      //setValue('username', user.username, true);
      setValue('email', user.email, true);
      setValue('first_name', user.first_name, true);
      setValue('last_name', user.last_name, true);
      setValue('roles', user.roles[0], true);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userRole, id]);

  const validationSchema = yup.object({
    password: yup
      .string()
      .test(
        'empty-or-8-characters-check',
        'Password must be at least 8 characters',
        (password) => !password || password.length >= 8
      )
      .required('Password is required'),
    passwordVerify: yup
      .string()
      .trim()
      .oneOf([yup.ref('password')], 'Passwords must match')
  });

  const {
    formState: { errors },
    setValue,
    control,
    trigger,
    handleSubmit,
    register
  } = useForm({
    mode: 'onChange',
    reValidateMode: 'onChange',

    resolver: yupResolver(validationSchema),
    defaultValues: {
      //username: '',
      email: '',
      first_name: '',
      last_name: '',
      password: '',
      passwordVerify: ''
    }
  });

  const handlePasswordClickOpen = () => {
    setPasswordOpen(true);
  };

  // const handleManagePaymentMethodClickOpen = () => {
  //   setManagePaymentMethodDialog(true);
  // };

  const handlePaymentMethodDialogClose = () => {
    setManagePaymentMethodDialog(false);
  };

  const handlePasswordCancel = () => {
    setValue('password', '', true);
    setValue('passwordVerify', '', true);
    errors.password = null;
    errors.passwordVerify = null;
    setPasswordOpen(false);
  };

  const handlePasswordClose = (errors, event) => {
    //If there are password errors, don't allow the box to close
    if (
      password !== '' &&
      event != 'backdropClick' &&
      !errors.password &&
      !errors.passwordVerify
    ) {
      setPasswordOpen(false);
      sendToDatabase();
    }
  };

  const sendToDatabase = async () => {
    let payload;
    if (password === verifyPassword) {
      payload = {
        password: password,
        passwordVerify: verifyPassword
      };

      await patch(`/api/users/change-password`, payload).then((res) => {
        if (res.status === 200) {
          setValue('password', '', true);
          setValue('passwordVerify', '', true);

          // success message
          setSnackbarMessage('Password updated successfully!');
          setOpenSnackbar(true);
          setTimeout(function () {
            setOpenSnackbar(false);
          }, 3000);
        }
      });
    }
  };

  //Section Return
  return (
    <Container maxWidth="xl">
      {/* Main Page and Form */}
      <form
        id="user-profile-form"
        key={1}
        onSubmit={handleSubmit((data) => sendToDatabase(data))}
      >
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Typography
              variant="h4"
              component={'span'}
              id="user-profile-title-h4"
            >
              User Profile
            </Typography>
          </Grid>
          <Grid item xs={9}>
            {/*              <Controller
                  as={TextField}
                  name={'username'}
                  control={control}
                  render={({field: {value}}) => (
                      <TextField
                          value={value}
                          label={'Username'}
                          disabled
                          variant="outlined"
                          fullWidth
                      />
                  )}
              />*/}
            <Controller
              as={TextField}
              name={'email'}
              control={control}
              render={({ field: { value } }) => (
                <CustomTextField
                  value={value}
                  label={'Email Address'}
                  variant="outlined"
                  margin="normal"
                  fullWidth
                  disabled
                  type="text"
                  id="user-profile-email-field"
                />
              )}
            />

            <Controller
              as={TextField}
              name={'first_name'}
              control={control}
              render={({ field: { value } }) => (
                <CustomTextField
                  value={value}
                  label={'First Name'}
                  variant="outlined"
                  margin="normal"
                  disabled
                  fullWidth
                  type="text"
                  id="user-profile-firstname-field"
                />
              )}
            />
            <Controller
              as={TextField}
              name={'last_name'}
              control={control}
              render={({ field: { value } }) => (
                <CustomTextField
                  value={value}
                  label={'Last Name'}
                  variant="outlined"
                  margin="normal"
                  disabled
                  fullWidth
                  type="text"
                  id="user-profile-lastname-field"
                />
              )}
            />
          </Grid>
          <Grid item xs={12}>
            <Button
              type="button"
              variant="outlined"
              color="primary"
              onClick={handlePasswordClickOpen}
              id="change-password-btn"
            >
              Change Password
            </Button>
          </Grid>
          <Grid item xs={9}>
            <Typography id="icon-guide-text" variant="h4">
              Manage Payment Methods
            </Typography>
            <PaymentMethodGrid
              open={managePaymentMethodDialog}
              close={handlePaymentMethodDialogClose}
              noModal={true}
            />
          </Grid>
        </Grid>
      </form>
      {/* Password Change Modal */}
      <div>
        <Dialog
          id="change-password-modal"
          open={passwordOpen}
          onClose={handlePasswordClose}
        >
          <DialogTitle>Change Password</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Passwords must be 8 characters or more, have a mixture of both
              uppercase and lowercase letters, have a mixture of letters and
              numbers, and include at least one special character. e.g., ! @ # ?
              ]
            </DialogContentText>
            <Controller
              as={TextField}
              name={'password'}
              control={control}
              render={({ field: { value } }) => (
                <TextField
                  {...register('password', {
                    onChange: (e) => setPassword(e.target.value)
                  })}
                  value={value}
                  label={'Password'}
                  error={!!errors.password}
                  helperText={errors.password ? errors.password?.message : null}
                  variant="outlined"
                  margin="normal"
                  fullWidth
                  type="password"
                  id="new-password-field"
                  autoComplete="new-password"
                />
              )}
            />
            <Controller
              as={TextField}
              name={'passwordVerify'}
              control={control}
              render={({ field: { value } }) => (
                <TextField
                  {...register('passwordVerify', {
                    onChange: (e) => setVerifyPassword(e.target.value)
                  })}
                  value={value}
                  label={'Re-Enter Password'}
                  error={!!errors.passwordVerify}
                  helperText={
                    errors.passwordVerify
                      ? errors.passwordVerify?.message
                      : null
                  }
                  variant="outlined"
                  margin="normal"
                  fullWidth
                  type="password"
                  id="verify-new-password-field"
                  autoComplete="new-password"
                />
              )}
            />
          </DialogContent>
          <DialogActions>
            <Button
              id="change-password-action-close-btn"
              onClick={handlePasswordCancel}
            >
              Cancel
            </Button>
            <Button
              onClick={async (e) => {
                const result = await trigger(['password', 'passwordVerify']);
                result ? handlePasswordClose(e) : '';
              }}
              id="change-password-action-confirm-btn"
            >
              Change Password
            </Button>
          </DialogActions>
        </Dialog>
      </div>
      <PositionedSnackbar
        open={openSnackbar}
        severity="success"
        message={snackbarMessage}
        onClose={() => setOpenSnackbar(false)}
      />
    </Container>
  );
};

export default connect((state) => state)(Profile);
