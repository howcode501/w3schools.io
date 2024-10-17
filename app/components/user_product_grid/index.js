//React Imports
import React from 'react';

//Material UI Imports
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Accordion from '@mui/material/Accordion';
import AccordionDetails from '@mui/material/AccordionDetails';
import AccordionSummary from '@mui/material/AccordionSummary';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Grid from '@mui/material/Grid';
import Switch from '@mui/material/Switch';
import TextField from '@mui/material/TextField';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
const moment = require('moment');

// Token service
import TokenService from '../../services/token';
import { TenantSearchBar, TenantSwitch } from '../../components';

//External Imports
import { Controller, useForm } from 'react-hook-form';

const UserProducts = (params) => {
  let userRole = [];
  userRole = TokenService.getUserData();

  //console.log('params', params);

  const [expanded, setExpanded] = React.useState(false);
  const [userData, setUserData] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [showActiveProducts, setShowActiveProducts] = React.useState(false);

  const handleChange = (panel) => (event, isExpanded) => {
    setExpanded(isExpanded ? panel : false);
  };

  const updateData = async (
    event,
    data_type,
    index,
    productId,
    appId = '',
    featureId = '',
    fieldName = ''
  ) => {
    const object = {
      data_type: data_type,
      activated_by: userRole.roles[0]
    };

    const object_product = {
      data_type: 'product',
      product_id: productId + '_product',
      activated_by: userRole.roles[0]
    };

    // For product
    if (data_type === 'product') {
      if (event.target.name == 'product_visible_status') {
        object_product.product_visible_status = event.target.value;
      }
    }

    // For app
    if (data_type === 'app') {
      // default
      object.app_activated_by = 'Admin';
      // set id according to data type
      object.app_id = appId + '_' + data_type;
      if (event.target.name == 'app_visible_status') {
        object.app_visible_status = event.target.value;
      }
      if (event.target.name == 'app_status') {
        object.app_status = event.target.checked;
        if (event.target.checked === true) {
          object.app_activated_date_time = moment().format(
            'MMMM Do YYYY, h:mm:ss a'
          );
        } else {
          object.app_activated_by = '';
          object.app_activated_date_time = '';
        }
      }
      if (fieldName == 'app_description') {
        object.app_description = event.target.value;
      }
    } else if (data_type === 'feature') {
      // For feature
      // default
      object.feature_activated_by = 'Admin';
      // set id according to data type
      object.feature_id = featureId + '_' + data_type;
      if (event.target.name == 'feature_visible_status') {
        object.feature_visible_status = event.target.value;
      }
      if (event.target.name == 'feature_status') {
        object.feature_status = event.target.checked;
        if (event.target.checked === true) {
          object.feature_activated_date_time = moment().format(
            'MMMM Do YYYY, h:mm:ss a'
          );
        } else {
          object.feature_activated_by = '';
          object.feature_activated_date_time = '';
        }
      }
      if (fieldName == 'feature_description') {
        object.feature_description = event.target.value;
      }
    }
    // Push common
    if (params?.userProducts.length > 0) {
      params?.userProducts.forEach((userProduct, i) => {
        if (userProduct.product_id === productId + '_' + data_type) {
          if (data_type === 'product') {
            params.userProducts[i] = { ...userProduct, ...object_product };
          }
          if (data_type === 'app') {
            processApps(appId, productId, object);
          } else if (data_type === 'feature') {
            processFeatures(featureId, productId, object);
          }
        } else {
          if (params.userProducts[productId] == undefined) {
            params.userProducts[productId] = object_product;
          }

          if (data_type === 'app') {
            processApps(appId, productId, object);
          } else if (data_type === 'feature') {
            processFeatures(featureId, productId, object);
          }
        }
      });
    } else {
      params.userProducts[productId] = object_product;

      if (data_type === 'app') {
        processApps(appId, productId, object);
      } else if (data_type === 'feature') {
        processFeatures(featureId, productId, object);
      }
    }

    // finally set
    params.updateFunc(params?.userProducts);
    setUserData(userData === true ? true : false);
  };

  // Process Apps
  const processApps = (appId, productId, object) => {
    if (params.userProducts[productId]?.apps?.length > 0) {
      params.userProducts[productId].apps?.forEach((app, i) => {
        if (app.app_id === object?.app_id) {
          params.userProducts[productId].apps[i] = { ...app, ...object };
        } else {
          params.userProducts[productId].apps[appId] = object;
        }
      });
    } else {
      params.userProducts[productId].apps = [];
      params.userProducts[productId].apps[appId] = object;
    }

    // finally set
    params.updateFunc(params.userProducts);
  };

  // Process Features
  const processFeatures = (featureId, productId, object) => {
    if (params.userProducts[productId]?.features?.length > 0) {
      params.userProducts[productId].features?.forEach((feature, i) => {
        if (feature.feature_id === object?.feature_id) {
          params.userProducts[productId].features[i] = {
            ...feature,
            ...object
          };
        } else {
          params.userProducts[productId].features[featureId] = object;
        }
      });
    } else {
      params.userProducts[productId].features = [];
      params.userProducts[productId].features[featureId] = object;
    }

    // finally set
    params.updateFunc(params.userProducts);
  };

  const {
    control,
    formState: { errors }
  } = useForm({
    mode: 'onChange',
    reValidateMode: 'onChange',
    defaultValues: {
      product_visible_status: 'Global',
      show_active_products: false,
      app_visible_status: 'Global',
      app_status: false,
      app_activated_by: '',
      app_activated_date_time: '',
      app_description: '',
      feature_visible_status: 'Global',
      feature_status: false,
      feature_activated_by: '',
      feature_activated_date_time: '',
      feature_description: ''
    }
  });

  // Product search
  const setSearchValue = (query) => {
    setSearchQuery(query);

    const filterData = params?.productsOriginal.reduce(function (result, prod) {
      const appsProd = prod.apps.reduce((result, prodApps) => {
        if (
          prodApps.app_name.toLowerCase().includes(query.toLowerCase()) ||
          query === '' ||
          prod.product_name.toLowerCase().includes(query.toLowerCase())
        ) {
          delete prodApps.hide;
        } else {
          prodApps.hide = true;
        }
        result.push(prodApps);
        return result;
      }, []);

      const featuresProd = prod.features.reduce((result, prodFeature) => {
        if (
          prodFeature.feature_name
            .toLowerCase()
            .includes(query.toLowerCase()) ||
          query === '' ||
          prod.product_name.toLowerCase().includes(query.toLowerCase())
        ) {
          delete prodFeature.hide;
        } else {
          prodFeature.hide = true;
        }
        result.push(prodFeature);
        return result;
      }, []);

      prod.apps = appsProd;
      prod.features = featuresProd;

      const appsProdStatus = prod.apps.filter((prodApps) => !prodApps.hide);
      const featuresStatus = prod.features.filter(
        (prodFeature) => !prodFeature.hide
      );
      if (
        appsProdStatus.length ||
        featuresStatus.length ||
        prod.product_name.toLowerCase().includes(query.toLowerCase())
      )
        result.push(prod);
      return result;
    }, []);

    if (query) {
      params.updateProducts(filterData);
    } else {
      params.updateProducts(params?.productsOriginal);
    }
  };

  // set show active products value
  const setShowActiveProductsValue = (event) => {
    setShowActiveProducts(event.target.checked);
  };

  // handle active all products / Apps / features
  const handleActivateAllProducts = (event) => {
    params?.products.map((product) => {
      product?.apps.map((app, indexApp) => {
        event.target.name = 'app_status';
        updateData(event, 'app', indexApp, product?.id, app?.id);
      });
      product?.features.map((feature, indexFeature) => {
        event.target.name = 'feature_status';
        updateData(
          event,
          'feature',
          indexFeature,
          product?.id,
          '',
          feature?.id
        );
      });
    });
  };

  return (
    <React.Fragment>
      <div>
        <Grid
          container
          spacing={0}
          direction="column"
          alignItems="center"
          justifyContent="center"
        >
          <TenantSearchBar
            placeholder={'Search Product'}
            setSearchQuery={setSearchValue}
          ></TenantSearchBar>
          <TenantSwitch
            name={'show_active_products'}
            control={control}
            label={'Show active products'}
            id="edit-user-status-switch"
            sx={{ marginLeft: '-196px' }}
            defaultValue={false}
            onClick={setShowActiveProductsValue}
          />
        </Grid>
        <grid container spacing={0} direction="column">
          <TenantSwitch
            name={'active_all_products'}
            control={control}
            label={'Active all Products, Apps, Features'}
            id="active-all-products"
            defaultValue={false}
            onClick={handleActivateAllProducts}
          />
        </grid>
        {params?.products.map((product, productIndex) => (
          <>
            <div>
              <Typography
                sx={{
                  position: 'absolute',
                  zIndex: '999999',
                  marginLeft: '190px',
                  marginTop: '14px',
                  color: 'grey',
                  fontWeight: 'bolder',
                  width: '9%'
                }}
                key={`${product?.id}-product_visible_status`}
              >
                <FormControl fullWidth>
                  <InputLabel>Product Status</InputLabel>
                  <Controller
                    name={'product_visible_status'}
                    control={control}
                    render={({ field, value }) => (
                      <Select
                        {...field}
                        label="product status"
                        variant="outlined"
                        fullWidth
                        defaultValue={
                          params?.userProducts[product?.id] !== undefined
                            ? params?.userProducts[product?.id]
                                ?.product_visible_status
                            : 'Global'
                        }
                        value={value}
                        onChange={(event) => {
                          updateData(
                            event,
                            'product',
                            productIndex,
                            product?.id
                          );
                        }}
                        id={`create-user-product_visible_status-select_${product?.id}`}
                      >
                        <MenuItem
                          key={'1product' + productIndex}
                          value={'Global'}
                          id={`create-user-product_visible_status-menu-item-1_${product?.id}`}
                        >
                          Global
                        </MenuItem>
                        <MenuItem
                          key={'2product' + productIndex}
                          value={'Visible'}
                          id={`create-user-product_visible_status-menu-item-2_${product?.id}`}
                        >
                          Visible
                        </MenuItem>
                        <MenuItem
                          key={'3product' + productIndex}
                          value={'Hidden'}
                          id={`create-user-product_visible_status-menu-item-3_${product?.id}`}
                        >
                          Hidden
                        </MenuItem>
                      </Select>
                    )}
                  />
                </FormControl>
              </Typography>
              <Accordion
                expanded={expanded === product?.id}
                onChange={handleChange(product?.id)}
                key={`${product?.id}-accordion`}
                sx={{ padding: '18px', marginTop: '100px' }}
              >
                <AccordionSummary
                  expandIcon={<ExpandMoreIcon />}
                  aria-controls={`${product?.id}-content`}
                  id={`${product?.id}-header`}
                >
                  <Typography
                    sx={{ width: '33%', flexShrink: 0 }}
                    key={`${product?.id}-product_name`}
                  >
                    {product?.product_name}
                  </Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Box
                    sx={{ width: '100%', maxWidth: 500 }}
                    key={`${product?.id}-product_box`}
                  >
                    {/* Loop through apps */}
                    {product?.apps.map((app, indexApp) => {
                      if (
                        !app.hide ||
                        (searchQuery == '' &&
                          showActiveProducts === true &&
                          app.app_status === true)
                      ) {
                        return (
                          <Card
                            sx={{ minWidth: 1400, marginTop: '12px' }}
                            key={`${product?.id}-${indexApp}-app-card`}
                          >
                            <CardContent
                              key={`${product?.id}-${indexApp}-app-card-content`}
                            >
                              <Typography
                                variant="h5"
                                component="div"
                                key={`${product?.id}-${indexApp}-app-name`}
                              >
                                {app?.app_name}
                              </Typography>
                              <Typography
                                variant="body2"
                                key={`${product?.id}-${indexApp}-app-body`}
                              >
                                <Grid
                                  item
                                  xs={3}
                                  style={{
                                    marginTop: 12,
                                    float: 'right',
                                    marginRight: '50px',
                                    minWidth: '150px'
                                  }}
                                >
                                  <FormControl fullWidth>
                                    <InputLabel>App Status</InputLabel>
                                    <Controller
                                      name={'app_visible_status'}
                                      control={control}
                                      render={({ field, value }) => (
                                        <Select
                                          {...field}
                                          label="app_status"
                                          variant="outlined"
                                          fullWidth
                                          defaultValue={
                                            params?.userProducts[product?.id]
                                              ?.apps !== undefined
                                              ? params?.userProducts[
                                                  product?.id
                                                ]?.apps[app?.id]
                                                  ?.app_visible_status
                                              : 'Global'
                                          }
                                          value={value}
                                          onChange={(event) => {
                                            updateData(
                                              event,
                                              'app',
                                              indexApp,
                                              product?.id,
                                              app?.id
                                            );
                                          }}
                                          id={`create-user-app_visible_status-select_${app?.id}`}
                                        >
                                          <MenuItem
                                            key={'1app' + indexApp}
                                            value={'Global'}
                                            id={`create-user-app_visible_status-menu-item-1_${app?.id}`}
                                          >
                                            Global
                                          </MenuItem>
                                          <MenuItem
                                            key={'2app' + indexApp}
                                            value={'Visible'}
                                            id={`create-user-app_visible_status-menu-item-2_${app?.id}`}
                                          >
                                            Visible
                                          </MenuItem>
                                          <MenuItem
                                            key={'3app' + indexApp}
                                            value={'Hidden'}
                                            id={`create-user-app_visible_status-menu-item-3_${app?.id}`}
                                          >
                                            Hidden
                                          </MenuItem>
                                        </Select>
                                      )}
                                    />
                                  </FormControl>
                                </Grid>
                                <Grid item xs={3}>
                                  <Controller
                                    as={Switch}
                                    name={'app_status'}
                                    control={control}
                                    render={({ field, value }) => (
                                      <Switch
                                        {...field}
                                        onChange={(event) => {
                                          updateData(
                                            event,
                                            'app',
                                            indexApp,
                                            product?.id,
                                            app?.id
                                          );
                                        }}
                                        defaultChecked={
                                          params?.userProducts[product?.id]
                                            ?.apps !== undefined
                                            ? params?.userProducts[product?.id]
                                                ?.apps[app?.id]?.app_status
                                            : false
                                        }
                                        value={value}
                                        id={`create-user-app_status_${app?.id}`}
                                      />
                                    )}
                                  />
                                  <label>App Active</label>
                                </Grid>
                                <Grid item xs={6}>
                                  <Controller
                                    as={TextField}
                                    name={'app_activated_by'}
                                    control={control}
                                    render={({ field: { onChange } }) => (
                                      <TextField
                                        onChange={onChange}
                                        autoFocus={true}
                                        value={
                                          params?.userProducts[product?.id]
                                            ?.apps !== undefined
                                            ? params?.userProducts[product?.id]
                                                ?.apps[app?.id]
                                                ?.app_activated_by
                                            : ''
                                        }
                                        label={'Activated By'}
                                        margin="normal"
                                        error={!!errors.activated_by}
                                        helperText={
                                          errors.activated_by
                                            ? errors.activated_by?.message
                                            : null
                                        }
                                        fullWidth
                                        type="text"
                                        InputLabelProps={{ shrink: true }}
                                        disabled
                                        id={`create-user-app_activated_by_${app?.id}`}
                                      />
                                    )}
                                  />
                                  <Controller
                                    as={TextField}
                                    name={'app_activated_date_time'}
                                    control={control}
                                    render={({ field: { onChange } }) => (
                                      <TextField
                                        onChange={onChange}
                                        value={
                                          params?.userProducts[product?.id]
                                            ?.apps !== undefined
                                            ? params?.userProducts[product?.id]
                                                ?.apps[app?.id]
                                                ?.app_activated_date_time
                                            : ''
                                        }
                                        label={'Activated On'}
                                        variant="outlined"
                                        margin="normal"
                                        error={!!errors.activated_date_time}
                                        helperText={
                                          errors.activated_date_time
                                            ? errors.activated_date_time
                                                ?.message
                                            : null
                                        }
                                        fullWidth
                                        type="text"
                                        InputLabelProps={{ shrink: true }}
                                        disabled
                                        id={`create-user-app_activated_date_time_${app?.id}`}
                                      />
                                    )}
                                  />
                                  <Controller
                                    as={TextField}
                                    name={'app_description'}
                                    control={control}
                                    render={() => (
                                      <TextField
                                        onChange={(event) => {
                                          updateData(
                                            event,
                                            'app',
                                            indexApp,
                                            product?.id,
                                            app?.id,
                                            '',
                                            'app_description'
                                          );
                                        }}
                                        InputLabelProps={{ shrink: true }}
                                        multiline
                                        minRows={4}
                                        label={'Description'}
                                        variant="outlined"
                                        margin="normal"
                                        error={!!errors.description}
                                        helperText={
                                          errors.description
                                            ? errors.description?.message
                                            : null
                                        }
                                        defaultValue={
                                          params?.userProducts[product?.id]
                                            ?.apps !== undefined
                                            ? params?.userProducts[product?.id]
                                                ?.apps[app?.id]?.app_description
                                            : ''
                                        }
                                        fullWidth
                                        type="text"
                                        id={`create-user-app_description_${app?.id}`}
                                      />
                                    )}
                                  />
                                </Grid>
                              </Typography>
                            </CardContent>
                          </Card>
                        );
                      }
                    })}
                  </Box>
                  <Box
                    sx={{ width: '100%', maxWidth: 500 }}
                    key={`${product?.id}-feature-box`}
                  >
                    {/* Loop through features */}
                    {product?.features.map((feature, indexFeature) => {
                      if (
                        !feature.hide ||
                        (searchQuery == '' &&
                          showActiveProducts === true &&
                          feature.feature_status === true)
                      ) {
                        return (
                          <Card
                            sx={{ minWidth: 1400, marginTop: '12px' }}
                            key={`${product?.id}-${indexFeature}-feature-card`}
                          >
                            <CardContent
                              key={`${product?.id}-${indexFeature}-feature-card-content`}
                            >
                              <Typography
                                variant="h5"
                                component="div"
                                key={`${product?.id}-${indexFeature}-feature-name`}
                              >
                                {feature?.feature_name}
                              </Typography>
                              <Typography
                                variant="body2"
                                key={`${product?.id}-${indexFeature}-feature-body`}
                              >
                                <Grid
                                  item
                                  xs={3}
                                  style={{
                                    marginTop: 12,
                                    float: 'right',
                                    marginRight: '50px',
                                    minWidth: '150px'
                                  }}
                                >
                                  <FormControl fullWidth>
                                    <InputLabel>Feature Status</InputLabel>
                                    <Controller
                                      name={'feature_visible_status'}
                                      control={control}
                                      render={({ field, value }) => (
                                        <Select
                                          {...field}
                                          label="feature_status"
                                          variant="outlined"
                                          defaultValue={
                                            params?.userProducts[product?.id]
                                              ?.features !== undefined
                                              ? params?.userProducts[
                                                  product?.id
                                                ]?.features[feature?.id]
                                                  ?.feature_visible_status
                                              : 'Global'
                                          }
                                          value={value}
                                          onChange={(event) => {
                                            updateData(
                                              event,
                                              'feature',
                                              indexFeature,
                                              product?.id,
                                              '',
                                              feature?.id
                                            );
                                          }}
                                          fullWidth
                                          id={`create-user-feature_visible_status-select_${feature?.id}`}
                                        >
                                          <MenuItem
                                            key={'1feature_' + indexFeature}
                                            value={'Global'}
                                            id={`create-user-feature_visible_status-menu-item-1
                                        _${feature?.id}`}
                                          >
                                            Global
                                          </MenuItem>
                                          <MenuItem
                                            key={'2feature_' + indexFeature}
                                            value={'Visible'}
                                            id={`create-user-feature_visible_status-menu-item-2
                                        _${feature?.id}`}
                                          >
                                            Visible
                                          </MenuItem>
                                          <MenuItem
                                            key={'3feature_' + indexFeature}
                                            value={'Hidden'}
                                            id={`create-user-feature_visible_status-menu-item-3
                                        _${feature?.id}`}
                                          >
                                            Hidden
                                          </MenuItem>
                                        </Select>
                                      )}
                                    />
                                  </FormControl>
                                </Grid>
                                <Grid item xs={3}>
                                  <Controller
                                    as={Switch}
                                    name={'feature_status'}
                                    control={control}
                                    render={({ field, value }) => (
                                      <Switch
                                        {...field}
                                        onChange={(event) => {
                                          updateData(
                                            event,
                                            'feature',
                                            indexFeature,
                                            product?.id,
                                            '',
                                            feature?.id
                                          );
                                        }}
                                        defaultChecked={
                                          params?.userProducts[product?.id]
                                            ?.features !== undefined
                                            ? params?.userProducts[product?.id]
                                                ?.features[feature?.id]
                                                ?.feature_status
                                            : false
                                        }
                                        checked={value}
                                        id={`create-user-feature_status_${feature?.id}`}
                                      />
                                    )}
                                  />
                                  <label>Feature Active</label>
                                </Grid>
                                <Grid item xs={6}>
                                  <Controller
                                    as={TextField}
                                    name={'feature_activated_by'}
                                    control={control}
                                    render={({ field: { onChange } }) => (
                                      <TextField
                                        onChange={onChange}
                                        value={
                                          params?.userProducts[product?.id]
                                            ?.features !== undefined
                                            ? params?.userProducts[product?.id]
                                                ?.features[feature?.id]
                                                ?.feature_activated_by
                                            : ''
                                        }
                                        label={'Activated By'}
                                        variant="outlined"
                                        margin="normal"
                                        error={!!errors.activated_by}
                                        helperText={
                                          errors.activated_by
                                            ? errors.activated_by?.message
                                            : null
                                        }
                                        fullWidth
                                        type="text"
                                        InputLabelProps={{ shrink: true }}
                                        disabled
                                        id={`create-user-feature_activated_by_${feature?.id}`}
                                      />
                                    )}
                                  />
                                  <Controller
                                    as={TextField}
                                    name={'feature_activated_date_time'}
                                    control={control}
                                    render={({ field: { onChange } }) => (
                                      <TextField
                                        onChange={onChange}
                                        value={
                                          params?.userProducts[product?.id]
                                            ?.features !== undefined
                                            ? params?.userProducts[product?.id]
                                                ?.features[feature?.id]
                                                ?.feature_activated_date_time
                                            : ''
                                        }
                                        label={'Activated On'}
                                        variant="outlined"
                                        margin="normal"
                                        error={!!errors.activated_date_time}
                                        helperText={
                                          errors.activated_date_time
                                            ? errors.activated_date_time
                                                ?.message
                                            : null
                                        }
                                        fullWidth
                                        type="text"
                                        InputLabelProps={{ shrink: true }}
                                        disabled
                                        id={`create-user-feature_activated_date_time_${feature?.id}`}
                                      />
                                    )}
                                  />
                                  <Controller
                                    as={TextField}
                                    name={'feature_description'}
                                    control={control}
                                    render={() => (
                                      <TextField
                                        onChange={(event) => {
                                          updateData(
                                            event,
                                            'feature',
                                            indexFeature,
                                            product?.id,
                                            '',
                                            feature?.id,
                                            'feature_description'
                                          );
                                        }}
                                        InputLabelProps={{ shrink: true }}
                                        multiline
                                        minRows={4}
                                        label={'Description'}
                                        variant="outlined"
                                        margin="normal"
                                        error={!!errors.description}
                                        helperText={
                                          errors.description
                                            ? errors.description?.message
                                            : null
                                        }
                                        defaultValue={
                                          params?.userProducts[product?.id]
                                            ?.features !== undefined
                                            ? params?.userProducts[product?.id]
                                                ?.features[feature?.id]
                                                ?.feature_description
                                            : ''
                                        }
                                        fullWidth
                                        type="text"
                                        id={`create-feature_description_${feature?.id}`}
                                      />
                                    )}
                                  />
                                </Grid>
                              </Typography>
                            </CardContent>
                          </Card>
                        );
                      }
                    })}
                  </Box>
                </AccordionDetails>
              </Accordion>
            </div>
          </>
        ))}
      </div>
    </React.Fragment>
  );
};

export default UserProducts;
