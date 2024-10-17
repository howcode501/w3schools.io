/*
 * File Created for APP Inc
 * Project: nextjs-spike
 * User: ***
 * Date: 8/26/2021
 */

//React Imports
import React, { useEffect, useState } from 'react';

// Import Services to get User's Information
import TokenService from '../../services/token';

//Material UI Imports
import Divider from '@mui/material/Divider';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';

//Material UI Icons
import PersonIcon from '@mui/icons-material/Person';
import SettingsIcon from '@mui/icons-material/Settings';
import AbcIcon from '@mui/icons-material/Abc';
import ShoppingBasketIcon from '@mui/icons-material/ShoppingBasket';
import EventRepeatIcon from '@mui/icons-material/EventRepeat';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import ApiIcon from '@mui/icons-material/Api';

//NextJS Imports
import Link from 'next/link';
import { useRouter } from 'next/router';
import store from '../../store';

//Application Imports

//External Imports

const SuperAdminNav = () => {
  //state variable that would be updated with user role
  const [user, setUser] = useState(null);
  // getting userRole data from useContext hook
  let userData = TokenService.getUserData();
  const router = useRouter();

  //method that would update the state variable with userRole
  useEffect(() => {
    setUser(userData);
  }, [userData]);

  const updateUser = () => {
    userData = TokenService.getUserData();
  };

  const unsubscribe = store.subscribe(updateUser);
  unsubscribe();

  return (
    <div id={'navigation-container'}>
      <Divider />
      {user && user?.roles[0] !== 'user' ? (
        <List component="nav">
          <Link href="/users" passHref>
            <ListItemButton
              key="Users"
              id={'users-listitem'}
              selected={router.pathname.includes('/users') ? true : false}
            >
              <ListItemIcon title="Users">
                <PersonIcon />
              </ListItemIcon>
              <ListItemText title="Users" primary="Users" />
            </ListItemButton>
          </Link>
          <Link href="/promo-codes" passHref>
            <ListItemButton
              key="promo-codes"
              id={'promo-codes-listitem'}
              selected={router.pathname.includes('/promo-codes') ? true : false}
            >
              <ListItemIcon title="Promo Codes">
                <AbcIcon />
              </ListItemIcon>
              <ListItemText title="Promo Codes" primary="Promo Codes" />
            </ListItemButton>
          </Link>
        </List>
      ) : null}
      {user && user?.roles[0] !== 'user' ? <Divider /> : null}
      {user && user?.roles[0] == 'msp' ? (
        <List component="nav">
          <Link href="/products" passHref>
            <ListItemButton
              key="products"
              id={'products-listitem'}
              selected={router.pathname.includes('/products') ? true : false}
            >
              <ListItemIcon title="Products">
                <ShoppingBasketIcon />
              </ListItemIcon>
              <ListItemText title="Products" primary="Products" />
            </ListItemButton>
          </Link>
          <Link href="/subscriptions" passHref>
            <ListItemButton
              key="subscriptions"
              id={'subscriptions-listitem'}
              selected={
                router.pathname.includes('/subscriptions') ? true : false
              }
            >
              <ListItemIcon title="Subscriptions">
                <EventRepeatIcon />
              </ListItemIcon>
              <ListItemText title="Subscriptions" primary="Subscriptions" />
            </ListItemButton>
          </Link>
          <Link href="/app-keys" passHref>
            <ListItemButton
              key="app-keys"
              id={'app-keys-listitem'}
              selected={router.pathname.includes('/app-keys') ? true : false}
            >
              <ListItemIcon title="APP Keys">
                <ApiIcon />
              </ListItemIcon>
              <ListItemText title="APP keys" primary="Api keys" />
            </ListItemButton>
          </Link>
          <Link href="/audit-logs" passHref>
            <ListItemButton
              key="audit-log"
              id={'audit-log-listitem'}
              selected={router.pathname.includes('/audit-logs') ? true : false}
            >
              <ListItemIcon title="Audit/Logging">
                <VerifiedUserIcon />
              </ListItemIcon>
              <ListItemText title="Audit/Logging" primary="Audit log" />
            </ListItemButton>
          </Link>
          <Link href="/system-config" passHref>
            <ListItemButton
              key="Setup"
              id={'system-config-listitem'}
              selected={
                router.pathname.includes('/system-config') ? true : false
              }
            >
              <ListItemIcon title="Setup">
                <SettingsIcon />
              </ListItemIcon>
              <ListItemText title="Setup" primary="Setup" />
            </ListItemButton>
          </Link>
        </List>
      ) : null}
    </div>
  );
};

export default SuperAdminNav;
