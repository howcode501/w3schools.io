//React Imports
import React, { useEffect, useState } from 'react';
import parse from 'html-react-parser';
import moment from 'moment';

//Material UI Imports
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import FormControl from '@mui/material/FormControl';
import { FormHelperText } from '@mui/material';
import MenuItem from '@mui/material/MenuItem';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
// MUI TABS
import PropTypes from 'prop-types';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
// MUI CARD
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import Button from '@mui/material/Button';
// MUI STYLES
import { styled } from '@mui/material/styles';
import ButtonBase from '@mui/material/ButtonBase';
// MUI ICONS
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import CachedIcon from '@mui/icons-material/Cached';
import CancelIcon from '@mui/icons-material/Cancel';
import { green, red, blue } from '@mui/material/colors';

import { useApi } from '../hooks';

//NextJS Imports
import { useRouter } from 'next/router';
//External Module Imports
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useForm } from 'react-hook-form';
import { connect } from 'react-redux';
import { API_ROOT } from '../helpers/config';
import CustomerLogo from '../components/customer_logo';

import {
  TenantSelect,
  PositionedSnackbar,
  TenantModal,
  TenantTextField,
  TenantSwitch
} from '../components';
import PaymentMethodGrid from '../components/payment_method_grid';
import TokenService from '../services/token';

const Application = () => {
  const [userProductsLoaded, setUserProductsLoaded] = useState(false);
  const [userProducts, setUserProducts] = useState([]);
  const [subscriptions, setSubscriptions] = useState([]);
  const [userSubscriptions, setUserSubscriptions] = useState([]);
  const [subscriptionOptions, setSubscriptionOptions] = useState([]);
  const [selectedSubscription, setSelectedSubscription] = useState([]);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarMessageType, setSnackbarMessageType] = useState('success');
  const [managePaymentMethodDialog, setManagePaymentMethodDialog] =
    useState(false);
  const [openModal, setOpenModal] = useState(false);
  const [subscriptionConfirmationDialog, setSubscriptionConfirmationDialog] =
    useState(false);
  const [currentSubscriptionCreate, setCurrentSubscriptionCreate] = useState(
    {}
  );
  const [confirmationDialogOpen, setConfirmationDialogOpen] = useState(false);
  const [confirmationDialogMessage, setConfirmationDialogMessage] =
    useState('');
  const [currentSubscriptionAutoRenew, setCurrentSubscriptionAutoRenew] =
    useState({});
  const [iframeUrl, setIframeUrl] = useState('');
  let subscriptionPricingPlanStr = [];
  const router = useRouter();

  //Initialize the API
  const { get, put, post } = useApi();

  //API is used to Grab the User's Data
  async function fetchData() {
    if (!userProductsLoaded) {
      await get(`${API_ROOT}/api/user-products`)
        .then((response) => {
          if (response) {
            let subscriptionOptionArr = [];
            response.data.data.systemConfig.forEach((config) => {
              subscriptionOptionArr[config.name] = config.value;
            });
            setSubscriptionOptions(subscriptionOptionArr);
            setUserProducts(response.data.data.userProductsParsed);
            setSubscriptions(response.data.data.subscriptions);
            setUserSubscriptions(response.data.data.userSubscriptions);
            setUserProductsLoaded(true);
          }
        })
        .catch(function () {
          //
        });
    }
  }

  useEffect(() => {
    fetchData();
  }, [router, userProductsLoaded, get]);

  const handlePaymentMethodDialogClose = () => {
    setManagePaymentMethodDialog(false);
  };

  // Subscription form
  const {
    control,
    formState: { errors },
    getValues,
    clearErrors,
    setError
  } = useForm({
    mode: 'onChange',
    reValidateMode: 'onChange',
    defaultValues: {
      subscription_plan_id: ''
    }
  });

  // create subscriptions
  const handleCreateSubscription = async () => {
    const data1 = currentSubscriptionCreate;
    if (data1.subscription_plan_id) {
      const dataArray = data1.subscription_plan_id.split('_');
      const subscription_id = dataArray[0];
      const subscription_plan_id = dataArray[1];
      const data = { subscription_id, subscription_plan_id };
      await put(`${API_ROOT}/api/stripe/createsubscription`, {
        data
      }).then((res) => {
        if (res?.data?.error) {
          const error = res?.data?.error;
          if (error.type == 'StripeInvalidRequestError') {
            setSnackbarMessage('No card or default payment method is set');
            setSubscriptionConfirmationDialog(false);
            setSnackbarMessageType('error');
            setManagePaymentMethodDialog(true);
          } else {
            setSubscriptionConfirmationDialog(false);
            setSnackbarMessage(error);
            setSnackbarMessageType('error');
          }
          setOpenSnackbar(true);
        } else {
          setSubscriptionConfirmationDialog(false);
          setSnackbarMessage('Subscription created successfully');
          setUserProductsLoaded(false);
          setSnackbarMessageType('success');
          setOpenSnackbar(true);
        }
      });
    } else {
      setSubscriptionConfirmationDialog(false);
      setSnackbarMessage('Something went wrong. Please contact administrator.');
      setSnackbarMessageType('error');
      setOpenSnackbar(true);
    }
  };

  const handleSubscriptionAutoRenew = async () => {
    const { event, subscription_id } = currentSubscriptionAutoRenew;
    const userSubscriptionActive = checkUserSubscriptionActive(subscription_id);
    const data = {
      auto_subscription: event.target.checked,
      userSubscription: userSubscriptionActive
    };
    await post(`${API_ROOT}/api/stripe/auto-renew`, {
      data
    }).then((res) => {
      handleConfirmationDialogClose();
      if (res?.data?.error) {
        setOpenSnackbar(true);
        setSnackbarMessage(res?.data?.error);
        setSnackbarMessageType('error');
      } else {
        setSnackbarMessage(
          `Subscription auto renew ${
            event.target.checked === true ? 'on' : 'off'
          } successfully`
        );
        setUserProductsLoaded(false);
        setSnackbarMessageType('success');
        setOpenSnackbar(true);
      }
    });
  };

  const handleConfirmationSubscriptionAutoRenew = async (
    event,
    subscription_id
  ) => {
    setCurrentSubscriptionAutoRenew({ event, subscription_id });
    // open confirm Dialog
    setConfirmationDialogMessage(
      'You are changing your subscription to auto renew on/off'
    );
    setConfirmationDialogOpen(true);
  };

  // Confirmation Dialog close
  const handleConfirmationDialogClose = () => {
    setConfirmationDialogMessage('');
    setCurrentSubscriptionAutoRenew({});
    setConfirmationDialogOpen(false);
  };

  // Subscription confirmation dialog
  const handleSubscriptionConfirmationDialogClose = () => {
    setCurrentSubscriptionCreate({});
    setSubscriptionConfirmationDialog(false);
  };
  // open subscription confirmation modal
  const handleConfirmSubscriptionMsg = async (data) => {
    if (!data?.subscription_plan_id) {
      setError(`subscription_plan_id_${data.subscription_id}`, {
        type: 'custom',
        message: 'Select subscription Plan'
      });
      return false;
    }
    setCurrentSubscriptionCreate(data);
    clearErrors(`subscription_plan_id_${data.subscription_id}`);
    const dataArray = data.subscription_plan_id.split('_');
    const subscriptionId = dataArray[0];
    const subscriptionPlanId = dataArray[1];
    let d = '';

    subscriptions.map((subscriptionRow) => {
      if (subscriptionRow.id == subscriptionId) {
        subscriptionRow.subscription_pricing_plan.map((pricingPlan) => {
          if (pricingPlan.id == subscriptionPlanId) {
            d = {
              ...subscriptionRow,
              subscription_pricing_plan: pricingPlan
            };
          }
        });
      }
    });
    setSelectedSubscription(d);
    setSubscriptionConfirmationDialog(true);
  };

  // MUI TABS START

  function TabPanel(props) {
    const { children, value, index, ...other } = props;

    return (
      <div
        role="tabpanel"
        hidden={value !== index}
        id={`simple-tabpanel-${index}`}
        aria-labelledby={`simple-tab-${index}`}
        {...other}
      >
        {value === index && (
          <Box sx={{ p: 3 }}>
            <Typography>{children}</Typography>
          </Box>
        )}
      </div>
    );
  }

  TabPanel.propTypes = {
    children: PropTypes.node,
    index: PropTypes.number.isRequired,
    value: PropTypes.number.isRequired
  };

  function a11yProps(index) {
    return {
      id: `simple-tab-${index}`,
      'aria-controls': `simple-tabpanel-${index}`
    };
  }

  const [value, setValue] = React.useState(0);

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  const checkUserSubscriptionActive = (subscription_id, return_field = '') => {
    const userSubscriptionIndex = userSubscriptions.findIndex(
      (a) => a.subscription_id == subscription_id
    );

    if (userSubscriptionIndex !== '' && userSubscriptionIndex >= 0) {
      if (
        Date.now() <
        new Date(
          userSubscriptions[userSubscriptionIndex]?.stripe_current_period_end
        ).getTime()
      ) {
        if (return_field == 'subscription_plan_id') {
          return userSubscriptions[userSubscriptionIndex].subscription_plan_id;
        }
        return userSubscriptions[userSubscriptionIndex];
      }
    }

    return false;
  };

  // MUI TABS END

  // MUI IMG
  const Img = styled('img')({
    margin: 'auto',
    display: 'block',
    maxWidth: '100%',
    maxHeight: '100%'
  });

  // Redirect to url or open modal
  const redirectToUrl = (status, active_url, inactive_url) => {
    if (status === true) {
      setIframeUrl(active_url);
      setOpenModal(true);
    } else {
      return window.open(inactive_url);
    }
  };

  const closeModal = () => {
    setOpenModal(false);
  };

  let userData = TokenService.getUserData();

  // Code activation form

  const validatorPromoCodeActivation = yup.object({
    code: yup.string('Enter code to activate').required('Code is required')
  });

  const {
    handleSubmit: handleSubmit2,
    control: control2,
    formState: { errors: errors2 }
  } = useForm({
    mode: 'onChange',
    reValidateMode: 'onChange',
    resolver: yupResolver(validatorPromoCodeActivation),
    defaultValues: {
      code: ''
    }
  });

  // handle activate code
  const handleActivateCode = (data) => {
    data.user_id = userData.id;
    post(`/api/promo-codes/activate`, { data })
      .then((res) => {
        if (res.status === 200) {
          setSnackbarMessage('Code reedem successfully!');
          setSnackbarMessageType('success');
          setOpenSnackbar(true);
        } else {
          setSnackbarMessage('Invalid code or expired');
          setSnackbarMessageType('error');
          setOpenSnackbar(true);
        }
      })
      .catch(function () {
        setSnackbarMessage('Invalid code or expired');
        setSnackbarMessageType('error');
        setOpenSnackbar(true);
      });
  };

  return (
    <>
      <Container
        id={'main-container'}
        component="main"
        maxWidth="xl"
        style={{ marginTop: 25 }}
      >
        <CustomerLogo />
        <Box sx={{ ml: 5 }}>
          <Typography variant="h4" mb={2} id="my-apps-title-h4">
            Owner Portal
          </Typography>
          <Typography variant="h6" mb={2} id="my-apps-title-h4">
            Welcome {userData?.first_name} {userData?.last_name} -{' '}
            {userData?.username}
          </Typography>
          {subscriptionOptions['User_Portal_Store_button_Text'] ? (
            <Button
              type={'button'}
              size="small"
              variant="contained"
              href={subscriptionOptions['User_Portal_Store_button_Link']}
            >
              {' '}
              {subscriptionOptions['User_Portal_Store_button_Text']}
            </Button>
          ) : (
            ''
          )}
          <Button
            type={'button'}
            size="small"
            variant="contained"
            href={
              'mailto:support@thoughtcastmagic.com?subject=Owner Portal Help'
            }
            sx={{ marginLeft: '10px' }}
          >
            Help
          </Button>
          {/* Tinymce Editor */}
          {subscriptionOptions['User_Portal_Promotional_Text']
            ? parse(subscriptionOptions['User_Portal_Promotional_Text'])
            : ''}
          {/* For Activating code */}
          <form id="activating-code-form" key={1} autoComplete="off">
            <Typography variant="h6" mb={2} id="activate-code">
              Activate a Code
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={4}>
                <TenantTextField
                  control={control2}
                  type="text"
                  id="promo-code"
                  name={'code'}
                  label={'Enter Code *'}
                  variant="outlined"
                  margin="normal"
                  fullWidth
                  inputProps={{ style: { textTransform: 'uppercase' } }}
                  error={!!errors2.code}
                  helperText={errors2.code ? errors2.code?.message : null}
                />
              </Grid>
              <Grid item xs={4}>
                <Button
                  size="large"
                  variant="contained"
                  sx={{ marginTop: '15px', height: '3.4rem' }}
                  onClick={handleSubmit2((data) => handleActivateCode(data))}
                >
                  Activate
                </Button>
              </Grid>
            </Grid>
          </form>
          <Grid id={'main-grid'} container spacing={2}>
            <Box sx={{ width: '100%' }}>
              <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                <Tabs
                  value={value}
                  onChange={handleChange}
                  aria-label="basic tabs example"
                >
                  <Tab key={0} label={'Subscriptions'} {...a11yProps(0)} />
                  {userProducts?.map((product, index) => {
                    index = index + 1;
                    if (product?.product_status === true) {
                      return (
                        <Tab
                          key={index}
                          label={product?.product_name}
                          {...a11yProps(index)}
                        />
                      );
                    }
                  })}
                </Tabs>
              </Box>
              {/* Subscriptions */}
              <TabPanel value={value} index={0} key={0}>
                <Grid container spacing={2} justify="space-between">
                  <Grid item xs={2}>
                    <ButtonBase>
                      <Img
                        sx={{ width: '8rem', height: '8rem' }}
                        alt="complex"
                        src={
                          subscriptionOptions['Subscription_Icon']
                            ? subscriptionOptions['Subscription_Icon']
                            : 'images/default-placeholder-250x100.png'
                        }
                      />
                    </ButtonBase>
                  </Grid>
                  <Grid item xs={8}>
                    <Typography variant="h3" mb={2} id={'Subscriptions'}>
                      Subscriptions
                    </Typography>
                    <Typography
                      variant="subtitle1"
                      mb={2}
                      id={
                        'These are all of the various subscriptions you can purchase for ThoughtCast Magic products!'
                      }
                    >
                      {subscriptionOptions['Subscription_Description']
                        ? subscriptionOptions['Subscription_Description']
                        : 'These are all of the various subscriptions you can purchase for ThoughtCast Magic products!'}
                    </Typography>
                  </Grid>
                </Grid>
                <Grid container spacing={2} justify="space-between">
                  <Grid item xs={12}>
                    <br></br>
                    {/* {'Subscriptions Loop'} */}
                    <Grid sx={{ flexGrow: 1 }} container spacing={2}>
                      <Grid item xs={12}>
                        <Grid container spacing={2}>
                          {subscriptions?.map((subscription) => {
                            subscriptionPricingPlanStr = [];
                            if (subscription?.status === true) {
                              return (
                                <>
                                  <Card
                                    sx={{
                                      width: '100%',
                                      height: 350,
                                      mr: 3,
                                      ml: 2,
                                      marginTop: '20px',
                                      boxShadow: 3
                                    }}
                                  >
                                    <CardContent>
                                      <Grid
                                        container
                                        spacing={2}
                                        justify="space-between"
                                      >
                                        <Grid item xs={2}>
                                          <ButtonBase>
                                            <Img
                                              sx={{
                                                width: '8rem',
                                                height: '8rem'
                                              }}
                                              alt="complex"
                                              src={
                                                subscription?.attachments
                                                  ?.public_url
                                                  ? subscription?.attachments
                                                      ?.public_url
                                                  : 'images/default-placeholder-250x100.png'
                                              }
                                            />
                                          </ButtonBase>
                                        </Grid>
                                        <Grid item xs={8}>
                                          <Typography
                                            variant="h3"
                                            mb={2}
                                            id={subscription?.subscription_name}
                                          >
                                            {subscription?.subscription_name}
                                          </Typography>
                                          <Typography
                                            variant="h6"
                                            mb={2}
                                            sx={{ color: 'grey' }}
                                            id={
                                              subscription?.subscription_description
                                            }
                                          >
                                            {
                                              subscription?.subscription_description
                                            }
                                          </Typography>
                                          {/* Check if user has subscription */}
                                          {checkUserSubscriptionActive(
                                            subscription.id
                                          ) !== false ? (
                                            <>
                                              <Typography
                                                variant="h6"
                                                mb={2}
                                                sx={{ color: 'grey' }}
                                                id={`subscription_expire_${subscription.id}`}
                                              >
                                                {`Current Subscription will expire on ${moment(
                                                  checkUserSubscriptionActive(
                                                    subscription.id
                                                  )?.stripe_current_period_end
                                                ).format('MMM  DD, YYYY')}`}
                                              </Typography>
                                              <Grid
                                                container
                                                spacing={2}
                                                sx={{
                                                  marginTop: '5px',
                                                  marginLeft: '5px'
                                                }}
                                              >
                                                <CheckCircleOutlineIcon
                                                  sx={{
                                                    color: green[500],
                                                    marginRight: '5px'
                                                  }}
                                                />
                                                <Typography
                                                  variant="body1"
                                                  sx={{ color: green[500] }}
                                                >
                                                  Active
                                                </Typography>
                                                <TenantSwitch
                                                  id={`enabled_${subscription.id}`}
                                                  name={`enabled_${subscription.id}`}
                                                  control={control}
                                                  onClick={(event) => {
                                                    handleConfirmationSubscriptionAutoRenew(
                                                      event,
                                                      subscription.id
                                                    );
                                                  }}
                                                  defaultValue={
                                                    checkUserSubscriptionActive(
                                                      subscription.id
                                                    )?.auto_subscription
                                                  }
                                                  label={'Auto Renew?'}
                                                  sx={{
                                                    marginLeft: '90px',
                                                    marginTop: '-5px'
                                                  }}
                                                />
                                              </Grid>
                                            </>
                                          ) : (
                                            <>
                                              <Grid
                                                container
                                                spacing={2}
                                                sx={{
                                                  marginTop: '5px',
                                                  marginLeft: '5px'
                                                }}
                                              >
                                                <CancelIcon
                                                  sx={{
                                                    color: red[500],
                                                    marginRight: '5px'
                                                  }}
                                                />
                                                <Typography
                                                  variant="body1"
                                                  sx={{ color: red[500] }}
                                                >
                                                  Inactive
                                                </Typography>
                                              </Grid>
                                            </>
                                          )}
                                          <FormControl>
                                            <TenantSelect
                                              id="subscription-select"
                                              control={control}
                                              variant="outlined"
                                              label="Choose Plan *"
                                              name={`subscription_plan_id_${subscription.id}`}
                                              sx={{ width: '170px' }}
                                              //displayEmpty
                                              defaultValue={`${
                                                subscription.id
                                              }_${
                                                checkUserSubscriptionActive(
                                                  subscription.id
                                                )?.subscription_plan_id
                                              }`}
                                              disabled={
                                                checkUserSubscriptionActive(
                                                  subscription.id
                                                ) !== false
                                                  ? true
                                                  : false
                                              }
                                            >
                                              {subscription?.subscription_pricing_plan?.map(
                                                (pricingPlan) => {
                                                  if (
                                                    !pricingPlan?.deleted &&
                                                    pricingPlan?.status === true
                                                  ) {
                                                    subscriptionPricingPlanStr.push(
                                                      pricingPlan?.description
                                                    );
                                                    return (
                                                      <MenuItem
                                                        key={pricingPlan.id}
                                                        value={`${subscription.id}_${pricingPlan.id}`}
                                                      >
                                                        {' '}
                                                        {`$${pricingPlan?.price} - `}
                                                        {
                                                          pricingPlan?.time_option_date
                                                        }
                                                        &nbsp;
                                                        {
                                                          pricingPlan?.time_option_frequency
                                                        }
                                                        {pricingPlan?.time_option_date >
                                                        1
                                                          ? 'S'
                                                          : ''}
                                                      </MenuItem>
                                                    );
                                                  }
                                                }
                                              )}
                                            </TenantSelect>
                                            <FormHelperText
                                              sx={{ color: 'red' }}
                                            >
                                              {errors[
                                                `subscription_plan_id_${subscription.id}`
                                              ]
                                                ? errors[
                                                    `subscription_plan_id_${subscription.id}`
                                                  ]?.message
                                                : null}
                                            </FormHelperText>
                                          </FormControl>
                                          <Button
                                            size="large"
                                            variant="contained"
                                            sx={{
                                              marginLeft: '30px',
                                              marginTop: '24px'
                                            }}
                                            onClick={() => {
                                              handleConfirmSubscriptionMsg({
                                                subscription_plan_id: getValues(
                                                  `subscription_plan_id_${subscription.id}`
                                                ),
                                                subscription_id: subscription.id
                                              });
                                            }}
                                            disabled={
                                              checkUserSubscriptionActive(
                                                subscription.id
                                              ) !== false
                                                ? true
                                                : false
                                            }
                                          >
                                            Subscribe
                                          </Button>
                                          <br></br>
                                          {subscriptionPricingPlanStr.map(
                                            (str) => {
                                              return (
                                                <Typography
                                                  key={str}
                                                  variant="subtitle2"
                                                  id={str}
                                                  sx={{ marginTop: '5px' }}
                                                >
                                                  {str}
                                                </Typography>
                                              );
                                            }
                                          )}
                                        </Grid>
                                      </Grid>
                                    </CardContent>
                                    <CardActions
                                      style={{
                                        justifyContent: 'center'
                                      }}
                                    ></CardActions>
                                  </Card>
                                </>
                              );
                            }
                          })}
                        </Grid>
                      </Grid>
                    </Grid>
                  </Grid>
                </Grid>
              </TabPanel>
              {/* {Products} */}
              {userProducts?.map((product, index) => {
                index = index + 1;
                if (product?.product_status === true) {
                  return (
                    <TabPanel value={value} index={index} key={index}>
                      <Grid container spacing={2} justify="space-between">
                        <Grid item xs={3}>
                          <ButtonBase>
                            <Img
                              sx={{
                                width:
                                  product?.product_id == 'bookTestLibrary'
                                    ? '20rem'
                                    : '8rem',
                                height:
                                  product?.product_id == 'bookTestLibrary'
                                    ? '20rem'
                                    : '8rem'
                              }}
                              alt="complex"
                              src={
                                product?.attachments?.public_url
                                  ? product?.attachments?.public_url
                                  : 'images/default-placeholder-250x100.png'
                              }
                            />
                          </ButtonBase>
                        </Grid>
                        <Grid item xs={8}>
                          <Typography
                            variant="h3"
                            mb={2}
                            id={product?.product_name}
                          >
                            {product?.product_name}
                          </Typography>
                          <Typography
                            variant="subtitle1"
                            mb={2}
                            id={product?.product_description}
                          >
                            {product?.product_description}
                          </Typography>
                          {product?.product_learn_more !== null &&
                          product?.product_learn_more !== '' ? (
                            <Button
                              variant="contained"
                              href={product?.product_learn_more}
                              target={'_blank'}
                            >
                              Learn More About {product?.product_name}
                            </Button>
                          ) : (
                            ''
                          )}
                        </Grid>
                      </Grid>
                      <Grid container spacing={2} justify="space-between">
                        <Grid item xs={12}>
                          {/* {'Apps Loop'} */}
                          {product?.product_id !== 'bookTestLibrary' ? (
                            <Typography
                              variant="h3"
                              mb={2}
                              id={'Apps'}
                              sx={{ padding: 2 }}
                            >
                              Apps
                            </Typography>
                          ) : (
                            ''
                          )}
                          <Grid sx={{ flexGrow: 1 }} container spacing={2}>
                            <Grid item xs={12}>
                              <Grid container spacing={2}>
                                {product?.apps?.map((app) => {
                                  if (app?.app_status === true) {
                                    return (
                                      <>
                                        <Card
                                          sx={{
                                            width: 250,
                                            height: 250,
                                            mr: 3,
                                            ml: 2,
                                            boxShadow: 3
                                          }}
                                        >
                                          <CardContent>
                                            <ButtonBase>
                                              <Img
                                                sx={{
                                                  width: '3rem',
                                                  height: '3rem'
                                                }}
                                                alt="complex"
                                                src={
                                                  app?.attachments?.public_url
                                                    ? app?.attachments
                                                        ?.public_url
                                                    : 'images/default-placeholder-250x100.png'
                                                }
                                              />
                                            </ButtonBase>
                                            <Typography
                                              variant="h6"
                                              color="text.secondary"
                                              gutterBottom
                                            >
                                              {app?.app_name}
                                            </Typography>
                                            {app?.is_purchased === true ? (
                                              <Stack
                                                direction="row"
                                                alignItems="center"
                                                gap={1}
                                              >
                                                <CheckCircleOutlineIcon
                                                  sx={{ color: green[500] }}
                                                />
                                                <Typography variant="body1">
                                                  {
                                                    subscriptionOptions[
                                                      'User_Portal_Active_Product_Text'
                                                    ]
                                                  }
                                                </Typography>
                                              </Stack>
                                            ) : (
                                              ''
                                            )}
                                            {app?.is_subscription === true ? (
                                              <Stack
                                                direction="row"
                                                alignItems="center"
                                                gap={1}
                                              >
                                                <CachedIcon
                                                  sx={{ color: blue[500] }}
                                                />
                                                <Typography variant="body1">
                                                  Subscribed
                                                </Typography>
                                              </Stack>
                                            ) : (
                                              ''
                                            )}
                                            {app?.is_subscription === false &&
                                            app?.is_purchased === false ? (
                                              <Stack
                                                direction="row"
                                                alignItems="center"
                                                gap={1}
                                              >
                                                <CancelIcon
                                                  sx={{ color: red[500] }}
                                                />
                                                <Typography variant="body1">
                                                  {
                                                    subscriptionOptions[
                                                      'User_Portal_Inactive_Product_Text'
                                                    ]
                                                  }
                                                </Typography>
                                              </Stack>
                                            ) : (
                                              ''
                                            )}
                                          </CardContent>
                                          <CardActions
                                            style={{
                                              justifyContent: 'center'
                                            }}
                                          >
                                            <Button
                                              type={'button'}
                                              size="small"
                                              variant="contained"
                                              onClick={() => {
                                                redirectToUrl(
                                                  app?.is_subscription ===
                                                    false &&
                                                    app?.is_purchased === false
                                                    ? false
                                                    : true,
                                                  app?.app_active_url,
                                                  app?.app_inactive_url
                                                );
                                              }}
                                            >
                                              {app?.is_subscription === false &&
                                              app?.is_purchased === false
                                                ? subscriptionOptions[
                                                    'User_Portal_Inactive_Product_Button_Text'
                                                  ]
                                                : subscriptionOptions[
                                                    'User_Portal_Active_Product_Button_Text'
                                                  ]}
                                            </Button>
                                          </CardActions>
                                        </Card>
                                      </>
                                    );
                                  }
                                })}
                              </Grid>
                            </Grid>
                          </Grid>

                          {/* {'Features Loop'} */}

                          <Typography
                            variant="h3"
                            mb={2}
                            id={'Features'}
                            sx={{ padding: 2 }}
                          >
                            {product?.product_id == 'bookTestLibrary'
                              ? 'Books'
                              : 'Features'}
                          </Typography>
                          <Grid sx={{ flexGrow: 1 }} container spacing={2}>
                            <Grid item xs={12}>
                              <Grid container spacing={2}>
                                {product?.features?.map((feature) => {
                                  if (feature?.feature_status === true) {
                                    return (
                                      <>
                                        <Card
                                          sx={{
                                            width: 250,
                                            height: 250,
                                            mr: 3,
                                            ml: 2,
                                            boxShadow: 3
                                          }}
                                        >
                                          <CardContent>
                                            <ButtonBase>
                                              <Img
                                                sx={{
                                                  width: '3rem',
                                                  height: '3rem'
                                                }}
                                                alt="complex"
                                                src={
                                                  feature?.attachments
                                                    ?.public_url
                                                    ? feature?.attachments
                                                        ?.public_url
                                                    : 'images/default-placeholder-250x100.png'
                                                }
                                              />
                                            </ButtonBase>
                                            <Typography
                                              color="text.secondary"
                                              gutterBottom
                                              variant="h6"
                                            >
                                              {feature?.feature_name}
                                            </Typography>
                                            {feature?.is_purchased === true ? (
                                              <Stack
                                                direction="row"
                                                alignItems="center"
                                                gap={1}
                                              >
                                                <CheckCircleOutlineIcon
                                                  sx={{ color: green[500] }}
                                                />
                                                <Typography variant="body1">
                                                  {
                                                    subscriptionOptions[
                                                      'User_Portal_Active_Product_Text'
                                                    ]
                                                  }
                                                </Typography>
                                              </Stack>
                                            ) : (
                                              ''
                                            )}
                                            {feature?.is_subscription ===
                                            true ? (
                                              <Stack
                                                direction="row"
                                                alignItems="center"
                                                gap={1}
                                              >
                                                <CachedIcon
                                                  sx={{ color: blue[500] }}
                                                />
                                                <Typography variant="body1">
                                                  Subscribed
                                                </Typography>
                                              </Stack>
                                            ) : (
                                              ''
                                            )}
                                            {feature?.is_subscription ===
                                              false &&
                                            feature?.is_purchased === false ? (
                                              <Stack
                                                direction="row"
                                                alignItems="center"
                                                gap={1}
                                              >
                                                <CancelIcon
                                                  sx={{ color: red[500] }}
                                                />
                                                <Typography variant="body1">
                                                  {
                                                    subscriptionOptions[
                                                      'User_Portal_Inactive_Product_Text'
                                                    ]
                                                  }
                                                </Typography>
                                              </Stack>
                                            ) : (
                                              ''
                                            )}
                                          </CardContent>
                                          <CardActions
                                            style={{
                                              justifyContent: 'center'
                                            }}
                                          >
                                            <Button
                                              size="small"
                                              variant="contained"
                                              onClick={() => {
                                                redirectToUrl(
                                                  feature?.is_subscription ===
                                                    false &&
                                                    feature?.is_purchased ===
                                                      false
                                                    ? false
                                                    : true,
                                                  feature?.feature_active_url,
                                                  feature?.feature_inactive_url
                                                );
                                              }}
                                            >
                                              {feature?.is_subscription ===
                                                false &&
                                              feature?.is_purchased === false
                                                ? subscriptionOptions[
                                                    'User_Portal_Inactive_Product_Button_Text'
                                                  ]
                                                : subscriptionOptions[
                                                    'User_Portal_Active_Product_Button_Text'
                                                  ]}
                                            </Button>
                                          </CardActions>
                                        </Card>
                                      </>
                                    );
                                  }
                                })}
                              </Grid>
                            </Grid>
                          </Grid>
                        </Grid>
                      </Grid>
                    </TabPanel>
                  );
                }
              })}
            </Box>
          </Grid>
          {userProducts.length < 1 && (
            <Typography
              variant="h5"
              style={{ color: 'grey' }}
              id="no-apps-text"
            >
              It looks like you don’t have access to any applications yet.
              Please contact your Administrator.{' '}
            </Typography>
          )}
        </Box>
      </Container>
      <PositionedSnackbar
        open={openSnackbar}
        autoHideDuration={2000}
        message={snackbarMessage}
        severity={snackbarMessageType}
        onClose={() => setOpenSnackbar(false)}
      />
      <TenantModal
        id="responsive-dialog-title"
        aria-labelledby="responsive-dialog-title"
        title=""
        fullWidth={true}
        fullScreen
        variant="alert"
        maxWidth="xl"
        open={openModal}
        close={closeModal}
        showCloseTopRight={false}
      >
        {iframeUrl !== '' ? (
          <iframe
            src={iframeUrl}
            title="React JS"
            style={{
              height: window.innerHeight - 100,
              minHeight: '700px',
              width: '100%'
            }}
          ></iframe>
        ) : (
          ''
        )}
      </TenantModal>
      <TenantModal
        open={subscriptionConfirmationDialog}
        close={handleSubscriptionConfirmationDialogClose}
        fullWidth
        maxWidth="md"
        id={'Subscription-confirm'}
        confirm={() => {
          handleCreateSubscription();
        }}
        title={`Are you sure you want to subscribe to ${selectedSubscription?.subscription_name} for ${selectedSubscription?.subscription_pricing_plan?.time_option_date}/${selectedSubscription?.subscription_pricing_plan?.time_option_frequency}? $${selectedSubscription?.subscription_pricing_plan?.price} will automatically be charged to your payment method on file.`}
      ></TenantModal>
      <TenantModal
        open={confirmationDialogOpen}
        close={handleConfirmationDialogClose}
        fullWidth
        maxWidth="md"
        id={'dialog-confirm'}
        confirm={handleSubscriptionAutoRenew}
        title={confirmationDialogMessage}
      ></TenantModal>
      <PaymentMethodGrid
        open={managePaymentMethodDialog}
        close={handlePaymentMethodDialogClose}
      />
    </>
  );
};
export default connect((state) => state)(Application);
