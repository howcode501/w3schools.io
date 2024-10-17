/*
 * File Created for APP Inc
 * Project: nextjs-spike
 * User: ***
 * Date: 02/21/2022
 */

// Section Import
//React Imports
import React, { useState } from 'react';
import moment from 'moment';

//Material UI Imports
import Stack from '@mui/material/Stack';

//Material UI DataGrid
import {
  DataGrid,
  GridToolbarColumnsButton,
  GridToolbarContainer,
  GridToolbarFilterButton
} from '@mui/x-data-grid';

import TokenService from '../../services/token';
import PositionedSnackbar from '../snackbar';

//Section Main Function
const AuditLogsGrid = ({ auditLogs, loading }) => {
  const userRole = TokenService.getUserData();

  const [openSnackbar, setOpenSnackbar] = useState(false);

  const handleRowClickDataGrid = (params) => {
    window.navigator.clipboard.writeText(JSON.stringify(params.row.data));
    setOpenSnackbar(true);
    // Close notification auto-trigger
    setTimeout(function () {
      setOpenSnackbar(false);
    }, 3000);
  };

  //Section Column Definitions
  //DataGrid Columns Definition
  const columns = [
    { field: 'id', headerName: 'ID', width: 50, hide: true },
    {
      field: 'timestamp',
      headerName: 'Timestamp',
      hide: true,
      flex: 2,
      valueGetter: function (params) {
        const event = new Date(params.row.created);
        return event.getTime();
      }
    },
    {
      field: 'created',
      headerName: 'Time (UTC)',
      editable: false,
      flex: 3,
      type: 'dateTime',
      valueGetter: (params) =>
        `${new Date(params.getValue(params.id, 'timestamp'))}`,
      sortComparator: (v1, v2, param1, param2) => {
        return (
          param1.api.getCellValue(param1.id, 'timestamp') -
          param2.api.getCellValue(param2.id, 'timestamp')
        );
      },
      valueFormatter: (params) => {
        return moment.utc(params.value).format('DD-MM-YYYY HH:mm:ss');
      }
    },
    {
      field: 'who',
      headerName: 'User',
      editable: false,
      flex: 2,
      valueGetter: function (params) {
        return getWHO(params);
      }
    },
    {
      field: 'event',
      headerName: 'Event',
      editable: false,
      flex: 3
    },
    {
      field: 'data',
      headerName: 'Details',
      sortable: true,
      editable: false,
      flex: 2,
      valueGetter: function (params) {
        return getOtherData(params);
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

  //Define the Custom Toolbar we want in order to move the create user button into the bar.
  function CustomToolbar() {
    return (
      <GridToolbarContainer>
        <GridToolbarColumnsButton id={'auditLogs-columns-btn'} />
        <GridToolbarFilterButton className={'filter-auditLogs-index'} />
      </GridToolbarContainer>
    );
  }

  //Used to get the WHO data
  const getWHO = (params) => {
    return params.row.user.profile.email != null
      ? params.row.user.profile.email
      : params.row.user.name;
  };

  // Used to show other data
  const getOtherData = (params) => {
    return JSON.stringify(params.row.data);
  };

  //Section Return
  return (
    <div>
      <DataGrid
        onRowClick={handleRowClickDataGrid}
        autoHeight
        components={{
          Toolbar: CustomToolbar,
          NoRowsOverlay: () => (
            <Stack
              height="auto"
              paddingTop="40px"
              alignItems="center"
              justifyContent="center"
            >
              No audit logs
            </Stack>
          ),
          NoResultsOverlay: () => (
            <Stack
              height="auto"
              paddingTop="40px"
              alignItems="center"
              justifyContent="center"
            >
              No audit logs found
            </Stack>
          )
        }}
        rows={auditLogs}
        columns={columns}
        pageSize={50}
        loading={loading}
        rowsPerPageOptions={[50]}
        id="auditLogGrid"
        disableSelectionOnClick
      />
      <PositionedSnackbar
        open={openSnackbar}
        severity={'success'}
        message={'Details copied to clipboard. Paste details to json viewer'}
      ></PositionedSnackbar>
    </div>
  );
};

export default AuditLogsGrid;
