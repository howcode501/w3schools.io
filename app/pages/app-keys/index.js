//React Imports
import React, { useEffect } from 'react';

//Material UI Imports
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';

//Material UI Icons
import EditIcon from '@mui/icons-material/Edit';
import ClearIcon from '@mui/icons-material/Clear';

//Material UI DataGrid
import {
  TenantDataGrid,
  MODAL_VARIANT_FORM_SUBMIT,
  TenantModal,
  PositionedSnackbar
} from '../../components';

//Application Imports
import { useApi } from '../../hooks';

//NextJS Imports
import Link from 'next/link';
import Router from 'next/router';

//External Module Imports
import { connect, useDispatch } from 'react-redux';
import { API_ROOT } from '../../helpers/config';

//Section Main Function
const APIKEYINDEX = () => {
  //Section Column Definitions
  //DataGrid Columns Definition
  let columns = [
    { field: 'id', headerName: 'ID', width: 200, hide: true },
    {
      field: 'email',
      headerName: 'Email',
      editable: false,
      flex: 3
    },
    {
      field: 'key',
      headerName: 'API Key',
      editable: false,
      flex: 2
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
              id={'btn-edit-api-key-' + params.row.id}
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
              id={'btn-delete-api-key' + params.row.id}
            >
              Delete
            </Button>
          </>
        );
      }
    }
  ];

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
  const [swaggerDocUrl, setSwaggerDocUrl] = React.useState('');
  //Define the data that will be loaded client side
  const { get, del } = useApi();
  const dispatch = useDispatch();

  useEffect(() => {
    async function fetchData() {
      if (typeof window !== 'undefined') {
        //If the page is loaded and the token is available, let's call the products
        await get(`${API_ROOT}/api/app-keys`)
          .then((response) => {
            setRows(response.data.data);
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

    function getOptions() {
      get(`/api/app-keys/options`)
        .then((response) => {
          const API_URL = response?.data?.data?.systemConfig?.find(
            (o) => o.name === 'Swagger_API_DOC_URL'
          );
          if (API_URL.value !== null) {
            setSwaggerDocUrl(API_URL.value);
          }
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

    fetchData();
    getOptions();
    setLoading(false);
    setShow(true);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  //Section Helper Functions
  function handleEditClick(params) {
    Router.push('/app-keys/update/' + params.id);
  }

  function handleDeleteClick(params) {
    try {
      const data = params.row;
      del(`/api/app-keys/${params.id}`, { data })
        .then((res) => {
          if (res?.status === 200) {
            setRows(rows.filter((row) => row.id !== params.id));
          } else {
            setSnackBarMessage('Unable to delete api key as it in use by user');
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

  // Handling delete confirmation box
  function handleDeleteConfirmation(params) {
    setDeletionPopupOpen(true);
    setDeleteParams(params);
  }

  // Trigger delete operation after getting confirmation
  function deleteApiKeyConfirmed() {
    handleDeleteClick(deleteParams);
    handleDeleteClose();
  }

  // Close Delete modal
  function handleDeleteClose() {
    setDeletionPopupOpen(false);
  }

  //Section Return
  //Return Our Page
  return (
    <>
      {show === true ? (
        <Container maxWidth="xl">
          <Typography variant="h4" id="manage-subscriptions-title-h4">
            API Keys
          </Typography>
          <div style={{ display: 'flex', height: '100%', marginTop: 15 }}>
            <div style={{ flexGrow: 1 }}>
              <TenantDataGrid
                title={'api-keys'}
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
                    key="goto-create-new-api-key-link-1"
                    href="/app-keys/create"
                    passHref
                    id="goto-create-new-api-key-link"
                  >
                    <Button
                      size="small"
                      variant="outlined"
                      id="create-new-subscription-btn"
                    >
                      Create New API key
                    </Button>
                  </Link>,
                  <Link
                    key="view-api-docs-1"
                    href={swaggerDocUrl}
                    target={'_blank'}
                    id="view-api-docs-2"
                  >
                    <Button size="small" variant="outlined" id="view-api-doc-3">
                      View API docs
                    </Button>
                  </Link>
                ]}
                rows={rows}
                columns={columns}
                pageSize={50}
                loading={loading}
                rowsPerPageOptions={[50]}
                NoRowsOverlay
                id="apiKeysGrid"
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
              id="delete-api-keys-modal"
              confirm={deleteApiKeyConfirmed}
              title="Delete API Key"
              submitTitle="Confirm"
              variant={MODAL_VARIANT_FORM_SUBMIT}
            >
              <Typography id="delete-api-key-confirmation-text">
                Are you sure you want to delete API Key{' '}
                <Typography sx={{ fontWeight: 'bold', display: 'inline' }}>
                  {deleteParams?.row?.name}
                </Typography>
                ? This action may take several seconds and cannot be undone.
              </Typography>
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

export default connect((state) => state)(APIKEYINDEX);
