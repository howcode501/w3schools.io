/*
 * File Created for APP Inc
 * Project: app
 * User: ***
 * Date: 11/1/2021
 */

//React Imports
import React, { useEffect, useCallback } from 'react';

//Material UI Imports
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Avatar from '@mui/material/Avatar';
import Stack from '@mui/material/Stack';
import Box from '@mui/material/Box';
import { darken, lighten } from '@mui/material/styles';

//Material UI Icons
//Material UI Styles
//Material UI DataGrid
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import LinkOffIcon from '@mui/icons-material/LinkOff';

// Material UI DataGrid
import {
  DataGrid,
  GridToolbarColumnsButton,
  GridToolbarContainer,
  GridToolbarFilterButton
} from '@mui/x-data-grid';

//Application Imports
import { useApi } from '../../hooks';

//NextJS Imports
import Link from 'next/link';

//External Module Imports

//Generates the "Linked Users" grid for settings tabs
const UsersGrid = (params) => {
  //Used to maintain state of the New Users Modal
  const [open, setOpen] = React.useState(false);
  const [hidden, setHidden] = React.useState(false);

  useEffect(() => {
    if (params.groupName == 'All Users') {
      setHidden(true);
    }
  }, [params]);

  //Used to get the User's Name based on type
  const getName = (params, type = '') => {
    if (type === 'first') {
      return params.row.profile.first_name;
    } else if (type === 'last') {
      return params.row.profile.last_name;
    } else {
      return params.row.profile.first_name + ' ' + params.row.profile.last_name;
    }
  };

  //Opens the New Users Modal
  const handleClickOpen = () => {
    setOpen(true);
  };

  //Initialize the API
  const { post } = useApi();

  // custom overlay for no results and no rows
  const noRowsCustomOverlay = () => {
    return (
      <Stack
        height="auto"
        paddingTop="40px"
        alignItems="center"
        justifyContent="center"
      >
        No users
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
        No users found
      </Stack>
    );
  };

  //Section Add Users
  //New User Modal, Allows Multiple Selection
  const NewUserSearchModal = () => {
    //Used to maintain the state of field elements
    const [data, setData] = React.useState({ search_string: '' });

    //Used to hold the values of new users returned from the database
    const [userSearch, setUserSearch] = React.useState([]);

    //Selected Rows
    const [selectedUsers, setSelectedUsers] = React.useState([]);

    //Closes the New Users Modal
    const handleClose = () => {
      setOpen(false);
      setData({ search_string: '' });
      setUserSearch([]);
    };

    //The columns for the New Users Modal
    const newUserColumns = [
      {
        field: 'id',
        headerName: 'ID',
        width: 100,
        hide: true
      },
      {
        field: 'avatar',
        headerName: 'Avatar',
        editable: false,
        filterable: false,
        sortable: false,
        disableClickEventBubbling: true,
        disableColumnMenu: true,
        flex: 1,
        renderCell: (params) => {
          if (params.row.profile.id < 7) {
            return (
              <Avatar
                src={`/images/avatars/${params.row.profile.id}.png`}
              ></Avatar>
            );
          } else {
            return (
              <Avatar>
                {params.row.profile.first_name.charAt(0) +
                  params.row.profile.last_name.charAt(0)}
              </Avatar>
            );
          }
        }
      },
      {
        field: 'name',
        headerName: 'Username',
        editable: false,
        flex: 2
      },
      {
        field: 'first_name',
        headerName: 'First Name',
        editable: false,
        flex: 4,
        renderCell: (params) => {
          return getName(params, 'first');
        }
      },
      {
        field: 'last_name',
        headerName: 'Last Name',
        editable: false,
        flex: 4,
        renderCell: (params) => {
          return getName(params, 'last');
        }
      }
      /*{
        field: 'role',
        headerName: 'Role',
        editable: false,
        flex: 2,
        renderCell: (params) => {
          return renderRoleChips(params);
        },
      },*/
    ];

    //Handles Field value changes
    const handleChange = (e) => {
      setData({ search_string: e.target.value });
    };

    //Post data to the API to search users
    const searchDatabase = useCallback(
      (event) => {
        //Prevent the form from Submitting
        event ? event.preventDefault() : '';

        //Send Query
        post(`/api/users/search`, { data }).then((response) => {
          const users = response.data.data;
          // Only show those users that are not present in 'Linked User' list
          let filteredUsers = users.filter((value) => {
            return !params.userData.find((res) => {
              return res.id === value.id;
            });
          });
          setUserSearch(filteredUsers);
        });
      },
      [data]
    );

    const sendUsersToParent = () => {
      handleAddUsers(selectedUsers);
      handleClose();
    };

    useEffect(() => {
      open ? searchDatabase() : '';
    }, [searchDatabase]);

    //Return Search Modal
    return (
      <div>
        <Dialog
          open={open}
          onClose={handleClose}
          fullWidth
          maxWidth="lg"
          id="user-search-modal"
        >
          <DialogTitle>Search For Users</DialogTitle>
          <DialogContent>
            <form onSubmit={searchDatabase}>
              <TextField
                autoFocus
                margin="dense"
                id="search_string"
                label="Search String"
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
                      id="search-user-btn"
                    >
                      Search
                    </Button>
                  )
                }}
              />
            </form>
            <DataGrid
              autoHeight
              rows={userSearch}
              columns={newUserColumns}
              pageSize={50}
              rowsPerPageOptions={[50]}
              loading={params.loading}
              checkboxSelection={true}
              components={{
                NoRowsOverlay: noRowsCustomOverlay,
                NoResultsOverlay: noResultsCustomOverlay
              }}
              onSelectionModelChange={(ids) => {
                //First we clean out the old list
                setSelectedUsers({});

                let newData = [];

                //Assign the selected ones to a set
                const selectedIDs = new Set(ids);

                //Roll through and assign the selected ones to the new list
                userSearch.filter((row) => {
                  if (selectedIDs.has(row.id)) {
                    newData = [...newData, row];
                  }
                });

                //Now update the state
                setSelectedUsers(newData);
              }}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose}>Cancel</Button>
            <Button id={'update-user-list'} onClick={sendUsersToParent}>
              Add Users
            </Button>
          </DialogActions>
        </Dialog>
      </div>
    );
  };

  //Define the Custom Toolbar we want in order to move the create user button into the bar.
  const UsersCustomToolbar = () => {
    return (
      <GridToolbarContainer>
        <GridToolbarColumnsButton />
        <GridToolbarFilterButton />
        {params.groupName !== 'All Users' && (
          <Button
            variant="outlined"
            size="small"
            onClick={handleClickOpen}
            id="add-user-btn"
          >
            Add User
          </Button>
        )}
      </GridToolbarContainer>
    );
  };

  //Remove the group from the list and then send it back to the caller
  const removeUser = (row) => {
    const result = params.userData.filter(
      (filterRow) => filterRow.id !== row.id
    );

    params.deleteFunc(result);
  };

  // For highlighting users Inactive

  const getColor = (color, mode) =>
    mode === 'dark' ? darken(color, 0.6) : lighten(color, 0.6);

  //Define the Columns that we want to draw out
  const userColumns = [
    {
      field: 'id',
      headerName: 'ID',
      width: 100,
      hide: true
    },
    {
      field: 'link',
      headerName: 'GoTo',
      sortable: false,
      filterable: false,
      disableClickEventBubbling: true,
      disableColumnMenu: true,
      flex: 1,
      renderCell: (params) => {
        return (
          <Link
            passHref
            href={`/users/update/${params.row.id}`}
            id={'goto-update-user-link-' + params.row.id}
          >
            <OpenInNewIcon />
          </Link>
        );
      }
    },
    {
      field: 'avatar',
      headerName: 'Avatar',
      editable: false,
      filterable: false,
      sortable: false,
      disableClickEventBubbling: true,
      disableColumnMenu: true,
      flex: 1,
      renderCell: (params) => {
        if (params.row.profile.id < 7) {
          return (
            <Avatar
              src={`/images/avatars/${params.row.profile.id}.png`}
            ></Avatar>
          );
        } else {
          return (
            <Avatar>
              {params.row.profile.first_name.charAt(0) +
                params.row.profile.last_name.charAt(0)}
            </Avatar>
          );
        }
      }
    },
    {
      field: 'name',
      headerName: 'Username',
      editable: false,
      flex: 2
    },
    {
      field: 'first_name',
      headerName: 'First Name',
      editable: false,
      flex: 4,
      valueGetter: function (params) {
        return getName(params, 'first');
      }
    },
    {
      field: 'last_name',
      headerName: 'Last Name',
      editable: false,
      flex: 4,
      valueGetter: function (params) {
        return getName(params, 'last');
      }
    },
    /*    {
          field: 'role',
          headerName: 'Role',
          editable: false,
          flex: 2,
          renderCell: (params) => {
            return renderRoleChips(params);
          },
        },*/
    {
      field: 'userAction',
      headerName: 'Actions',
      editable: false,
      filterable: false,
      disableClickEventBubbling: true,
      disableColumnMenu: true,
      sortable: false,
      hide: hidden,
      flex: 2,
      renderCell: (param) => {
        return params.mode === 'edit' &&
          params.groupName === 'All Users' ? null : (
          <Button
            variant="contained"
            color="error"
            fullWidth
            startIcon={<LinkOffIcon />}
            size="small"
            onClick={() => removeUser(param.row)}
            id={'remove-user-btn-' + param.row.id}
          >
            Remove
          </Button>
        );
      }
    }
  ];

  //TODO Pass the users back to the caller
  const handleAddUsers = (selectedUsers) => {
    //Update our Users List
    params.updateFunc(selectedUsers);
  };

  //Section Existing Users
  //Return Selected DataGrid
  return (
    <React.Fragment>
      <Box
        sx={{
          '& .user--inactive': {
            color: (theme) =>
              getColor(theme.palette.grey[500], theme.palette.mode)
          }
        }}
      >
        <DataGrid
          autoHeight
          components={{
            Toolbar: UsersCustomToolbar,
            NoRowsOverlay: noRowsCustomOverlay,
            NoResultsOverlay: noResultsCustomOverlay
          }}
          rows={params.userData}
          columns={userColumns}
          pageSize={50}
          rowsPerPageOptions={[50]}
          loading={params.loading}
          checkboxSelection={false}
          disableMultipleSelection={true}
          getRowClassName={(params) =>
            !params.row.auth.enabled ? 'user--inactive' : ''
          }
        />
      </Box>
      <NewUserSearchModal onAddUsers={handleAddUsers} />
    </React.Fragment>
  );
};

export default UsersGrid;
