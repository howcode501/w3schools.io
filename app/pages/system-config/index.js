//Section Import
//React Imports
import React, { useEffect, useState, useRef } from 'react';
import { Editor } from '@tinymce/tinymce-react';

//Material UI Imports

import Typography from '@mui/material/Typography';
import LoadingButton from '@mui/lab/LoadingButton';
import Grid from '@mui/material/Grid';
import Container from '@mui/material/Container';
import FormControl from '@mui/material/FormControl';
import Alert from '@mui/material/Alert';
import {
  TenantTextField,
  TenantSelect,
  TenantDragbleContent
} from '../../components';

import { useApi } from '../../hooks';
import { TINY_MCE_API_KEY } from '../../helpers/config';

//NextJS Imports
import { useRouter } from 'next/router';

//External Module Imports
import { connect } from 'react-redux';
import { useForm } from 'react-hook-form';

//Section Main Function
const SystemConfig = () => {
  //Used to determine loading or not
  const [loadingButton, setLoadingButton] = React.useState(false);
  const [remindToSave, setRemindToSave] = useState(false);
  const [show, setShow] = React.useState(false);
  const [systemConfig, setSystemConfig] = useState([]);
  const [promotionalText, setPromotionalText] = useState('');
  const stripeMode = [{ name: 'Test' }, { name: 'Live' }];
  const [displayOrder, setDislayOrder] = useState([]);

  //Initialize the API
  const { get, post } = useApi();

  //Get the ID Called in the URL
  const router = useRouter();

  useEffect(() => {
    async function fetchData() {
      if (typeof window !== 'undefined') {
        await get('/api/system-config/options')
          .then((response) => {
            setSystemConfig(response.data.data.systemConfig);

            setDislayOrder(response.data.data.products);

            setShow(true);
          })
          .catch(() => {
            setShow(false);
          });
      }
    }

    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const sendToDatabase = async (data) => {
    setLoadingButton(true);
    const keys = Object.keys(data);
    const values = Object.values(data);
    const newData = [];
    keys.forEach((key, i) => {
      // find index from system config
      const index = systemConfig.findIndex((p) => p.name == key);
      // User_Portal_Promotional_Text as tinymce editor
      if (key == 'User_Portal_Promotional_Text') {
        if (editorRef.current) {
          newData.push({
            id: systemConfig[index].id,
            name: key,
            value: editorRef.current.getContent()
          });
        }
      } else {
        newData.push({
          id: systemConfig[index].id,
          name: key,
          value: values[i]
        });
      }
    });

    await post(`/api/system-config/1`, { newData, displayOrder }).then(
      (res) => {
        if (res.status === 200) {
          router.push('/system-config');
          setLoadingButton(false);
        }
      }
    );
  };

  // Product Display Order Drag & Drop
  const reorder = (list, startIndex, endIndex) => {
    const result = Array.from(list);
    const [removed] = result.splice(startIndex, 1);
    result.splice(endIndex, 0, removed);
    return result;
  };
  //drag-end
  const onDragEnd = (result) => {
    // dropped outside the list
    if (!result.destination) {
      return;
    }
    const newItems = reorder(
      displayOrder,
      result.source.index,
      result.destination.index
    );

    if (newItems) {
      setDislayOrder(newItems);
    }
  };

  const getItemStyle = (isDragging, draggableStyle) => ({
    // some basic styles to make the items look a bit nicer
    userSelect: 'none',
    padding: '4px 8px',
    margin: `0 -4px 0 0`,
    height: 'fit-content',
    border: isDragging ? '2px solid #1e3a8a' : '2px solid #000000',
    // change background colour if dragging
    background: isDragging ? '#3b82f6' : 'white',
    borderTopRightRadius: '10px',
    borderTopLeftRadius: '10px',
    // styles we need to apply on draggables
    ...draggableStyle
  });

  const getListStyle = (isDraggingOver) => ({
    borderBottom: isDraggingOver ? '1px solid #1e3a8a' : '1px solid #000000',
    display: 'flex',
    padding: 4
  });

  const {
    handleSubmit,
    control,
    setValue,
    formState: { errors, isDirty }
  } = useForm({
    mode: 'onChange',
    reValidateMode: 'onChange',
    defaultValues: {
      User_Portal_Store_button_Link: '',
      User_Portal_Store_button_Text: '',
      User_Portal_Active_Product_Button_Text: '',
      User_Portal_Inactive_Product_Button_Text: '',
      User_Portal_Active_Product_Text: '',
      User_Portal_Inactive_Product_Text: '',
      User_Portal_Promotional_Text: '',
      New_Account_Success_Message: '',
      Promo_Codes_Purchase_Location: '',
      Site_Title: '',
      Stripe_Mode: '',
      Stripe_Test_Publishable_Key: '',
      Stripe_Test_Secret_Key: '',
      Stripe_Live_Publishable_Key: '',
      Stripe_Live_Secret_Key: '',
      Promo_Codes_Characters: '',
      Promo_Codes_Default_Length: '',
      Promo_Codes_Default_Bulk_Code_Length: '',
      Swagger_API_DOC_URL: ''
    }
  });

  useEffect(() => {
    if (isDirty) {
      setRemindToSave(true);
      [];
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDirty]);
  useEffect(() => {
    systemConfig.forEach((config) => {
      if (config.name == 'User_Portal_Promotional_Text') {
        setPromotionalText(config.value);
      } else {
        setValue(config.name, config.value, true);
      }
    });
  }, [systemConfig]);

  // Tinymic editor
  const editorRef = useRef(null);

  //Section Return
  return (
    <>
      {show === true ? (
        <Container maxWidth="xl">
          {/* Main Page and Form */}
          <form
            id="system-config-form"
            key={1}
            onSubmit={handleSubmit((data) => sendToDatabase(data))}
            autoComplete="off"
          >
            <Grid container spacing={2}>
              <Grid item xs={4}>
                <Typography
                  id="system-config-title-h4"
                  variant="h4"
                  component={'span'}
                >
                  System Config
                </Typography>
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
              ></Grid>
              {remindToSave === true ? (
                <Alert severity="warning" id="save-changes-warning">
                  Please Save Changes
                </Alert>
              ) : null}
              <Grid item xs={9}>
                <TenantTextField
                  control={control}
                  id="User_Portal_Store_button_Link"
                  error={!!errors.User_Portal_Store_button_Link}
                  helperText={
                    errors.User_Portal_Store_button_Link
                      ? errors.User_Portal_Store_button_Link?.message
                      : null
                  }
                  fullWidth
                  label={'User Portal - Store button Link'}
                  name={'User_Portal_Store_button_Link'}
                  variant="outlined"
                  margin="normal"
                />
                <TenantTextField
                  control={control}
                  id="User_Portal_Store_button_Text"
                  error={!!errors.User_Portal_Store_button_Text}
                  helperText={
                    errors.User_Portal_Store_button_Text
                      ? errors.User_Portal_Store_button_Text?.message
                      : null
                  }
                  fullWidth
                  label={'User Portal - Store button Text'}
                  name={'User_Portal_Store_button_Text'}
                  variant="outlined"
                  margin="normal"
                />
                <TenantTextField
                  control={control}
                  id="User_Portal_Active_Product_Button_Text"
                  error={!!errors.User_Portal_Active_Product_Button_Text}
                  helperText={
                    errors.User_Portal_Active_Product_Button_Text
                      ? errors.User_Portal_Active_Product_Button_Text?.message
                      : null
                  }
                  fullWidth
                  label={'User Portal - Active Product Button Text'}
                  name={'User_Portal_Active_Product_Button_Text'}
                  variant="outlined"
                  margin="normal"
                />
                <TenantTextField
                  control={control}
                  id="User_Portal_Inactive_Product_Button_Text"
                  error={!!errors.User_Portal_Inactive_Product_Button_Text}
                  helperText={
                    errors.User_Portal_Inactive_Product_Button_Text
                      ? errors.User_Portal_Inactive_Product_Button_Text?.message
                      : null
                  }
                  fullWidth
                  label={'User Portal - Inactive Product Button Text'}
                  name={'User_Portal_Inactive_Product_Button_Text'}
                  variant="outlined"
                  margin="normal"
                />
                <TenantTextField
                  control={control}
                  id="User_Portal_Active_Product_Text"
                  error={!!errors.User_Portal_Active_Product_Text}
                  helperText={
                    errors.User_Portal_Active_Product_Text
                      ? errors.User_Portal_Active_Product_Text?.message
                      : null
                  }
                  fullWidth
                  label={'User Portal - Active Product Text'}
                  name={'User_Portal_Active_Product_Text'}
                  variant="outlined"
                  margin="normal"
                />
                <TenantTextField
                  control={control}
                  id="User_Portal_Inactive_Product_Text"
                  error={!!errors.User_Portal_Inactive_Product_Text}
                  helperText={
                    errors.User_Portal_Inactive_Product_Text
                      ? errors.User_Portal_Inactive_Product_Text?.message
                      : null
                  }
                  fullWidth
                  label={'User Portal - Inactive Product Text'}
                  name={'User_Portal_Inactive_Product_Text'}
                  variant="outlined"
                  margin="normal"
                />
                <TenantTextField
                  control={control}
                  id="system-config-Site_Title"
                  error={!!errors.Site_Title}
                  helperText={
                    errors.Site_Title ? errors.Site_Title?.message : null
                  }
                  fullWidth
                  label={'Site Title'}
                  name={'Site_Title'}
                  variant="outlined"
                  margin="normal"
                />

                <FormControl fullWidth style={{ marginTop: 15 }}>
                  <TenantSelect
                    id="system-config-Stripe_Mode"
                    control={control}
                    error={errors.Stripe_Mode}
                    fullWidth
                    label="Stripe Mode"
                    name={'Stripe_Mode'}
                    options={stripeMode}
                    variant="outlined"
                    placeholder="Select a Stripe Mode"
                  />
                </FormControl>
                <TenantTextField
                  control={control}
                  id="Stripe_Test_Publishable_Key"
                  error={!!errors.Stripe_Test_Publishable_Key}
                  helperText={
                    errors.Stripe_Test_Publishable_Key
                      ? errors.Stripe_Test_Publishable_Key?.message
                      : null
                  }
                  fullWidth
                  label={'Stripe Test Publishable Key'}
                  name={'Stripe_Test_Publishable_Key'}
                  variant="outlined"
                  margin="normal"
                />
                <TenantTextField
                  control={control}
                  id="system-config-Stripe_Test_Secret_Key"
                  error={!!errors.Stripe_Test_Secret_Key}
                  helperText={
                    errors.Stripe_Test_Secret_Key
                      ? errors.Stripe_Test_Secret_Key?.message
                      : null
                  }
                  fullWidth
                  label={'Stripe Test Secret Key'}
                  name={'Stripe_Test_Secret_Key'}
                  variant="outlined"
                  margin="normal"
                />

                <TenantTextField
                  control={control}
                  id="system-config-Stripe_Live_Publishable_Key"
                  error={!!errors.Stripe_Live_Publishable_Key}
                  helperText={
                    errors.Stripe_Live_Publishable_Key
                      ? errors.Stripe_Live_Publishable_Key?.message
                      : null
                  }
                  fullWidth
                  label={'Stripe Live Publishable Key'}
                  name={'Stripe_Live_Publishable_Key'}
                  variant="outlined"
                  margin="normal"
                />
                <TenantTextField
                  control={control}
                  id="system-config-Stripe_Live_Secret_Key"
                  error={!!errors.Stripe_Live_Secret_Key}
                  helperText={
                    errors.Stripe_Live_Secret_Key
                      ? errors.Stripe_Live_Secret_Key?.message
                      : null
                  }
                  fullWidth
                  label={'Stripe Live Secret Key'}
                  name={'Stripe_Live_Secret_Key'}
                  variant="outlined"
                  margin="normal"
                />
                <TenantTextField
                  control={control}
                  id="Promo_Codes_Purchase_Location"
                  error={!!errors.Promo_Codes_Characters}
                  helperText={
                    errors.Promo_Codes_Purchase_Location
                      ? errors.Promo_Codes_Purchase_Location?.message
                      : null
                  }
                  fullWidth
                  label={'Codes - Default Purchase Location'}
                  name={'Promo_Codes_Purchase_Location'}
                  variant="outlined"
                  margin="normal"
                />
                <TenantTextField
                  control={control}
                  id="system-config-Promo_Codes_Characters"
                  error={!!errors.Promo_Codes_Characters}
                  helperText={
                    errors.Promo_Codes_Characters
                      ? errors.Promo_Codes_Characters?.message
                      : null
                  }
                  fullWidth
                  label={'Promo Codes - Code Characters'}
                  name={'Promo_Codes_Characters'}
                  variant="outlined"
                  margin="normal"
                />

                <TenantTextField
                  control={control}
                  id="system-config-Promo_Codes_Default_Length"
                  error={!!errors.Promo_Codes_Default_Length}
                  helperText={
                    errors.Promo_Codes_Default_Length
                      ? errors.Promo_Codes_Default_Length?.message
                      : null
                  }
                  fullWidth
                  label={'Promo Codes - Default Code Length'}
                  name={'Promo_Codes_Default_Length'}
                  variant="outlined"
                  margin="normal"
                />
                <TenantTextField
                  control={control}
                  id="system-config-Promo_Codes_Default_Bulk_Code_Length"
                  error={!!errors.Promo_Codes_Default_Bulk_Code_Length}
                  helperText={
                    errors.Promo_Codes_Default_Bulk_Code_Length
                      ? errors.Promo_Codes_Default_Bulk_Code_Length?.message
                      : null
                  }
                  fullWidth
                  label={'Promo Codes - Bulk Codes - Default Number of Codes'}
                  name={'Promo_Codes_Default_Bulk_Code_Length'}
                  variant="outlined"
                  margin="normal"
                />
                <TenantTextField
                  control={control}
                  id="system-config-Swagger_API_DOC_URL"
                  error={!!errors.Swagger_API_DOC_URL}
                  helperText={
                    errors.Swagger_API_DOC_URL
                      ? errors.Swagger_API_DOC_URL?.message
                      : null
                  }
                  fullWidth
                  label={'Swagger docs location'}
                  name={'Swagger_API_DOC_URL'}
                  variant="outlined"
                  margin="normal"
                />
                <TenantTextField
                  control={control}
                  id="New_Account_Success_Message"
                  minRows={4}
                  multiline={true}
                  error={!!errors.New_Account_Success_Message}
                  helperText={
                    errors.New_Account_Success_Message
                      ? errors.New_Account_Success_Message?.message
                      : null
                  }
                  fullWidth
                  label={'New Account - Success Message'}
                  name={'New_Account_Success_Message'}
                  variant="outlined"
                  margin="normal"
                />
                <br></br>
                <Grid item xs={4}>
                  <Typography
                    id="system-config-title-h4"
                    variant="text"
                    component={'span'}
                  >
                    User Portal - Promotional Text
                  </Typography>
                </Grid>
                <br></br>
                <Editor
                  apiKey={TINY_MCE_API_KEY}
                  onInit={(evt, editor) => (editorRef.current = editor)}
                  initialValue={promotionalText}
                  init={{
                    height: 200,
                    menubar: false,
                    plugins: [
                      'advlist',
                      'autolink',
                      'lists',
                      'link',
                      'image',
                      'charmap',
                      'preview',
                      'anchor',
                      'searchreplace',
                      'visualblocks',
                      'code',
                      'fullscreen',
                      'insertdatetime',
                      'media',
                      'table',
                      'code',
                      'help',
                      'wordcount'
                    ],
                    toolbar:
                      'undo redo | blocks | ' +
                      'bold italic forecolor | alignleft aligncenter ' +
                      'alignright alignjustify | bullist numlist outdent indent | ' +
                      'removeformat | help',
                    content_style:
                      'body { font-family:Helvetica,Arial,sans-serif; font-size:14px }'
                  }}
                />
                <br></br>
                <Grid item xs={4}>
                  <Typography
                    id="system-config-title-h4"
                    variant="text"
                    component={'span'}
                  >
                    User Portal - Product Display Order
                  </Typography>
                </Grid>
                <br></br>
                <div>
                  <TenantDragbleContent
                    onDragEnd={onDragEnd}
                    getItemStyle={getItemStyle}
                    getListStyle={getListStyle}
                    displayOrder={displayOrder}
                  />
                </div>
                <Grid sx={{ marginTop: '20px', float: 'right' }}>
                  <LoadingButton
                    variant="contained"
                    color="primary"
                    type={'submit'}
                    id="save-system-config-button"
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

export default connect((state) => state)(SystemConfig);
