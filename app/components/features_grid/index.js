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

const ADD_FEATURE_MODAL = 'ADD';
const DELETE_FEATURE_MODAL = 'DELETE';
const EDIT_FEATURE_MODAL = 'EDIT';
const ASSOCIATE_FEATURE_MODAL = 'ASSOCIATE';
const defaultPlaceholder = '/images/default-placeholder-250x100.png';
//Section Add Feature Modal
const AddFeatureModal = ({ open, onClose, onSubmit, validator }) => {
  const handleResizeImage = useResizeImageHandler();
  const [s3bucketImageUpload, s3bucketImageRemove] = useS3Uploader();

  //Closes the New Feature Modal
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

      const pageType = 'Feature';

      const data = await s3bucketImageUpload(resizedImage, 'variant', pageType);
      // TODO remove previous image
      await imageRemoveHandler();

      setValue('attachment', `${data.url}/${data.fields.key}`);
      setValue('feature_icon_id', data?.attachment?.id);
    }
  };

  const imageRemoveHandler = async () => {
    const url = getValues('attachment');
    if (url && url.split(':')[0] !== 'data') {
      const urlar = url.split('/');
      const fileName = `${urlar[3]}/${urlar[4]}/${urlar[5]}`;
      await s3bucketImageRemove({ fileName });
    }

    setValue('feature_icon_id', '');
    setValue('attachment', null);
  };

  const sendFeatureToParent = async (data) => {
    onSubmit(data);
    handleNewClose();
  };

  const {
    handleSubmit,
    control,
    getValues,
    setValue,
    formState: { errors }
  } = useForm({
    mode: 'onChange',
    reValidateMode: 'onChange',
    resolver: yupResolver(validator),
    defaultValues: {
      feature_name: '',
      feature_id: '',
      feature_active_url: '',
      feature_inactive_url: '',
      feature_mailchimp_tag: '',
      feature_shopify_fulfill: '',
      feature_shopify_unfulfill: '',
      feature_status: true,
      feature_icon_id: '',
      attachment: ''
    }
  });

  //Return Add Feature Modal
  return (
    <div>
      <TenantModal
        id="add-feature-modal"
        open={open}
        close={handleNewClose}
        confirm={handleSubmit((data) => sendFeatureToParent(data))}
        title={'Add New Feature'}
        maxWidth={'md'}
        submitTitle={'Add New Feature'}
        variant={'form_submit'}
      >
        <TenantTextField
          id="add-feature-feature_name-field"
          name={'feature_name'}
          control={control}
          label={'Feature Name *'}
          variant="outlined"
          margin="normal"
          fullWidth
          error={!!errors.feature_name}
          helperText={errors.feature_name ? errors.feature_name?.message : null}
        />
        <TenantTextField
          id="add-feature-feature_id-field"
          name={'feature_id'}
          control={control}
          label={'Feature ID'}
          variant="outlined"
          margin="normal"
          fullWidth
          error={!!errors.feature_id}
          helperText={errors.feature_id ? errors.feature_id?.message : null}
        />
        <TenantTextField
          id="add-feature-feature_active_url-field"
          name={'feature_active_url'}
          control={control}
          label={'Feature Active URL'}
          variant="outlined"
          margin="normal"
          fullWidth
          error={!!errors.feature_active_url}
          helperText={
            errors.feature_active_url
              ? errors.feature_active_url?.message
              : null
          }
        />
        <TenantTextField
          id="add-feature-feature_inactive_url-field"
          name={'feature_inactive_url'}
          control={control}
          label={'Feature Inactive URL'}
          variant="outlined"
          margin="normal"
          fullWidth
          error={!!errors.feature_inactive_url}
          helperText={
            errors.feature_inactive_url
              ? errors.feature_inactive_url?.message
              : null
          }
        />

        <TenantTextField
          id="add-feature-feature_mailchimp_tag-field"
          name={'feature_mailchimp_tag'}
          control={control}
          label={'Email/Shopify Tag'}
          variant="outlined"
          margin="normal"
          fullWidth
          error={!!errors.feature_mailchimp_tag}
          helperText={
            errors.feature_mailchimp_tag
              ? errors.feature_mailchimp_tag?.message
              : null
          }
        />

        <TenantTextField
          id="add-feature-feature_shopify_fulfill-field"
          name={'feature_shopify_fulfill'}
          control={control}
          label={'Shopify Fulfill'}
          variant="outlined"
          margin="normal"
          fullWidth
          error={!!errors.feature_shopify_fulfill}
          helperText={
            errors.feature_shopify_fulfill
              ? errors.feature_shopify_fulfill?.message
              : null
          }
        />
        <TenantTextField
          id="add-feature-feature_shopify_unfulfill-field"
          name={'feature_shopify_unfulfill'}
          control={control}
          label={'Shopify Do Not FulFill'}
          variant="outlined"
          margin="normal"
          fullWidth
          error={!!errors.feature_shopify_unfulfill}
          helperText={
            errors.feature_shopify_unfulfill
              ? errors.feature_shopify_unfulfill?.message
              : null
          }
        />
        <FormControl fullWidth style={{ marginTop: 12 }}>
          <TenantSelect
            id="add-feature-feature_status-select"
            control={control}
            fullWidth
            variant="outlined"
            label="Feature Status *"
            name={'feature_status'}
          >
            <MenuItem
              key={1}
              value={true}
              id={'add-feature-feature_status-menu-item-1'}
            >
              Active
            </MenuItem>
            <MenuItem
              key={2}
              value={false}
              id={'add-feature-feature_status-menu-item-2'}
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
                The feature icon appears on features and in the user portal.{' '}
                <br />
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

//Section Edit Feature Modal
const EditFeatureModal = ({
  data,
  open,
  onClose,
  onSubmit,
  validator
  //...params
}) => {
  const handleResizeImage = useResizeImageHandler();
  const [s3bucketImageUpload, s3bucketImageRemove] = useS3Uploader();

  //Closes the New Feature Modal
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

      const pageType = 'Feature';

      const data = await s3bucketImageUpload(resizedImage, 'variant', pageType);
      // TODO remove previous image
      await imageRemoveHandler();

      setValue('attachment', `${data.url}/${data.fields.key}`);
      setValue('feature_icon_id', data?.attachment?.id);
    }
  };

  const imageRemoveHandler = async () => {
    const url = getValues('attachment');
    if (url && url.split(':')[0] !== 'data') {
      const urlar = url.split('/');
      const fileName = `${urlar[3]}/${urlar[4]}/${urlar[5]}`;
      await s3bucketImageRemove({ fileName });
    }

    setValue('feature_icon_id', '');
    setValue('attachment', null);
  };

  const sendFeatureToParent = (sendData) => {
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
      feature_name: '',
      feature_id: '',
      feature_active_url: '',
      feature_inactive_url: '',
      feature_mailchimp_tag: '',
      feature_shopify_fulfill: '',
      feature_shopify_unfulfill: '',
      feature_status: true,
      feature_icon_id: '',
      attachment: ''
    }
  });

  //Set the field values
  useEffect(() => {
    setValue('id', data.id, true);
    setValue('feature_name', data.feature_name, true);
    setValue('feature_id', data.feature_id, true);
    setValue('feature_active_url', data.feature_active_url, true);
    setValue('feature_inactive_url', data.feature_inactive_url, true);
    setValue('feature_mailchimp_tag', data.feature_mailchimp_tag, true);
    setValue('feature_shopify_fulfill', data.feature_shopify_fulfill, true);
    setValue('feature_shopify_unfulfill', data.feature_shopify_unfulfill, true);
    setValue('feature_status', data.feature_status, true);
    setValue('feature_icon_id', data.feature_icon_id, true);
    setValue('feature_icon_id', data?.feature_icon_id);
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
        id="edit-feature-modal"
        open={open}
        close={handleEditClose}
        confirm={handleSubmit((data) => sendFeatureToParent(data))}
        title={'Edit Feature'}
        maxWidth={'md'}
        submitTitle={'Update Feature'}
        variant={'form_submit'}
      >
        <TenantTextField
          id="add-feature-feature_name-field"
          name={'feature_name'}
          control={control}
          label={'Feature Name *'}
          variant="outlined"
          margin="normal"
          fullWidth
          error={!!errors.feature_name}
          helperText={errors.feature_name ? errors.feature_name?.message : null}
        />
        <TenantTextField
          id="add-feature-feature_id-field"
          name={'feature_id'}
          control={control}
          label={'Feature ID'}
          variant="outlined"
          margin="normal"
          fullWidth
          error={!!errors.feature_id}
          helperText={errors.feature_id ? errors.feature_id?.message : null}
        />
        <TenantTextField
          id="add-feature-feature_active_url-field"
          name={'feature_active_url'}
          control={control}
          label={'Feature Active URL'}
          variant="outlined"
          margin="normal"
          fullWidth
          error={!!errors.feature_active_url}
          helperText={
            errors.feature_active_url
              ? errors.feature_active_url?.message
              : null
          }
        />
        <TenantTextField
          id="add-feature-feature_inactive_url-field"
          name={'feature_inactive_url'}
          control={control}
          label={'Feature Inactive URL'}
          variant="outlined"
          margin="normal"
          fullWidth
          error={!!errors.feature_inactive_url}
          helperText={
            errors.feature_inactive_url
              ? errors.feature_inactive_url?.message
              : null
          }
        />

        <TenantTextField
          id="add-feature-feature_mailchimp_tag-field"
          name={'feature_mailchimp_tag'}
          control={control}
          label={'Email/Shopify Tag'}
          variant="outlined"
          margin="normal"
          fullWidth
          error={!!errors.feature_mailchimp_tag}
          helperText={
            errors.feature_mailchimp_tag
              ? errors.feature_mailchimp_tag?.message
              : null
          }
        />

        <TenantTextField
          id="add-feature-feature_shopify_fulfill-field"
          name={'feature_shopify_fulfill'}
          control={control}
          label={'Shopify Fulfill'}
          variant="outlined"
          margin="normal"
          fullWidth
          error={!!errors.feature_shopify_fulfill}
          helperText={
            errors.feature_shopify_fulfill
              ? errors.feature_shopify_fulfill?.message
              : null
          }
        />
        <TenantTextField
          id="add-feature-feature_shopify_unfulfill-field"
          name={'feature_shopify_unfulfill'}
          control={control}
          label={'Shopify Do Not FulFill'}
          variant="outlined"
          margin="normal"
          fullWidth
          error={!!errors.feature_shopify_unfulfill}
          helperText={
            errors.feature_shopify_unfulfill
              ? errors.feature_shopify_unfulfill?.message
              : null
          }
        />
        <FormControl fullWidth style={{ marginTop: 12 }}>
          <TenantSelect
            id="add-feature-feature_status-select"
            control={control}
            fullWidth
            variant="outlined"
            label="Feature Status *"
            name={'feature_status'}
          >
            <MenuItem
              key={1}
              value={true}
              id={'add-feature-feature_status-menu-item-1'}
            >
              Active
            </MenuItem>
            <MenuItem
              key={2}
              value={false}
              id={'add-feature-feature_status-menu-item-2'}
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
                The feature icon appears on features and in the user portal.{' '}
                <br />
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

const DeleteFeatureModal = ({ data, open, onConfirm, onClose }) => {
  const handleDeleteFeature = () => {
    onConfirm(data);
    onClose();
  };

  return (
    <TenantModal
      id="delete-feature-modal"
      open={open}
      close={onClose}
      confirm={handleDeleteFeature}
      title="Delete Feature"
    >
      <Typography id="delete-feature-confirmation-text">
        Are you sure you want to delete this Feature&nbsp;
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
const FeaturesCustomToolbar = ({
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
          id="add-feature-btn"
        >
          Add Feature
        </Button>
      ) : null}
      {associateModal ? (
        <Button
          size="small"
          variant="outlined"
          onClick={onAssociate}
          id="associate-feature-btn"
        >
          Associate Feature
        </Button>
      ) : null}
    </GridToolbarContainer>
  );
};

//Generates the "Linked Feature" grid for settings tabs
const FeaturesGrid = (params) => {
  const { post } = useApi();

  //Used to maintain state of the New Feature Modal
  const [modal, setModal] = React.useState('');
  const [focusedData, setFocusedData] = React.useState({});

  const handleCloseModal = () => {
    setModal('');
  };

  //Opens the New Feature Modal
  const handleAddClickOpen = () => {
    setModal(ADD_FEATURE_MODAL);
  };

  //Opens the Associate Feature Modal
  const handleAssociateClickOpen = () => {
    setModal(ASSOCIATE_FEATURE_MODAL);
  };

  //Opens the Edit Modal
  const handleEditClickOpen = (row) => {
    setFocusedData(row);
    setModal(EDIT_FEATURE_MODAL);
  };

  // Handling delete confirmation box
  function handleDeleteClickOpen(row) {
    setFocusedData(row);
    setModal(DELETE_FEATURE_MODAL);
  }

  function notValidFeatureName(valueToCheck) {
    return new Promise((resolve) => {
      if (focusedData?.feature_name == valueToCheck) {
        resolve(false);
      }

      // check for existing
      params.featuresData.map(function (obj) {
        if (
          obj.feature_name == valueToCheck &&
          focusedData?.feature_name !== obj.feature_name
        ) {
          resolve(true);
        }
      });

      post(`/api/features/feature-validate`, {
        data: {
          feature_name: valueToCheck.toString().trim()
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

  function notValidFeatureId(valueToCheck) {
    return new Promise((resolve) => {
      if (focusedData?.feature_id == valueToCheck) {
        resolve(false);
      }

      // check for existing
      params.featuresData.map(function (obj) {
        if (
          obj.feature_id == valueToCheck &&
          focusedData?.feature_id !== obj.feature_id
        ) {
          resolve(true);
        }
      });

      post(`/api/features/feature-validate`, {
        data: {
          feature_id: valueToCheck.toString().trim()
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
    feature_name: yup
      .string('Enter Feature Name')
      .min(3, 'Name should be of minimum 3 characters length')
      .matches(
        EMOJIS_REGEX,
        'Emojis are not allowed in Feature name. Please choose another name.'
      )
      .required('Name is required')
      .trim()
      .test(
        'validator',
        'A name with the same name already exists. Please choose another name.',
        async (value) => {
          if (value !== undefined && value !== '') {
            const isDuplicateExists = await notValidFeatureName(value);
            return !isDuplicateExists;
          }
          // WHEN THE VALUE IS EMPTY RETURN `true` by default
          return true;
        }
      ),
    feature_id: yup
      .string('Enter Feature Id')
      .trim()
      .test(
        'validator',
        'A feature id with the same name already exists. Please choose another feature id.',
        async (value) => {
          if (value !== undefined && value !== '') {
            const isDuplicateExists = await notValidFeatureId(value);
            return !isDuplicateExists;
          }
          // WHEN THE VALUE IS EMPTY RETURN `true` by default
          return true;
        }
      ),
    feature_active_url: yup
      .string('Enter Feature Active URL')
      .url('Feature Active URL should be formatted as a URL'),
    feature_inactive_url: yup
      .string('Enter Feature Inactive URL')
      .url('Feature Inactive URL should be formatted as a URL')
  });

  //Define the Columns that we want to draw out
  const featuresColumns = [
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
      field: 'feature_id',
      headerName: 'Feature ID',
      editable: false,
      flex: 4
    },
    {
      field: 'feature_name',
      headerName: 'Feature Name',
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
              id={'edit-feature-btn' + params.row.id}
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
              id={'remove-feature-btn' + params.row.id}
            >
              Remove
            </Button>
          </>
        );
      }
    }
  ];

  const handleAddFeature = async (data) => {
    data.id = 'a' + Date.now();
    //Add our feature List

    params.addFunc([data]);
  };

  const handleEditFeatures = (data) => {
    //Update our Feature List
    params.updateFunc([data]);
  };

  const handleDeleteFeature = (row) => {
    const result = params.featuresData.map((filterRow) => {
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

  //Section Existing Features
  //Return Selected DataGrid
  return (
    <React.Fragment>
      <TenantDataGrid
        title={'features'}
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
            <FeaturesCustomToolbar
              {...params}
              onAdd={handleAddClickOpen}
              onAssociate={handleAssociateClickOpen}
            />
          )
        }}
        rows={params.featuresData.filter(
          (filterRow) =>
            filterRow?.deleted == null || filterRow?.deleted == undefined
        )}
        columns={featuresColumns}
        pageSize={50}
        rowsPerPageOptions={[50]}
        loading={params.loading}
        checkboxSelection={false}
      />
      {params.addModal ? (
        <AddFeatureModal
          validator={validator}
          onSubmit={handleAddFeature}
          onClose={handleCloseModal}
          open={modal === ADD_FEATURE_MODAL}
        />
      ) : null}
      {params.editModal ? (
        <EditFeatureModal
          //{...params}
          validator={validator}
          data={focusedData}
          onSubmit={handleEditFeatures}
          onClose={handleCloseModal}
          open={modal === EDIT_FEATURE_MODAL}
        />
      ) : null}
      <DeleteFeatureModal
        data={focusedData}
        onConfirm={handleDeleteFeature}
        onClose={handleCloseModal}
        open={modal === DELETE_FEATURE_MODAL}
      />
    </React.Fragment>
  );
};

export default FeaturesGrid;
