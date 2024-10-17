//React Imports
import React, { useEffect, useState } from 'react';

//Material UI Imports
import Button from '@mui/material/Button';

import Typography from '@mui/material/Typography';
import FormControl from '@mui/material/FormControl';
import MenuItem from '@mui/material/MenuItem';
import { FormHelperText } from '@mui/material';
//Material UI Icons
import HighlightOffIcon from '@mui/icons-material/HighlightOff';
import EditIcon from '@mui/icons-material/Edit';
//Material UI Styles
//Material UI DataGrid
import {
  GridToolbarColumnsButton,
  GridToolbarContainer,
  GridToolbarFilterButton
} from '@mui/x-data-grid';

import {
  TenantDataGrid,
  TenantModal,
  TenantSelect,
  TenantTextField
} from '../../components';

//External Imports
import * as yup from 'yup';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';

const ADD_PRICINGPLAN_MODAL = 'ADD';
const DELETE_PRICINGPLAN_MODAL = 'DELETE';
const EDIT_PRICINGPLAN_MODAL = 'EDIT';
const ASSOCIATE_PRICINGPLAN_MODAL = 'ASSOCIATE';

//Section Add PricingPlan Modal
const AddPricingPlanModal = ({ open, onClose, onSubmit, validator }) => {
  //Closes the New PricingPlan Modal
  const handleNewClose = () => {
    setValue('time_option_date', '', true);
    setValue('time_option_frequency', '', true);
    setValue('free_with_new_account', false, true);
    setValue('status', true, true);
    onClose();
  };

  const sendPricingPlanToParent = async (data) => {
    onSubmit(data);
    handleNewClose();
  };

  const {
    handleSubmit,
    control,
    setValue,
    watch,
    getValues,
    formState: { errors }
  } = useForm({
    mode: 'onChange',
    reValidateMode: 'onChange',
    resolver: yupResolver(validator),
    defaultValues: {
      time_option_date: '',
      time_option_frequency: '',
      price: 0,
      free_with_new_account: false,
      description: '',
      shopify_fulfill: '',
      shopify_unfulfill: '',
      status: true
    }
  });

  const [timeDateOption, setTimeDateOption] = useState('');
  let timeOptionDate = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  const pricingPlanStatus = [
    { id: true, name: 'Showing' },
    { id: false, name: 'Not Showing' }
  ];

  useEffect(() => {
    if (getValues('time_option_frequency') == 'YEAR') {
      timeOptionDate = [1];
    }
    setTimeDateOption(
      timeOptionDate.map((option, index) => (
        <MenuItem key={index} value={option}>
          {option}
        </MenuItem>
      ))
    );
  }, [watch('time_option_frequency')]);

  //Return Add PricingPlan Modal
  return (
    <div>
      <TenantModal
        id={'add-pricing-plan-modal'}
        open={open}
        close={handleNewClose}
        confirm={handleSubmit((data) => sendPricingPlanToParent(data))}
        title={'Add Pricing Plan'}
        maxWidth={'md'}
        submitTitle={'Add Pricing Plan'}
        variant={'form_submit'}
      >
        <FormControl
          fullWidth
          style={{ marginTop: 14 }}
          error={!!errors.time_option_frequency}
        >
          <TenantSelect
            id="add-pricing-plan-time-option-frequency-select"
            control={control}
            fullWidth
            variant="outlined"
            label="Time Frequency *"
            name={'time_option_frequency'}
          >
            <MenuItem
              key={1}
              value={'DAY'}
              id={'add-pricing-plan-time-option-frequency-menu-item-1'}
            >
              DAY
            </MenuItem>
            <MenuItem
              key={2}
              value={'WEEK'}
              id={'add-pricing-plan-time-option-frequency-menu-item-2'}
            >
              WEEK
            </MenuItem>
            <MenuItem
              key={3}
              value={'MONTH'}
              id={'add-pricing-plan-time-option-frequency-menu-item-2'}
            >
              MONTH
            </MenuItem>
            <MenuItem
              key={4}
              value={'YEAR'}
              id={'add-pricing-plan-time-option-frequency-menu-item-2'}
            >
              YEAR
            </MenuItem>
          </TenantSelect>
          <FormHelperText>
            {errors.time_option_frequency
              ? errors.time_option_frequency?.message
              : null}
          </FormHelperText>
        </FormControl>
        <FormControl
          fullWidth
          style={{ marginTop: 14 }}
          error={!!errors.time_option_date}
        >
          <TenantSelect
            id="add-pricing-plan-time-option-date-select"
            control={control}
            fullWidth
            variant="outlined"
            label="Time Date *"
            name={'time_option_date'}
          >
            {timeDateOption}
          </TenantSelect>
          <FormHelperText>
            {errors.time_option_date ? errors.time_option_date?.message : null}
          </FormHelperText>
        </FormControl>

        <TenantTextField
          id="add-pricing-plan-price-field"
          name={'price'}
          control={control}
          label={'Price *'}
          variant="outlined"
          margin="normal"
          fullWidth
          error={!!errors.price}
          helperText={errors.price ? errors.price?.message : null}
        />
        <TenantTextField
          id="add-pricing-plan-shopify-fulfill-field"
          name={'shopify_fulfill'}
          control={control}
          label={'Shopify Fulfill'}
          variant="outlined"
          margin="normal"
          fullWidth
          error={!!errors.shopify_fulfill}
          helperText={
            errors.shopify_fulfill ? errors.shopify_fulfill?.message : null
          }
        />
        <TenantTextField
          id="add-pricing-plan-shopify-unfulfill-field"
          name={'shopify_unfulfill'}
          control={control}
          label={'Shopify Do Not FulFill'}
          variant="outlined"
          margin="normal"
          fullWidth
          error={!!errors.shopify_unfulfill}
          helperText={
            errors.shopify_unfulfill ? errors.shopify_unfulfill?.message : null
          }
        />
        <TenantTextField
          id="add-pricing-plan-description"
          name={'description'}
          control={control}
          label={'Description'}
          variant="outlined"
          margin="normal"
          multiline
          minRows={4}
          fullWidth
          error={!!errors.description}
          helperText={errors.description ? errors.description?.message : null}
        />
        <FormControl
          fullWidth
          style={{ marginTop: 12 }}
          error={!!errors.free_with_new_account}
        >
          <TenantSelect
            id="add-pricing-plan-free-with-new-account-select"
            control={control}
            fullWidth
            variant="outlined"
            label="Free with new account? *"
            name={'free_with_new_account'}
          >
            <MenuItem
              key={1}
              value={true}
              id={'add-pricing-plan-free-with-new-account-menu-item-1'}
            >
              Yes
            </MenuItem>
            <MenuItem
              key={2}
              value={false}
              id={'add-pricing-plan-free-with-new-account-menu-item-2'}
            >
              No
            </MenuItem>
          </TenantSelect>
          <FormHelperText>
            {errors.free_with_new_account
              ? errors.free_with_new_account?.message
              : null}
          </FormHelperText>
        </FormControl>
        <FormControl
          fullWidth
          style={{ marginTop: 12 }}
          error={!!errors.status}
        >
          <TenantSelect
            id="add-pricing-plan-status-select"
            control={control}
            fullWidth
            variant="outlined"
            label="Visibility *"
            name={'status'}
            options={pricingPlanStatus}
          ></TenantSelect>
          <FormHelperText>
            {errors.status ? errors.status?.message : null}
          </FormHelperText>
        </FormControl>
      </TenantModal>
    </div>
  );
};

//Section Edit PricingPlan Modal
const EditPricingPlanModal = ({
  data,
  open,
  onClose,
  onSubmit,
  validator
  // ...params
}) => {
  //Closes the New Pricing Plan Modal
  const handleEditClose = () => {
    onClose();
  };

  const sendPricingPlanToParent = (sendData) => {
    onSubmit(sendData);
    handleEditClose();
  };

  const {
    handleSubmit,
    control,
    setValue,
    watch,
    getValues,
    formState: { errors }
  } = useForm({
    mode: 'onChange',
    reValidateMode: 'onChange',
    resolver: yupResolver(validator),
    defaultValues: {
      stripe_price_id: '',
      time_option_date: '',
      time_option_frequency: '',
      price: 0,
      free_with_new_account: false,
      description: '',
      shopify_fulfill: '',
      shopify_unfulfill: '',
      status: true
    }
  });

  const [timeDateOption, setTimeDateOption] = useState('');
  let timeOptionDate = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

  useEffect(() => {
    if (getValues('time_option_frequency') == 'YEAR') {
      timeOptionDate = [1];
    }
    setTimeDateOption(
      timeOptionDate.map((option, index) => (
        <MenuItem key={index} value={option}>
          {option}
        </MenuItem>
      ))
    );
  }, [watch('time_option_frequency')]);

  //Set the field values
  useEffect(() => {
    setValue('id', data.id, true);
    setValue('time_option_date', data.time_option_date, true);
    setValue('time_option_frequency', data.time_option_frequency, true);
    setValue('price', data.price, true);
    setValue('free_with_new_account', data.free_with_new_account, true);
    setValue('description', data.description, true);
    setValue('shopify_fulfill', data.shopify_fulfill, true);
    setValue('shopify_unfulfill', data.shopify_unfulfill, true);
    setValue('status', data.status, true);
    setValue('stripe_price_id', data.stripe_price_id, true);
  }, [data, setValue]);

  //Return Edit Modal
  return (
    <div>
      <TenantModal
        id={'edit-pricing-plan-modal'}
        open={open}
        close={handleEditClose}
        confirm={handleSubmit((data) => sendPricingPlanToParent(data))}
        title={'Edit Pricing Plan'}
        maxWidth={'md'}
        submitTitle={'Update Pricing Plan'}
        variant={'form_submit'}
      >
        <FormControl
          fullWidth
          style={{ marginTop: 14 }}
          error={!!errors.time_option_frequency}
        >
          <TenantSelect
            id="edit-pricing-plan-time-option-frequency-select"
            control={control}
            fullWidth
            variant="outlined"
            label="Time Frequency *"
            name={'time_option_frequency'}
            disabled
          >
            <MenuItem
              key={1}
              value={'DAY'}
              id={'edit-pricing-plan-time-option-frequency-menu-item-1'}
            >
              DAY
            </MenuItem>
            <MenuItem
              key={2}
              value={'WEEK'}
              id={'edit-pricing-plan-time-option-frequency-menu-item-2'}
            >
              WEEK
            </MenuItem>
            <MenuItem
              key={3}
              value={'MONTH'}
              id={'edit-pricing-plan-time-option-frequency-menu-item-2'}
            >
              MONTH
            </MenuItem>
            <MenuItem
              key={4}
              value={'YEAR'}
              id={'edit-pricing-plan-time-option-frequency-menu-item-2'}
            >
              YEAR
            </MenuItem>
          </TenantSelect>
          <FormHelperText>
            {errors.time_option_frequency
              ? errors.time_option_frequency?.message
              : null}
          </FormHelperText>
        </FormControl>
        <FormControl
          fullWidth
          style={{ marginTop: 14 }}
          error={!!errors.time_option_date}
        >
          <TenantSelect
            id="edit-pricing-plan-time-option-date-select"
            control={control}
            fullWidth
            variant="outlined"
            label="Time Date *"
            name={'time_option_date'}
            disabled
          >
            {timeDateOption}
          </TenantSelect>
          <FormHelperText>
            {errors.time_option_date ? errors.time_option_date?.message : null}
          </FormHelperText>
        </FormControl>
        <TenantTextField
          id="edit-pricing-plan-price-field"
          name={'price'}
          control={control}
          label={'Price *'}
          variant="outlined"
          margin="normal"
          fullWidth
          error={!!errors.price}
          helperText={errors.price ? errors.price?.message : null}
          disabled
        />
        <TenantTextField
          id="edit-pricing-plan-shopify-fulfill-field"
          name={'shopify_fulfill'}
          control={control}
          label={'Shopify Fulfill'}
          variant="outlined"
          margin="normal"
          fullWidth
          error={!!errors.shopify_fulfill}
          helperText={
            errors.shopify_fulfill ? errors.shopify_fulfill?.message : null
          }
        />
        <TenantTextField
          id="edit-pricing-plan-shopify-unfulfill-field"
          name={'shopify_unfulfill'}
          control={control}
          label={'Shopify Do Not FulFill'}
          variant="outlined"
          margin="normal"
          fullWidth
          error={!!errors.shopify_unfulfill}
          helperText={
            errors.shopify_unfulfill ? errors.shopify_unfulfill?.message : null
          }
        />
        <TenantTextField
          id="edit-pricing-plan-description"
          name={'description'}
          control={control}
          label={'Description'}
          variant="outlined"
          margin="normal"
          multiline
          minRows={4}
          fullWidth
          error={!!errors.description}
          helperText={errors.description ? errors.description?.message : null}
        />
        <FormControl
          fullWidth
          style={{ marginTop: 12 }}
          error={!!errors.free_with_new_account}
        >
          <TenantSelect
            id="edit-pricing-plan-free-with-new-account-select"
            control={control}
            fullWidth
            variant="outlined"
            label="Free with new account? *"
            name={'free_with_new_account'}
          >
            <MenuItem
              key={1}
              value={true}
              id={'edit-pricing-plan-free-with-new-account-menu-item-1'}
            >
              Yes
            </MenuItem>
            <MenuItem
              key={2}
              value={false}
              id={'edit-pricing-plan-free-with-new-account-menu-item-2'}
            >
              No
            </MenuItem>
          </TenantSelect>
          <FormHelperText>
            {errors.free_with_new_account
              ? errors.free_with_new_account?.message
              : null}
          </FormHelperText>
        </FormControl>
        <FormControl
          fullWidth
          style={{ marginTop: 12 }}
          error={!!errors.status}
        >
          <TenantSelect
            id="edit-pricing-plan-status-select"
            control={control}
            fullWidth
            variant="outlined"
            label="Visibility *"
            name={'status'}
          >
            <MenuItem
              key={1}
              value={true}
              id={'edit-pricing-plan-status-menu-item-1'}
            >
              Showing
            </MenuItem>
            <MenuItem
              key={2}
              value={false}
              id={'edit-pricing-plan-status-menu-item-2'}
            >
              Not Showing
            </MenuItem>
          </TenantSelect>
          <FormHelperText>
            {errors.status ? errors.status?.message : null}
          </FormHelperText>
        </FormControl>
      </TenantModal>
    </div>
  );
};

const DeletePricingPlanModal = ({ data, open, onConfirm, onClose }) => {
  const handleDeletePricingPlan = () => {
    onConfirm(data);
    onClose();
  };

  return (
    <TenantModal
      id="delete-pricing-modal"
      open={open}
      close={onClose}
      confirm={handleDeletePricingPlan}
      title="Delete Pricing Plan"
    >
      <Typography id="delete-pricing-plan-confirmation-text">
        Are you sure you want to delete this Pricing Plan&nbsp;
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

//Define the Custom Toolbar we want in order to move the create user button into the bar.
const PricingPlanCustomToolbar = ({
  addModal,
  associateModal,
  onAdd,
  onAssociate
}) => {
  return (
    <GridToolbarContainer>
      <GridToolbarColumnsButton />
      <GridToolbarFilterButton />
      {addModal ? (
        <Button
          size="small"
          variant="outlined"
          onClick={onAdd}
          id="add-pricing-plan-btn"
        >
          Add Pricing Plan
        </Button>
      ) : null}
      {associateModal ? (
        <Button
          size="small"
          variant="outlined"
          onClick={onAssociate}
          id="associate-pricing-plan-btn"
        >
          Associate Pricing Plan
        </Button>
      ) : null}
    </GridToolbarContainer>
  );
};

//Generates the "Linked PrcingPlan" grid for settings tabs
const SubscriptionsPricingPlansGrid = (params) => {
  //Used to maintain state of the New Pricing Plan Modal
  const [modal, setModal] = React.useState('');
  const [focusedData, setFocusedData] = React.useState({});

  const handleCloseModal = () => {
    setModal('');
  };

  //Opens the New PricingPlan Modal
  const handleAddClickOpen = () => {
    setModal(ADD_PRICINGPLAN_MODAL);
  };

  //Opens the Associate PricingPlan Modal
  const handleAssociateClickOpen = () => {
    setModal(ASSOCIATE_PRICINGPLAN_MODAL);
  };

  //Opens the Edit Modal
  const handleEditClickOpen = (row) => {
    setFocusedData(row);
    setModal(EDIT_PRICINGPLAN_MODAL);
  };

  // Handling delete confirmation box
  function handleDeleteClickOpen(row) {
    setFocusedData(row);
    setModal(DELETE_PRICINGPLAN_MODAL);
  }

  const validator = yup.object({
    time_option_frequency: yup
      .string('Time option frequency')
      .trim()
      .required('Time option frequency is required')
      .trim(),
    time_option_date: yup
      .number('Time Option Date')
      .required('Time option date is required'),
    price: yup
      .number('A Price must be Specified!')
      .min(1, 'A Price must be Specified!')
      .required('A Price is Required')
  });

  //Define the Columns that we want to draw out
  const pricingPlanColumns = [
    { field: 'id', headerName: 'ID', width: 100, hide: true },
    {
      field: 'Time option (Date / frequency)',
      headerName: 'Time option (Date / frequency)',
      editable: false,
      flex: 4,
      valueGetter: function ({ row }) {
        return `${row?.time_option_date}/${row?.time_option_frequency}`;
      }
    },
    {
      field: 'price',
      headerName: 'Price',
      editable: false,
      flex: 3
    },
    {
      field: 'status',
      headerName: 'Visibility',
      editable: false,
      flex: 3,
      valueGetter: function ({ row }) {
        if (row.status === true) {
          return 'Showing';
        } else {
          return 'Not Showing';
        }
      }
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
            <Button
              variant="contained"
              color="primary"
              startIcon={<EditIcon />}
              size="small"
              onClick={() => handleEditClickOpen(params.row)}
              id={'edit-pricing-plan-btn' + params.row.id}
            >
              Edit
            </Button>
            &nbsp;&nbsp;
            <Button
              variant="contained"
              color="error"
              startIcon={<HighlightOffIcon />}
              size="small"
              onClick={() => handleDeleteClickOpen(params.row)}
              id={'remove-pricing-plan-btn' + params.row.id}
            >
              Remove
            </Button>
          </>
        );
      }
    }
  ];

  const handleAddPricingPlan = async (data) => {
    data.id = 'a' + Date.now();
    //Add our PricingPlan List

    params.addFunc([data]);
  };

  const handleEditPricingPlan = (data) => {
    //Update our PricingPlan List
    params.updateFunc([data]);
  };

  const handleDeletePricingPlan = (row) => {
    const result = params.pricingPlanData.map((filterRow) => {
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

  //Section Existing PricingPlans
  //Return Selected DataGrid
  return (
    <React.Fragment>
      <TenantDataGrid
        title={'pricing plans'}
        initialState={{
          columns: {
            columnVisibilityModel: {
              id: false
            }
          }
        }}
        autoHeight
        components={{
          Toolbar: () => (
            <PricingPlanCustomToolbar
              {...params}
              onAdd={handleAddClickOpen}
              onAssociate={handleAssociateClickOpen}
            />
          )
        }}
        rows={params.pricingPlanData.filter(
          (filterRow) =>
            filterRow?.deleted == null || filterRow?.deleted == undefined
        )}
        columns={pricingPlanColumns}
        pageSize={50}
        rowsPerPageOptions={[50]}
        loading={params.loading}
        checkboxSelection={false}
      />
      {params.addModal ? (
        <AddPricingPlanModal
          validator={validator}
          onSubmit={handleAddPricingPlan}
          onClose={handleCloseModal}
          open={modal === ADD_PRICINGPLAN_MODAL}
        />
      ) : null}
      {params.editModal ? (
        <EditPricingPlanModal
          //{...params}
          validator={validator}
          data={focusedData}
          onSubmit={handleEditPricingPlan}
          onClose={handleCloseModal}
          open={modal === EDIT_PRICINGPLAN_MODAL}
        />
      ) : null}
      <DeletePricingPlanModal
        data={focusedData}
        onConfirm={handleDeletePricingPlan}
        onClose={handleCloseModal}
        open={modal === DELETE_PRICINGPLAN_MODAL}
      />
    </React.Fragment>
  );
};

export default SubscriptionsPricingPlansGrid;
