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

import { TenantDataGrid, TenantModal } from '../../components';

//Application Imports
import { useApi } from '../../hooks';

//NextJS Imports
import Link from 'next/link';
import Router from 'next/router';

//External Module Imports
import { connect, useDispatch } from 'react-redux';
import { API_ROOT } from '../../helpers/config';
import TokenService from '../../services/token';

//Used to get the User's Name based on type
const getName = (params, type = '') => {
  if (type === 'first') {
    return params?.row?.profile?.first_name
      ? params?.row?.profile?.first_name
      : '';
  } else if (type === 'last') {
    return params?.row?.profile?.last_name
      ? params?.row?.profile?.last_name
      : '';
  } else {
    return (
      (params?.row?.profile?.first_name
        ? params?.row?.profile?.first_name
        : '') +
      ' ' +
      (params?.row?.profile?.last_name ? params?.row?.profile?.last_name : '')
    );
  }
};

//Section Main Function
const UsersIndex = () => {
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
        if (params?.row?.attachments?.public_url !== null) {
          return (
            <Avatar
              src={params?.row?.attachments?.public_url}
              id={'user-profile-avatar-' + params?.row?.profile?.id}
            ></Avatar>
          );
        } else {
          return (
            <Avatar id={'user-profile-text-avatar-' + params.row.profile?.id}>
              {params?.row?.profile?.first_name?.charAt(0) +
                params?.row?.profile?.last_name?.charAt(0)}
            </Avatar>
          );
        }
      }
    },
    {
      field: 'name',
      headerName: 'Email Address',
      editable: false,
      flex: 3
    },
    {
      field: 'first_name',
      headerName: 'First Name',
      editable: false,
      flex: 2,
      valueGetter: function (params) {
        return getName(params, 'first');
      }
    },
    {
      field: 'last_name',
      headerName: 'Last Name',
      editable: false,
      flex: 2,
      valueGetter: function (params) {
        return getName(params, 'last');
      }
    },
    {
      field: 'groups',
      headerName: 'Apps',
      editable: false,
      flex: 3,
      valueGetter: function (params) {
        let str = '';
        params?.row?.user_products_apps_features?.map((eachVal) => {
          if (eachVal?.app_name) {
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
      headerName: 'Features',
      editable: false,
      flex: 3,
      valueGetter: function (params) {
        let str = '';
        params?.row?.user_products_apps_features?.map((eachVal) => {
          if (eachVal?.feature_name) {
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
      field: 'subscription',
      headerName: 'Subscription',
      editable: false,
      flex: 3,
      valueGetter: function (params) {
        let str = '';
        params?.row?.user_subscriptions?.map((eachVal) => {
          if (eachVal?.subscription_name) {
            str = str + `${eachVal.subscription_name},`;
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
      field: 'role',
      headerName: 'Role',
      sortable: true,
      editable: false,
      flex: 1,
      valueGetter: function (params) {
        return params?.row?.roles[0]?.display_name;
      }
    },
    {
      field: 'enabled',
      headerName: 'Status',
      editable: false,
      flex: 1,
      valueGetter: function (params) {
        return params?.row?.auth?.enabled ? 'Active' : 'Inactive';
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
              id={'btn-edit-user-' + params.row.profile?.id}
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
              id={'btn-delete-user-' + params.row.profile?.id}
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
  const [authorizedPopupOpen, setauthorizedPopupOpen] = React.useState(false);
  const [deletionPopupOpen, setDeletionPopupOpen] = React.useState(false);
  const [deleteParams, setDeleteParams] = React.useState('');
  const [show, setShow] = React.useState(false);
  //Define the data that will be loaded client side
  const { get, del } = useApi();
  const dispatch = useDispatch();

  useEffect(() => {
    async function fetchData() {
      if (typeof window !== 'undefined') {
        //If the page is loaded and the token is available, let's call the users
        await get(`${API_ROOT}/api/users`)
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
    Router.push('/users/update/' + params.id);
  }

  function handleDeleteClick(params) {
    if (
      userRole.id == params.id &&
      (userRole.roles[0] === 'msp' || userRole.roles[0] === 'administrator')
    ) {
      setauthorizedPopupOpen(true);
      setDeletionPopupOpen(false);
    } else {
      const data = params.row;
      del(`/api/users/${params.id}`, { data }).then((res) => {
        if (res.status === 200) {
          setRows(rows.filter((row) => row.id !== params.id));
        }
      });
    }
  }

  // Handling delete confirmation box
  function handleDeleteConfirmation(params) {
    setDeletionPopupOpen(true);
    setDeleteParams(params);
  }

  // Trigger delete operation after getting confirmation
  function deleteUserConfirmed() {
    handleDeleteClick(deleteParams);
    handleDeleteClose();
  }

  // Close modal
  function handleClose() {
    setauthorizedPopupOpen(false);
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
          <Typography variant="h4" id="manage-users-title-h4">
            Users
          </Typography>
          <div style={{ display: 'flex', height: '100%', marginTop: 15 }}>
            <div style={{ flexGrow: 1 }}>
              <TenantDataGrid
                title={'users'}
                autoHeight
                initialState={{
                  columns: {
                    columnVisibilityModel: {
                      id: false
                    }
                  }
                }}
                tools={[
                  <Link
                    key="goto-create-new-user-link-1"
                    href="/users/create"
                    passHref
                    id="goto-create-new-user-link"
                  >
                    <Button
                      size="small"
                      variant="outlined"
                      id="create-new-user-btn"
                    >
                      Create New User
                    </Button>
                  </Link>
                ]}
                rows={rows}
                columns={columns}
                pageSize={50}
                loading={loading}
                rowsPerPageOptions={[50]}
                NoRowsOverlay
                id="usersGrid"
                disableSelectionOnClick
              />
            </div>
          </div>
          <div>
            <TenantModal
              open={authorizedPopupOpen}
              close={handleClose}
              fullWidth
              maxWidth="md"
              id="access-denied-modal"
              confirm={handleClose}
              title={'Delete User'}
            >
              <Typography id="delete-user-confirmation-text">
                You can not delete yourself while you are logged in.
              </Typography>
            </TenantModal>
          </div>
          <div>
            <TenantModal
              open={deletionPopupOpen}
              close={handleDeleteClose}
              fullWidth
              maxWidth="md"
              id={'delete-user-modal'}
              confirm={deleteUserConfirmed}
              title={'Delete User'}
            >
              <Typography id="delete-user-confirmation-text">
                Are you sure you want to delete user{' '}
                <Typography sx={{ fontWeight: 'bold', display: 'inline' }}>
                  {deleteParams?.row?.name}
                </Typography>
                ? This action may take several seconds and cannot be undone.
              </Typography>
            </TenantModal>
          </div>
        </Container>
      ) : (
        ''
      )}
    </>
  );
};

export default connect((state) => state)(UsersIndex);
