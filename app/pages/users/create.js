//React Imports
import React, { useEffect, useState } from 'react';

//Material UI Imports
import Breadcrumbs from '@mui/material/Breadcrumbs';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import MenuItem from '@mui/material/MenuItem';
import Grid from '@mui/material/Grid';
import AppBar from '@mui/material/AppBar';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Container from '@mui/material/Container';
import Button from '@mui/material/Button';
import FormControl from '@mui/material/FormControl';
import Alert from '@mui/material/Alert';
import Checkbox from '@mui/material/Checkbox';
import LoadingButton from '@mui/lab/LoadingButton';
import InfoIcon from '@mui/icons-material/Info';

//Material UI Icons
//Material UI Styles
//Material UI DataGrid
//Application Imports
import {
  useApi,
  useCacheAsyncValidator,
  useS3Uploader,
  useResizeImageHandler
} from '../../hooks';
import UserSubscriptions from '../../components/user_subscription_gird';
import UserProducts from '../../components/user_product_grid';

import {
  TenantSwitch,
  TenantModal,
  TenantSelect,
  TenantTextField,
  BadgeTooltip,
  FileSelectButton,
  UserAvatar
} from '../../components';

//NextJS Imports
import Link from 'next/link';
import { useRouter } from 'next/router';

//External Module Imports
import { connect, useDispatch } from 'react-redux';
import { Controller, useForm, useFormState } from 'react-hook-form';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { EMOJIS_REGEX } from '../../helpers/constants';

//Section Helpers
//Used to Render Tabs
function TabPanel(props) {
  const { children, value, tabIndex, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== tabIndex}
      id={`scrollable-force-tabpanel-${tabIndex}`}
      aria-labelledby={`scrollable-force-tab-${tabIndex}`}
      {...other}
    >
      {value === tabIndex && (
        <Box p={0} component={'span'}>
          {children}
        </Box>
      )}
    </div>
  );
}

//Used to Change Tabs
function a11yProps(tabIndex) {
  return {
    id: `scrollable-force-tab-${tabIndex}`,
    'aria-controls': `scrollable-force-tabpanel-${tabIndex}`
  };
}
//Section Main Function
const UserCreate = () => {
  //Used to determine loading or not
  const [loadingButton, setLoadingButton] = React.useState(false);
  const [remindToSave, setRemindToSave] = useState(false);
  const [roles, setRoles] = useState([]);
  const [passwordConfirmationDialog, setPasswordConfirmationDialog] =
    useState(false);
  const [subscriptions, setSubscriptions] = useState([]);
  const [userSubscriptions, setUserSubscriptions] = useState([]);
  const [userProducts, setUserProducts] = useState([]);
  const [products, setProducts] = useState([]);
  const [show, setShow] = React.useState(false);
  //Used for TabNumbers
  const [tabNumber, setTabNumber] = useState(0);

  //Initialize the API
  const { get, put, post } = useApi();
  const dispatch = useDispatch();
  const handleResizeImage = useResizeImageHandler();
  const [s3bucketImageUpload, s3bucketImageRemove] = useS3Uploader();

  //Get the ID Called in the URL
  const router = useRouter();

  useEffect(() => {
    let getUserOptions = {};

    async function fetchData() {
      if (typeof window !== 'undefined' && !getUserOptions.data) {
        await get('/api/users/options')
          .then((response) => {
            setRoles(response.data.data.roles);
            setSubscriptions(response.data.data.subscriptions);
            setProducts(response.data.data.products);
            setShow(true);
          })
          .catch((error) => {
            if (error.response.status === 403) {
              dispatch({
                type: 'SET_ALLOWED',
                isAllowed: false
              });
              setShow(false);
            }
          });
      }
    }

    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Password confirmation dialog
  const handlePasswordDialogClose = () => {
    setPasswordConfirmationDialog(false);
  };

  const handleConfirmMsg = async (data) => {
    // Password confirmation Dialog if password is empty and email checkbox is unchecked
    if (data.password == '' && data.sendMailchecked === false) {
      setPasswordConfirmationDialog(true);
    } else {
      await sendToDatabase(data);
    }
  };

  //method to handle image upload, for creating a url to the image
  //and updating the url to the config setting selected value
  const imageUploadHandler = async (file) => {
    if (file) {
      const resizedImage = await handleResizeImage({
        file: file,
        maxWidth: 500,
        maxHeight: 500,
        minWidth: 500
      });

      const pageType = 'User';

      const data = await s3bucketImageUpload(resizedImage, 'variant', pageType);
      // TODO remove previous image
      await imageRemoveHandler();

      setValue('attachment', `${data.url}/${data.fields.key}`);
      setValue('user_icon_id', data?.attachment?.id);
    }
  };

  const imageRemoveHandler = async () => {
    const url = getValues('attachment');
    if (url && url.split(':')[0] !== 'data') {
      const urlar = url.split('/');
      const fileName = `${urlar[3]}/${urlar[4]}/${urlar[5]}`;
      await s3bucketImageRemove({ fileName });
    }

    setValue('user_icon_id', '');
    setValue('attachment', null);
  };

  const sendToDatabase = async (data) => {
    setLoadingButton(true);
    // Make username to lower case for consistency
    data.email = data.email.toString().toLowerCase().trim();
    data.auth_method = 1;
    data.userSubscriptions = userSubscriptions;
    data.userProducts = userProducts;
    await put(`/api/users`, { data }).then((res) => {
      if (res.status === 200) {
        router.push('/users');
      }
    });
  };

  const handleTabChange = (event, newValue) => {
    setTabNumber(newValue);
  };

  const handleCancelClick = () => {
    router.push('/users');
  };

  function notValidUsername(valueToCheck) {
    return new Promise((resolve) => {
      if (!valueToCheck) {
        return true;
      }

      post(`/api/users/user-validate`, {
        data: {
          username: valueToCheck.toString().toLowerCase().trim()
        }
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

  const validationSchema = yup.object({
    email: yup
      .string('Enter your email')
      .email('Enter a valid email')
      // eslint-disable-next-line no-useless-escape
      .matches(/^([A-Za-z0-9_\-\.])+\@([A-Za-z0-9_\-\.])+\.([A-Za-z]{2,4})$/, {
        message: 'Enter a valid email'
      })
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
      .string()
      .test(
        'empty-or-8-characters-check',
        'Password must be at least 8 characters',
        (password) => !password || password.length >= 8
      ),
    passwordVerify: yup
      .string()
      .trim()
      .oneOf([yup.ref('password')], 'Passwords must match')
  });

  const {
    handleSubmit,
    control,
    getValues,
    setValue,
    formState: { errors }
  } = useForm({
    mode: 'onChange',
    reValidateMode: 'onChange',
    resolver: yupResolver(validationSchema),
    defaultValues: {
      email: '',
      first_name: '',
      last_name: '',
      enabled: true,
      roles: 'user',
      password: '',
      passwordVerify: '',
      sendMailchecked: false,
      attachment: '',
      user_icon_id: ''
    }
  });

  const { isDirty } = useFormState({ control });

  useEffect(() => {
    if (isDirty) {
      setRemindToSave(true);
      [];
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDirty]);

  // User subscriptions functions

  const processSubscriptionAdd = (index) => {
    let newSubscription = [...userSubscriptions, ...index];

    setUserSubscriptions(newSubscription);
    setRemindToSave(true);
  };

  const processSubscriptionRemove = (subscriptionList) => {
    setUserSubscriptions(subscriptionList);
    setRemindToSave(true);
  };

  // User Products
  const processUserProductUpdate = (index) => {
    setUserProducts(index);
    setRemindToSave(true);
  };

  //Section Return
  return (
    <>
      {show === true ? (
        <Container maxWidth="xl" sx={{ position: 'relative', pb: 8 }}>
          {/* Main Page and Form */}
          <form
            id="create-user-form"
            key={1}
            onSubmit={handleSubmit((data) => sendToDatabase(data))}
            autoComplete="off"
          >
            <Grid container spacing={2}>
              <Grid item xs={4}>
                <Typography
                  id="create-user-title-h4"
                  variant="h4"
                  component={'span'}
                >
                  Create User
                </Typography>
                <Breadcrumbs aria-label="breadcrumb">
                  <Link id="goto-users-link" href="/users" color="primary">
                    Users
                  </Link>
                  <Typography
                    id="create-user-breadcrumb-text"
                    color="textPrimary"
                    component={'span'}
                  >
                    Create User
                  </Typography>
                </Breadcrumbs>
              </Grid>
              <Grid
                container
                alignItems="center"
                justifyContent="center"
                item
                xs={3}
                sx={{
                  ml: '1.5rem',
                  position: 'sticky',
                  top: '68px',
                  zIndex: 1
                }}
              >
                {remindToSave === true ? (
                  <Alert severity="warning" id="save-changes-warning">
                    Please Save Changes
                  </Alert>
                ) : null}
              </Grid>
              <Grid item xs={9}>
                <TenantTextField
                  id="create-user-email"
                  name={'email'}
                  control={control}
                  label={'Email Address *'}
                  variant="outlined"
                  margin="normal"
                  fullWidth
                  error={!!errors.email}
                  helperText={errors.email ? errors.email?.message : null}
                />

                <TenantTextField
                  id="create-user-firstname"
                  name={'first_name'}
                  control={control}
                  label={'First Name *'}
                  variant="outlined"
                  margin="normal"
                  fullWidth
                  error={!!errors.first_name}
                  helperText={
                    errors.first_name ? errors.first_name?.message : null
                  }
                />

                <TenantTextField
                  id="create-user-lastname"
                  name={'last_name'}
                  control={control}
                  label={'Last Name *'}
                  variant="outlined"
                  margin="normal"
                  fullWidth
                  error={!!errors.last_name}
                  helperText={
                    errors.last_name ? errors.last_name?.message : null
                  }
                />

                <TenantTextField
                  type="password"
                  id="create-user-password"
                  autoComplete="new-password"
                  name={'password'}
                  control={control}
                  label={'Password'}
                  variant="outlined"
                  margin="normal"
                  fullWidth
                  error={!!errors.password}
                  helperText={errors.password ? errors.password?.message : null}
                />

                <TenantTextField
                  type="password"
                  id="create-user-password-confirm"
                  autoComplete="new-password"
                  name={'passwordVerify'}
                  control={control}
                  label={'Re-Enter Password'}
                  variant="outlined"
                  margin="normal"
                  fullWidth
                  error={!!errors.passwordVerify}
                  helperText={
                    errors.passwordVerify
                      ? errors.passwordVerify?.message
                      : null
                  }
                />
                <FormControl fullWidth style={{ marginTop: 15 }}>
                  <TenantSelect
                    id="create-user-role"
                    control={control}
                    fullWidth
                    variant="outlined"
                    label="Role *"
                    name={'roles'}
                  >
                    {roles?.map((roles) => {
                      return (
                        <MenuItem key={roles.name} value={roles.name}>
                          {roles.display_name ?? roles.name}
                        </MenuItem>
                      );
                    })}
                  </TenantSelect>
                </FormControl>
                <br />
                <br />
                <Controller
                  as={Checkbox}
                  name={'sendMailchecked'}
                  control={control}
                  render={({ field: { onChange, value } }) => (
                    <Checkbox checked={value} onChange={onChange} />
                  )}
                />
                <label
                  style={{ position: 'relative', top: '2px', right: '3px' }}
                >
                  Send Welcome Mail
                </label>
                <p
                  aria-required="true"
                  aria-label={'(*) indicates required field'}
                >
                  (*) indicates required field
                </p>
              </Grid>
              <Grid item xs={3}>
                <Controller
                  name="attachment"
                  control={control}
                  render={({ field }) => (
                    <UserAvatar
                      id={'icon'}
                      icon={field?.value}
                      name={'icon'}
                      variant="square"
                      removable
                      onDelete={imageRemoveHandler}
                      sx={{
                        width: 75,
                        height: 75
                      }}
                    />
                  )}
                />
                <br></br>
                <br></br>
                <BadgeTooltip
                  title={
                    <Typography id="icon-guide-text" variant="body2">
                      The user icon appears on user and in the user portal.{' '}
                      <br />
                      <br />
                      An aspect ratio of 1 : 1 is recommended (e.g. 128 x 128
                      pixels). <br />
                      <br />
                      Accepted formats include JPEG and PNG. If your logo
                      doesn&apos;t meet the size requirements above, it will
                      automatically be cropped or resized.
                    </Typography>
                  }
                  tooltipIcon={<InfoIcon color="primary" />}
                  placement="bottom-end"
                  severity="info"
                >
                  <FileSelectButton
                    accept="image/*"
                    id="app-change-icon"
                    onChange={imageUploadHandler}
                    title="Change Icon"
                  />
                </BadgeTooltip>
                <br />
                <br />
                <TenantSwitch
                  name={'enabled'}
                  control={control}
                  label={'User Active'}
                />
              </Grid>
              <Grid item xs={2}>
                <Grid
                  sx={{ position: 'absolute', bottom: '0px', right: '24px' }}
                >
                  <Button
                    variant="outlined"
                    color="primary"
                    sx={{ mr: 2, p: '6px 40px' }}
                    onClick={handleCancelClick}
                  >
                    Cancel
                  </Button>
                  <LoadingButton
                    variant="contained"
                    color="primary"
                    id="create-user-button"
                    onClick={handleSubmit((data) => handleConfirmMsg(data))}
                    loading={loadingButton}
                  >
                    Save Changes
                  </LoadingButton>
                </Grid>
              </Grid>
            </Grid>
          </form>
          <Grid container spacing={2} mt={1}>
            <Grid container item xs={12}>
              <Grid item xs={12}>
                <AppBar position="static">
                  <Tabs
                    aria-label="User Options"
                    variant="fullWidth"
                    indicatorColor="secondary"
                    textColor="inherit"
                    value={tabNumber}
                    onChange={handleTabChange}
                  >
                    <Tab
                      label="Products"
                      className="tabs"
                      id="linked-products-tab"
                      {...a11yProps(0)}
                    />
                    <Tab
                      label="Active Subscriptions"
                      className="tabs"
                      id="linked-subscriptions-tab"
                      {...a11yProps(1)}
                    />
                  </Tabs>
                </AppBar>
              </Grid>
            </Grid>
            <Grid container item xs={12} spacing={0}>
              <Grid item xs={12}>
                <TabPanel value={tabNumber} tabIndex={0} p={0}>
                  <Typography
                    variant="h6"
                    component={'span'}
                    id="linked-products-tab-title"
                  >
                    Products
                  </Typography>
                  <div style={{ marginTop: 10 }}>
                    <UserProducts
                      userProducts={userProducts}
                      products={products}
                      loading={show}
                      addModal={true}
                      editModal={true}
                      updateFunc={processUserProductUpdate}
                      deleteFunc={processSubscriptionRemove}
                    />
                  </div>
                </TabPanel>
                <TabPanel value={tabNumber} tabIndex={1} p={1}>
                  <Typography
                    variant="h6"
                    component={'span'}
                    id="linked-subscriptions-tab-title"
                  >
                    Active Subscriptions
                  </Typography>
                  <div style={{ marginTop: 10 }}>
                    <UserSubscriptions
                      userSubscriptions={userSubscriptions}
                      subscriptions={subscriptions}
                      loading={show}
                      addModal={true}
                      editModal={true}
                      addFunc={processSubscriptionAdd}
                      deleteFunc={processSubscriptionRemove}
                    />
                  </div>
                </TabPanel>
              </Grid>
            </Grid>
          </Grid>
          <TenantModal
            open={passwordConfirmationDialog}
            close={handlePasswordDialogClose}
            fullWidth
            maxWidth="md"
            id={'User-create-confirm'}
            confirm={handleSubmit((data) => sendToDatabase(data))}
            title={'Are you sure you want to create a user without a password?'}
          >
            <Typography id="delete-user-confirmation-text">
              You are creating a user without any password and no welcome email
              will be sent. Please add a password or select welcome email
              checkbox.
            </Typography>
          </TenantModal>
        </Container>
      ) : (
        ''
      )}
    </>
  );
};

export default connect((state) => state)(UserCreate);
