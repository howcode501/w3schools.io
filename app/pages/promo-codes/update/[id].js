//Section Import
//React Imports
import React, { useEffect, useState } from 'react';
import dayjs from 'dayjs';

//Material UI Imports
import TextField from '@mui/material/TextField';
import Grid from '@mui/material/Grid';
import Container from '@mui/material/Container';
import Button from '@mui/material/Button';
import Switch from '@mui/material/Switch';
import Autocomplete from '@mui/material/Autocomplete';
import FormControl from '@mui/material/FormControl';
import { FormHelperText } from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import LoadingButton from '@mui/lab/LoadingButton';

//Material UI Icons
//Material UI Styles
//Material UI DataGrid
//Application Imports
import { useApi, useCacheAsyncValidator } from '../../../hooks';

//NextJS Imports
import { useRouter } from 'next/router';

//External Module Imports
import { connect, useDispatch } from 'react-redux';
import { Controller, useForm } from 'react-hook-form';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';

//Section Main Function
const PromoCodeUpdate = () => {
  //Used to determine loading or not
  const [optionsLoaded, setOptionsLoaded] = React.useState(false);
  const [loadingButton, setLoadingButton] = React.useState(false);
  const [loading, setLoading] = React.useState(true);
  const [promoCode, setPromoCode] = useState([]);
  const [subscriptionPricingPlanDB, setSubscriptionPricingPlanDB] = useState(
    []
  );
  const [productsOptionsDb, setProductsOptionsDb] = useState([]);
  const [appsOptionsDb, setAppsOptionsDb] = useState([]);
  const [featuresOptionsDb, setFeaturesOptionsDb] = useState([]);
  const [subscriptionsDB, setSubscriptionsDB] = useState([]);

  const [productsOptions, setProductsOptions] = useState([]);
  const [appsOptions, setAppsOptions] = useState([]);
  const [featuresOptions, setFeaturesOptions] = useState([]);
  const [subscriptionOptions, setSubscriptionOptions] = useState([]);
  const [subscriptionPricingPlanOptions, setSubscriptionPricingPlanOptions] =
    useState([]);

  //Initialize the API
  const { post, get } = useApi();

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

  // handle change subscription
  const handleChangeSubscriptions = (newValue) => {
    if (newValue !== null && newValue !== undefined) {
      if (newValue.length) {
        setSubscriptionPricingPlanOptions(
          newValue[0]?.subscription_pricing_plan
        );
      } else {
        setSubscriptionPricingPlanOptions(newValue?.subscription_pricing_plan);
      }
    } else {
      setSubscriptionPricingPlanOptions([]);
      setSubscriptionPricingPlanDB([]);
    }
  };
  function getOptions() {
    if (!optionsLoaded) {
      get(`/api/promo-codes/options`)
        .then((response) => {
          setProductsOptions(response.data.data.products);
          setSubscriptionOptions(response.data.data.subscriptions);
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

  const handleConfirmMsg = async (data) => {
    await sendToDatabase(data);
  };

  const sendToDatabase = async (data) => {
    setLoadingButton(true);
    data.products = data?.products
      ? data?.products.map((o) => ({ id: o.id }))
      : [];
    data.apps = data?.apps ? data?.apps.map((o) => ({ id: o.id })) : [];
    data.features = data?.features
      ? data?.features.map((o) => ({ id: o.id }))
      : [];
    data.subscriptions = data?.subscriptions
      ? [{ id: data?.subscriptions?.id }]
      : [];
    data.subscription_pricing_plan = data?.subscription_pricing_plan
      ? [{ id: data?.subscription_pricing_plan?.id }]
      : [];
    await post(`/api/promo-codes/${id}`, { data }).then((res) => {
      if (res.status === 200) {
        router.push('/promo-codes');
      }
    });
  };

  const handleCancelClick = () => {
    router.push('/promo-codes');
  };

  function notValidCodeName(valueToCheck) {
    return new Promise((resolve) => {
      if (promoCode?.code == valueToCheck) {
        resolve(true);
      }

      post(`/api/promo-codes/code-validate`, {
        data: {
          code: valueToCheck.toString().trim()
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

  const [codeNameTest] = useCacheAsyncValidator(notValidCodeName);

  const validationSchema = yup.object({
    code: yup
      .string('Enter code')
      .required('Code is required')
      .trim()
      .test(
        'validator',
        'A code with the same name already exists. Please choose another code.',
        codeNameTest
      )
  });

  const {
    handleSubmit,
    control,
    setValue,
    formState: { errors }
  } = useForm({
    mode: 'onChange',
    reValidateMode: 'onChange',
    resolver: yupResolver(validationSchema),
    defaultValues: {
      code: '',
      description: '',
      expire_date_time: '',
      status: true,
      products: '',
      apps: '',
      features: '',
      subscriptions: '',
      subscription_pricing_plan: ''
    }
  });

  //TODO Come back to this and make it Async
  //API is used to Grab the User's Data

  useEffect(() => {
    // get options
    getOptions();
    if (optionsLoaded) {
      // get data
      get(`/api/promo-codes/${id}`)
        .then(async (response) => {
          const promoCoded = response.data.data.promoCode;

          setPromoCode(promoCoded);

          setValue('code', promoCoded?.code, true);
          setValue(
            'description',
            promoCoded?.description == null ? '' : promoCoded?.description,
            true
          );
          setValue(
            'expire_date_time',
            promoCoded?.expire_date_time == null
              ? ''
              : promoCoded?.expire_date_time,
            true
          );
          setValue('status', promoCoded?.status, true);
          // get matched products
          const productsMatched = productsOptions.filter((o1) =>
            promoCoded?.products.some((o2) => o1.id === o2.id)
          );
          setValue('products', productsMatched);
          // set static options
          setProductsOptionsDb(productsMatched);
          handleChangeProducts(productsMatched);
          setAppsOptionsDb(promoCoded?.apps);
          setValue('apps', promoCoded?.apps);
          setFeaturesOptionsDb(promoCoded?.features);
          setValue('features', promoCoded?.features);

          // get Matched subscriptions
          const subscriptionsMatched = subscriptionOptions.filter((o1) =>
            promoCoded?.subscriptions.some((o2) => o1.id === o2.id)
          );
          setValue('subscriptions', subscriptionsMatched[0]);
          setSubscriptionsDB(subscriptionsMatched[0]);
          handleChangeSubscriptions(subscriptionsMatched[0]);
          setValue(
            'subscription_pricing_plan',
            promoCoded?.subscription_pricing_plan[0]
          );
          setSubscriptionPricingPlanDB(
            promoCoded?.subscription_pricing_plan[0]
          );
          setLoading(false);
        })
        .catch(() => {});
    }
  }, [id, optionsLoaded]);

  //Section Return
  return (
    <>
      {loading === false ? (
        <Container maxWidth="xl" sx={{ position: 'relative', pb: 8 }}>
          {/* Main Page and Form */}
          <form
            id="update-promo-code-form"
            key={1}
            onSubmit={handleSubmit((data) => sendToDatabase(data))}
            autoComplete="off"
          >
            <Grid container spacing={2}>
              <Grid item xs={9}>
                <Controller
                  as={TextField}
                  name={'code'}
                  control={control}
                  render={({ field: { onChange, value } }) => (
                    <TextField
                      onChange={onChange}
                      value={value}
                      label={'Code *'}
                      variant="outlined"
                      margin="normal"
                      error={!!errors.code}
                      helperText={errors.code ? errors.code?.message : null}
                      fullWidth
                      type="text"
                      id="create-promo-code"
                      inputProps={{ style: { textTransform: 'uppercase' } }}
                    />
                  )}
                />
                <Controller
                  as={TextField}
                  name={'description'}
                  control={control}
                  render={({ field: { onChange, value } }) => (
                    <TextField
                      onChange={onChange}
                      value={value}
                      multiline
                      minRows={4}
                      label={'Description'}
                      variant="outlined"
                      margin="normal"
                      error={!!errors.description}
                      helperText={
                        errors.description ? errors.description?.message : null
                      }
                      fullWidth
                      type="text"
                      id="create-promo-code-description"
                    />
                  )}
                />
                <Controller
                  as={TextField}
                  name={'expire_date_time'}
                  control={control}
                  render={({ field: { onChange, value } }) => (
                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                      <DateTimePicker
                        sx={{ width: '100%', mt: 3 }}
                        label={'Expire date'}
                        control={control}
                        defaultValue={dayjs(value)}
                        onChange={(event) => {
                          onChange(event);
                        }}
                        renderInput={(params) => (
                          <TextField
                            variant="outlined"
                            fullWidth
                            {...params}
                            error={!!errors.expire_date_time}
                            helperText={
                              errors.expire_date_time
                                ? errors.expire_date_time?.message
                                : null
                            }
                          />
                        )}
                      />
                    </LocalizationProvider>
                  )}
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
                        multiple
                        onChange={(event, products) => {
                          onChange(products);
                          handleChangeProducts(products);
                        }}
                        options={productsOptions}
                        getOptionLabel={(option) => option.product_name}
                        defaultValue={productsOptionsDb}
                        isOptionEqualToValue={(option, value) =>
                          option.product_name === value.product_name
                        }
                        filterSelectedOptions
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            label="Products"
                            margin="normal"
                            variant="outlined"
                          />
                        )}
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
                        multiple
                        onChange={(event, apps) => {
                          onChange(apps);
                        }}
                        options={appsOptions}
                        getOptionLabel={(option) => option.app_name}
                        defaultValue={appsOptionsDb}
                        isOptionEqualToValue={(option, value) =>
                          option.app_name === value.app_name
                        }
                        filterSelectedOptions
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            label="Apps"
                            margin="normal"
                            variant="outlined"
                          />
                        )}
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
                        multiple
                        onChange={(event, features) => {
                          onChange(features);
                        }}
                        options={featuresOptions}
                        getOptionLabel={(option) => option.feature_name}
                        defaultValue={featuresOptionsDb}
                        isOptionEqualToValue={(option, value) =>
                          option.feature_name === value.feature_name
                        }
                        filterSelectedOptions
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            label="Features"
                            margin="normal"
                            variant="outlined"
                          />
                        )}
                      />
                    )}
                  />
                </FormControl>
                <FormControl
                  fullWidth
                  style={{ marginTop: 14 }}
                  error={!!errors.subscriptions}
                >
                  <Controller
                    control={control}
                    name={'subscriptions'}
                    render={({ field: { onChange } }) => (
                      <Autocomplete
                        onChange={(event, subscriptions) => {
                          onChange(subscriptions);
                          handleChangeSubscriptions(subscriptions);
                        }}
                        options={subscriptionOptions}
                        getOptionLabel={(option) => option.subscription_name}
                        defaultValue={subscriptionsDB}
                        isOptionEqualToValue={(option, value) =>
                          option.subscription_name === value.subscription_name
                        }
                        filterSelectedOptions
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            label="Subscriptions"
                            margin="normal"
                            variant="outlined"
                          />
                        )}
                      />
                    )}
                  />
                  <FormHelperText>
                    {errors.subscriptions
                      ? errors.subscriptions?.message
                      : null}
                  </FormHelperText>
                </FormControl>
                <FormControl
                  fullWidth
                  style={{ marginTop: 14 }}
                  error={!!errors.subscription_pricing_plan}
                >
                  <Controller
                    control={control}
                    name={'subscription_pricing_plan'}
                    render={({ field: { onChange } }) => (
                      <Autocomplete
                        onChange={(event, subscription_pricing_plan) => {
                          onChange(subscription_pricing_plan);
                        }}
                        options={subscriptionPricingPlanOptions}
                        getOptionLabel={(option) =>
                          `${option.time_option_date} ${option.time_option_frequency}`
                        }
                        defaultValue={subscriptionPricingPlanDB}
                        //isOptionEqualToValue={(option, value) => option.time_option_date === value.time_option_date}
                        filterSelectedOptions
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            label="Pricing Plan"
                            margin="normal"
                            variant="outlined"
                          />
                        )}
                      />
                    )}
                  />
                </FormControl>
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
                  as={Switch}
                  name={'status'}
                  control={control}
                  render={({ field: { onChange, value } }) => (
                    <Switch checked={value} onChange={onChange} />
                  )}
                />
                <label>Promo Code Active</label>
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
                    id="create-promo-code-button"
                    onClick={handleSubmit((data) => handleConfirmMsg(data))}
                    loading={loadingButton}
                  >
                    Save Changes
                  </LoadingButton>
                </Grid>
              </Grid>
            </Grid>
          </form>
        </Container>
      ) : (
        ''
      )}
    </>
  );
};

export default connect((state) => state)(PromoCodeUpdate);
