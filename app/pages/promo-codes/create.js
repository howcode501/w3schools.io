//Section Import
//React Imports
import React, { useEffect, useState } from 'react';

//Material UI Imports
import TextField from '@mui/material/TextField';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import Container from '@mui/material/Container';
import Button from '@mui/material/Button';
import Alert from '@mui/material/Alert';
import Switch from '@mui/material/Switch';
import Autocomplete from '@mui/material/Autocomplete';
import FormControl from '@mui/material/FormControl';
import { FormHelperText } from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import LoadingButton from '@mui/lab/LoadingButton';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';

//Material UI Icons
//Material UI Styles
//Material UI DataGrid
//Application Imports
import { useApi, useCacheAsyncValidator } from '../../hooks';
import { generateRandomCode } from '../../helpers/functions';

//NextJS Imports
import Link from 'next/link';
import { useRouter } from 'next/router';

//External Module Imports
import { connect, useDispatch } from 'react-redux';
import { Controller, useForm, useFormState } from 'react-hook-form';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';

//Section Main Function
const PromoCodeCreate = () => {
  //Used to determine loading or not
  const [optionsLoaded, setOptionsLoaded] = React.useState(false);
  const [loading, setLoading] = React.useState(true);
  const [loadingButton, setLoadingButton] = React.useState(false);
  const [remindToSave, setRemindToSave] = useState(false);
  const [productsOptions, setProductsOptions] = useState([]);
  const [appsOptions, setAppsOptions] = useState([]);
  const [featuresOptions, setFeaturesOptions] = useState([]);
  const [subscriptionOptions, setSubscriptionOptions] = useState([]);
  const [subscriptionPricingPlanOptions, setSubscriptionPricingPlanOptions] =
    useState([]);
  const [promoCodeConfig, setPromoCodeConfig] = useState({});
  const [generatedCodes, setGeneratedCodes] = useState([]);

  //Initialize the API
  const { put, post, get } = useApi();
  const dispatch = useDispatch();

  useEffect(() => {
    function getOptions() {
      if (!optionsLoaded) {
        get(`/api/promo-codes/options`)
          .then((response) => {
            setProductsOptions(response.data.data.products);
            setSubscriptionOptions(response.data.data.subscriptions);
            const promoCodeCharacters =
              response?.data?.data?.systemConfig?.find(
                (o) => o.name === 'Promo_Codes_Characters'
              );
            const promoCodeDefaultLength =
              response?.data?.data?.systemConfig?.find(
                (o) => o.name === 'Promo_Codes_Default_Length'
              );
            const promoCodeBulkCodeLength =
              response?.data?.data?.systemConfig?.find(
                (o) => o.name === 'Promo_Codes_Default_Bulk_Code_Length'
              );
            setPromoCodeConfig({
              promoCodeCharacters: promoCodeCharacters?.value,
              promoCodeDefaultLength: promoCodeDefaultLength?.value,
              promoCodeBulkCodeLength: promoCodeBulkCodeLength?.value
            });

            setLoading(false);
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
      getOptions();
      setOptionsLoaded(true);
    }

    loadPage();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  //Get the ID Called in the URL
  const router = useRouter();

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
    setSubscriptionPricingPlanOptions(newValue?.subscription_pricing_plan);
  };

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

    // Bulk code
    data.codes = generatedCodes;
    data.bulkCodes = generatedCodes.length > 1;

    // Bulk code if code text has comma
    if (data?.code?.includes(',')) {
      data.codes = data?.code.split(',');
      data.bulkCodes = true;
    }

    await put(`/api/promo-codes`, { data }).then((res) => {
      if (res.status === 200) {
        router.push('/promo-codes');
      }
    });
  };

  const handleCancelClick = () => {
    router.push('/promo-codes');
  };

  const handleGenerateRandomCode = async () => {
    // numberOfCodes,characters,length
    const numberOfCodeToBeGenerated = promoCodeConfig?.numberOfCodeGenerate
      ? promoCodeConfig?.numberOfCodeGenerate
      : 1;
    const randomCode = await generateRandomCode(
      numberOfCodeToBeGenerated,
      promoCodeConfig?.promoCodeCharacters !== '' &&
        promoCodeConfig?.promoCodeCharacters !== null
        ? promoCodeConfig?.promoCodeCharacters
        : 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789',
      promoCodeConfig?.promoCodeDefaultLength !== '' &&
        promoCodeConfig?.promoCodeDefaultLength !== null
        ? promoCodeConfig?.promoCodeDefaultLength
        : '11'
    );

    setGeneratedCodes(randomCode);
    setValue('code', randomCode[0], true);
  };

  const handleChangeNumberOfCodeGenerate = async (e) => {
    if (e.target.value !== '') {
      setPromoCodeConfig({
        ...promoCodeConfig,
        numberOfCodeGenerate: e.target.value
      });
    }
  };

  const handleChangeRandomCodeLength = async (e) => {
    if (e.target.value !== '') {
      setPromoCodeConfig({
        ...promoCodeConfig,
        promoCodeDefaultLength: e.target.value
      });
    }
  };

  function notValidCodeName(valueToCheck) {
    return new Promise((resolve) => {
      if (!valueToCheck) {
        return true;
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
      products: [],
      apps: [],
      features: [],
      subscriptions: '',
      subscription_pricing_plan: ''
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
                  Create Promo Code
                </Typography>
                <Breadcrumbs aria-label="breadcrumb">
                  <Link
                    id="goto-promo-code-link"
                    href="/promo-codes"
                    color="primary"
                  >
                    Promo Codes
                  </Link>
                  <Typography
                    id="create-promo-code-breadcrumb-text"
                    color="textPrimary"
                    component={'span'}
                  >
                    Create Promo Code
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
              <Grid container spacing={2} xs={9} sx={{ m: 0 }}>
                <Grid item xl={6} lg={6} md={6} sm={12} xs={12}>
                  <TextField
                    defaultValue={1}
                    label={'Number of Codes to Generate '}
                    variant="outlined"
                    margin="normal"
                    fullWidth
                    type="text"
                    id="create-promo-code-number-code-generate"
                    onChange={handleChangeNumberOfCodeGenerate}
                  />
                </Grid>
                <Grid item xl={6} lg={6} md={6} sm={12} xs={12}>
                  <TextField
                    defaultValue={promoCodeConfig?.promoCodeDefaultLength}
                    label={'Random Code Length'}
                    variant="outlined"
                    margin="normal"
                    fullWidth
                    type="text"
                    id="create-promo-code-random-code-length"
                    onChange={handleChangeRandomCodeLength}
                  />
                </Grid>
              </Grid>
              <Grid item xs={9}>
                <Controller
                  as={TextField}
                  name={'code'}
                  control={control}
                  render={({ field: { onChange, value } }) => (
                    <TextField
                      onChange={onChange}
                      value={value}
                      label={
                        'Code ( You can multiple with comma seperated list) *'
                      }
                      variant="outlined"
                      margin="normal"
                      error={!!errors.code}
                      helperText={errors.code ? errors.code?.message : null}
                      fullWidth
                      type="text"
                      id="create-promo-code"
                      inputProps={{ style: { textTransform: 'uppercase' } }}
                      InputProps={{
                        endAdornment: (
                          <Button
                            variant="contained"
                            color="primary"
                            onClick={handleGenerateRandomCode}
                            size={'large'}
                            sx={{ marginRight: '-14px' }}
                          >
                            Generate Random Code
                          </Button>
                        )
                      }}
                    />
                  )}
                />
                <Card>
                  <CardContent sx={{ textAlign: 'center' }}>
                    <Typography component="div" variant="h5" gutterBottom>
                      Generated Codes
                    </Typography>
                    <Typography variant="body2">
                      {generatedCodes.join(',')}
                    </Typography>
                  </CardContent>
                </Card>
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
                        value={value || null}
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
                  <FormHelperText>
                    {errors.apps ? errors.apps?.message : null}
                  </FormHelperText>
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
                  <FormHelperText>
                    {errors.features ? errors.features?.message : null}
                  </FormHelperText>
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

export default connect((state) => state)(PromoCodeCreate);
