//React Imports
import React, { useEffect, useState } from 'react';

//Material UI Imports
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import FormControl from '@mui/material/FormControl';
import MenuItem from '@mui/material/MenuItem';
import Grid from '@mui/material/Grid';

//Material UI Icons
import HighlightOffIcon from '@mui/icons-material/HighlightOff';
import EditIcon from '@mui/icons-material/Edit';
import CircularProgress from '@mui/material/CircularProgress';
import InfoIcon from '@mui/icons-material/Info';

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
//Section Add Book Modal
const AddFeatureModal = ({ open, onClose, onSubmit, validator }) => {
  const handleResizeImage = useResizeImageHandler();
  const [s3bucketImageUpload, s3bucketImageRemove] = useS3Uploader();
  const [imageLoader, setImageLoader] = useState(false);

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

  // Book upload
  const bookUploadHandler = async (file) => {
    if (file) {
      const pageType = 'BookJSON';

      setImageLoader(true);
      const data = await s3bucketImageUpload(file, 'BookJSON', pageType);
      setImageLoader(false);
      // TODO remove previous image
      await imageRemoveHandler();
      setValue('book_json_file_name', file.name);
      setValue('book_json_path', `${data.url}/${data.fields.key}`);
      setValue('book_json_id', data?.attachment?.id);
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
      attachment: '',
      book_is_dictinoary: false,
      book_purchase_link: '',
      book_isbn_number_10: '',
      book_isbn_number_13: '',
      book_json_id: '',
      book_json_path: '',
      book_json_file_name: ''
    }
  });

  //Return Add Book Modal
  return (
    <div>
      <TenantModal
        id="add-feature-modal"
        open={open}
        close={handleNewClose}
        confirm={handleSubmit((data) => sendFeatureToParent(data))}
        title={'Add New Book'}
        maxWidth={'md'}
        submitTitle={'Add New Book'}
        variant={'form_submit'}
      >
        <TenantTextField
          id="add-feature-feature_name-field"
          name={'feature_name'}
          control={control}
          label={'Book Title *'}
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
          label={'Book ID'}
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
          label={'Book Active URL'}
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
          label={'Book Inactive URL'}
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
        <TenantTextField
          id="add-book-book_isbn_number_10"
          name={'book_isbn_number_10'}
          control={control}
          label={'ISBN Number 10'}
          variant="outlined"
          margin="normal"
          fullWidth
          error={!!errors.book_isbn_number_10}
          helperText={
            errors.book_isbn_number_10
              ? errors.book_isbn_number_10?.message
              : null
          }
        />
        <TenantTextField
          id="add-book-book_isbn_number_13"
          name={'book_isbn_number_13'}
          control={control}
          label={'ISBN Number 13'}
          variant="outlined"
          margin="normal"
          fullWidth
          error={!!errors.book_isbn_number_13}
          helperText={
            errors.book_isbn_number_13
              ? errors.book_isbn_number_13?.message
              : null
          }
        />
        <TenantTextField
          id="add-book-purchase-link"
          name={'book_purchase_link'}
          control={control}
          label={'Book Purchase Link'}
          variant="outlined"
          margin="normal"
          fullWidth
          error={!!errors.book_purchase_link}
          helperText={
            errors.book_purchase_link
              ? errors.book_purchase_link?.message
              : null
          }
        />
        <FormControl fullWidth style={{ marginTop: 12 }}>
          <TenantSelect
            id="add-book_dictinoary"
            control={control}
            fullWidth
            variant="outlined"
            label="Is Dictionary ?"
            name={'book_is_dictinoary'}
          >
            <MenuItem
              key={1}
              value={true}
              id={'add-add-book_dictinoary-menu-item-1'}
            >
              Yes
            </MenuItem>
            <MenuItem
              key={2}
              value={false}
              id={'add-add-book_dictinoary-menu-item-2'}
            >
              No
            </MenuItem>
          </TenantSelect>
        </FormControl>
        <FormControl style={{ marginTop: 12 }}>
          <Grid
            container
            rowSpacing={0.5}
            columnSpacing={{ xs: 1, sm: 2, md: 3 }}
          >
            <Grid item xs={5}>
              <FileSelectButton
                accept="application/json"
                id="book-json"
                onChange={bookUploadHandler}
                title="Upload Json"
              />
            </Grid>
            <Grid item xs={5}>
              <Controller
                name="book_json_path"
                control={control}
                render={({ field }) => (
                  <Button
                    href={field?.value}
                    id={'btn-link'}
                    target="_blank"
                    icon={field?.value}
                    name={'btn-link'}
                    variant="square"
                    removable
                  >
                    {getValues('book_json_file_name')}
                  </Button>
                )}
              />
            </Grid>
            <Grid item xs={1}>
              {imageLoader === true ? <CircularProgress /> : ''}
            </Grid>
          </Grid>
        </FormControl>
        <FormControl fullWidth style={{ marginTop: 12 }}>
          <TenantSelect
            id="add-feature-feature_status-select"
            control={control}
            fullWidth
            variant="outlined"
            label="Book Status *"
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
                The book icon appears on books and in the user portal. <br />
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

//Section Edit Book Modal
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
  const [imageLoader, setImageLoader] = useState(false);

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

  // Book upload
  const bookUploadHandler = async (file) => {
    if (file) {
      const pageType = 'BookJSON';

      setImageLoader(true);
      const data = await s3bucketImageUpload(file, 'BookJSON', pageType);
      setImageLoader(false);
      // TODO remove previous image
      await imageRemoveHandler();

      setValue('book_json_file_name', file.name);
      setValue('book_json_path', `${data.url}/${data.fields.key}`);
      setValue('book_json_id', data?.attachment?.id);
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
      attachment: '',
      book_is_dictinoary: false,
      book_purchase_link: '',
      book_isbn_number_10: '',
      book_isbn_number_13: '',
      book_json_id: '',
      book_json_file_name: ''
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

    setValue('book_is_dictinoary', data?.book_is_dictinoary);
    setValue('book_purchase_link', data?.book_purchase_link);
    setValue('book_isbn_number_10', data?.book_isbn_number_10);
    setValue('book_isbn_number_13', data?.book_isbn_number_13);
    setValue('book_json_path', data?.book_json_path);
    setValue('book_json_id', data?.book_json_id);
    setValue('book_json_file_name', data?.book_json_file_name);
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
          label={'Book Title *'}
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
          label={'Book ID'}
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
          label={'Book Active URL'}
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
          label={'Book Inactive URL'}
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
        <TenantTextField
          id="add-book-book_isbn_number_10"
          name={'book_isbn_number_10'}
          control={control}
          label={'ISBN Number 10'}
          variant="outlined"
          margin="normal"
          fullWidth
          error={!!errors.book_isbn_number_10}
          helperText={
            errors.book_isbn_number_10
              ? errors.book_isbn_number_10?.message
              : null
          }
        />
        <TenantTextField
          id="add-book-book_isbn_number_13"
          name={'book_isbn_number_13'}
          control={control}
          label={'ISBN Number 13'}
          variant="outlined"
          margin="normal"
          fullWidth
          error={!!errors.book_isbn_number_13}
          helperText={
            errors.book_isbn_number_13
              ? errors.book_isbn_number_13?.message
              : null
          }
        />
        <TenantTextField
          id="add-book-purchase-link"
          name={'book_purchase_link'}
          control={control}
          label={'Book Purchase Link'}
          variant="outlined"
          margin="normal"
          fullWidth
          error={!!errors.book_purchase_link}
          helperText={
            errors.book_purchase_link
              ? errors.book_purchase_link?.message
              : null
          }
        />
        <FormControl fullWidth style={{ marginTop: 12 }}>
          <TenantSelect
            id="add-book_dictinoary"
            control={control}
            fullWidth
            variant="outlined"
            label="Is Dictionary ?"
            name={'book_is_dictinoary'}
          >
            <MenuItem
              key={1}
              value={true}
              id={'add-add-book_dictinoary-menu-item-1'}
            >
              Yes
            </MenuItem>
            <MenuItem
              key={2}
              value={false}
              id={'add-add-book_dictinoary-menu-item-2'}
            >
              No
            </MenuItem>
          </TenantSelect>
        </FormControl>
        <FormControl style={{ marginTop: 12 }}>
          <Grid
            container
            rowSpacing={0.5}
            columnSpacing={{ xs: 1, sm: 2, md: 3 }}
          >
            <Grid item xs={5}>
              <FileSelectButton
                accept="application/json"
                id="book-json"
                onChange={bookUploadHandler}
                title="Upload Json"
              />
            </Grid>
            <Grid item xs={5}>
              <Controller
                name="book_json_path"
                control={control}
                render={({ field }) => (
                  <Button
                    href={field?.value}
                    id={'btn-link'}
                    target="_blank"
                    icon={field?.value}
                    name={'btn-link'}
                    variant="square"
                    removable
                  >
                    {getValues('book_json_file_name')}
                  </Button>
                )}
              />
            </Grid>
            <Grid item xs={1}>
              {imageLoader === true ? <CircularProgress /> : ''}
            </Grid>
          </Grid>
        </FormControl>
        <FormControl fullWidth style={{ marginTop: 12 }}>
          <TenantSelect
            id="add-feature-feature_status-select"
            control={control}
            fullWidth
            variant="outlined"
            label="Book Status *"
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
                The Book icon appears on books and in the user portal. <br />
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
      id="delete-book-modal"
      open={open}
      close={onClose}
      confirm={handleDeleteFeature}
      title="Delete Book"
    >
      <Typography id="delete-feature-confirmation-text">
        Are you sure you want to delete this Book&nbsp;
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
          id="add-book-btn"
        >
          Add Book
        </Button>
      ) : null}
      {associateModal ? (
        <Button
          size="small"
          variant="outlined"
          onClick={onAssociate}
          id="associate-book-btn"
        >
          Associate Book
        </Button>
      ) : null}
    </GridToolbarContainer>
  );
};

//Generates the "Linked Feature" grid for settings tabs
const BooksGrid = (params) => {
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
      .string('Enter Book Title')
      .min(3, 'Title should be of minimum 3 characters length')
      .matches(
        EMOJIS_REGEX,
        'Emojis are not allowed in Feature name. Please choose another name.'
      )
      .required('Title is required')
      .trim()
      .test(
        'validator',
        'A title with the same name already exists. Please choose another title.',
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
      .string('Enter Book Id')
      .trim()
      .test(
        'validator',
        'A book id with the same name already exists. Please choose another book id.',
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
      .string('Enter Book Active URL')
      .url('Book Active URL should be formatted as a URL'),
    feature_inactive_url: yup
      .string('Enter Book Inactive URL')
      .url('Book Inactive URL should be formatted as a URL')
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
      headerName: 'Book ID',
      editable: false,
      flex: 4
    },
    {
      field: 'feature_name',
      headerName: 'Book Title',
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
        title={'Books'}
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

export default BooksGrid;
