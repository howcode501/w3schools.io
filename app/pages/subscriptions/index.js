//React Imports
import React, { useEffect } from 'react';

//Material UI Imports
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import Avatar from '@mui/material/Avatar';

//Material UI Icons
import EditIcon from '@mui/icons-material/Edit';
import ClearIcon from '@mui/icons-material/Clear';
import InfoIcon from '@mui/icons-material/Info';

//Material UI DataGrid
import {
  TenantDataGrid,
  MODAL_VARIANT_FORM_SUBMIT,
  TenantModal,
  PositionedSnackbar,
  TenantTextField,
  BadgeTooltip,
  FileSelectButton,
  UserAvatar
} from '../../components';

//Application Imports
import { useApi, useS3Uploader, useResizeImageHandler } from '../../hooks';
import { Controller, useForm } from 'react-hook-form';

//NextJS Imports
import Link from 'next/link';
import Router from 'next/router';

//External Module Imports
import { connect, useDispatch } from 'react-redux';
import { API_ROOT } from '../../helpers/config';
import TokenService from '../../services/token';

//Section Main Function
const SubscriptionsIndex = () => {
  let userRole = [];
  userRole = TokenService.getUserData();
  const handleResizeImage = useResizeImageHandler();
  const [s3bucketImageUpload, s3bucketImageRemove] = useS3Uploader();

  //Section Column Definitions
  //DataGrid Columns Definition
  let columns = [
    { field: 'id', headerName: 'ID', width: 200, hide: true },
    {
      field: 'attachments',
      headerName: ' ',
      width: 45,
      align: 'center',
      sortable: false,
      filterable: false,
      disableClickEventBubbling: true,
      disableColumnMenu: true,
      editable: false,
      renderCell: (params) => {
        if (params?.row?.attachments?.public_url !== null) {
          return (
            <Avatar
              src={params?.row?.attachments?.public_url}
              id={'subscription-profile-avatar-' + params.row.subscription_name}
            ></Avatar>
          );
        } else {
          return (
            <Avatar
              id={
                'subscription-profile-text-avatar-' +
                params.row.subscription_name
              }
            >
              {params?.row?.subscription_name?.charAt(0)}
            </Avatar>
          );
        }
      }
    },
    {
      field: 'subscription_name',
      headerName: 'Subscription Name',
      editable: false,
      flex: 3
    },
    {
      field: 'apps',
      headerName: 'Subscription Apps',
      editable: false,
      flex: 2,
      valueGetter: function (params) {
        let str = '';
        params.row.apps?.map((eachVal) => {
          if (eachVal.app_name) {
            str = str + `${eachVal.app_name},`;
          }
        });
        if (str !== '') {
          return str.replace(/,(?=[^,]*$)/, '');
        } else {
          return str;
        }
      }
    },
    {
      field: 'features',
      headerName: 'Subscription Features',
      editable: false,
      flex: 2,
      valueGetter: function (params) {
        let str = '';
        params.row.features?.map((eachVal) => {
          if (eachVal.feature_name) {
            str = str + `${eachVal.feature_name},`;
          }
        });
        if (str !== '') {
          return str.replace(/,(?=[^,]*$)/, '');
        } else {
          return str;
        }
      }
    },
    {
      field: 'status',
      headerName: 'Status',
      editable: false,
      flex: 1,
      valueGetter: function (params) {
        return params?.row?.status ? 'Active' : 'Inactive';
      }
    },
    {
      field: 'action',
      headerName: 'Actions',
      align: 'left',
      headerAlign: 'left',
      sortable: false,
      filterable: false,
      minWidth: 175,
      disableClickEventBubbling: true,
      disableColumnMenu: true,
      flex: 2,
      renderCell: (params) => {
        return (
          <>
            <Button
              size="small"
              variant="contained"
              color="primary"
              onClick={() => handleEditClick(params)}
              startIcon={<EditIcon />}
              id={'btn-edit-subscription-' + params.row.id}
            >
              Edit
            </Button>
            &nbsp;
            <Button
              variant="contained"
              size="small"
              color="error"
              onClick={() => handleDeleteConfirmation(params)}
              startIcon={<ClearIcon />}
              id={'btn-delete-subscription-' + params.row.id}
            >
              Delete
            </Button>
          </>
        );
      }
    }
  ];

  if (userRole) {
    if (userRole.roles[0] === 'msp') {
      columns;
    } else {
      columns.splice(0, 1);
    }
  }
  //Section Define Vars
  //Using the Router so that we can push them to a new URL
  //Rows Data is temporarily stored in a State Object
  const [rows, setRows] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [deletionPopupOpen, setDeletionPopupOpen] = React.useState(false);
  const [deleteParams, setDeleteParams] = React.useState('');
  const [show, setShow] = React.useState(false);
  const [openSnackBar, setOpenSnackBar] = React.useState(false);
  const [snackBarMessage, setSnackBarMessage] = React.useState('');
  const [subscriptionModalStaticOpen, setSubscriptionModalStaticOpen] =
    React.useState(false);
  const [systemConfig, setSystemConfig] = React.useState([]);
  //Define the data that will be loaded client side
  const { get, del, post } = useApi();
  const dispatch = useDispatch();

  useEffect(() => {
    async function fetchData() {
      if (typeof window !== 'undefined') {
        //If the page is loaded and the token is available, let's call the products
        await get(`${API_ROOT}/api/subscriptions`)
          .then((response) => {
            setRows(response.data.data);
            setLoading(false);
            setShow(true);
          })
          .catch((error) => {
            if (error.response.status === 403) {
              dispatch({
                type: 'SET_ALLOWED',
                isAllowed: false
              });
              setShow(false);
            }
          });
      }
    }

    fetchData();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  //Section Helper Functions
  function handleEditClick(params) {
    Router.push('/subscriptions/update/' + params.id);
  }

  function handleDeleteClick(params) {
    if (
      userRole.id == params.id &&
      (userRole.roles[0] === 'msp' || userRole.roles[0] === 'administrator')
    ) {
      setDeletionPopupOpen(false);
    } else {
      try {
        const data = params.row;
        del(`/api/subscriptions/${params.id}`, { data })
          .then((res) => {
            if (res?.status === 200) {
              setRows(rows.filter((row) => row.id !== params.id));
            } else {
              setSnackBarMessage(
                'Unable to delete subscription as it in use by user'
              );
              setOpenSnackBar(true);
            }
          })
          .catch(function (error) {
            setSnackBarMessage(error.message);
            setOpenSnackBar(true);
          });
      } catch (err) {
        setSnackBarMessage(err.message);
        setOpenSnackBar(true);
      }
    }
  }

  // Handling delete confirmation box
  function handleDeleteConfirmation(params) {
    setDeletionPopupOpen(true);
    setDeleteParams(params);
  }

  // Trigger delete operation after getting confirmation
  function deleteSubscriptionConfirmed() {
    handleDeleteClick(deleteParams);
    handleDeleteClose();
  }

  // Close Delete modal
  function handleDeleteClose() {
    setDeletionPopupOpen(false);
  }
  // Static subscription modal functions
  const handleSubscriptionModalBtn = async () => {
    await get('/api/system-config/options')
      .then((response) => {
        setSystemConfig(response.data.data.systemConfig);
        response.data.data.systemConfig.forEach((config) => {
          if (
            config.name == 'Subscription_Description' ||
            config.name == 'Subscription_Learn_More_Link' ||
            config.name == 'Subscription_Icon'
          ) {
            setValue(config.name, config.value, true);
          }
        });
        setSubscriptionModalStaticOpen(true);
      })
      .catch(() => {});
  };

  // Close Delete modal
  function handleDeleteCloseSubscriptionModal() {
    setSubscriptionModalStaticOpen(false);
  }

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

      const pageType = 'Subscription_Static';

      const data = await s3bucketImageUpload(
        resizedImage,
        'Subscription_Static',
        pageType
      );
      // TODO remove previous image
      await imageRemoveHandler();

      setValue('Subscription_Icon', `${data.url}/${data.fields.key}`);
    }
  };

  const imageRemoveHandler = async () => {
    const url = getValues('Subscription_Icon');
    if (url && url.split(':')[0] !== 'data') {
      const urlar = url.split('/');
      const fileName = `${urlar[3]}/${urlar[4]}/${urlar[5]}`;
      await s3bucketImageRemove({ fileName });
    }

    setValue('Subscription_Icon', '');
  };

  const sendSubscriptionStaticToParent = async (data) => {
    const keys = Object.keys(data);
    const values = Object.values(data);
    const newData = [];
    keys.forEach((key, i) => {
      // find index from system config
      const index = systemConfig.findIndex((p) => p.name == key);
      newData.push({
        id: systemConfig[index].id,
        name: key,
        value: values[i]
      });
    });

    await post(`/api/system-config/1`, { newData }).then((res) => {
      if (res.status === 200) {
        setSubscriptionModalStaticOpen(false);
      }
    });
  };

  const { handleSubmit, control, getValues, setValue } = useForm({
    mode: 'onChange',
    reValidateMode: 'onChange',
    defaultValues: {
      Subscription_Description: '',
      Subscription_Learn_More_Link: '',
      Subscription_Icon: ''
    }
  });

  //Section Return
  //Return Our Page
  return (
    <>
      {show === true ? (
        <Container maxWidth="xl">
          <Typography variant="h4" id="manage-subscriptions-title-h4">
            Subscription
          </Typography>
          <div style={{ display: 'flex', height: '100%', marginTop: 15 }}>
            <div style={{ flexGrow: 1 }}>
              <TenantDataGrid
                title={'subscriptions'}
                initialState={{
                  columns: {
                    columnVisibilityModel: {
                      id: false
                    }
                  }
                }}
                autoHeight
                tools={[
                  <Link
                    key="goto-create-new-subscription-link-1"
                    href="/subscriptions/create"
                    passHref
                    id="goto-create-new-subscription-link"
                  >
                    <Button
                      size="small"
                      variant="outlined"
                      id="create-new-subscription-btn"
                    >
                      Create New Subscription
                    </Button>
                  </Link>,
                  <Link
                    key="edit-Subscription-user-portal-info-1"
                    href="#"
                    onClick={handleSubscriptionModalBtn}
                    id="edit-Subscription-user-portal-info"
                  >
                    <Button
                      size="small"
                      variant="outlined"
                      id="edit-Subscription-user-portal-info"
                    >
                      Edit Subscription User Portal Info
                    </Button>
                  </Link>
                ]}
                rows={rows}
                columns={columns}
                pageSize={50}
                loading={loading}
                rowsPerPageOptions={[50]}
                NoRowsOverlay
                id="subscriptionsGrid"
                disableSelectionOnClick
              />
            </div>
          </div>
          <div>
            <TenantModal
              open={deletionPopupOpen}
              close={handleDeleteClose}
              fullWidth
              maxWidth="md"
              id="delete-subscriptions-modal"
              confirm={deleteSubscriptionConfirmed}
              title="Delete Subscriptions"
              submitTitle="Confirm"
              variant={MODAL_VARIANT_FORM_SUBMIT}
            >
              <Typography id="delete-subscriptions-confirmation-text">
                Are you sure you want to delete subscriptions{' '}
                <Typography sx={{ fontWeight: 'bold', display: 'inline' }}>
                  {deleteParams?.row?.name}
                </Typography>
                ? This action may take several seconds and cannot be undone.
              </Typography>
            </TenantModal>
            <TenantModal
              open={subscriptionModalStaticOpen}
              close={handleDeleteCloseSubscriptionModal}
              fullWidth
              maxWidth="md"
              id="edit-subscriptions-modal-static"
              title="Edit Subscription User Portal Info"
              confirm={handleSubmit((data) =>
                sendSubscriptionStaticToParent(data)
              )}
              submitTitle={'Save'}
              variant={'form_submit'}
            >
              <TenantTextField
                id="Subscription_Description"
                name={'Subscription_Description'}
                control={control}
                label={'Subscription Description'}
                variant="outlined"
                margin="normal"
                multiline
                minRows={4}
                fullWidth
              />
              <TenantTextField
                id="Subscription_Learn_More_Link"
                name={'Subscription_Learn_More_Link'}
                control={control}
                label={'Learn More Link'}
                variant="outlined"
                margin="normal"
                fullWidth
              />
              <Controller
                name="Subscription_Icon"
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
                  id="app-change-icon"
                  onChange={imageUploadHandler}
                  title="Change Icon"
                />
              </BadgeTooltip>
            </TenantModal>
          </div>
          <PositionedSnackbar
            open={openSnackBar}
            autoHideDuration={2000}
            message={snackBarMessage}
            severity="error"
            onClose={() => setOpenSnackBar(false)}
          />
        </Container>
      ) : (
        ''
      )}
    </>
  );
};

export default connect((state) => state)(SubscriptionsIndex);
