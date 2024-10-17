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
import LoadingButton from '@mui/lab/LoadingButton';
import AppBar from '@mui/material/AppBar';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';

//Material UI Icons
//Material UI Styles
//Material UI DataGrid
//Application Imports
import { useApi, useCacheAsyncValidator } from '../../../hooks';
import { genRandomHex } from '../../../helpers/functions';
import RoutesGrid from '../../../components/routes_gird';

//NextJS Imports
import Link from 'next/link';
import { useRouter } from 'next/router';

//External Module Imports
import { connect, useDispatch } from 'react-redux';
import { Controller, useForm, useFormState } from 'react-hook-form';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';

//Section Main Function
const ApiKeyUpdate = () => {
  //Used to determine loading or not
  const [optionsLoaded, setOptionsLoaded] = React.useState(false);
  const [options, setOptions] = React.useState({});
  const [loading, setLoading] = React.useState(true);
  const [loadingButton, setLoadingButton] = React.useState(false);
  const [remindToSave, setRemindToSave] = useState(false);
  const [apiKey, setApiKey] = useState({});
  //Used for TabNumbers
  const [tabNumber, setTabNumber] = useState(0);
  // Routes
  const [selectionModel, setSelectionModel] = useState([]);

  //Initialize the API
  const { post, get } = useApi();
  const dispatch = useDispatch();
  const router = useRouter();
  const { id } = router.query;

  function getOptions() {
    if (!optionsLoaded) {
      get(`/api/app-keys/options`)
        .then((response) => {
          setOptions(response.data.data.options);
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

  useEffect(() => {
    // get options
    getOptions();
    if (optionsLoaded) {
      // get data
      get(`/api/app-keys/${id}`)
        .then(async (response) => {
          const apikey = response.data.data.apiKey;

          setApiKey(apikey);

          setValue('email', apikey?.email, true);
          setValue('key', apikey?.key, true);
          setValue('status', apikey?.status, true);
          const changeOptions = apikey?.routes.filter(
            (item) => item.value === true
          );
          setSelectionModel(changeOptions);
          setLoading(false);
        })
        .catch(() => {});
    }
  }, [id, optionsLoaded]);

  const handleConfirmMsg = async (data) => {
    await sendToDatabase(data);
  };

  const sendToDatabase = async (data) => {
    const changeOptions = options.map((option) => {
      const checked = selectionModel.filter((item) => item.id === option.id);
      if (!checked.length > 0) {
        return {
          ...option,
          value: false
        };
      }

      return option;
    });
    data.routes = changeOptions;

    setLoadingButton(true);
    await post(`/api/app-keys/${id}`, { data }).then((res) => {
      if (res.status === 200) {
        router.push('/app-keys');
      }
    });
  };

  const handleCancelClick = () => {
    router.push('/app-keys');
  };

  const handleGenerateRandomKey = async () => {
    const randomCode = genRandomHex(32);
    setValue('key', randomCode, true);
  };

  function notValidEmail(valueToCheck) {
    return new Promise((resolve) => {
      if (apiKey?.email == valueToCheck) {
        resolve(true);
      }

      post(`/api/app-keys/email-validate`, {
        data: {
          email: valueToCheck.toString().toLowerCase().trim()
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

  const [userEmailTest] = useCacheAsyncValidator(notValidEmail);

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
    key: yup.string('Key').required('Key is required')
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
      email: '',
      key: '',
      status: true
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

  const handleTabChange = (event, newValue) => {
    setTabNumber(newValue);
  };

  //Used to Change Tabs
  function a11yProps(tabIndex) {
    return {
      id: `scrollable-force-tab-${tabIndex}`,
      'aria-controls': `scrollable-force-tabpanel-${tabIndex}`
    };
  }

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

  //Take the Routes that are added and update them
  const processRoutesUpdate = (newObject) => {
    setSelectionModel(newObject);
    setRemindToSave(true);
  };

  //Section Return
  return (
    <>
      {loading === false ? (
        <Container maxWidth="xl" sx={{ position: 'relative', pb: 8 }}>
          {/* Main Page and Form */}
          <form
            id="update-api-key-form"
            key={1}
            onSubmit={handleSubmit((data) => sendToDatabase(data))}
            autoComplete="off"
          >
            <Grid container spacing={2}>
              <Grid item xs={4}>
                <Typography
                  id="update-api-key-title-h4"
                  variant="h4"
                  component={'span'}
                >
                  Update API Key
                </Typography>
                <Breadcrumbs aria-label="breadcrumb">
                  <Link id="goto-api-key-link" href="/api-keys" color="primary">
                    Api keys
                  </Link>
                  <Typography
                    id="update-api-key-breadcrumb-text"
                    color="textPrimary"
                    component={'span'}
                  >
                    Update API Key
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
                <Controller
                  as={TextField}
                  name={'email'}
                  control={control}
                  render={({ field: { onChange, value } }) => (
                    <TextField
                      onChange={onChange}
                      value={value}
                      label={'Email'}
                      variant="outlined"
                      margin="normal"
                      error={!!errors.email}
                      helperText={errors.email ? errors.email?.message : null}
                      fullWidth
                      type="text"
                      id="update-api-key-email"
                      disabled
                    />
                  )}
                />
                <Controller
                  as={TextField}
                  name={'key'}
                  control={control}
                  render={({ field: { onChange, value } }) => (
                    <TextField
                      onChange={onChange}
                      value={value}
                      label={'Key *'}
                      variant="outlined"
                      margin="normal"
                      error={!!errors.key}
                      helperText={errors.key ? errors.key?.message : null}
                      fullWidth
                      type="text"
                      id="create-key"
                      InputProps={{
                        endAdornment: (
                          <Button
                            variant="contained"
                            color="primary"
                            onClick={handleGenerateRandomKey}
                            size={'large'}
                            sx={{ marginRight: '-14px' }}
                          >
                            Generate Random Key
                          </Button>
                        )
                      }}
                    />
                  )}
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
                  as={Switch}
                  name={'status'}
                  control={control}
                  render={({ field: { onChange, value } }) => (
                    <Switch checked={value} onChange={onChange} />
                  )}
                />
                <label>API Key Active</label>
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
                    id="update-api-key-button"
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
                    aria-label="api keys options"
                    variant="fullWidth"
                    indicatorColor="secondary"
                    textColor="inherit"
                    value={tabNumber}
                    onChange={handleTabChange}
                  >
                    <Tab
                      label="Routes"
                      className="tabs"
                      id="routes-tab"
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
                    id="routes-tab-title"
                  >
                    Routes
                  </Typography>
                  <div style={{ marginTop: 10 }}>
                    <RoutesGrid
                      selectionModel={selectionModel}
                      routes={options}
                      loading={loading}
                      updateFunc={processRoutesUpdate}
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

export default connect((state) => state)(ApiKeyUpdate);
