//React Imports
import React, { useState } from 'react';

//Material UI Imports
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import FormControl from '@mui/material/FormControl';
import Autocomplete from '@mui/material/Autocomplete';
import { FormHelperText } from '@mui/material';
import dayjs from 'dayjs';

//Material UI Icons
import HighlightOffIcon from '@mui/icons-material/HighlightOff';

import { TenantDataGrid, TenantModal } from '../../components';

//External Imports
import * as yup from 'yup';
import { Controller, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { calculateSubscriptionExpiraryDate } from '../../helpers/functions';

const ADD_SUBSCRIPTION_MODAL = 'ADD';
const DELETE_SUBSCRIPTION_MODAL = 'DELETE';

//Section Add Subscription Modal
const AddSubscriptionModal = ({
  open,
  onClose,
  onSubmit,
  validator,
  subscriptions
}) => {
  const [subscriptionPricingPlanOptions, setSubscriptionPricingPlanOptions] =
    useState([]);

  //Closes the New Subscription Modal
  const handleNewClose = () => {
    setValue('subscriptions', '', true);
    setValue('subscription_pricing_plan', '', true);
    onClose();
  };

  const sendSubscriptionToParent = async (data) => {
    onSubmit(data);
    handleNewClose();
  };

  // handle change subscription
  const handleChangeSubscriptions = (newValue) => {
    setSubscriptionPricingPlanOptions(newValue?.subscription_pricing_plan);
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
      subscriptions: '',
      subscription_pricing_plan: ''
    }
  });

  //Return Add Subscription Modal
  return (
    <div>
      <TenantModal
        id="add-subscription-modal"
        open={open}
        fullWidth
        close={handleNewClose}
        confirm={handleSubmit((data) => sendSubscriptionToParent(data))}
        title={'Add subscription'}
        maxWidth={'md'}
        submitTitle={'Link subscription'}
        variant={'form_submit'}
      >
        <FormControl
          fullWidth
          style={{ marginTop: 14 }}
          error={!!errors.subscriptions}
        >
          <Controller
            control={control}
            name={'subscriptions'}
            render={({ field: { onChange } }) => (
              <Autocomplete
                onChange={(event, subscriptions) => {
                  onChange(subscriptions);
                  handleChangeSubscriptions(subscriptions);
                }}
                options={subscriptions}
                getOptionLabel={(option) => option.subscription_name}
                filterSelectedOptions
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Subscriptions"
                    margin="normal"
                    variant="outlined"
                  />
                )}
              />
            )}
          />
          <FormHelperText>
            {errors.subscriptions ? errors.subscriptions?.message : null}
          </FormHelperText>
        </FormControl>
        <FormControl
          fullWidth
          style={{ marginTop: 14 }}
          error={!!errors.subscription_pricing_plan}
        >
          <Controller
            control={control}
            name={'subscription_pricing_plan'}
            render={({ field: { onChange } }) => (
              <Autocomplete
                onChange={(event, subscription_pricing_plan) => {
                  onChange(subscription_pricing_plan);
                }}
                options={subscriptionPricingPlanOptions}
                getOptionLabel={(option) =>
                  `${option.time_option_date} ${option.time_option_frequency}`
                }
                filterSelectedOptions
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Pricing Plan"
                    margin="normal"
                    variant="outlined"
                  />
                )}
              />
            )}
          />
          <FormHelperText>
            {errors.subscription_pricing_plan
              ? errors.subscription_pricing_plan?.message
              : null}
          </FormHelperText>
        </FormControl>
      </TenantModal>
    </div>
  );
};

const DeleteSubscriptionModal = ({ data, open, onConfirm, onClose }) => {
  const handleDeleteSubscription = () => {
    onConfirm(data);
    onClose();
  };

  return (
    <TenantModal
      id="delete-subscription-modal"
      open={open}
      fullWidth
      close={onClose}
      confirm={handleDeleteSubscription}
      title={'Unlinked Subscription'}
      maxWidth={'md'}
      submitTitle={'Link subscription'}
    >
      <Typography id="delete-subscription-confirmation-text">
        Are you sure you want to delete this Subscription&nbsp;
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

//Generates the "Linked UserSubscription" grid for settings tabs
const UserSubscriptions = (params) => {
  //Used to maintain state of the New Subscription Modal
  const [modal, setModal] = React.useState('');
  const [focusedData, setFocusedData] = React.useState({});

  const handleCloseModal = () => {
    setModal('');
  };

  //Opens the New Subscription Modal
  const handleAddClickOpen = () => {
    setModal(ADD_SUBSCRIPTION_MODAL);
  };

  // Handling delete confirmation box
  function handleDeleteClickOpen(row) {
    setFocusedData(row);
    setModal(DELETE_SUBSCRIPTION_MODAL);
  }

  const validator = yup.object().shape({
    subscriptions: yup
      .object()
      .nullable()
      .required('Subscription is required')
      .test('fileSize', 'Subscription already exists', (value) => {
        let data = params.userSubscriptions.find(
          (eachRule) => eachRule.subscription_id == value?.id
        );
        if (data) return false;
        return true;
      }),
    subscription_pricing_plan: yup
      .object()
      .nullable()
      .required('Subscription Pricing Plan is required')
      .test('fileSize', 'Subscription Pricing Plan already exists', (value) => {
        let data = params.userSubscriptions.find(
          (eachRule) => eachRule.subscription_pricing_plan_id == value?.id
        );
        if (data) return false;
        return true;
      })
  });

  //Define the Columns that we want to draw out
  const subscriptionColumns = [
    { field: 'id', headerName: 'ID', width: 100, hide: true },
    {
      field: 'subscription_name',
      headerName: 'Subscription Name',
      editable: false,
      flex: 3
    },
    {
      field: 'subscription_pricing_plan_time_option',
      headerName: 'Time option (Date / frequency)',
      editable: false,
      flex: 4,
      valueGetter: (params) => {
        if (params.value == undefined) {
          return (
            params.row.time_option_date + `/` + params.row.time_option_frequency
          );
        } else {
          return params.value;
        }
      }
    },
    {
      field: 'subscription_pricing_plan_price',
      headerName: 'Price',
      editable: false,
      flex: 3,
      valueGetter: (params) => {
        if (params.value == undefined) {
          return params.row.stripe_plan_amount;
        } else {
          return params.value;
        }
      }
    },
    {
      field: 'stripe_current_period_end',
      headerName: 'Expiration Date',
      editable: false,
      flex: 3,
      valueGetter: (params) => {
        return dayjs(params.value).format('MMMM DD, YYYY');
      }
    },
    {
      field: 'auto_subscription',
      headerName: 'Rebill on',
      editable: false,
      flex: 3
    },
    {
      field: 'activated_by',
      headerName: 'Activated By',
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
            {params.row.activated_by === 'Admin' ? (
              <Button
                variant="contained"
                color="error"
                startIcon={<HighlightOffIcon />}
                size="small"
                onClick={() => handleDeleteClickOpen(params.row)}
                id={'remove-subscription-btn' + params.row.id}
              >
                Remove
              </Button>
            ) : (
              ''
            )}
          </>
        );
      }
    }
  ];

  const handleAddSubscription = async (data) => {
    const newData = {
      id: 'a' + Date.now(),
      subscription_id: data?.subscriptions?.id,
      subscription_name: data?.subscriptions?.subscription_name,
      subscription_pricing_plan_id: data?.subscription_pricing_plan?.id,
      subscription_pricing_plan_price: data?.subscription_pricing_plan?.price,
      subscription_pricing_plan_time_option:
        data?.subscription_pricing_plan?.time_option_date +
        '/' +
        data?.subscription_pricing_plan?.time_option_frequency,
      activated_by: 'Admin',
      auto_subscription: false,
      stripe_current_period_end: calculateSubscriptionExpiraryDate(
        data?.subscription_pricing_plan?.time_option_date,
        data?.subscription_pricing_plan?.time_option_frequency
      )
    };

    params.addFunc([newData]);
  };

  const handleDeleteSubscription = (row) => {
    const result = params.userSubscriptions.map((filterRow) => {
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

  //Section Existing Subscriptions
  //Return Selected DataGrid
  return (
    <React.Fragment>
      <TenantDataGrid
        title={'linked subscriptions'}
        initialState={{
          columns: {
            columnVisibilityModel: {
              id: false
            }
          }
        }}
        tools={[
          <Button
            key={'add-subscription-btn-key'}
            size="small"
            variant="outlined"
            onClick={handleAddClickOpen}
            id="add-subscription-btn"
          >
            Add Subscription
          </Button>
        ]}
        rows={params.userSubscriptions.filter(
          (filterRow) =>
            filterRow?.deleted == null || filterRow?.deleted == undefined
        )}
        columns={subscriptionColumns}
        pageSize={50}
        rowsPerPageOptions={[50]}
        loading={params.show}
        checkboxSelection={false}
      />
      {params.addModal ? (
        <AddSubscriptionModal
          subscriptions={params?.subscriptions ? params?.subscriptions : []}
          validator={validator}
          onSubmit={handleAddSubscription}
          onClose={handleCloseModal}
          open={modal === ADD_SUBSCRIPTION_MODAL}
        />
      ) : null}
      <DeleteSubscriptionModal
        data={focusedData}
        onConfirm={handleDeleteSubscription}
        onClose={handleCloseModal}
        open={modal === DELETE_SUBSCRIPTION_MODAL}
      />
    </React.Fragment>
  );
};

export default UserSubscriptions;
