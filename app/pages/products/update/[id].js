//Section Import
//React Imports
import React, { useState, useEffect } from 'react';

//Material UI Imports
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
import AppsGrid from '../../../components/apps_grid';
import FeaturesGrid from '../../../components/features_grid';
import BooksGrid from '../../../components/books_grid';
import {
  TenantTextField,
  BadgeTooltip,
  FileSelectButton,
  UserAvatar,
  TenantSwitch
} from '../../../components';

//NextJS Imports
import Link from 'next/link';
import { useRouter } from 'next/router';

//External Module Imports
import { connect } from 'react-redux';
import { useForm, Controller } from 'react-hook-form';
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
const ProductUpdate = () => {
  //Used to determine loading or not
  const [loading, setLoading] = React.useState(true);
  const [loadingButton, setLoadingButton] = React.useState(false);
  const [optionsLoaded, setOptionsLoaded] = React.useState(false);
  const [apps, setApps] = useState([]);
  const [features, setFeatures] = useState([]);
  const [products, setproducts] = useState([]);

  //Used for TabNumbers
  const [tabNumber, setTabNumber] = useState(0);

  //Used for DataGrids on the Tabs
  const [remindToSave, setRemindToSave] = useState(false);

  //Initialize the API
  const { get, post } = useApi();
  const handleResizeImage = useResizeImageHandler();
  const [s3bucketImageUpload, s3bucketImageRemove] = useS3Uploader();

  //Get the ID Called in the URL
  const router = useRouter();
  const { id } = router.query;

  let product = {
    apps: [],
    features: []
  };

  //Define the data that will be loaded client side

  function notValidProductName(valueToCheck) {
    return new Promise((resolve) => {
      if (products?.product_name == valueToCheck) {
        resolve(false);
      }

      post(`/api/products/product-validate`, {
        data: {
          product_name: valueToCheck.toString().trim()
        }
      }).then((res) => {
        if (res.status === 200) {
          if (res.data.data.exists) {
            resolve(true);
          } else {
            resolve(false);
          }
        } else {
          resolve(false);
        }
      });
    });
  }

  //Start up form validation
  const validationSchema = yup.object({
    product_name: yup
      .string('Enter product name')
      .required('Product name is required')
      .trim()
      .test(
        'validator',
        'A product with the same name already exists. Please choose another name.',
        async (value) => {
          if (value !== undefined && value !== '') {
            const isDuplicateExists = await notValidProductName(value);
            return !isDuplicateExists;
          }
          // WHEN THE VALUE IS EMPTY RETURN `true` by default
          return true;
        }
      ),
    product_learn_more: yup
      .string('Enter Learn more URL')
      .url('Learn more URL should be formatted as a URL')
  });

  // Apps functions

  const processAppAdd = (index) => {
    const newApps = index[0];
    apps.push({ ...newApps });
    setApps(apps);
    setRemindToSave(true);
  };

  const processAppUpdate = (index) => {
    let newApps = [];
    apps.forEach((app) => {
      if (app.id === index[0].id) {
        const newAppsObject = index[0];
        newApps.push({ ...newAppsObject });
      } else {
        newApps.push(app);
      }
    });

    setApps(newApps);
    setRemindToSave(true);
  };

  const processAppRemove = (appList) => {
    setApps(appList);
    setRemindToSave(true);
  };

  // Feature functions

  const processFeatureAdd = (index) => {
    const newFeatures = index[0];
    features.push({ ...newFeatures });

    setFeatures(features);
    setRemindToSave(true);
  };

  const processFeatureUpdate = (index) => {
    let newFeatures = [];
    features.forEach((feature) => {
      if (feature.id === index[0].id) {
        const newFeaturesObject = index[0];
        newFeatures.push({ ...newFeaturesObject });
      } else {
        newFeatures.push(feature);
      }
    });

    setFeatures(newFeatures);
    setRemindToSave(true);
  };

  const processFeatureRemove = (featureList) => {
    setFeatures(featureList);
    setRemindToSave(true);
  };

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
      product_name: '',
      product_id: '',
      product_description: '',
      product_learn_more: '',
      product_status: true,
      product_icon_id: '',
      attachment: ''
    }
  });

  useEffect(() => {
    async function loadPage() {
      setOptionsLoaded(true);
      setLoading(false);
    }

    loadPage();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  //TODO Come back to this and make it Async
  //API is used to Grab the User's Data
  useDidMountEffect(() => {
    get(`/api/products/${id}`)
      .then(async (response) => {
        setLoading(false);
        product = response.data.data.product;

        setproducts(product);

        setValue('product_name', product.product_name, true);
        setValue('product_id', product.product_id, true);
        setValue('product_description', product.product_description, true);
        setValue(
          'product_learn_more',
          product.product_learn_more == null ? '' : product.product_learn_more,
          true
        );
        setValue('product_status', product.product_status, true);
        setApps(product?.apps);
        setFeatures(product?.features);
        setValue('product_icon_id', product?.attachments?.id);
        setValue('attachment', product?.attachments?.public_url);
      })
      .catch(() => {
        //router.push('/unauthorized');
      });
  }, [id, optionsLoaded]);

  const stripAddIds = (id) => {
    if (id.toString().substring(0, 1) === 'a') {
      id = '';
    }
    return id;
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

      const pageType = 'Product';

      const data = await s3bucketImageUpload(resizedImage, 'variant', pageType);
      // TODO remove previous image
      await imageRemoveHandler();

      setValue('attachment', `${data.url}/${data.fields.key}`);
      setValue('product_icon_id', data?.attachment?.id);
    }
  };

  const imageRemoveHandler = async () => {
    const url = getValues('attachment');
    if (url && url.split(':')[0] !== 'data') {
      const urlar = url.split('/');
      const fileName = `${urlar[3]}/${urlar[4]}/${urlar[5]}`;
      await s3bucketImageRemove({ fileName });
    }

    setValue('product_icon_id', '');
    setValue('attachment', null);
  };

  const sendToDatabase = async (data) => {
    setLoadingButton(true);
    data.apps = apps.map((o) => ({ ...o, id: stripAddIds(o.id) }));
    data.features = features.map((o) => ({ ...o, id: stripAddIds(o.id) }));

    await post(`/api/products/${id}`, { data }).then((res) => {
      if (res.status === 200) {
        router.push('/products');
      }
    });
  };

  const handleTabChange = (event, newValue) => {
    setTabNumber(newValue);
    history.replaceState(undefined, undefined, '#' + newValue);
  };

  const handleCancelClick = () => {
    router.push('/products');
  };

  //Section Return
  return (
    <>
      <Container maxWidth="xl" sx={{ position: 'relative', pb: 8 }}>
        {/* Main Page and Form */}
        <form
          id="edit-product-form"
          key={1}
          onSubmit={handleSubmit((data) => sendToDatabase(data))}
        >
          <Grid container spacing={2}>
            <Grid item xs={4}>
              <Typography
                id="edit-product-title-h4"
                variant="h4"
                component={'span'}
              >
                Edit Product
              </Typography>
              <Breadcrumbs aria-label="breadcrumb" className="breadcrumb">
                <Link id="goto-product-link" href="/products" color="primary">
                  Products
                </Link>
                <Typography
                  id="edit-product-breadcrumb-text"
                  color="textPrimary"
                  component={'span'}
                >
                  Edit Product
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
                id="create-product-name"
                name={'product_name'}
                control={control}
                label={'Product Name *'}
                variant="outlined"
                margin="normal"
                fullWidth
                error={!!errors.product_name}
                helperText={
                  errors.product_name ? errors.product_name?.message : null
                }
                disabled={
                  products.product_name == 'Book Test Library' ? true : false
                }
              />
              <TenantTextField
                id="edit-product-product_id"
                name={'product_id'}
                control={control}
                label={'Product ID'}
                variant="outlined"
                margin="normal"
                fullWidth
                error={!!errors.product_id}
                helperText={
                  errors.product_id ? errors.product_id?.message : null
                }
                disabled={
                  products.product_name == 'Book Test Library' ? true : false
                }
              />
              <TenantTextField
                id="edit-product-product_description"
                name={'product_description'}
                control={control}
                label={'Product Description'}
                multiline
                minRows={4}
                variant="outlined"
                margin="normal"
                fullWidth
                error={!!errors.product_description}
                helperText={
                  errors.product_description
                    ? errors.product_description?.message
                    : null
                }
              />
              <TenantTextField
                id="edit-product-product_learn_more"
                name={'product_learn_more'}
                control={control}
                label={'Product Learn More Link'}
                variant="outlined"
                margin="normal"
                fullWidth
                error={!!errors.product_learn_more}
                helperText={
                  errors.product_learn_more
                    ? errors.product_learn_more?.message
                    : null
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
                    The product icon appears on product and in the user portal.{' '}
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
                  disabled={loading}
                  id="app-change-icon"
                  onChange={imageUploadHandler}
                  title="Change Icon"
                />
              </BadgeTooltip>
              <br />
              <br />
              <TenantSwitch
                name={'product_status'}
                control={control}
                label={'Product Active'}
              />
            </Grid>
            <Grid item xs={2}>
              <Grid sx={{ position: 'absolute', bottom: '0px', right: '24px' }}>
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
                  type={'submit'}
                  id="edit-product-button"
                  loading={loadingButton}
                >
                  Save Changes
                </LoadingButton>
              </Grid>
            </Grid>
          </Grid>
        </form>
        <Grid container spacing={2} mt={1}>
          {products.product_name == 'Book Test Library' ? (
            <>
              <Grid container item xs={12}>
                <Grid item xs={12}>
                  <AppBar position="static">
                    <Tabs
                      aria-label="Product Options"
                      variant="fullWidth"
                      indicatorColor="secondary"
                      textColor="inherit"
                      value={tabNumber}
                      onChange={handleTabChange}
                    >
                      <Tab
                        label="Books"
                        className="tabs"
                        id="books-tab"
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
                      id="books-tab-title"
                    >
                      Books
                    </Typography>
                    <div style={{ marginTop: 10 }}>
                      <BooksGrid
                        featuresData={features}
                        loading={loading}
                        addModal={true}
                        editModal={true}
                        addFunc={processFeatureAdd}
                        updateFunc={processFeatureUpdate}
                        deleteFunc={processFeatureRemove}
                      />
                    </div>
                  </TabPanel>
                </Grid>
              </Grid>
            </>
          ) : (
            <>
              <Grid container item xs={12}>
                <Grid item xs={12}>
                  <AppBar position="static">
                    <Tabs
                      aria-label="Product Options"
                      variant="fullWidth"
                      indicatorColor="secondary"
                      textColor="inherit"
                      value={tabNumber}
                      onChange={handleTabChange}
                    >
                      <Tab
                        label="Apps"
                        className="tabs"
                        id="apps-tab"
                        {...a11yProps(0)}
                      />
                      <Tab
                        label="Features"
                        className="tabs"
                        id="features-tab"
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
                      id="apps-tab-title"
                    >
                      Apps
                    </Typography>
                    <div style={{ marginTop: 10 }}>
                      <AppsGrid
                        appsData={apps}
                        loading={loading}
                        addModal={true}
                        editModal={true}
                        addFunc={processAppAdd}
                        updateFunc={processAppUpdate}
                        deleteFunc={processAppRemove}
                      />
                    </div>
                  </TabPanel>
                  <TabPanel value={tabNumber} tabIndex={1} p={0}>
                    <Typography
                      variant="h6"
                      component={'span'}
                      id="features-tab-title"
                    >
                      Features
                    </Typography>
                    <div style={{ marginTop: 10 }}>
                      <FeaturesGrid
                        featuresData={features}
                        loading={loading}
                        addModal={true}
                        editModal={true}
                        addFunc={processFeatureAdd}
                        updateFunc={processFeatureUpdate}
                        deleteFunc={processFeatureRemove}
                      />
                    </div>
                  </TabPanel>
                </Grid>
              </Grid>
            </>
          )}
        </Grid>
      </Container>
    </>
  );
};

export default connect((state) => state)(ProductUpdate);
