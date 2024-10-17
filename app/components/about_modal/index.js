/*
 * File Created for APP Inc
 * Project: nextjs-spike
 * User: ***
 * Date: 8/28/2021
 */
import React, { useEffect } from 'react';
import DialogTitle from '@mui/material/DialogTitle';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import Alert from '@mui/material/Alert';

//Application Imports
import { useApi } from '../../hooks';
import { API_ROOT } from '../../helpers/config';
import yaml from '../../build_info.yaml';

export default function AboutModal(props) {
  const [open, setOpen] = React.useState(false);
  const [buildInfo, setBuildInfo] = React.useState(null);
  const [fullWidth] = React.useState(true);
  const [maxWidth] = React.useState('sm');
  const [warningMsg, setWarningMsg] = React.useState('');
  const { get } = useApi();

  const columns = [
    { id: 'tenentAPI', label: 'API' },
    { id: 'tenentAPP', label: 'APP' }
  ];

  const createData = (tenentAPI, tenentAPP) => {
    return { tenentAPI, tenentAPP };
  };

  const rows = [
    createData(
      `${buildInfo?.APP_BUILD_VERSION ? buildInfo?.APP_BUILD_VERSION : '--'}`,
      `${yaml?.APP_BUILD_VERSION ? yaml?.APP_BUILD_VERSION : '--'}`
    )
  ];

  useEffect(() => {
    setOpen(props.helpMenuDialog);
  }, [props.helpMenuDialog]);

  useEffect(() => {
    open &&
      (buildInfo == null || buildInfo == undefined) &&
      get(`${API_ROOT}/api/about`)
        .then((response) => {
          if (response.data.error) {
            setWarningMsg(response.data.error);
          } else {
            setBuildInfo(response.data.data.buildInfo);
          }
        })
        .catch(() => {
          setBuildInfo(null);
        });
  });

  const handleClose = () => {
    setOpen(false);
    props.setHelpMenuDialog(false);
  };

  return (
    <>
      <Dialog
        onClose={handleClose}
        open={open}
        fullWidth={fullWidth}
        maxWidth={maxWidth}
      >
        <IconButton
          aria-label="close"
          onClick={handleClose}
          sx={{
            position: 'absolute',
            right: 8,
            top: 8,
            color: (theme) => theme.palette.grey[500]
          }}
          id="about-modal-close-button"
        >
          <CloseIcon />
        </IconButton>
        <DialogTitle textAlign="center" ml={8}>
          Thoughtcastowners Version
        </DialogTitle>
        <TableContainer
          sx={{ maxHeight: 440 }}
          id="about-modal-table-container"
        >
          <Table stickyHeader aria-label="sticky table">
            <TableHead>
              <TableRow>
                {columns.map((column, index) => {
                  return (
                    <TableCell
                      key={column.id.toString() + index}
                      align="center"
                      style={{ minWidth: column.minWidth }}
                    >
                      {column.label}
                    </TableCell>
                  );
                })}
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map((row, idx) => {
                return (
                  <TableRow hover role="checkbox" tabIndex={-1} key={idx}>
                    {columns.map((column, index) => {
                      const value = row[column.id];
                      return (
                        <TableCell
                          key={column.id.toString() + index}
                          align="center"
                        >
                          {column.format && typeof value === 'number'
                            ? column.format(value)
                            : value}
                        </TableCell>
                      );
                    })}
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
        {warningMsg ? (
          <Alert
            id="about-modal-warning"
            severity="warning"
            sx={{ mt: 2, ml: 1, mr: 1 }}
          >
            {warningMsg}
          </Alert>
        ) : null}
        <DialogActions>
          <Button onClick={handleClose} id="about-modal-action-close-button">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
