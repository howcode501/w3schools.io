// Section Import
//React Imports
import React, { useEffect } from 'react';
import moment from 'moment';

//Material UI Imports
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';

//Material UI Icons
import EditIcon from '@mui/icons-material/Edit';
import ClearIcon from '@mui/icons-material/Clear';

import { useForm } from 'react-hook-form';

import { readCsv } from '../../helpers/functions';

import {
  TenantFileField,
  TenantDataGrid,
  MODAL_VARIANT_FORM_SUBMIT,
  TenantModal
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
const PromoCodesIndex = () => {
  let userRole = [];
  userRole = TokenService.getUserData();

  //Section Column Definitions
  //DataGrid Columns Definition
  let columns = [
    { field: 'id', headerName: 'ID', width: 200, hide: true },
    {
      field: 'code',
      headerName: 'Code',
      editable: false,
      flex: 2
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
      field: 'subscriptions',
      headerName: 'Subscriptions',
      editable: false,
      flex: 2,
      valueGetter: function (params) {
        let str = '';
        params.row.subscriptions?.map((eachVal) => {
          if (eachVal.subscription_name) {
            str = str + `${eachVal.subscription_name},`;
          }
        });
        params.row.subscription_pricing_plan?.map((eachVal) => {
          if (eachVal.time_option_date) {
            str =
              str +
              ` ( ${eachVal?.time_option_date} ${eachVal?.time_option_frequency} )`;
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
      field: 'user_email',
      headerName: 'Activated By',
      editable: false,
      flex: 3
    },
    {
      field: 'expire_date_time',
      headerName: 'Expire Date',
      editable: false,
      flex: 2,
      valueGetter: function ({ row }) {
        return row.expire_date_time
          ? moment
              .utc(row.expire_date_time)
              .local()
              .format('ddd, MM/DD/YYYY - hh:mm A')
          : '';
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
              id={'btn-edit-product-' + params.row.id}
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
              id={'btn-delete-product-' + params.row.id}
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
  const [showImportModal, setShowImportModal] = React.useState(false);
  const [importErrorRows, setImportErrorRows] = React.useState([]);
  const [importError, setImportError] = React.useState('');
  //Define the data that will be loaded client side
  const { get, del, put } = useApi();
  const dispatch = useDispatch();

  useEffect(() => {
    async function fetchData() {
      if (typeof window !== 'undefined') {
        //If the page is loaded and the token is available, let's call the products
        await get(`${API_ROOT}/api/promo-codes`)
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
    Router.push('/promo-codes/update/' + params.id);
  }

  function handleDeleteClick(params) {
    if (
      userRole.id == params.id &&
      (userRole.roles[0] === 'msp' || userRole.roles[0] === 'administrator')
    ) {
      setDeletionPopupOpen(false);
    } else {
      const data = params.row;
      del(`/api/promo-codes/${params.id}`, { data }).then((res) => {
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

  // Close Delete modal
  function handleDeleteClose() {
    setDeletionPopupOpen(false);
  }

  // Form import functions
  const { handleSubmit, control } = useForm({
    mode: 'onChange',
    reValidateMode: 'onChange',
    //resolver: yupResolver(validator),
    defaultValues: {}
  });

  const handleImportModal = () => {
    setShowImportModal(true);
    setImportError('');
    setImportErrorRows([]);
  };

  const handleImportModalClose = () => {
    setShowImportModal(false);
  };

  const handleImportSubmit = async (data) => {
    if (data?.promoCodeFileUpload !== undefined) {
      try {
        const csvData = await readCsv(data?.promoCodeFileUpload[0]);
        await put(`/api/promo-codes/import`, { data: csvData }).then((res) => {
          if (res.status === 200) {
            setImportError('');
            setImportErrorRows(res?.data?.data);
          }
        });
        // do something with the data...
      } catch (err) {
        setImportError(err.message);
      }
    } else {
      setImportError('Please upload csv file');
    }
  };

  //Define the Columns that we want to draw out
  const importColumns = [
    {
      field: 'id',
      headerName: 'id',
      width: 100,
      hide: true
    },
    {
      field: 'csvRow',
      headerName: 'Code',
      width: 100,
      flex: 1,
      valueGetter: function (row) {
        return row?.row?.csvRow[0];
      }
    },
    {
      field: 'message',
      headerName: 'Error Message',
      editable: false,
      filterable: true,
      sortable: true,
      disableClickEventBubbling: true,
      flex: 2
    }
  ];

  //Section Return
  //Return Our Page
  return (
    <>
      {show === true ? (
        <Container maxWidth="xl">
          <Typography variant="h4" id="manage-promo-codes-title-h4">
            Promo Codes
          </Typography>
          <div style={{ display: 'flex', height: '100%', marginTop: 15 }}>
            <div style={{ flexGrow: 1 }}>
              <TenantDataGrid
                autoHeight
                initialState={{
                  columns: {
                    columnVisibilityModel: {
                      id: false
                    }
                  }
                }}
                rows={rows}
                tools={[
                  <Link
                    key="goto-create-new-user-link-1"
                    href="/promo-codes/create"
                    passHref
                    id="goto-create-new-user-link"
                  >
                    <Button
                      size="small"
                      variant="outlined"
                      id="create-new-user-btn"
                    >
                      Create New Promo Code
                    </Button>
                  </Link>,
                  <Button
                    key={'import-promo-code-1'}
                    size="small"
                    variant="outlined"
                    id="import-promo-code"
                    sx={{ marginLeft: '10px' }}
                    onClick={handleImportModal}
                  >
                    Import Promo Code
                  </Button>
                ]}
                columns={columns}
                pageSize={50}
                loading={loading}
                rowsPerPageOptions={[50]}
                NoRowsOverlay
                id="promocodesGrid"
                disableSelectionOnClick
                title={'Promo Code'}
              />
            </div>
          </div>
          <div>
            <TenantModal
              id="delete-product-modal"
              open={deletionPopupOpen}
              onClose={handleDeleteClose}
              confirm={deleteUserConfirmed}
              title="Delete Promo Code"
            >
              <Typography id="delete-promo-codes-confirmation-text">
                Are you sure you want to delete promo code{' '}
                <Typography sx={{ fontWeight: 'bold', display: 'inline' }}>
                  {deleteParams?.row?.name}
                </Typography>
                ? This action may take several seconds and cannot be undone.
              </Typography>
            </TenantModal>
            <TenantModal
              open={showImportModal}
              close={handleImportModalClose}
              fullWidth
              maxWidth="md"
              id="import-promo-code-modal"
              confirm={handleSubmit((data) => handleImportSubmit(data))}
              title="Import Promo Code"
              submitTitle="Import Promo Code"
              variant={MODAL_VARIANT_FORM_SUBMIT}
            >
              <TenantFileField
                name={'promoCodeFileUpload'}
                control={control}
                label={'File Upload'}
                accept={'text/csv'}
                variant={'contained'}
              ></TenantFileField>
              <Typography variant="subtitle2" id="sample-csv-download">
                <br></br>
                <Link href="/assets/PromoCode.csv" download>
                  Download sample csv
                </Link>
              </Typography>
              {importError !== '' ? (
                <Typography
                  variant="subtitle2"
                  id="csv-error"
                  sx={{ color: 'red' }}
                >
                  {importError}
                </Typography>
              ) : (
                ''
              )}
              {importErrorRows?.errorRows ? (
                <>
                  <Typography variant="subtitle2" id="csv-msg">
                    Total Rows : {importErrorRows?.totalRows}
                    <br></br>
                    Total Inserted : {importErrorRows?.totalInserted}
                  </Typography>
                  <TenantDataGrid
                    autoHeight
                    rows={
                      importErrorRows?.errorRows
                        ? importErrorRows?.errorRows
                        : []
                    }
                    columns={importColumns}
                    pageSize={50}
                    rowsPerPageOptions={[50]}
                    NoRowsOverlay
                    title={'CSV Errors'}
                  />
                </>
              ) : (
                ''
              )}
            </TenantModal>
          </div>
        </Container>
      ) : (
        ''
      )}
    </>
  );
};

export default connect((state) => state)(PromoCodesIndex);
