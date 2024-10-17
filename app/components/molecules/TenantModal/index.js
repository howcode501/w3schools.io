import React from 'react';
import Box from '@mui/material/Box';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Button from '@mui/material/Button';
import LoadingButton from '@mui/lab/LoadingButton';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';

export const MODAL_VARIANT_ALERT = 'alert';
export const MODAL_VARIANT_CONFIRM = 'confirm';
export const MODAL_VARIANT_FORM_SUBMIT = 'form_submit';

export default function TenantModal({
  variant = MODAL_VARIANT_CONFIRM,
  children,
  close,
  confirm,
  open,
  title,
  submitTitle,
  showCloseTopRight = true,
  ...modalProps
}) {
  const [proceeding, setProceeding] = React.useState(false);

  const handleSubmitForm = (e) => {
    e?.preventDefault();

    if (confirm) {
      setProceeding(true);
      confirm()?.finally(() => setProceeding(false));
    }
  };

  return (
    <Dialog onClose={close} open={open} {...modalProps}>
      {showCloseTopRight === true ? (
        <IconButton
          aria-label="close"
          onClick={close}
          sx={{
            position: 'absolute',
            right: 8,
            top: 8,
            color: (theme) => theme.palette.grey[500]
          }}
          id="tenant-modal-close-button"
        >
          <CloseIcon />
        </IconButton>
      ) : (
        ''
      )}
      <DialogTitle>{title}</DialogTitle>
      <Box
        component={variant === MODAL_VARIANT_FORM_SUBMIT ? 'form' : 'div'}
        onSubmit={handleSubmitForm}
      >
        <DialogContent sx={{ py: 0 }}>
          {children}
          {variant === MODAL_VARIANT_FORM_SUBMIT ? (
            <Box
              aria-required="true"
              id="required-text"
              aria-label="(*) indicates required field"
            >
              (*) indicates required field
            </Box>
          ) : null}
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          {variant === MODAL_VARIANT_CONFIRM ? (
            <LoadingButton
              onClick={confirm}
              id="modal-action-confirm-button"
              loading={proceeding}
            >
              Confirm
            </LoadingButton>
          ) : null}
          <Button
            onClick={close}
            variant="outlined"
            id="modal-action-close-button"
          >
            {variant === MODAL_VARIANT_ALERT ? 'Close' : 'Cancel'}
          </Button>
          {variant === MODAL_VARIANT_FORM_SUBMIT ? (
            <LoadingButton
              type="submit"
              id="modal-action-confirm-button"
              loading={proceeding}
              variant="contained"
            >
              {submitTitle ? submitTitle : 'Submit'}
            </LoadingButton>
          ) : null}
        </DialogActions>
      </Box>
    </Dialog>
  );
}
