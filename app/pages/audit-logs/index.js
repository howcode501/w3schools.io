// Section Import
//React Imports
import React, { useEffect } from 'react';

//Material UI Imports
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';

//Material UI DataGrid
import { TenantDataGrid } from '../../components/atoms';

//Application Imports
import { useApi } from '../../hooks';

//External Module Imports
import { connect, useDispatch } from 'react-redux';
import { API_ROOT } from '../../helpers/config';
import TokenService from '../../services/token';

//Section Main Function
const AuditLog = () => {
  const userRole = TokenService.getUserData();
  //Section Define Vars
  //Using the Router so that we can push them to a new URL
  //Rows Data is temporarily stored in a State Object
  const [rows, setRows] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [show, setShow] = React.useState(false);

  //Define the data that will be loaded client side
  const { get } = useApi();
  const dispatch = useDispatch();

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
      headerName: 'Time',
      editable: false,
      flex: 3
      // valueGetter: (params) =>
      //   `${new Date(params.getValue(params.id, 'timestamp'))}`,
      // sortComparator: (v1, v2, param1, param2) => {
      //   return (
      //     param1.api.getCellValue(param1.id, 'timestamp') -
      //     param2.api.getCellValue(param2.id, 'timestamp')
      //   );
      // },
      // valueFormatter: (params) => {
      //   return formatDate(params.value);
      // }
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

  useEffect(() => {
    async function fetchData() {
      if (typeof window !== 'undefined') {
        //If the page is loaded and the token is available, let's call the users
        await get(`${API_ROOT}/api/auditlogs`)
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

  //Used to get the WHO data
  const getWHO = (params) => {
    return params.row.user?.profile?.email != null
      ? params.row.user.profile.email
      : params.row.user.name;
  };

  // Used to format date

  // const formatDate = (date) => {
  //   const mon = [
  //     'Jan',
  //     'Feb',
  //     'Mar',
  //     'April',
  //     'May',
  //     'Jun',
  //     'Jul',
  //     'Aug',
  //     'Sep',
  //     'Oct',
  //     'Nov',
  //     'Dec'
  //   ];
  //   let d = new Date(date),
  //     month = mon[d.getUTCMonth()],
  //     day = d.getUTCDate(),
  //     year = d.getUTCFullYear(),
  //     hours = d.getUTCHours(),
  //     min = d.getUTCMinutes(),
  //     sec = d.getUTCSeconds();
  //   hours < 10 ? (hours = '0' + hours) : hours;
  //   let finalDate = [day, month, year].join('-'),
  //     finalTime = [hours, min, sec].join(':');
  //   return finalDate + '  ' + finalTime + ' UTC';
  // };

  // Used to show other data
  const getOtherData = (params) => {
    return JSON.stringify(params.row.data);
  };

  //Section Return
  //Return Our Page
  return (
    //The Main Container
    <>
      {show === true ? (
        <Container maxWidth="xl">
          {/* Page Title */}
          <Typography variant="h4" id="audit-log-title">
            Audit Log
          </Typography>
          {/* The Data Grid Displayed on the Page */}
          <div style={{ display: 'flex', height: '100%', marginTop: 15 }}>
            <div style={{ flexGrow: 1 }}>
              <TenantDataGrid
                autoHeight
                initialState={{
                  columns: {
                    columnVisibilityModel: {
                      id: false,
                      timestamp: false
                    }
                  }
                }}
                title={'audit'}
                rows={rows}
                columns={columns}
                pageSize={50}
                loading={loading}
                rowsPerPageOptions={[50]}
                id="auditLogGrid"
                disableSelectionOnClick
              />
            </div>
          </div>
        </Container>
      ) : (
        ''
      )}
    </>
  );
};

export default connect((state) => state)(AuditLog);
