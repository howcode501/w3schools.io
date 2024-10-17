/*
 * File Created for APP Inc
 * Project: nextjs-spike
 * User: ***
 * Date: 8/30/2021
 */

import React from 'react';
import { connect } from 'react-redux';
import EditIcon from '@mui/icons-material/Edit';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import { DataGrid } from '@mui/x-data-grid';
import { useRouter } from 'next/router';
import Link from 'next/link';

const columns = [
  { field: 'id', headerName: 'ID', width: 100, hide: true },
  {
    field: 'groupname',
    headerName: 'Role Name',
    editable: false,
    flex: 3
  },
  {
    field: 'role',
    headerName: 'Role',
    editable: false,
    flex: 2
  },
  {
    field: 'quota',
    headerName: 'Storage Quota',
    editable: false,
    flex: 2
  },
  {
    field: 'action',
    headerName: 'Action',
    align: 'right',
    headerAlign: 'right',
    sortable: false,
    filterable: false,
    resizable: false,
    disableClickEventBubbling: true,
    disableColumnMenu: true,
    flex: 1,
    renderCell: (params) => {
      return (
        <Button
          id={'edit-role-btn-' + params.row.id}
          variant="contained"
          color="primary"
          startIcon={<EditIcon />}
        >
          Edit
        </Button>
      );
    }
  }
];

const rows = [
  { id: 1, groupname: 'Group 1', role: 'Faculty', quota: '1 GB' },
  { id: 2, groupname: 'Group 2', role: 'Faculty', quota: '2 GB' },
  { id: 3, groupname: 'Accounting', role: 'Sub-Admin', quota: '2 GB' },
  { id: 4, groupname: 'Support', role: 'Faculty', quota: '2 GB' },
  { id: 5, groupname: 'Class 1', role: 'Sub-Admin', quota: '' },
  { id: 6, groupname: 'Class 2', role: 'Faculty', quota: '' },
  { id: 7, groupname: 'Class 3', role: 'Faculty', quota: '' },
  { id: 8, groupname: 'Class 4', role: 'Sub-Admin', quota: '5 GB' },
  { id: 9, groupname: 'Class 5', role: 'Faculty', quota: '5 GB' }
];

const GroupsIndex = () => {
  const router = useRouter();

  function currentlySelected(params) {
    if (params.field === 'action') {
      router.push('/roles/update/' + params.id);
    }
  }

  return (
    <Container maxWidth="lg" style={{ marginTop: 100 }}>
      <div id="roles-list-text">Roles List</div>
      <div>
        <Link id="goto-create-new-role-link" href="/roles/create" passHref>
          <Button variant="outlined" id="create-new-role-btn">
            Create New Role
          </Button>
        </Link>
      </div>
      <div style={{ display: 'flex', height: '100%', marginTop: 10 }}>
        <div style={{ flexGrow: 1 }}>
          <div style={{ height: 600 }}>
            <DataGrid
              rows={rows}
              columns={columns}
              pageSize={50}
              rowsPerPageOptions={[50]}
              NoRowsOverlay
              onCellClick={currentlySelected}
            />
          </div>
        </div>
      </div>
    </Container>
  );
};

export default connect((state) => state)(GroupsIndex);
