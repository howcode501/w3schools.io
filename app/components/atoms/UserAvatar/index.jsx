import React from 'react';
import Avatar from '@mui/material/Avatar';
import Badge from '@mui/material/Badge';
import IconButton from '@mui/material/IconButton';
import RemoveCircleIcon from '@mui/icons-material/RemoveCircle';

const UserAvatar = ({
  id,
  icon,
  name,
  onDelete,
  removable = false,
  ...props
}) => {
  return (
    <Badge
      badgeContent={
        removable && icon ? (
          <IconButton
            size="small"
            color="error"
            aria-label="delete"
            title="Delete"
            onClick={onDelete}
          >
            <RemoveCircleIcon color="error" />
          </IconButton>
        ) : (
          0
        )
      }
    >
      <Avatar id={id} src={icon} {...props}>
        {name?.charAt(0)?.toUpperCase() + name?.charAt(1)?.toUpperCase()}
      </Avatar>
    </Badge>
  );
};

export default UserAvatar;
