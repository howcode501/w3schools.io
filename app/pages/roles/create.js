/*
 * File Created for APP Inc
 * Project: nextjs-spike
 * User: ***
 * Date: 9/1/2021
 */

import React, { useState } from 'react';
import { connect } from 'react-redux';
import Container from '@mui/material/Container';
import { Breadcrumbs, TextField, Typography } from '@mui/material';
import Button from '@mui/material/Button';
import Link from 'next/link';
import Autocomplete from '@mui/material/Autocomplete';

const groups = [];
groups[1] = 'Group 1';
groups[2] = 'Group 2';
groups[3] = 'Accounting';
groups[4] = 'Support';
groups[5] = 'Class 1';
groups[6] = 'Class 2';

const apps = [];
apps[1] = 'Windows App Testing';
apps[2] = 'Camera Test NC';
apps[3] = 'thoughtcastowners Desktop';
apps[4] = 'Engineering Desktop';
apps[5] = 'Guac H264';
apps[6] = 'Hyperstream';
apps[7] = 'Linux Test';
apps[8] = 'Guac Dev';
apps[9] = 'A Test 1';

const GroupCreate = () => {
  const [data, setData] = useState({
    groupname: '',
    storagequota: '',
    lastname: '',
    email: ''
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setData((data) => ({ ...data, [name]: value }));
  };

  const HandleSubmit = (e) => {
    e.preventDefault();
    setIsLoading(true);
  };

  return (
    <Container maxWidth="sm">
      <div style={{ marginTop: 100 }}>
        <form noValidate id="create-role-form">
          <div>
            <Breadcrumbs aria-label="breadcrumb" className="breadcrumb">
              <Link href="/groups" id="goto-roles-link">
                Roles Management
              </Link>
              <Typography id="create-role-breadcrumb-text" color="textPrimary">
                Create Role
              </Typography>
            </Breadcrumbs>
          </div>
          <div id="create-role-text">Create Role</div>
          <TextField
            variant="outlined"
            margin="normal"
            required
            fullWidth
            name="groupname"
            label="Group Name"
            type="text"
            id="groupname"
            value={data?.groupname}
            onChange={handleChange}
            autoComplete="groupname"
          />
          <TextField
            variant="outlined"
            margin="normal"
            required
            fullWidth
            name="storagequota"
            label="Storage Quota Per User"
            type="text"
            id="storagequota"
            value={data?.storagequota}
            onChange={handleChange}
            autoComplete="storagequota"
          />
          <Autocomplete
            multiple
            style={{ marginTop: 15 }}
            id="tags-standard"
            options={groups}
            renderInput={(params) => (
              <TextField
                {...params}
                variant="outlined"
                label="Groups"
                placeholder="Groups"
              />
            )}
          />
          <Autocomplete
            multiple
            style={{ marginTop: 15 }}
            id="tags-standard"
            options={apps}
            renderInput={(params) => (
              <TextField
                {...params}
                variant="outlined"
                label="Applications"
                placeholder="Applications"
              />
            )}
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            disabled={isLoading}
            onClick={HandleSubmit}
            id="add-role-submit-btn"
          >
            Add Role
          </Button>
        </form>
      </div>
    </Container>
  );
};

export default connect((state) => state)(GroupCreate);
