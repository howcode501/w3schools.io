import * as React from 'react';
import Paper from '@mui/material/Paper';
import InputBase from '@mui/material/InputBase';
import IconButton from '@mui/material/IconButton';
import SearchIcon from '@mui/icons-material/Search';


const TenantSearchBar = ({
    onClick,
    setSearchQuery,
    ...props
}) => (
    <Paper
    component="form"
    sx={{ p: '2px 4px', display: 'flex', alignItems: 'center', width: 400 }}
    >
        <InputBase
        sx={{ ml: 1, flex: 1 }}
        onInput={(e) => {
            setSearchQuery(e.target.value);
            }}

        inputProps={{ 'aria-label': 'search' }}
        {...props}
        />
        <IconButton type="button" sx={{ p: '10px' }} aria-label="search" onClick={onClick}>
        <SearchIcon />
        </IconButton>
  </Paper> 
);

export default TenantSearchBar;