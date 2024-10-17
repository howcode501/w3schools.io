import React from 'react';

// Material UI Imports
import Button from '@mui/material/Button';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import { styled } from '@mui/material/styles';

// Material UI Icon Imports
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';

const StyledMenu = styled((props) => (
  <Menu
    elevation={0}
    anchorOrigin={{
      vertical: 'bottom',
      horizontal: 'right'
    }}
    transformOrigin={{
      vertical: 'top',
      horizontal: 'right'
    }}
    {...props}
  />
))(({ theme }) => ({
  '& .MuiPaper-root': {
    borderRadius: 6,
    marginTop: theme.spacing(1),
    minWidth: 180,
    color:
      theme.palette.mode === 'light'
        ? 'rgb(55, 65, 81)'
        : theme.palette.grey[300],
    boxShadow:
      'rgb(255, 255, 255) 0px 0px 0px 0px, rgba(0, 0, 0, 0.05) 0px 0px 0px 1px, rgba(0, 0, 0, 0.1) 0px 10px 15px -3px, rgba(0, 0, 0, 0.05) 0px 4px 6px -2px',
    '& .MuiMenu-list': {
      padding: '4px 0'
    }
  }
}));

const DropdownButton = ({ title, menus, onClickMenuItem, ...btnProps }) => {
  // options for dropdown beside launch button
  const [anchorEl, setAnchorEl] = React.useState(null);
  const openOptions = Boolean(anchorEl);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <>
      <Button
        {...btnProps}
        id="demo-customized-button"
        aria-controls={openOptions ? 'demo-customized-menu' : undefined}
        aria-haspopup="true"
        aria-expanded={openOptions ? 'true' : undefined}
        variant="contained"
        onClick={handleClick}
        endIcon={<ArrowDropDownIcon />}
      >
        {title}
      </Button>
      {menus?.length ? (
        <StyledMenu
          id="demo-customized-menu"
          MenuListProps={{
            'aria-labelledby': 'demo-customized-button'
          }}
          anchorEl={anchorEl}
          open={openOptions}
          onClose={handleClose}
        >
          {menus.map((menu) => (
            <MenuItem
              key={menu.key}
              onClick={() => {
                onClickMenuItem(menu.key);
                handleClose();
              }}
              disableRipple
            >
              {menu.value}
            </MenuItem>
          ))}
        </StyledMenu>
      ) : null}
    </>
  );
};

export default DropdownButton;
