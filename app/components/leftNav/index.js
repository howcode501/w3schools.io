//Import React
import React from 'react';

//Import Core
import List from '@mui/material/List';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import SuperAdminNav from '../superAdminNav';
import Link from 'next/link';
import { useRouter } from 'next/router';

//Import Icons
import AppIcon from '@mui/icons-material/Apps';
import ListItemButton from '@mui/material/ListItemButton';

const LeftNav = () => {
  const router = useRouter();
  return (
    <div>
      <List component="nav">
        <Link href="/applications" passHref>
          <ListItemButton
            key="My Effects"
            id={'my-effects-button'}
            selected={router.pathname === '/' ? true : false}
          >
            <ListItemIcon title="My Effects">
              <AppIcon />
            </ListItemIcon>
            <ListItemText title="My Effects" primary="My Effects" />
          </ListItemButton>
        </Link>
      </List>
      <SuperAdminNav />
    </div>
  );
};

export default LeftNav;
