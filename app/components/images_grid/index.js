/*
 * File Created for APP Inc
 * Project: app
 * User: ***
 * Date: 11/1/2021
 */

//React Imports
import React, { useEffect } from 'react';

//Material UI Imports
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContentText from '@mui/material/DialogContentText';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import Typography from '@mui/material/Typography';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';

//Material UI Icons
import LinkOffIcon from '@mui/icons-material/LinkOff';
import LaunchIcon from '@mui/icons-material/Launch';
import CachedIcon from '@mui/icons-material/Cached';
import EditIcon from '@mui/icons-material/Edit';
import RemoveCircleIcon from '@mui/icons-material/RemoveCircle';

//Material UI Styles
//Material UI DataGrid
import {
  DataGrid,
  GridToolbarColumnsButton,
  GridToolbarContainer,
  GridToolbarFilterButton
} from '@mui/x-data-grid';

//Image Imports
import { useApi } from '../../hooks';

//NextJS Imports
import { useRouter } from 'next/router';

//External Module Imports
import { Controller, useForm } from 'react-hook-form';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { EMOJIS_REGEX } from '../../helpers/constants';

const ADD_IMAGE_MODAL = 'ADD';
const DELETE_IMAGE_MODAL = 'DELETE';
const EDIT_IMAGE_MODAL = 'EDIT';
const ASSOCIATE_IMAGE_MODAL = 'ASSOCIATE';

const validator = yup.object({
  display_name: yup
    .string('Enter Image Name')
    .min(3, 'Name should be of minimum 3 characters length')
    .matches(
      EMOJIS_REGEX,
      'Emojis are not allowed in image name. Please choose another name.'
    )
    .required('Name is required'),
  description: yup
    .string('Enter Image Description')
    .min(3, 'Image Description should be of minimum 3 characters length')
    .matches(
      EMOJIS_REGEX,
      'Emojis are not allowed in image description. Please choose another description.'
    )
    .required('Image Description is required'),
  pool_id: yup
    .number('A Pool must be Specified!')
    .min(1, 'A Pool must be Specified!')
    .required('A Pool is Required'),
  operational_state_id: yup
    .string('A Image State must be Specified!')
    .min(1, 'A Image State must be Specified!')
    .required('A Image State is Required'),
  templated_type_id: yup
    .string('A Image Type must be Specified!')
    .min(1, 'A Image Type must be Specified!')
    .required('A Image Type is Required'),
  operating_system_id: yup
    .string('A Image OS must be Specified!')
    .min(1, 'A Image OS must be Specified!')
    .required('A Image OS is Required')
});

//Section Add Image Modal
const AddImageModal = ({
  open,
  onClose,
  onSubmit,
  operationalState,
  imageTypes,
  imageOSTypes,
  ...params
}) => {
  const { put } = useApi();
  //Used to maintain the state of field elements

  //Closes the New Images Modal
  const handleNewClose = () => {
    onClose();
    setValue('display_name', '', true);
    setValue('description', '', true);
    setValue('operational_state_id', 1, true);
    setValue('templated_type_id', 1, true);
    setValue('operating_system_id', 1, true);
    setValue('os_version', '', true);
    setValue('version', '', true);
    setValue('pool_id', 1, true);
  };

  const sendImagesToParent = (data) => {
    data.templated_type_id = parseInt(data.templated_type_id);
    // TODO: store farm into database
    put('/api/templates', { data })
      .then((res) => {
        if (res.status === 200) {
          const newImage = res.data.data.template;
          onSubmit(newImage);
          handleNewClose();
        }
      })
      .catch(() => {
        // TODO: should alert error message
      });
  };

  const {
    handleSubmit,
    control,
    setValue,
    formState: { errors }
  } = useForm({
    mode: 'onChange',
    reValidateMode: 'onChange',
    resolver: yupResolver(validator),
    defaultValues: {
      pool_id: 1,
      display_name: '',
      description: '',
      operational_state_id: 1,
      templated_type_id: 1,
      operating_system_id: 1,
      os_version: '',
      version: ''
    }
  });

  //Return Search Modal
  return (
    <div>
      <Dialog
        open={open}
        onClose={handleNewClose}
        fullWidth
        maxWidth="md"
        id="add-image-modal"
      >
        <form
          key={1}
          onSubmit={handleSubmit((data) => sendImagesToParent(data))}
          id="add-image-form"
        >
          <DialogTitle>Add New Image</DialogTitle>
          <DialogContent>
            {/* Main Page and Form */}

            <Controller
              as={TextField}
              name={'display_name'}
              control={control}
              render={({ field: { onChange, value, onBlur } }) => (
                <TextField
                  onChange={onChange}
                  onBlur={onBlur}
                  value={value}
                  error={!!errors.display_name}
                  helperText={
                    errors.display_name ? errors.display_name?.message : null
                  }
                  label={'Name *'}
                  variant="outlined"
                  margin={'normal'}
                  fullWidth
                  id="add-image-display-name-field"
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
                  label={'Description *'}
                  multiline
                  minRows={4}
                  error={!!errors.description}
                  helperText={
                    errors.description ? errors.description?.message : null
                  }
                  variant="outlined"
                  margin="normal"
                  fullWidth
                  type="text"
                  id="add-image-description-field"
                />
              )}
            />
            <FormControl
              fullWidth
              style={{ marginTop: 15 }}
              error={!!errors.pool_id}
            >
              <InputLabel>Pool * </InputLabel>
              <Controller
                name={'pool_id'}
                control={control}
                render={({ field }) => (
                  <Select
                    {...field}
                    label="Pool *"
                    fullWidth
                    variant="outlined"
                    id="add-image-pool-select"
                  >
                    {params.virtPools?.map((option) => (
                      <MenuItem key={option.id} value={option.id}>
                        {option.name}
                      </MenuItem>
                    ))}
                  </Select>
                )}
              />
            </FormControl>
            <FormControl
              fullWidth
              style={{ marginTop: 12 }}
              error={!!errors.state}
            >
              <InputLabel>State</InputLabel>
              <Controller
                name={'operational_state_id'}
                control={control}
                render={({ field }) => (
                  <Select
                    {...field}
                    label="State"
                    variant="outlined"
                    fullWidth
                    id="add-image-state-select"
                  >
                    {operationalState?.map((state) => {
                      return (
                        <MenuItem key={state.id} value={state.id}>
                          {state.display_name ?? state.value}
                        </MenuItem>
                      );
                    })}
                  </Select>
                )}
              />
            </FormControl>
            <FormControl
              fullWidth
              style={{ marginTop: 12 }}
              error={!!errors.type}
            >
              <InputLabel>Type</InputLabel>
              <Controller
                name={'templated_type_id'}
                control={control}
                render={({ field }) => (
                  <Select
                    {...field}
                    label="Type"
                    variant="outlined"
                    fullWidth
                    id="add-image-type-select"
                  >
                    {imageTypes?.map((templateType) => {
                      return (
                        <MenuItem key={templateType.id} value={templateType.id}>
                          {templateType.display_name ?? templateType.value}
                        </MenuItem>
                      );
                    })}
                  </Select>
                )}
              />
            </FormControl>
            <FormControl
              fullWidth
              style={{ marginTop: 12 }}
              error={!!errors.os}
            >
              <InputLabel>OS</InputLabel>
              <Controller
                name={'operating_system_id'}
                control={control}
                render={({ field }) => (
                  <Select
                    {...field}
                    label="Operating System"
                    variant="outlined"
                    fullWidth
                    id="add-image-os-select"
                  >
                    {imageOSTypes?.map((os) => {
                      return (
                        <MenuItem key={os.id} value={os.id}>
                          {os.display_name ?? os.value}
                        </MenuItem>
                      );
                    })}
                  </Select>
                )}
              />
            </FormControl>
            <Controller
              as={TextField}
              name={'os_version'}
              control={control}
              render={({ field: { onChange, value, onBlur } }) => (
                <TextField
                  onChange={onChange}
                  onBlur={onBlur}
                  value={value}
                  style={{ marginTop: 12 }}
                  label={'OS Version'}
                  error={!!errors.os_version}
                  helperText={
                    errors.os_version ? errors.os_version?.message : null
                  }
                  variant="outlined"
                  fullWidth
                  id="add-image-os-version-field"
                />
              )}
            />
            <Controller
              as={TextField}
              name={'version'}
              control={control}
              render={({ field: { onChange, value, onBlur } }) => (
                <TextField
                  onChange={onChange}
                  onBlur={onBlur}
                  value={value}
                  style={{ marginTop: 12 }}
                  error={!!errors.version}
                  helperText={errors.version ? errors.version?.message : null}
                  label={'Version'}
                  variant="outlined"
                  fullWidth
                  id="add-image-version-field"
                />
              )}
            />
            <p aria-required="true" aria-label={'(*) indicates required field'}>
              (*) indicates required field
            </p>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleNewClose} id="add-image-action-close-btn">
              Cancel
            </Button>
            <Button
              variant="contained"
              color="primary"
              type={'submit'}
              id="add-image-action-submit-btn"
            >
              Add Image
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </div>
  );
};

//Section Add Image Modal
const EditImageModal = ({
  data,
  open,
  onClose,
  onSubmit,
  operationalState,
  imageTypes,
  imageOSTypes,
  ...params
}) => {
  const { post } = useApi();

  //Closes the New Images Modal
  const handleEditClose = () => {
    onClose();
    setValue('display_name', '', true);
    setValue('description', '', true);
    setValue('operational_state_id', 1, true);
    setValue('templated_type_id', 1, true);
    setValue('operating_system_id', 1, true);
    setValue('os_version', '', true);
    setValue('version', '', true);
    setValue('pool_id', 0, true);
  };

  const sendImagesToParent = (sendData) => {
    sendData.id = data.id;
    post(`/api/templates/${sendData.id}`, { data: sendData })
      .then((res) => {
        if (res.status === 200) {
          const updated = res.data.data.template;
          onSubmit(updated);
          handleEditClose();
        }
      })
      .catch(() => {
        // Alert error message
      });
  };

  const {
    handleSubmit,
    control,
    setValue,
    formState: { errors }
  } = useForm({
    mode: 'onChange',
    reValidateMode: 'onChange',
    resolver: yupResolver(validator),
    defaultValues: {
      pool_id: 0,
      display_name: '',
      description: '',
      operational_state_id: 1,
      templated_type_id: 1,
      operating_system_id: 1,
      os_version: '',
      version: ''
    }
  });

  //Set the field values
  useEffect(() => {
    setValue('display_name', data.display_name, true);
    setValue('description', data.description, true);
    setValue('operational_state_id', data.operational_state_id, true);
    setValue('templated_type_id', data.templated_type_id, true);
    setValue('operating_system_id', data.operating_system_id, true);
    setValue('os_version', data.os_version, true);
    setValue('version', data.version, true);
    setValue('pool_id', data.pool_id, true);
  }, [open, data, setValue]);

  //Return Search Modal
  return (
    <div>
      <Dialog
        open={open}
        onClose={handleEditClose}
        fullWidth
        maxWidth="md"
        id="edit-image-modal"
      >
        <form
          key={1}
          onSubmit={handleSubmit((data) => sendImagesToParent(data))}
          id="edit-image-form"
        >
          <DialogTitle>Edit Image</DialogTitle>
          <DialogContent>
            <Controller
              as={TextField}
              name={'display_name'}
              control={control}
              render={({ field: { onChange, value, onBlur } }) => (
                <TextField
                  onChange={onChange}
                  onBlur={onBlur}
                  value={value}
                  error={!!errors.display_name}
                  helperText={
                    errors.display_name ? errors.display_name?.message : null
                  }
                  label={'Name *'}
                  variant="outlined"
                  margin={'normal'}
                  fullWidth
                  id="edit-image-display-name-field"
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
                  label={'Description *'}
                  multiline
                  minRows={4}
                  error={!!errors.description}
                  helperText={
                    errors.description ? errors.description?.message : null
                  }
                  variant="outlined"
                  margin="normal"
                  fullWidth
                  type="text"
                  id="edit-image-description-field"
                />
              )}
            />
            <FormControl
              fullWidth
              style={{ marginTop: 15 }}
              error={!!errors.pool_id}
            >
              <InputLabel>Pool * </InputLabel>
              <Controller
                name={'pool_id'}
                control={control}
                render={({ field }) => (
                  <Select
                    {...field}
                    label="Pool *"
                    fullWidth
                    variant="outlined"
                    id="edit-image-pool-select"
                  >
                    {params.virtPools?.map((option) => (
                      <MenuItem key={option.id} value={option.id}>
                        {option.name}
                      </MenuItem>
                    ))}
                  </Select>
                )}
              />
            </FormControl>
            <FormControl
              fullWidth
              style={{ marginTop: 12 }}
              error={!!errors.state}
            >
              <InputLabel>State</InputLabel>
              <Controller
                name={'operational_state_id'}
                control={control}
                render={({ field }) => (
                  <Select
                    {...field}
                    label="State"
                    variant="outlined"
                    fullWidth
                    id="edit-image-state-select"
                  >
                    {operationalState?.map((opState) => {
                      return (
                        <MenuItem key={opState.id} value={opState.id}>
                          {opState.display_name ?? opState.value}
                        </MenuItem>
                      );
                    })}
                  </Select>
                )}
              />
            </FormControl>
            <FormControl
              fullWidth
              style={{ marginTop: 12 }}
              error={!!errors.type}
            >
              <InputLabel>Type</InputLabel>
              <Controller
                name={'templated_type_id'}
                control={control}
                render={({ field }) => (
                  <Select
                    {...field}
                    label="Type"
                    variant="outlined"
                    fullWidth
                    id="edit-image-type-select"
                  >
                    {imageTypes?.map((templateType) => {
                      return (
                        <MenuItem key={templateType.id} value={templateType.id}>
                          {templateType.display_name ?? templateType.name}
                        </MenuItem>
                      );
                    })}
                  </Select>
                )}
              />
            </FormControl>
            <FormControl
              fullWidth
              style={{ marginTop: 12 }}
              error={!!errors.os}
            >
              <InputLabel>OS</InputLabel>
              <Controller
                name={'operating_system_id'}
                control={control}
                render={({ field }) => (
                  <Select
                    {...field}
                    label="Operating System"
                    variant="outlined"
                    fullWidth
                    id="edit-image-os-select"
                  >
                    {imageOSTypes?.map((os) => {
                      return (
                        <MenuItem key={os.id} value={os.id}>
                          {os.display_name ?? os.value}
                        </MenuItem>
                      );
                    })}
                  </Select>
                )}
              />
            </FormControl>
            <Controller
              as={TextField}
              name={'os_version'}
              control={control}
              render={({ field: { onChange, value, onBlur } }) => (
                <TextField
                  onChange={onChange}
                  onBlur={onBlur}
                  value={value}
                  style={{ marginTop: 12 }}
                  label={'OS Version'}
                  error={!!errors.os_version}
                  helperText={
                    errors.os_version ? errors.os_version?.message : null
                  }
                  variant="outlined"
                  fullWidth
                  id="edit-image-os-version-field"
                />
              )}
            />
            <Controller
              as={TextField}
              name={'version'}
              control={control}
              render={({ field: { onChange, value, onBlur } }) => (
                <TextField
                  onChange={onChange}
                  onBlur={onBlur}
                  value={value}
                  style={{ marginTop: 12 }}
                  error={!!errors.version}
                  helperText={errors.version ? errors.version?.message : null}
                  label={'Version'}
                  variant="outlined"
                  fullWidth
                  id="edit-image-version-field"
                />
              )}
            />
            <p aria-required="true" aria-label={'(*) indicates required field'}>
              (*) indicates required field
            </p>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleEditClose} id="edit-image-action-close-btn">
              Cancel
            </Button>
            <Button
              variant="contained"
              color="primary"
              type={'submit'}
              id="edit-image-action-submit-btn"
            >
              Update Image
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </div>
  );
};

//The columns for the New Images Modal
const newImageColumns = [
  { field: 'id', headerName: 'ID', width: 100, hide: true },
  {
    field: 'state',
    headerName: 'status',
    sortable: false,
    filterable: false,
    disableClickEventBubbling: true,
    disableColumnMenu: true,
    flex: 1
  },
  {
    field: 'name',
    headerName: 'Name',
    editable: false,
    flex: 3
  },
  {
    field: 'description',
    headerName: 'Description',
    editable: false,
    flex: 5
  },
  {
    field: 'released',
    headerName: 'Released',
    editable: false,
    filterable: false,
    align: 'right',
    headerAlign: 'right',
    disableClickEventBubbling: true,
    disableColumnMenu: true,
    flex: 2
  }
];
//New Image Modal, Allows Multiple Selection
const NewImageSearchModal = ({ open, onSubmit, onClose, ...params }) => {
  const { post } = useApi();

  //Used to maintain the state of field elements
  const [data, setData] = React.useState({ search_string: '' });

  //Used to hold the values of new images returned from the database
  const [templateSearch, setImageSearch] = React.useState([]);

  //Selected Rows
  const [selectedImages, setSelectedImages] = React.useState([]);

  //Closes the New Images Modal
  const handleClose = () => {
    onClose(false);
    setData({ name: '' });
    setImageSearch([]);
  };

  //Handles Field value changes
  const handleChange = (e) => {
    setData({ search_string: e.target.value });
  };

  //Post data to the API to search images
  const searchDatabase = (event) => {
    //Prevent the form from Submitting
    event.preventDefault();

    //Send Query
    post(`/api/images/search`, { data }).then((response) => {
      const images = response.data.data;
      setImageSearch(images);
    });
  };

  const sendImagesToParent = () => {
    onSubmit(selectedImages);
    handleClose();
  };

  //Return Search Modal
  return (
    <div>
      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="lg">
        <DialogTitle>Search For Images</DialogTitle>
        <DialogContent>
          <form onSubmit={searchDatabase}>
            <TextField
              autoFocus
              margin="dense"
              id="search_string"
              label="Image Name"
              type="text"
              variant="outlined"
              fullWidth
              value={data.search_string}
              onChange={(e) => handleChange(e)}
              autoComplete="off"
              InputProps={{
                endAdornment: (
                  <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    id="search-images-btn"
                  >
                    Search
                  </Button>
                )
              }}
            />
          </form>
          <DataGrid
            autoHeight
            rows={templateSearch}
            columns={newImageColumns}
            pageSize={50}
            rowsPerPageOptions={[50]}
            loading={params.loading}
            checkboxSelection
            components={{
              NoRowsOverlay: noRowsCustomOverlay,
              NoResultsOverlay: noResultsCustomOverlay
            }}
            onSelectionModelChange={(ids) => {
              //First we clean out the old list
              setSelectedImages({});

              let newData = [];

              //Assign the selected ones to a set
              const selectedIDs = new Set(ids);

              //Roll through and assign the selected ones to the new list
              templateSearch.filter((row) => {
                if (selectedIDs.has(row.id)) {
                  newData = [...newData, row];
                }
              });

              //Now update the state
              setSelectedImages(newData);
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} id="search-images-action-close-btn">
            Cancel
          </Button>
          <Button
            onClick={sendImagesToParent}
            id="search-images-action-add-btn"
          >
            Add Images
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

const DeleteImageModal = ({ data, open, onConfirm, onClose }) => {
  const { del } = useApi();

  const handleDeleteImage = () => {
    if (!data?.id) return;

    del(`/api/templates/${data.id}`, data)
      .then((res) => {
        if (res.status === 200) {
          onConfirm(data);
          onClose();
        }
      })
      .catch(() => {
        // TODO: Alert Error message
      });
  };

  return (
    <Dialog id="delete-image-modal" open={open} onClose={onClose}>
      <DialogTitle>Delete Image</DialogTitle>
      <DialogContent>
        <DialogContentText component="div">
          <Typography id="delete-image-confirmation-text">
            Are you sure you want to delete this Image&nbsp;
            <Typography
              component="span"
              sx={{ fontWeight: 'bold', display: 'inline' }}
            >
              {data?.display_name}
            </Typography>
            ? This action may take a few seconds and cannot be undone.
          </Typography>
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} id="delete-image-action-close-btn">
          Cancel
        </Button>
        <Button
          onClick={handleDeleteImage}
          autoFocus
          id="delete-image-action-confirm-btn"
        >
          Confirm
        </Button>
      </DialogActions>
    </Dialog>
  );
};

//Define the Custom Toolbar we want in order to move the create user button into the bar.
const ImagesCustomToolbar = ({ onAdd, onAssociate, ...params }) => {
  let addModal = false;
  let associateModal = false;

  //Limit the number of Images that can be added, if the flag is set!
  if (params.numAllowed) {
    if (params.imagesData.length < params.numAllowed) {
      addModal = !!params.addModal;
      associateModal = !!params.associateModal;
    }
  } else {
    addModal = !!params.addModal;
    associateModal = !!params.associateModal;
  }

  return (
    <GridToolbarContainer>
      <GridToolbarColumnsButton />
      <GridToolbarFilterButton />
      {addModal ? (
        <Button
          size="small"
          id={'add-image-btn'}
          variant="outlined"
          onClick={onAdd}
        >
          Add Image
        </Button>
      ) : null}
      {associateModal ? (
        <Button size="small" variant="outlined" onClick={onAssociate}>
          Associate Image
        </Button>
      ) : null}
    </GridToolbarContainer>
  );
};

// custom overlay for no results and no rows
const noRowsCustomOverlay = () => {
  return (
    <Stack
      height="auto"
      paddingTop="40px"
      alignItems="center"
      justifyContent="center"
    >
      No images
    </Stack>
  );
};

const noResultsCustomOverlay = () => {
  return (
    <Stack
      height="auto"
      paddingTop="40px"
      alignItems="center"
      justifyContent="center"
    >
      No images found
    </Stack>
  );
};

//Generates the "Linked Images" grid for settings tabs
const ImagesGrid = (params) => {
  //Used to maintain state of the New Images Modal
  const pageParams = params;
  const router = useRouter();
  const [modal, setModal] = React.useState('');
  const [focusedData, setFocusedData] = React.useState({});

  const handleCloseModal = () => {
    setModal('');
  };

  //Opens the New Farms Modal
  const handleAddClickOpen = () => {
    setModal(ADD_IMAGE_MODAL);
  };

  //Opens the Associate Farms Modal
  const handleAssociateClickOpen = () => {
    if (params.associateModalLink) {
      router.push(params.associateModalLink);
    } else {
      setModal(ASSOCIATE_IMAGE_MODAL);
    }
  };

  //Opens the Edit Modal
  const handleEditClickOpen = (row) => {
    setFocusedData(row);
    setModal(EDIT_IMAGE_MODAL);
  };

  const handleRemoveClickOpen = () => {
    setModal(DELETE_IMAGE_MODAL);
  };

  //Remove the group from the list and then send it back to the caller
  const handleDeleteImage = (row) => {
    const result = params.imagesData.filter(
      (filterRow) => filterRow.id !== row.id
    );

    params.deleteFunc(result);
  };

  //Define the Columns that we want to draw out
  const imageColumns = [
    { field: 'id', headerName: 'ID', width: 100, hide: true },
    {
      field: 'display_name',
      headerName: 'Name',
      editable: false,
      flex: 4
    },
    {
      field: 'description',
      headerName: 'Description',
      editable: false,
      flex: 5
    },
    {
      field: 'operational_state',
      headerName: 'Status',
      flex: 1,
      valueGetter: function ({ row }) {
        return row.operational_state?.display_name;
      }
    },
    {
      field: 'action',
      headerName: 'Action',
      align: 'left',
      headerAlign: 'left',
      sortable: false,
      filterable: false,
      disableClickEventBubbling: true,
      disableColumnMenu: true,
      flex: 3,
      renderCell: (params) => {
        return (
          <>
            {pageParams.executive ? (
              <Button
                variant="contained"
                color="success"
                startIcon={<LaunchIcon />}
                size="small"
                id={'launch-image-btn-' + params.row.id}
              >
                Launch
              </Button>
            ) : null}
            &nbsp;
            {pageParams.associateModal && pageParams.executive ? (
              <>
                <Button
                  variant="contained"
                  color="info"
                  startIcon={<CachedIcon />}
                  size="small"
                  id={'deploy-image-btn-' + params.row.id}
                >
                  Deploy
                </Button>
                &nbsp;
                <Button
                  variant="contained"
                  color="error"
                  startIcon={<LinkOffIcon />}
                  size="small"
                  id={'stop-image-btn' + params.row.id}
                >
                  Stop
                </Button>
              </>
            ) : null}
            {pageParams.addModal ? (
              <>
                <Button
                  variant="contained"
                  startIcon={<EditIcon />}
                  size="small"
                  onClick={() => handleEditClickOpen(params.row)}
                  id={'edit-image-btn' + params.row.id}
                >
                  Edit
                </Button>
                &nbsp;
                <Button
                  variant="contained"
                  color="error"
                  startIcon={<RemoveCircleIcon />}
                  size="small"
                  onClick={() => handleRemoveClickOpen(params.row)}
                  id={'remove-image-btn' + params.row.id}
                >
                  Remove
                </Button>
              </>
            ) : null}
          </>
        );
      }
    }
  ];

  //TODO Pass the images back to the caller
  const handleAddImages = (data) => {
    params.addFunc([data]);
  };

  const handleEditImages = (data) => {
    params.updateFunc([data]);
  };

  //Section Existing Images
  //Return Selected DataGrid
  return (
    <React.Fragment>
      <DataGrid
        autoHeight
        components={{
          Toolbar: () => (
            <ImagesCustomToolbar
              {...params}
              onAdd={handleAddClickOpen}
              onAssociate={handleAssociateClickOpen}
            />
          ),
          NoRowsOverlay: noRowsCustomOverlay,
          NoResultsOverlay: noResultsCustomOverlay
        }}
        rows={params.imagesData}
        columns={imageColumns}
        pageSize={50}
        rowsPerPageOptions={[50]}
        loading={params.loading}
        checkboxSelection={false}
      />
      {params.associateModal ? (
        <NewImageSearchModal
          {...params}
          onSubmit={handleAddImages}
          onClose={handleCloseModal}
          open={modal === ASSOCIATE_IMAGE_MODAL}
        />
      ) : null}
      {params.addModal ? (
        <AddImageModal
          {...params}
          onSubmit={handleAddImages}
          onClose={handleCloseModal}
          open={modal === ADD_IMAGE_MODAL}
        />
      ) : null}
      {params.editModal ? (
        <EditImageModal
          {...params}
          data={focusedData}
          onSubmit={handleEditImages}
          onClose={handleCloseModal}
          open={modal === EDIT_IMAGE_MODAL}
        />
      ) : null}
      <DeleteImageModal
        data={focusedData}
        onConfirm={handleDeleteImage}
        onClose={handleCloseModal}
        open={modal === DELETE_IMAGE_MODAL}
      />
    </React.Fragment>
  );
};

export default ImagesGrid;
