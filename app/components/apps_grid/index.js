//React Imports
import React, { useEffect } from 'react';

//Material UI Imports
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import FormControl from '@mui/material/FormControl';
import MenuItem from '@mui/material/MenuItem';
import InfoIcon from '@mui/icons-material/Info';

//Material UI Icons
import HighlightOffIcon from '@mui/icons-material/HighlightOff';
import EditIcon from '@mui/icons-material/Edit';

//Material UI Styles
//Material UI DataGrid
import {
  GridToolbarColumnsButton,
  GridToolbarContainer,
  GridToolbarFilterButton
} from '@mui/x-data-grid';
import {
  TenantDataGrid,
  TenantModal,
  TenantSelect,
  TenantTextField,
  BadgeTooltip,
  FileSelectButton,
  UserAvatar
} from '../../components';

//NextJS Imports
//Application Imports
import { useApi, useS3Uploader, useResizeImageHandler } from '../../hooks';

//External Imports
import * as yup from 'yup';
import { Controller, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { EMOJIS_REGEX } from '../../helpers/constants';

const ADD_APP_MODAL = 'ADD';
const DELETE_APP_MODAL = 'DELETE';
const EDIT_APP_MODAL = 'EDIT';
const ASSOCIATE_APP_MODAL = 'ASSOCIATE';
const defaultPlaceholder = '/images/default-placeholder-250x100.png';

//Section Add App Modal
const AddAppModal = ({ open, onClose, onSubmit, validator }) => {
  const handleResizeImage = useResizeImageHandler();
  const [s3bucketImageUpload, s3bucketImageRemove] = useS3Uploader();

  //Closes the New App Modal
  const handleNewClose = () => {
    onClose();
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

      const pageType = 'App';

      const data = await s3bucketImageUpload(resizedImage, 'variant', pageType);
      // TODO remove previous image
      await imageRemoveHandler();

      setValue('attachment', `${data.url}/${data.fields.key}`);
      setValue('app_icon_id', data?.attachment?.id);
    }
  };

  const imageRemoveHandler = async () => {
    const url = getValues('attachment');
    if (url && url.split(':')[0] !== 'data') {
      const urlar = url.split('/');
      const fileName = `${urlar[3]}/${urlar[4]}/${urlar[5]}`;
      await s3bucketImageRemove({ fileName });
    }

    setValue('app_icon_id', '');
    setValue('attachment', null);
  };

  const sendAppToParent = async (data) => {
    onSubmit(data);
    handleNewClose();
  };

  const {
    handleSubmit,
    control,
    setValue,
    getValues,
    formState: { errors }
  } = useForm({
    mode: 'onChange',
    reValidateMode: 'onChange',
    resolver: yupResolver(validator),
    defaultValues: {
      app_name: '',
      app_id: '',
      app_active_url: '',
      app_inactive_url: '',
      app_mailchimp_tag: '',
      app_shopify_fulfill: '',
      app_shopify_unfulfill: '',
      app_status: true,
      app_icon_id: '',
      attachment: ''
    }
  });

  //Return Add App Modal
  return (
    <div>
      <TenantModal
        id="add-app-app_name-field"
        open={open}
        close={handleNewClose}
        confirm={handleSubmit((data) => sendAppToParent(data))}
        title={'Add New App'}
        maxWidth={'md'}
        submitTitle={'Add New App'}
        variant={'form_submit'}
      >
        <TenantTextField
          id="add-app-app_name-field"
          name={'app_name'}
          control={control}
          label={'App Name *'}
          variant="outlined"
          margin="normal"
          fullWidth
          error={!!errors.app_name}
          helperText={errors.app_name ? errors.app_name?.message : null}
        />
        <TenantTextField
          id="add-app-app_id-field"
          name={'app_id'}
          control={control}
          label={'App ID'}
          variant="outlined"
          margin="normal"
          fullWidth
          error={!!errors.app_id}
          helperText={errors.app_id ? errors.app_id?.message : null}
        />
        <TenantTextField
          id="add-app-app_active_url-field"
          name={'app_active_url'}
          control={control}
          label={'App Active URL'}
          variant="outlined"
          margin="normal"
          fullWidth
          error={!!errors.app_active_url}
          helperText={
            errors.app_active_url ? errors.app_active_url?.message : null
          }
        />
        <TenantTextField
          id="add-app-app_inactive_url-field"
          name={'app_inactive_url'}
          control={control}
          label={'App Inactive URL'}
          variant="outlined"
          margin="normal"
          fullWidth
          error={!!errors.app_inactive_url}
          helperText={
            errors.app_inactive_url ? errors.app_inactive_url?.message : null
          }
        />
        <TenantTextField
          id="add-app-app_mailchimp_tag-field"
          name={'app_mailchimp_tag'}
          control={control}
          label={'Email/Shopify Tag'}
          variant="outlined"
          margin="normal"
          fullWidth
          error={!!errors.app_mailchimp_tag}
          helperText={
            errors.app_mailchimp_tag ? errors.app_mailchimp_tag?.message : null
          }
        />
        <TenantTextField
          id="add-app-app_shopify_fulfill-field"
          name={'app_shopify_fulfill'}
          control={control}
          label={'Shopify Fulfill'}
          variant="outlined"
          margin="normal"
          fullWidth
          error={!!errors.app_shopify_fulfill}
          helperText={
            errors.app_shopify_fulfill
              ? errors.app_shopify_fulfill?.message
              : null
          }
        />
        <TenantTextField
          id="add-app-app_shopify_unfulfill-field"
          name={'app_shopify_unfulfill'}
          control={control}
          label={'Shopify Do Not FulFill'}
          variant="outlined"
          margin="normal"
          fullWidth
          error={!!errors.app_shopify_unfulfill}
          helperText={
            errors.app_shopify_unfulfill
              ? errors.app_shopify_unfulfill?.message
              : null
          }
        />
        <FormControl fullWidth style={{ marginTop: 12 }}>
          <TenantSelect
            id="add-app-app_status-select"
            control={control}
            fullWidth
            variant="outlined"
            label="App Status"
            name={'app_status'}
          >
            <MenuItem
              key={1}
              value={true}
              id={'add-app-app_status-menu-item-1'}
            >
              Active
            </MenuItem>
            <MenuItem
              key={2}
              value={false}
              id={'add-app-app_status-menu-item-2'}
            >
              Inactive
            </MenuItem>
          </TenantSelect>
        </FormControl>
        <FormControl style={{ marginTop: 12 }}>
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
                The app icon appears on apps and in the user portal. <br />
                <br />
                An aspect ratio of 1 : 1 is recommended (e.g. 128 x 128 pixels).{' '}
                <br />
                <br />
                Accepted formats include JPEG and PNG. If your logo doesn&apos;t
                meet the size requirements above, it will automatically be
                cropped or resized.
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
        </FormControl>
      </TenantModal>
    </div>
  );
};

//Section Edit App Modal
const EditAppModal = ({ data, open, onClose, onSubmit, validator }) => {
  const handleResizeImage = useResizeImageHandler();
  const [s3bucketImageUpload, s3bucketImageRemove] = useS3Uploader();

  //Closes the New App Modal
  const handleEditClose = () => {
    onClose();
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

      const pageType = 'App';

      const data = await s3bucketImageUpload(resizedImage, 'variant', pageType);
      // TODO remove previous image
      await imageRemoveHandler();

      setValue('attachment', `${data.url}/${data.fields.key}`);
      setValue('app_icon_id', data?.attachment?.id);
    }
  };

  const imageRemoveHandler = async () => {
    const url = getValues('attachment');
    if (url && url.split(':')[0] !== 'data') {
      const urlar = url.split('/');
      const fileName = `${urlar[3]}/${urlar[4]}/${urlar[5]}`;
      await s3bucketImageRemove({ fileName });
    }

    setValue('app_icon_id', '');
    setValue('attachment', null);
  };

  const sendAppToParent = (sendData) => {
    onSubmit(sendData);
    handleEditClose();
  };

  const {
    handleSubmit,
    control,
    setValue,
    getValues,
    formState: { errors }
  } = useForm({
    mode: 'onChange',
    reValidateMode: 'onChange',
    resolver: yupResolver(validator),
    defaultValues: {
      app_name: '',
      app_id: '',
      app_active_url: '',
      app_inactive_url: '',
      app_mailchimp_tag: '',
      app_shopify_fulfill: '',
      app_shopify_unfulfill: '',
      app_status: true,
      app_icon_id: '',
      attachment: ''
    }
  });

  //Set the field values
  useEffect(() => {
    setValue('id', data.id, true);
    setValue('app_name', data.app_name, true);
    setValue('app_id', data.app_id, true);
    setValue('app_active_url', data.app_active_url, true);
    setValue('app_inactive_url', data.app_inactive_url, true);
    setValue('app_mailchimp_tag', data.app_mailchimp_tag, true);
    setValue('app_shopify_fulfill', data.app_shopify_fulfill, true);
    setValue('app_shopify_unfulfill', data.app_shopify_unfulfill, true);
    setValue('app_status', data.app_status, true);
    setValue('app_icon_id', data?.app_icon_id);
    setValue(
      'attachment',
      data?.attachment
        ? data?.attachment
        : data?.attachments?.public_url
        ? data?.attachments?.public_url
        : null
    );
  }, [open, data, setValue]);

  //Return Edit Modal
  return (
    <div>
      <TenantModal
        id="edit-app-app_name-field"
        open={open}
        close={handleEditClose}
        confirm={handleSubmit((data) => sendAppToParent(data))}
        title={'Edit App'}
        maxWidth={'md'}
        submitTitle={'Edit App'}
        variant={'form_submit'}
      >
        <TenantTextField
          id="edit-app-app_name-field"
          name={'app_name'}
          control={control}
          label={'App Name *'}
          variant="outlined"
          margin="normal"
          fullWidth
          error={!!errors.app_name}
          helperText={errors.app_name ? errors.app_name?.message : null}
        />
        <TenantTextField
          id="edit-app-app_id-field"
          name={'app_id'}
          control={control}
          label={'App ID'}
          variant="outlined"
          margin="normal"
          fullWidth
          error={!!errors.app_id}
          helperText={errors.app_id ? errors.app_id?.message : null}
        />
        <TenantTextField
          id="edit-app-app_active_url-field"
          name={'app_active_url'}
          control={control}
          label={'App Active URL'}
          variant="outlined"
          margin="normal"
          fullWidth
          error={!!errors.app_active_url}
          helperText={
            errors.app_active_url ? errors.app_active_url?.message : null
          }
        />
        <TenantTextField
          id="edit-app-app_inactive_url-field"
          name={'app_inactive_url'}
          control={control}
          label={'App Inactive URL'}
          variant="outlined"
          margin="normal"
          fullWidth
          error={!!errors.app_inactive_url}
          helperText={
            errors.app_inactive_url ? errors.app_inactive_url?.message : null
          }
        />
        <TenantTextField
          id="edit-app-app_mailchimp_tag-field"
          name={'app_mailchimp_tag'}
          control={control}
          label={'Email/Shopify Tag'}
          variant="outlined"
          margin="normal"
          fullWidth
          error={!!errors.app_mailchimp_tag}
          helperText={
            errors.app_mailchimp_tag ? errors.app_mailchimp_tag?.message : null
          }
        />
        <TenantTextField
          id="edit-app-app_shopify_fulfill-field"
          name={'app_shopify_fulfill'}
          control={control}
          label={'Shopify Fulfill'}
          variant="outlined"
          margin="normal"
          fullWidth
          error={!!errors.app_shopify_fulfill}
          helperText={
            errors.app_shopify_fulfill
              ? errors.app_shopify_fulfill?.message
              : null
          }
        />
        <TenantTextField
          id="edit-app-app_shopify_unfulfill-field"
          name={'app_shopify_unfulfill'}
          control={control}
          label={'Shopify Do Not FulFill'}
          variant="outlined"
          margin="normal"
          fullWidth
          error={!!errors.app_shopify_unfulfill}
          helperText={
            errors.app_shopify_unfulfill
              ? errors.app_shopify_unfulfill?.message
              : null
          }
        />
        <FormControl fullWidth style={{ marginTop: 12 }}>
          <TenantSelect
            id="edit-app-app_status-select"
            control={control}
            fullWidth
            variant="outlined"
            label="App Status"
            name={'app_status'}
          >
            <MenuItem
              key={1}
              value={true}
              id={'edit-app-app_status-menu-item-1'}
            >
              Active
            </MenuItem>
            <MenuItem
              key={2}
              value={false}
              id={'edit-app-app_status-menu-item-2'}
            >
              Inactive
            </MenuItem>
          </TenantSelect>
        </FormControl>
        <FormControl style={{ marginTop: 12 }}>
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
                The app icon appears on apps and in the user portal. <br />
                <br />
                An aspect ratio of 1 : 1 is recommended (e.g. 128 x 128 pixels).{' '}
                <br />
                <br />
                Accepted formats include JPEG and PNG. If your logo doesn&apos;t
                meet the size requirements above, it will automatically be
                cropped or resized.
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
        </FormControl>
      </TenantModal>
    </div>
  );
};

const DeleteAppModal = ({ data, open, onConfirm, onClose }) => {
  const handleDeleteApp = () => {
    onConfirm(data);
    onClose();
  };

  return (
    <TenantModal
      id="delete-app-modal"
      open={open}
      close={onClose}
      confirm={handleDeleteApp}
      title="Delete App"
    >
      <Typography id="delete-app-confirmation-text">
        Are you sure you want to delete this App&nbsp;
        <Typography
          component="span"
          sx={{ fontWeight: 'bold', display: 'inline' }}
        >
          {data?.name}
        </Typography>
        ? This action may take a few seconds and cannot be undone.
      </Typography>
    </TenantModal>
  );
};

//Define the Custom Toolbar we want in order to move the create user button into the bar.
const AppsCustomToolbar = ({
  addModal,
  associateModal,
  onAdd,
  onAssociate
}) => {
  return (
    <GridToolbarContainer>
      <GridToolbarColumnsButton />
      <GridToolbarFilterButton />
      {addModal ? (
        <Button
          size="small"
          variant="outlined"
          onClick={onAdd}
          id="add-app-btn"
        >
          Add App
        </Button>
      ) : null}
      {associateModal ? (
        <Button
          size="small"
          variant="outlined"
          onClick={onAssociate}
          id="associate-app-btn"
        >
          Associate App
        </Button>
      ) : null}
    </GridToolbarContainer>
  );
};

//Generates the "Linked App" grid for settings tabs
const AppsGrid = (params) => {
  const { post } = useApi();

  //Used to maintain state of the New App Modal
  const [modal, setModal] = React.useState('');
  const [focusedData, setFocusedData] = React.useState({});

  const handleCloseModal = () => {
    setModal('');
  };

  //Opens the New App Modal
  const handleAddClickOpen = () => {
    setModal(ADD_APP_MODAL);
  };

  //Opens the Associate App Modal
  const handleAssociateClickOpen = () => {
    setModal(ASSOCIATE_APP_MODAL);
  };

  //Opens the Edit Modal
  const handleEditClickOpen = (row) => {
    setFocusedData(row);
    setModal(EDIT_APP_MODAL);
  };

  // Handling delete confirmation box
  function handleDeleteClickOpen(row) {
    setFocusedData(row);
    setModal(DELETE_APP_MODAL);
  }

  function notValidAppName(valueToCheck) {
    return new Promise((resolve) => {
      if (focusedData?.app_name == valueToCheck) {
        resolve(false);
      }

      // check for existing
      params.appsData.map(function (obj) {
        if (
          obj.app_name == valueToCheck &&
          focusedData?.app_name !== obj.app_name
        ) {
          resolve(true);
        }
      });

      post(`/api/apps/app-validate`, {
        data: {
          app_name: valueToCheck.toString().trim()
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

  function notValidAppId(valueToCheck) {
    return new Promise((resolve) => {
      if (focusedData?.app_id == valueToCheck) {
        resolve(false);
      }

      // check for existing
      params.appsData.map(function (obj) {
        if (obj.app_id == valueToCheck && focusedData?.app_id !== obj.app_id) {
          resolve(true);
        }
      });

      post(`/api/apps/app-validate`, {
        data: {
          app_id: valueToCheck.toString().trim()
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

  const validator = yup.object({
    app_name: yup
      .string('Enter App Name')
      .min(3, 'Name should be of minimum 3 characters length')
      .matches(
        EMOJIS_REGEX,
        'Emojis are not allowed in App name. Please choose another name.'
      )
      .required('Name is required')
      .trim()
      .test(
        'validator',
        'A name with the same name already exists. Please choose another name.',
        async (value) => {
          if (value !== undefined && value !== '') {
            const isDuplicateExists = await notValidAppName(value);
            return !isDuplicateExists;
          }
          // WHEN THE VALUE IS EMPTY RETURN `true` by default
          return true;
        }
      ),
    app_id: yup
      .string('Enter App Id')
      .trim()
      .test(
        'validator',
        'A app id with the same name already exists. Please choose another app id.',
        async (value) => {
          if (value !== undefined && value !== '') {
            const isDuplicateExists = await notValidAppId(value);
            return !isDuplicateExists;
          }
          // WHEN THE VALUE IS EMPTY RETURN `true` by default
          return true;
        }
      ),
    app_active_url: yup
      .string('Enter App Active URL')
      .url('App Active URL should be formatted as a URL'),
    app_inactive_url: yup
      .string('Enter App Inactive URL')
      .url('App Inactive URL should be formatted as a URL')
  });

  //Define the Columns that we want to draw out
  const appsColumns = [
    { field: 'id', headerName: 'ID', width: 100, hide: true },
    {
      field: 'avatar',
      headerName: ' ',
      width: 45,
      align: 'center',
      sortable: false,
      filterable: false,
      disableClickEventBubbling: true,
      disableColumnMenu: true,
      editable: false,
      renderCell: (params) => {
        if (
          params.row?.attachments?.public_url !== null ||
          params.row?.attachment !== null
        ) {
          return (
            <UserAvatar
              id={'icon'}
              icon={
                params.row?.attachments?.public_url || params.row?.attachment
              }
              name={'icon'}
              variant="circular"
              sx={{
                width: 75,
                height: 75
              }}
            />
          );
        } else {
          return (
            <UserAvatar
              id={'icon'}
              icon={defaultPlaceholder}
              name={'icon'}
              variant="square"
              sx={{
                width: 75,
                height: 75
              }}
            />
          );
        }
      }
    },
    {
      field: 'app_id',
      headerName: 'App ID',
      editable: false,
      flex: 4
    },
    {
      field: 'app_name',
      headerName: 'App Name',
      editable: false,
      flex: 3
    },
    {
      field: 'editAction',
      headerName: 'Actions',
      align: 'right',
      headerAlign: 'left',
      sortable: false,
      filterable: false,
      disableClickEventBubbling: true,
      disableColumnMenu: true,
      flex: 2,
      renderCell: (params) => {
        return (
          <>
            <Button
              variant="contained"
              color="primary"
              startIcon={<EditIcon />}
              size="small"
              onClick={() => handleEditClickOpen(params.row)}
              id={'edit-app-btn' + params.row.id}
            >
              Edit
            </Button>
            &nbsp;&nbsp;
            <Button
              variant="contained"
              color="error"
              startIcon={<HighlightOffIcon />}
              size="small"
              onClick={() => handleDeleteClickOpen(params.row)}
              id={'remove-app-btn' + params.row.id}
            >
              Remove
            </Button>
          </>
        );
      }
    }
  ];

  const handleAddApp = async (data) => {
    data.id = 'a' + Date.now();
    //Add our App List

    params.addFunc([data]);
  };

  const handleEditApps = (data) => {
    //Update our App List
    params.updateFunc([data]);
  };

  const handleDeleteApp = (row) => {
    const result = params.appsData.map((filterRow) => {
      if (filterRow.id == row.id) {
        return {
          ...filterRow,
          deleted: new Date()
        };
      }
      return {
        ...filterRow
      };
    });
    params.deleteFunc(result);
  };

  //Section Existing Apps
  //Return Selected DataGrid
  return (
    <React.Fragment>
      <TenantDataGrid
        title={'apps'}
        initialState={{
          columns: {
            columnVisibilityModel: {
              id: false
            }
          }
        }}
        autoHeight
        components={{
          Toolbar: () => (
            <AppsCustomToolbar
              {...params}
              onAdd={handleAddClickOpen}
              onAssociate={handleAssociateClickOpen}
            />
          )
        }}
        rows={params.appsData.filter(
          (filterRow) =>
            filterRow?.deleted == null || filterRow?.deleted == undefined
        )}
        columns={appsColumns}
        pageSize={50}
        rowsPerPageOptions={[50]}
        loading={params.loading}
        checkboxSelection={false}
      />
      {params.addModal ? (
        <AddAppModal
          validator={validator}
          onSubmit={handleAddApp}
          onClose={handleCloseModal}
          open={modal === ADD_APP_MODAL}
        />
      ) : null}
      {params.editModal ? (
        <EditAppModal
          validator={validator}
          data={focusedData}
          onSubmit={handleEditApps}
          onClose={handleCloseModal}
          open={modal === EDIT_APP_MODAL}
        />
      ) : null}
      <DeleteAppModal
        data={focusedData}
        onConfirm={handleDeleteApp}
        onClose={handleCloseModal}
        open={modal === DELETE_APP_MODAL}
      />
    </React.Fragment>
  );
};

export default AppsGrid;
