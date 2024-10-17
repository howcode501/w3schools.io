import React, { useState, useEffect } from 'react';
import {
  Elements,
  CardElement,
  useStripe,
  useElements
} from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';

import { useApi } from '../../hooks';

// Mui Imports
import Button from '@mui/material/Button';
import Radio from '@mui/material/Radio';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';

//Material UI Icons
import ClearIcon from '@mui/icons-material/Clear';

import {
  TenantModal,
  TenantDataGrid,
  PositionedSnackbar
} from '../../components';

import TokenService from '../../services/token';

const PaymentMethodGrid = (params) => {
  const [selectedValue, setSelectedValue] = useState(true);
  const [loading, setLoading] = useState(true);
  const [showCheckoutForm, setShowCheckoutForm] = useState(false);
  const [stripeOptions, setStripeOptions] = useState({});
  const [rows, setRows] = React.useState([]);
  const [stripePromise, setStripePromise] = useState(null);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');

  //Initialize the API
  const { get, put, post, del } = useApi();

  const userData = TokenService.getUserData();

  useEffect(() => {
    async function fetchData() {
      if (typeof window !== 'undefined') {
        await get('/api/system-config/useroptions')
          .then((response) => {
            const config = {};

            response.data.data.systemConfig.forEach((row) => {
              if (row.name === 'Stripe_Mode') {
                config.stripe_mode = row.value;
              }
              if (row.name === 'Stripe_Live_Publishable_Key') {
                config.stripe_live_publishable_key = row.value;
              }
              if (row.name === 'Stripe_Test_Publishable_Key') {
                config.stripe_test_publishable_key = row.value;
              }
            });
            fetchStripeObject(config);
          })
          .catch((err) => {
            setSnackbarMessage(err);
            setOpenSnackbar(true);
            setSnackbarSeverity('error');
          });
      }
    }
    const fetchStripeObject = async (config) => {
      const res = await loadStripe(
        config.stripe_mode == 'Test'
          ? config.stripe_test_publishable_key
          : config.stripe_live_publishable_key
      );
      // When we have got the Stripe object, pass it into our useState.
      setStripePromise(res);
      listSetupIntents();
    };
    fetchData();
  }, []);

  const createSetupIntents = async () => {
    await put('/api/stripe/createsetupintent', {})
      .then((res) => {
        if (res) {
          setStripeOptions({
            clientSecret: res.data.data,
            appearance: {
              /*...*/
            }
          });
          setShowCheckoutForm(true);
          return res.data.data;
        } else {
          return false;
        }
      })
      .catch((err) => {
        setSnackbarMessage(err);
        setOpenSnackbar(true);
        setSnackbarSeverity('error');
        return false;
      });
  };

  const listSetupIntents = async () => {
    await get('/api/stripe/listsetupintent')
      .then((res) => {
        if (res) {
          setRows(res.data.data.data);
          setLoading(false);

          // show checkout form when modal opens
          showCheckout();
          return res.data.data;
        } else {
          // show checkout form when modal opens
          showCheckout();
          return false;
        }
      })
      .catch((err) => {
        setSnackbarMessage(err);
        setOpenSnackbar(true);
        setSnackbarSeverity('error');
        return false;
      });
  };

  const showCheckout = async () => {
    await createSetupIntents();
  };

  const CheckoutForm = () => {
    const stripe = useStripe();
    const elements = useElements();

    const handleSubmit = async (event) => {
      // We don't want to let default form submission happen here,
      // which would refresh the page.
      event.preventDefault();

      if (!stripe || !Elements) {
        // Stripe.js has not yet loaded.
        // Make sure to disable form submission until Stripe.js has loaded.
        return;
      }
      const result = await stripe.confirmCardSetup(stripeOptions.clientSecret, {
        payment_method: {
          card: elements.getElement(CardElement),
          billing_details: {
            name: userData.username
            // address: addressData
          }
        }
      });
      if (result.error) {
        // Display result.error.message in your UI.
        setSnackbarMessage(
          'Failed to process payment details. Please try another payment method.'
        );
        setOpenSnackbar(true);
        setSnackbarSeverity('error');
      } else {
        // The setup has succeeded. Display a success message and send
        // result.setupIntent.payment_method to your server to save the
        // card to a Customer
        setSnackbarMessage('Success! Your payment method has been saved.');
        setOpenSnackbar(true);
        setSnackbarSeverity('success');
        await listSetupIntents();
        showCheckout();
      }
    };

    return (
      <form onSubmit={handleSubmit} style={{ marginTop: '50px' }}>
        <CardElement />
        <button
          onClick={handleSubmit}
          disabled={!stripe}
          style={{
            marginBottom: '15px',
            cursor: 'pointer',
            backgroundColor: '#1976d2',
            color: 'white',
            border: '1px solid #1976d2',
            padding: '6px',
            borderRadius: '5px',
            marginTop: '30px',
            width: '10%',
            float: 'right',
            boxShadow:
              '0px 2px 4px -1px rgb(0 0 0 / 20%), 0px 4px 5px 0px rgb(0 0 0 / 14%), 0px 1px 10px 0px rgb(0 0 0 / 12%)'
          }}
        >
          Save Card
        </button>
        {/* Show error message to your customers */}
      </form>
    );
  };
  const handleRemovePaymentIndent = async (params) => {
    setLoading(true);
    del(`/api/stripe/deletepaymentmethod/${params.row.id}`, {
      payment_id: params.row.id
    })
      .then((res) => {
        if (res) {
          listSetupIntents();
        } else {
          setLoading(false);
          return false;
        }
      })
      .catch((err) => {
        setLoading(false);
        setSnackbarMessage(err);
        setOpenSnackbar(true);
        setSnackbarSeverity('error');
        return false;
      });
  };
  const handleChangeDefault = async (event, params) => {
    let dop = JSON.parse(JSON.stringify(rows));
    dop.map((value) => {
      if (params.id == value.id) {
        value.default = true;
        return value;
      } else {
        value.default = false;
        return value;
      }
    });
    setRows(dop);
    setSelectedValue(true);
    // set
    setLoading(true);
    await post('/api/stripe/updatedefaultpaymentmethod', {
      payment_id: params.row.id
    })
      .then((res) => {
        if (res) {
          setLoading(false);
          setSnackbarMessage('Success! Your payment method has set default.');
          setOpenSnackbar(true);
          setSnackbarSeverity('success');
        } else {
          setLoading(false);
          setSnackbarMessage('Something went wrong.');
          setOpenSnackbar(true);
          setSnackbarSeverity('error');

          return false;
        }
      })
      .catch((err) => {
        setLoading(false);
        setSnackbarMessage(err);
        setOpenSnackbar(true);
        setSnackbarSeverity('error');

        return false;
      });
  };
  // Mui data grid
  let columns = [
    {
      field: 'customer',
      headerName: 'Card',
      width: 150,
      editable: true,
      valueGetter: function (params) {
        return `XXXX-${params.row.card.last4}`;
      }
    },
    {
      field: 'id',
      headerName: 'Card Brand',
      width: 150,
      editable: true,
      valueGetter: function (params) {
        return params.row.card.brand;
      }
    },
    {
      field: 'object',
      headerName: 'Card type',
      type: 'number',
      width: 150,
      editable: true,
      valueGetter: function (params) {
        return params.row.card.funding;
      }
    },
    {
      field: 'created',
      headerName: 'Exp Month/Year',
      type: 'number',
      width: 150,
      editable: true,
      valueGetter: function (params) {
        return `${params.row.card.exp_month}/${params.row.card.exp_year}`;
      }
    },
    {
      field: 'default',
      headerName: 'Default',
      type: 'number',
      width: 150,
      editable: true,
      renderCell: (params) => {
        return (
          <>
            <Radio
              checked={selectedValue === params.row.default}
              onChange={(e) => handleChangeDefault(e, params)}
              value={params.row.default}
              name="radio-buttons"
              inputProps={{ 'aria-label': `${selectedValue}` }}
            />
          </>
        );
      }
    },
    {
      field: 'actions',
      headerName: 'Actions',
      description: 'This column has a value getter and is not sortable.',
      sortable: false,
      width: 160,
      renderCell: (params) => {
        return (
          <>
            <Button
              variant="contained"
              size="small"
              color="error"
              onClick={() => handleRemovePaymentIndent(params)}
              startIcon={<ClearIcon />}
            >
              Remove
            </Button>
          </>
        );
      }
    }
  ];
  return (
    <React.Fragment>
      {!params.noModal ? (
        <TenantModal
          id="responsive-dialog-title"
          aria-labelledby="responsive-dialog-title"
          title="Manage Payment Methods"
          variant="alert"
          maxWidth="xl"
          {...params}
        >
          <div style={{ display: 'flex', height: '100%', marginTop: 15 }}>
            <div style={{ flexGrow: 1 }}>
              <TenantDataGrid
                title={'saved cards'}
                initialState={{
                  sorting: {
                    sortModel: [{ field: 'default', sort: 'desc' }]
                  }
                }}
                autoHeight
                rows={rows}
                columns={columns}
                pageSize={5}
                loading={loading}
                rowsPerPageOptions={[5]}
                NoRowsOverlay
                id="paymentMethodGrid"
                disableSelectionOnClick
              />
            </div>
          </div>

          {showCheckoutForm ? (
            <Elements stripe={stripePromise} options={stripeOptions}>
              <CheckoutForm />
            </Elements>
          ) : null}
        </TenantModal>
      ) : (
        <>
          <div style={{ display: 'flex', marginTop: 15 }}>
            <div style={{ flexGrow: 1 }}>
              <TenantDataGrid
                title={'saved cards'}
                initialState={{
                  sorting: {
                    sortModel: [{ field: 'default', sort: 'desc' }]
                  }
                }}
                autoHeight
                rows={rows}
                columns={columns}
                pageSize={5}
                loading={loading}
                rowsPerPageOptions={[5]}
                NoRowsOverlay
                id="paymentMethodGrid"
                disableSelectionOnClick
              />
            </div>
          </div>
          {showCheckoutForm ? (
            <>
              <Typography id="icon-guide-text" variant="h4" sx={{ mt: 2 }}>
                Add Card
              </Typography>
              <Card variant="outlined" sx={{ mt: 2 }}>
                <CardContent sx={{ pading: '15px' }}>
                  <Elements stripe={stripePromise} options={stripeOptions}>
                    <CheckoutForm />
                  </Elements>
                </CardContent>
              </Card>
            </>
          ) : null}
        </>
      )}
      <PositionedSnackbar
        open={openSnackbar}
        autoHideDuration={2000}
        message={snackbarMessage}
        severity={snackbarSeverity}
        onClose={() => setOpenSnackbar(false)}
      />
    </React.Fragment>
  );
};

export default PaymentMethodGrid;
