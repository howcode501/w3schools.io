//Section Import
//React Imports
import React, { useEffect, useState } from 'react';

//Material UI Imports
import TextField from '@mui/material/TextField';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import AppBar from '@mui/material/AppBar';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Container from '@mui/material/Container';
import Button from '@mui/material/Button';
import Alert from '@mui/material/Alert';
import Switch from '@mui/material/Switch';
import Autocomplete from '@mui/material/Autocomplete';
import FormControl from '@mui/material/FormControl';
import { FormHelperText } from '@mui/material';
import LoadingButton from '@mui/lab/LoadingButton';
import InfoIcon from '@mui/icons-material/Info';
import { Paper, Checkbox, FormControlLabel, Divider } from '@mui/material';

//Material UI Icons
//Material UI Styles
//Material UI DataGrid
//Application Imports
import {
  useApi,
  useCacheAsyncValidator,
  useS3Uploader,
  useResizeImageHandler
} from '../../../hooks';
import SubscriptionsPricingPlansGrid from '../../../components/subscriptions_pricing_plans_grid';
import {
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
const SubscriptionUpdate = () => {
  //Used to determine loading or not
  const [optionsLoaded, setOptionsLoaded] = React.useState(false);
  const [loadingButton, setLoadingButton] = React.useState(false);
  const [loading, setLoading] = React.useState(true);
  const [remindToSave, setRemindToSave] = useState(false);
  const [productsOptions, setProductsOptions] = useState([]);
  const [appsOptions, setAppsOptions] = useState([]);
  const [featuresOptions, setFeaturesOptions] = useState([]);
  const [subscriptionPricingPlan, setSubscriptionPricingPlan] = useState([]);
  const [subscriptions, setSubscriptions] = useState([]);

  //Used for Products, Apps, Features Autocomplete
  const [productsSelectAll, setProductsSelectAll] = useState(false);
  const [productsColumns, setProductsColumns] = useState([]);

  const [appsSelectAll, setAppsSelectAll] = useState(false);
  const [appsColumns, setAppsColumns] = useState([]);

  const [featuresSelectAll, setFeaturesSelectAll] = useState(false);
  const [featuresColumns, setFeaturesColumns] = useState([]);

  //Used for TabNumbers
  const [tabNumber, setTabNumber] = useState(0);

  //Initialize the API
  const { post, get } = useApi();
  const handleResizeImage = useResizeImageHandler();
  const [s3bucketImageUpload, s3bucketImageRemove] = useS3Uploader();

  //Get the ID Called in the URL
  const dispatch = useDispatch();
  const router = useRouter();
  const { id } = router.query;

  // handle change product
  const handleChangeProducts = (newValue) => {
    const appoptions = [];
    const featureOptions = [];
    newValue.map((product) => {
      appoptions.push(...product.apps);
      featureOptions.push(...product.features);
    });
    setAppsOptions(appoptions);
    setFeaturesOptions(featureOptions);
  };

  useEffect(() => {
    function getOptions() {
      if (!optionsLoaded) {
        get(`/api/subscriptions/options`)
          .then((response) => {
            setProductsOptions(response.data.data.products);
            setOptionsLoaded(true);
          })
          .catch((error) => {
            if (error.response.status === 403) {
              dispatch({
                type: 'SET_ALLOWED',
                isAllowed: false
              });
            }
          });
      }
    }

    async function loadPage() {
      await getOptions();
    }

    loadPage();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const stripAddIds = (id) => {
    if (id.toString().substring(0, 1) === 'a') {
      id = '';
    }
    return id;
  };

  const handleConfirmMsg = async (data) => {
    await sendToDatabase(data);
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

      const pageType = 'Subscription';

      const data = await s3bucketImageUpload(resizedImage, 'variant', pageType);
      // TODO remove previous image
      await imageRemoveHandler();

      setValue('attachment', `${data.url}/${data.fields.key}`);
      setValue('subscription_icon_id', data?.attachment?.id);
    }
  };

  const imageRemoveHandler = async () => {
    const url = getValues('attachment');
    if (url && url.split(':')[0] !== 'data') {
      const urlar = url.split('/');
      const fileName = `${urlar[3]}/${urlar[4]}/${urlar[5]}`;
      await s3bucketImageRemove({ fileName });
    }

    setValue('subscription_icon_id', '');
    setValue('attachment', null);
  };

  const sendToDatabase = async (data) => {
    setLoadingButton(true);
    data.subscriptionPricingPlan = subscriptionPricingPlan.map((o) => ({
      ...o,
      id: stripAddIds(o.id)
    }));
    // filter products, apps, features
    data.products = productsColumns.map((o) => ({ id: o.id }));
    data.apps = appsColumns.map((o) => ({ id: o.id }));
    data.features = featuresColumns.map((o) => ({ id: o.id }));
    await post(`/api/subscriptions/${id}`, { data }).then((res) => {
      if (res.status === 200) {
        router.push('/subscriptions');
      }
    });
  };

  // Pricing Plan functions

  const processPricingPlanAdd = (index) => {
    let newPricingPlan = [...subscriptionPricingPlan, ...index];

    setSubscriptionPricingPlan(newPricingPlan);
    setRemindToSave(true);
  };

  const processPricingPlanUpdate = (index) => {
    let newPricingPlan = [];
    subscriptionPricingPlan.forEach((pricingPlan) => {
      if (pricingPlan.id === index[0].id) {
        newPricingPlan.push(index[0]);
      } else {
        newPricingPlan.push(pricingPlan);
      }
    });

    setSubscriptionPricingPlan(newPricingPlan);
    setRemindToSave(true);
  };

  const processPricingPlanRemove = (pricingPlanList) => {
    setSubscriptionPricingPlan(pricingPlanList);
    setRemindToSave(true);
  };

  const handleTabChange = (event, newValue) => {
    setTabNumber(newValue);
  };

  const handleCancelClick = () => {
    router.push('/subscriptions');
  };

  function notValidSubscriptionName(valueToCheck) {
    return new Promise((resolve) => {
      if (subscriptions?.subscription_name == valueToCheck) {
        resolve(false);
      }

      post(`/api/subscriptions/subscription-validate`, {
        data: {
          subscription_name: valueToCheck.toString().trim()
        }
      }).then((res) => {
        if (res.status === 200) {
          if (res.data.data.exists) {
            resolve(true);
          } else {
            resolve(false);
          }
        } else {
          resolve(true);
        }
      });
    });
  }

  const [subscriptionNameTest] = useCacheAsyncValidator(
    notValidSubscriptionName
  );

  const validationSchema = yup.object({
    subscription_name: yup
      .string('Enter subscription name')
      .required('Subscription name is required')
      .trim()
      .test(
        'validator',
        'A subscription with the same name already exists. Please choose another name.',
        async (value) => {
          if (value !== undefined && value !== '') {
            const isDuplicateExists = await subscriptionNameTest(value);
            return !isDuplicateExists;
          }
          // WHEN THE VALUE IS EMPTY RETURN `true` by default
          return true;
        }
      )
    //     products: yup
    //     .string('Products')
    //    // .required('Products is required')
    //     .trim(),
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
      subscription_name: '',
      subscription_description: '',
      subscription_icon_id: '',
      mailchimp_tag: '',
      status: true,
      products: '',
      apps: '',
      features: '',
      attachment: ''
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

  //TODO Come back to this and make it Async
  //API is used to Grab the User's Data

  useEffect(() => {
    if (optionsLoaded) {
      get(`/api/subscriptions/${id}`)
        .then(async (response) => {
          const subscription_res = response.data.data.subscription;

          setSubscriptions(subscription_res);

          setValue(
            'subscription_name',
            subscription_res?.subscription_name,
            true
          );
          setValue(
            'subscription_description',
            subscription_res?.subscription_description == null
              ? ''
              : subscription_res?.subscription_description,
            true
          );

          setValue(
            'mailchimp_tag',
            subscription_res?.mailchimp_tag == null
              ? ''
              : subscription_res?.mailchimp_tag,
            true
          );
          setValue('status', subscription_res?.status, true);
          // get matched products

          const productsMatched = await productsOptions.filter((o1) =>
            subscription_res?.products.some((o2) => o1.id === o2.id)
          );

          setValue('products', productsMatched);
          setProductsColumns(productsMatched);
          // set static options
          handleChangeProducts(productsMatched);

          setValue('apps', subscription_res?.apps);
          setAppsColumns(subscription_res?.apps);
          setValue('features', subscription_res?.features);
          setFeaturesColumns(subscription_res?.features);
          setSubscriptionPricingPlan(
            subscription_res?.subscription_pricing_plan
          );

          setValue('attachment', subscription_res?.attachments?.public_url);
          setValue('subscription_icon_id', subscription_res?.attachments?.id);
          setLoading(false);
          // setTimeout(function () {
          //   setLoading(false);
          // }, 2000);
        })
        .catch(() => {
          //router.push('/unauthorized');
        });
    }
  }, [optionsLoaded]);

  // Product , Apps, Features Select All autocomplete

  const handleProductsToggleSelectAll = () => {
    setProductsSelectAll((prev) => {
      if (!prev) {
        setProductsColumns([...productsOptions]);
        handleChangeProducts([...productsOptions]);
      } else {
        setProductsColumns([]);
        handleChangeProducts([]);
      }
      return !prev;
    });
  };

  const handleAppsToggleSelectAll = () => {
    setAppsSelectAll((prev) => {
      if (!prev) {
        setAppsColumns([...appsOptions]);
      } else {
        setAppsColumns([]);
      }
      return !prev;
    });
  };

  const handleFeaturesToggleSelectAll = () => {
    setFeaturesSelectAll((prev) => {
      if (!prev) {
        setFeaturesColumns([...featuresOptions]);
      } else {
        setFeaturesColumns([]);
      }
      return !prev;
    });
  };

  //Section Return
  return (
    <>
      {loading === false ? (
        <Container maxWidth="xl" sx={{ position: 'relative', pb: 8 }}>
          {/* Main Page and Form */}
          <form
            id="create-promo-code-form"
            key={1}
            onSubmit={handleSubmit((data) => sendToDatabase(data))}
            autoComplete="off"
          >
            <Grid container spacing={2}>
              <Grid item xs={4}>
                <Typography
                  id="create-promo-code-title-h4"
                  variant="h4"
                  component={'span'}
                >
                  Edit Subscription
                </Typography>
                <Breadcrumbs aria-label="breadcrumb">
                  <Link
                    id="goto-promo-code-link"
                    href="/subscriptions"
                    color="primary"
                  >
                    Subscriptions
                  </Link>
                  <Typography
                    id="create-promo-code-breadcrumb-text"
                    color="textPrimary"
                    component={'span'}
                  >
                    Edit Subscription
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
                  id="create-subscription-name"
                  name={'subscription_name'}
                  control={control}
                  label={'Subscription Name *'}
                  variant="outlined"
                  margin="normal"
                  fullWidth
                  error={!!errors.subscription_name}
                  helperText={
                    errors.subscription_name
                      ? errors.subscription_name?.message
                      : null
                  }
                />
                <TenantTextField
                  id="create-subscription-subscription_description"
                  name={'subscription_description'}
                  control={control}
                  multiline
                  minRows={4}
                  label={'Subscription Description'}
                  variant="outlined"
                  margin="normal"
                  fullWidth
                  error={!!errors.subscription_description}
                  helperText={
                    errors.subscription_description
                      ? errors.subscription_description?.message
                      : null
                  }
                />
                <FormControl
                  fullWidth
                  style={{ marginTop: 14 }}
                  error={!!errors.products}
                >
                  <Controller
                    control={control}
                    name={'products'}
                    render={({ field: { onChange } }) => (
                      <Autocomplete
                        id={'products_autocomplete_with_select_all'}
                        multiple
                        fullWidth
                        disableCloseOnSelect
                        freeSolo={false}
                        value={productsColumns}
                        options={productsOptions}
                        getOptionLabel={(option) => option.product_name}
                        filterSelectedOptions
                        onChange={(_e, value, reason) => {
                          onChange(value);
                          handleChangeProducts(value);
                          if (reason === 'clear' || reason === 'removeOption')
                            setProductsSelectAll(false);
                          if (
                            reason === 'selectOption' &&
                            value.length === productsOptions.length
                          )
                            setProductsSelectAll(true);
                          setProductsColumns(value);
                        }}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            label="Products *"
                            margin="normal"
                            variant="outlined"
                          />
                        )}
                        PaperComponent={(paperProps) => {
                          const { children, ...restPaperProps } = paperProps;
                          return (
                            <Paper {...restPaperProps}>
                              <Box
                                onMouseDown={(e) => e.preventDefault()} // prevent blur
                                pl={1.5}
                                py={0.5}
                              >
                                <FormControlLabel
                                  onClick={(e) => {
                                    e.preventDefault(); // prevent blur
                                    handleProductsToggleSelectAll();
                                  }}
                                  label="Select all"
                                  control={
                                    <Checkbox
                                      id="select-all-checkbox"
                                      checked={productsSelectAll}
                                    />
                                  }
                                />
                              </Box>
                              <Divider />
                              {children}
                            </Paper>
                          );
                        }}
                      />
                    )}
                  />
                  <FormHelperText>
                    {errors.products ? errors.products?.message : null}
                  </FormHelperText>
                </FormControl>
                <FormControl
                  fullWidth
                  style={{ marginTop: 14 }}
                  error={!!errors.apps}
                >
                  <Controller
                    control={control}
                    name={'apps'}
                    render={({ field: { onChange } }) => (
                      <Autocomplete
                        id={'apps_autocomplete_with_select_all'}
                        multiple
                        fullWidth
                        disableCloseOnSelect
                        freeSolo={false}
                        value={appsColumns}
                        options={appsOptions}
                        getOptionLabel={(option) => option.app_name}
                        filterSelectedOptions
                        onChange={(_e, value, reason) => {
                          onChange(value);
                          if (reason === 'clear' || reason === 'removeOption')
                            setAppsSelectAll(false);
                          if (
                            reason === 'selectOption' &&
                            value.length === appsOptions.length
                          )
                            setAppsSelectAll(true);
                          setAppsColumns(value);
                        }}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            label="Apps"
                            margin="normal"
                            variant="outlined"
                          />
                        )}
                        PaperComponent={(paperProps) => {
                          const { children, ...restPaperProps } = paperProps;
                          return (
                            <Paper {...restPaperProps}>
                              <Box
                                onMouseDown={(e) => e.preventDefault()} // prevent blur
                                pl={1.5}
                                py={0.5}
                              >
                                <FormControlLabel
                                  onClick={(e) => {
                                    e.preventDefault(); // prevent blur
                                    handleAppsToggleSelectAll();
                                  }}
                                  label="Select all"
                                  control={
                                    <Checkbox
                                      id="select-all-checkbox"
                                      checked={appsSelectAll}
                                    />
                                  }
                                />
                              </Box>
                              <Divider />
                              {children}
                            </Paper>
                          );
                        }}
                      />
                    )}
                  />
                </FormControl>
                <FormControl
                  fullWidth
                  style={{ marginTop: 14 }}
                  error={!!errors.features}
                >
                  <Controller
                    control={control}
                    name={'features'}
                    render={({ field: { onChange } }) => (
                      <Autocomplete
                        id={'features_autocomplete_with_select_all'}
                        multiple
                        fullWidth
                        disableCloseOnSelect
                        freeSolo={false}
                        value={featuresColumns}
                        options={featuresOptions}
                        getOptionLabel={(option) => option.feature_name}
                        filterSelectedOptions
                        onChange={(_e, value, reason) => {
                          onChange(value);
                          if (reason === 'clear' || reason === 'removeOption')
                            setFeaturesSelectAll(false);
                          if (
                            reason === 'selectOption' &&
                            value.length === featuresOptions.length
                          )
                            setFeaturesSelectAll(true);
                          setFeaturesColumns(value);
                        }}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            label="Features"
                            margin="normal"
                            variant="outlined"
                          />
                        )}
                        PaperComponent={(paperProps) => {
                          const { children, ...restPaperProps } = paperProps;
                          return (
                            <Paper {...restPaperProps}>
                              <Box
                                onMouseDown={(e) => e.preventDefault()} // prevent blur
                                pl={1.5}
                                py={0.5}
                              >
                                <FormControlLabel
                                  onClick={(e) => {
                                    e.preventDefault(); // prevent blur
                                    handleFeaturesToggleSelectAll();
                                  }}
                                  label="Select all"
                                  control={
                                    <Checkbox
                                      id="select-all-checkbox"
                                      checked={featuresSelectAll}
                                    />
                                  }
                                />
                              </Box>
                              <Divider />
                              {children}
                            </Paper>
                          );
                        }}
                      />
                    )}
                  />
                </FormControl>
                <TenantTextField
                  id="create-subscription-mailchimp_tag"
                  name={'mailchimp_tag'}
                  control={control}
                  label={'Email/Shopify Tag'}
                  variant="outlined"
                  margin="normal"
                  fullWidth
                  error={!!errors.mailchimp_tag}
                  helperText={
                    errors.mailchimp_tag ? errors.mailchimp_tag?.message : null
                  }
                />

                <br />
                <br />
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
                      The subscription icon appears on subscription and in the
                      user portal. <br />
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
                    disabled={loading}
                    id="app-change-icon"
                    onChange={imageUploadHandler}
                    title="Change Icon"
                  />
                </BadgeTooltip>
                <br></br>
                <br></br>
                <Controller
                  as={Switch}
                  name={'status'}
                  control={control}
                  render={({ field: { onChange, value } }) => (
                    <Switch checked={value} onChange={onChange} />
                  )}
                />
                <label>Subscription Active</label>
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
                    id="create-subscription-button"
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
                    aria-label="Subscription Options"
                    variant="fullWidth"
                    indicatorColor="secondary"
                    textColor="inherit"
                    value={tabNumber}
                    onChange={handleTabChange}
                  >
                    <Tab
                      label="Pricing Plans"
                      className="tabs"
                      id="pricing-plan-tab"
                      {...a11yProps(0)}
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
                    id="pricing-plan-tab-title"
                  >
                    Pricing Plans
                  </Typography>
                  <div style={{ marginTop: 10 }}>
                    <SubscriptionsPricingPlansGrid
                      pricingPlanData={subscriptionPricingPlan}
                      loading={loading}
                      addModal={true}
                      editModal={true}
                      addFunc={processPricingPlanAdd}
                      updateFunc={processPricingPlanUpdate}
                      deleteFunc={processPricingPlanRemove}
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

export default connect((state) => state)(SubscriptionUpdate);
