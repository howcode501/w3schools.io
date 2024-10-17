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
import Alert from '@mui/material/Alert';
import LoadingButton from '@mui/lab/LoadingButton';
import InfoIcon from '@mui/icons-material/Info';

//Material UI Icons
//Material UI Styles
//Material UI DataGrid
//Application Imports
import {
  useApi,
  useDidMountEffect,
  useS3Uploader,
  useResizeImageHandler
} from '../../../hooks';
import UserSubscriptions from '../../../components/user_subscription_gird';
import UserProducts from '../../../components/user_product_grid';

import {
  TenantSwitch,
  TenantSelect,
  TenantTextField,
  BadgeTooltip,
  FileSelectButton,
  UserAvatar
} from '../../../components';

//NextJS Imports
import Link from 'next/link';
import { useRouter } from 'next/router';

//External Module Imports
import { connect, useDispatch } from 'react-redux';
import { Controller, useForm, useFormState } from 'react-hook-form';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import FormControl from '@mui/material/FormControl';
import { forgotPassword_API, randomString } from '../../../helpers/functions';
import { EMOJIS_REGEX } from '../../../helpers/constants';

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

//Start up form validation
const validationSchema = yup.object({
  email: yup
    .string('Enter your email')
    .email('Enter a valid email')
    // eslint-disable-next-line no-useless-escape
    .matches(/^([A-Za-z0-9_\-\.])+\@([A-Za-z0-9_\-\.])+\.([A-Za-z]{2,4})$/)
    .required('Email is required'),
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
  isPasswordModalOpen: yup.boolean(),
  password: yup
    .string()
    .test(
      'empty-or-8-characters-check',
      'Password must be at least 8 characters',
      (password) => !password || password.length >= 8
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

//Section Main Function
const UserUpdate = () => {
  //Used to determine loading or not
  const [loadingButton, setLoadingButton] = React.useState(false);
  const [optionsLoaded, setOptionsLoaded] = React.useState(false);
  const [roles, setRoles] = useState([]);

  const [show, setShow] = React.useState(false);
  //Used for TabNumbers
  const [tabNumber, setTabNumber] = useState(0);

  const [remindToSave, setRemindToSave] = useState(false);
  const [userSubscriptions, setUserSubscriptions] = useState([]);
  const [userProducts, setUserProducts] = useState([]);
  const [productsOriginal, setProductsOriginal] = useState([]);
  const [products, setProducts] = useState([]);
  const [subscriptions, setSubscriptions] = useState([]);

  //Initialize the API
  const { get, post } = useApi();
  const dispatch = useDispatch();
  const handleResizeImage = useResizeImageHandler();
  const [s3bucketImageUpload, s3bucketImageRemove] = useS3Uploader();

  //Get the ID Called in the URL
  const router = useRouter();
  const { id } = router.query;

  //Define the data that will be loaded client side

  let user = {
    profile: {},
    groups: []
  };

  const [userData, setData] = useState({ username: '' });
  const [buttonDisabled, setButtonDisabled] = useState(false);

  //Section Client Side Work
  //Once the page loads, let's do some client side work
  useEffect(() => {
    let getUserOptions = {};

    async function fetchData() {
      if (typeof window !== 'undefined' && !getUserOptions.data) {
        await get('/api/users/options')
          .then((response) => {
            setRoles(response.data.data.roles);
            setSubscriptions(response.data.data.subscriptions);
            setProducts(response.data.data.products);
            setProductsOriginal(response.data.data.products);
            setOptionsLoaded(true);
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
  }, [router]);

  //When the options load, let's put them in the fields
  const {
    handleSubmit,
    control,
    setValue,
    getValues,
    formState: { errors }
  } = useForm({
    mode: 'onChange',
    reValidateMode: 'onChange',
    resolver: yupResolver(validationSchema),
    defaultValues: {
      email: '',
      first_name: '',
      last_name: '',
      enabled: false,
      roles: '',
      password: '',
      passwordVerify: '',
      isPasswordModalOpen: false,
      user_icon_id: '',
      attachment: '',
      actions_api_token: ''
    }
  });

  const { dirtyFields } = useFormState({ control });

  useEffect(() => {
    const objArr = Object.keys(dirtyFields);
    if (objArr.length > 0) {
      if (!objArr.includes('password') && !objArr.includes('passwordVerify')) {
        setRemindToSave(true);
      } else {
        setRemindToSave(false);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [Object.keys(dirtyFields)]);

  //TODO Come back to this and make it Async
  //API is used to Grab the User's Data
  useDidMountEffect(() => {
    get(`/api/users/${id}`)
      .then(async (response) => {
        user = response.data.data.user;
        //setValue('username', user.username, true);
        setValue('email', user.email, true);
        setValue('first_name', user.first_name, true);
        setValue('last_name', user.last_name, true);

        setValue('attachment', user?.attachments?.public_url);
        setValue('user_icon_id', user?.attachments?.id);
        setValue('actions_api_token', user?.actions_api_token);

        const userSubscriptionData = [];
        for (let j = 0; j < user?.userSubscriptions.length; j++) {
          userSubscriptionData.push({
            id: user?.userSubscriptions[j].id,
            subscription_id: user?.userSubscriptions[j].subscription_id,
            subscription_name: user?.userSubscriptions[j].subscription_name,
            subscription_pricing_plan_id:
              user?.userSubscriptions[j].subscription_plan_id,
            subscription_pricing_plan_price:
              user?.userSubscriptions[j].stripe_plan_amount,
            subscription_pricing_plan_time_option:
              user?.userSubscriptions[j].time_option_date +
              '/' +
              user?.userSubscriptions[j].time_option_frequency,
            activated_by: user?.userSubscriptions[j].activated_by,
            auto_subscription: user?.userSubscriptions[j].auto_subscription,
            stripe_current_period_end:
              user?.userSubscriptions[j].stripe_current_period_end
          });
        }

        setUserSubscriptions(userSubscriptionData);

        // Reform array structure to fit with frontend
        const userProductsData = [];
        for (let i = 0; i < user?.userProducts.length; i++) {
          if (user?.userProducts[i].data_type === 'product') {
            userProductsData[user?.userProducts[i].product_id] = {
              data_type: 'product',
              product_id: user?.userProducts[i].product_id + '_product',
              product_visible_status: user?.userProducts[i].visible_status,
              activated_by: user?.userProducts[i].activated_by,
              id: user?.userProducts[i].id,
              apps: [],
              features: []
            };
          }
          if (user?.userProducts[i].data_type === 'app') {
            if (
              userProductsData[user?.userProducts[i].product_id] !== undefined
            ) {
              userProductsData[user?.userProducts[i].product_id].apps[
                user?.userProducts[i].app_id
              ] = {
                data_type: 'app',
                app_activated_by: user?.userProducts[i].activated_by,
                app_description: user?.userProducts[i].description,
                app_visible_status: user?.userProducts[i].visible_status,
                app_id: user?.userProducts[i].app_id + '_app',
                app_status: user?.userProducts[i].status,
                app_activated_date_time: user?.userProducts[i].created,
                id: user?.userProducts[i].id
              };
            }
          }
          if (user?.userProducts[i].data_type === 'feature') {
            if (
              userProductsData[user?.userProducts[i].product_id] !== undefined
            ) {
              userProductsData[user?.userProducts[i].product_id].features[
                user?.userProducts[i].feature_id
              ] = {
                data_type: 'feature',
                feature_activated_by: user?.userProducts[i].activated_by,
                feature_description: user?.userProducts[i].description,
                feature_visible_status: user?.userProducts[i].visible_status,
                feature_id: user?.userProducts[i].feature_id + '_feature',
                feature_status: user?.userProducts[i].status,
                feature_activated_date_time: user?.userProducts[i].created,
                id: user?.userProducts[i].id
              };
            }
          }
        }
        setUserProducts(userProductsData);

        // Make sure we aren't trying to set the roles before they exist in the select
        if (roles.length > 0) {
          setValue('roles', user.roles[0], true);
        }

        setValue('enabled', user.auth.enabled, true);
        setData((prev) => {
          return {
            ...prev,
            username: user.username
          };
        });
        if (
          user.email === '' ||
          user.email === undefined ||
          user.email === null
        ) {
          setButtonDisabled(true);
        }
        setShow(true);
      })
      .catch(() => {});
  }, [optionsLoaded, id]);

  // Sent password reset link
  const sendPasswordResetMail = (e) => {
    e.preventDefault();
    setButtonDisabled(true);
    // call api function //
    forgotPassword_API(userData).then((response) => {
      if (response.status) {
        setData({ username: '' });
      } else {
        //
      }
    });
    setTimeout(() => {
      setButtonDisabled(false);
    }, 3500);
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
    data.userSubscriptions = userSubscriptions;
    // remove null from array
    const userProductsFiltered = userProducts.filter(function (el) {
      return el != null;
    });
    data.userProducts = userProductsFiltered;
    await post(`/api/users/${id}`, { data }).then((res) => {
      if (res.status === 200) {
        router.push('/users');
      }
    });
  };

  const handleTabChange = (event, newValue) => {
    setTabNumber(newValue);
    history.replaceState(undefined, undefined, '#' + newValue);
  };

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

  const processProductUpdate = (products) => {
    setProducts(products);
  };

  const handleCancelClick = () => {
    router.push('/users');
  };

  const handleGenerateRandomString = async () => {
    // numberOfCodes,characters,length

    const randomStr = await randomString();
    setValue('actions_api_token', randomStr, true);
  };

  //Section Return
  return (
    <>
      {show === true ? (
        <Container maxWidth="xl" sx={{ position: 'relative', pb: 8 }}>
          {/* Main Page and Form */}
          <form
            id="edit-user-form"
            key={1}
            onSubmit={handleSubmit((data) => sendToDatabase(data))}
          >
            <Grid container spacing={2}>
              <Grid item xs={4}>
                <Typography
                  id="edit-user-title-h4"
                  variant="h4"
                  component={'span'}
                >
                  Edit User
                </Typography>
                <Breadcrumbs aria-label="breadcrumb" className="breadcrumb">
                  <Link id="goto-users-link" href="/users" color="primary">
                    Users
                  </Link>
                  <Typography
                    id="edit-user-breadcrumb-text"
                    color="textPrimary"
                    component={'span'}
                  >
                    Edit User
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
                  <Alert id="edit-user-save-change-warning" severity="warning">
                    Please Save Changes
                  </Alert>
                ) : null}
              </Grid>
              <Grid item xs={9}>
                <TenantTextField
                  id="edit-user-email"
                  name={'email'}
                  control={control}
                  label={'Email Address *'}
                  variant="outlined"
                  margin="normal"
                  fullWidth
                  error={!!errors.email}
                  helperText={errors.email ? errors.email?.message : null}
                  disabled
                />

                <TenantTextField
                  id="edit-user-firstname"
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
                  id="edit-user-lastname"
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
                  id="new-password-field"
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
                <TenantTextField
                  type="text"
                  id="create-user-actions-api-token"
                  name={'actions_api_token'}
                  control={control}
                  label={'Actions API Token'}
                  variant="outlined"
                  margin="normal"
                  fullWidth
                  error={!!errors.actions_api_token}
                  helperText={
                    errors.actions_api_token
                      ? errors.actions_api_token?.message
                      : null
                  }
                  InputProps={{
                    endAdornment: (
                      <Button
                        variant="contained"
                        color="primary"
                        onClick={handleGenerateRandomString}
                        size={'large'}
                        sx={{ marginRight: '-14px' }}
                      >
                        Generate Random Token
                      </Button>
                    )
                  }}
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
                  id="edit-user-status-switch"
                />
              </Grid>
              <Grid item xs={8}>
                <Button
                  type="button"
                  variant="outlined"
                  color="primary"
                  onClick={sendPasswordResetMail}
                  disabled={buttonDisabled}
                  id="send-password-reset-email-btn"
                >
                  Send Password Reset Email
                </Button>
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
                    id="save-change-submit-btn"
                    variant="contained"
                    color="primary"
                    type={'submit'}
                    loading={loadingButton}
                  >
                    Save Changes
                  </LoadingButton>
                </Grid>
              </Grid>
            </Grid>
            <p aria-required="true" aria-label={'(*) indicates required field'}>
              (*) indicates required field
            </p>
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
                      productsOriginal={productsOriginal}
                      userProducts={userProducts}
                      products={products}
                      loading={show}
                      addModal={true}
                      editModal={true}
                      updateFunc={processUserProductUpdate}
                      deleteFunc={processSubscriptionRemove}
                      updateProducts={processProductUpdate}
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
        </Container>
      ) : (
        ''
      )}
    </>
  );
};

export default connect((state) => state)(UserUpdate);
