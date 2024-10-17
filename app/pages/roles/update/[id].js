/*
 * File Created for APP Inc
 * Project: nextjs-spike
 * User: ***
 * Date: 9/1/2021
 */

import React, { useState } from 'react';
import { connect } from 'react-redux';
import Container from '@mui/material/Container';
import {
  Breadcrumbs,
  Checkbox,
  FormControlLabel,
  FormGroup,
  TextField,
  Typography
} from '@mui/material';
import Button from '@mui/material/Button';
import Link from 'next/link';

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
        <form noValidate id="edit-group-form">
          <div>
            <Breadcrumbs aria-label="breadcrumb" className="breadcrumb">
              <Link href="/groups" id="goto-groups-link">
                Group Management
              </Link>
              <Typography color="textPrimary" id="edit-group-breadcrumb-text">
                Edit Group
              </Typography>
            </Breadcrumbs>
          </div>
          <div>Edit Group</div>
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
          <FormGroup>
            <FormControlLabel
              control={<Checkbox />}
              label="Create Shared Folder"
            />
            <FormControlLabel control={<Checkbox />} label="Create AD Group" />
          </FormGroup>
          <Button
            type="submit"
            fullWidth
            variant="contained"
            disabled={isLoading}
            onClick={HandleSubmit}
            id="update-group-submit-btn"
          >
            Update Group
          </Button>
        </form>
      </div>
    </Container>
  );
};

export default connect((state) => state)(GroupCreate);
