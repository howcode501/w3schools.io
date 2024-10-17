// Section Import
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
import TokenService from '../../services/token';

//Section Main Function
const ProductsIndex = () => {
  let userRole = [];
  userRole = TokenService.getUserData();

  //Section Column Definitions
  //DataGrid Columns Definition
  let columns = [
    { field: 'id', headerName: 'ID', width: 200, hide: true },
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
        if (params.row?.attachments?.public_url !== null) {
          return (
            <Avatar
              src={params.row?.attachments?.public_url}
              id={'product-profile-avatar-' + params.row.product_name}
            ></Avatar>
          );
        } else {
          return (
            <Avatar
              id={'product-profile-text-avatar-' + params.row.product_name}
            >
              {params?.row?.product_name?.charAt(0)}
            </Avatar>
          );
        }
      }
    },
    {
      field: 'product_name',
      headerName: 'Product Name',
      editable: false,
      flex: 3
    },
    {
      field: 'apps',
      headerName: 'Product Apps',
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
      headerName: 'Product Features',
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
              id={'btn-edit-product-' + params.row.id}
            >
              Edit
            </Button>
            &nbsp;
            {params.row.product_name !== 'Book Test Library' ? (
              <Button
                variant="contained"
                size="small"
                color="error"
                onClick={() => handleDeleteConfirmation(params)}
                startIcon={<ClearIcon />}
                id={'btn-delete-product-' + params.row.id}
              >
                Delete
              </Button>
            ) : (
              ''
            )}
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
  //Define the data that will be loaded client side
  const { get, del } = useApi();
  const dispatch = useDispatch();

  useEffect(() => {
    async function fetchData() {
      if (typeof window !== 'undefined') {
        //If the page is loaded and the token is available, let's call the products
        await get(`${API_ROOT}/api/products`)
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
    Router.push('/products/update/' + params.id);
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
        del(`/api/products/${params.id}`, { data })
          .then((res) => {
            if (res.status === 200) {
              setRows(rows.filter((row) => row.id !== params.id));
            } else {
              setSnackBarMessage(
                'Unable to delete product as it in use by user'
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
  function deleteProductConfirmed() {
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
          <Typography variant="h4" id="manage-products-title-h4">
            Products
          </Typography>
          <div style={{ display: 'flex', height: '100%', marginTop: 15 }}>
            <div style={{ flexGrow: 1 }}>
              <TenantDataGrid
                title={'products'}
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
                    key={'create-new-product-btn-1'}
                    href="/products/create"
                    passHref
                    id="goto-create-new-user-link"
                  >
                    <Button
                      size="small"
                      variant="outlined"
                      id="create-new-product-btn"
                    >
                      Create New Product
                    </Button>
                  </Link>
                ]}
                rows={rows}
                columns={columns}
                pageSize={50}
                loading={loading}
                rowsPerPageOptions={[50]}
                NoRowsOverlay
                id="productsGrid"
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
              id="delete-product-modal"
              confirm={deleteProductConfirmed}
              title="Delete Product"
              submitTitle="Confirm"
              variant={MODAL_VARIANT_FORM_SUBMIT}
            >
              <Typography id="delete-product-confirmation-text">
                Are you sure you want to delete Product{' '}
                <Typography sx={{ fontWeight: 'bold', display: 'inline' }}>
                  {deleteParams?.row?.name}
                </Typography>
                ? This action may take several seconds and cannot be undone.
              </Typography>
            </TenantModal>
            <PositionedSnackbar
              open={openSnackBar}
              autoHideDuration={2000}
              message={snackBarMessage}
              severity="error"
              onClose={() => setOpenSnackBar(false)}
            />
          </div>
        </Container>
      ) : (
        ''
      )}
    </>
  );
};

export default connect((state) => state)(ProductsIndex);
