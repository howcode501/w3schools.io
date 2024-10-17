import React from 'react';

import Alert from '@mui/material/Alert';
import Badge from '@mui/material/Badge';
import Tooltip from '@mui/material/Tooltip';

const BadgeTooltip = ({
  children,
  title,
  severity,
  placement,
  tooltipIcon
}) => {
  return (
    <Badge
      badgeContent={
        <Tooltip
          title={<Alert severity={severity}>{title}</Alert>}
          placement={placement}
          componentsProps={{
            tooltip: {
              sx: {
                bgcolor: 'transparent',
                maxWidth: '500px'
              }
            }
          }}
          PopperProps={{
            modifiers: [
              {
                name: 'offset',
                options: {
                  offset: [8, -8]
                }
              }
            ]
          }}
        >
          {tooltipIcon}
        </Tooltip>
      }
      color="info"
      sx={{
        '& .MuiBadge-badge': {
          backgroundColor: 'transparent',
          padding: '0',
          height: 'auto',
          borderRadius: '12px',
          transform: 'translate(100%, -12px)'
        }
      }}
    >
      {children}
    </Badge>
  );
};

export default BadgeTooltip;
