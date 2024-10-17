//Section Import
import React, { useState, useEffect } from 'react';
import { isMobile } from 'react-device-detect';
import { InView } from 'react-intersection-observer';
import htmlParser from 'html-react-parser';
import moment from 'moment';

//Material Core Imports
import Avatar from '@mui/material/Avatar';
import Badge from '@mui/material/Badge';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import InfoIcon from '@mui/icons-material/Info';
import ListItemIcon from '@mui/material/ListItemIcon';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import MuiAppBar from '@mui/material/AppBar';
import MuiDrawer from '@mui/material/Drawer';
import { styled } from '@mui/material/styles';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Link from 'next/link';

//Material Icons
import AccountCircle from '@mui/icons-material/AccountCircle';
import CloseIcon from '@mui/icons-material/Close';
import NotificationsIcon from '@mui/icons-material/Notifications';
import HelpIcon from '@mui/icons-material/Help';
import MenuIcon from '@mui/icons-material/Menu';
import CheckIcon from '@mui/icons-material/Check';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import Logout from '@mui/icons-material/Logout';
import Tooltip from '@mui/material/Tooltip';
import SupportAgent from '@mui/icons-material/Support';

//Component Imports
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { useRouter } from 'next/router';
import LeftNav from '../components/leftNav';
import AboutModal from '../components/about_modal';
import { useApi } from '../hooks';
import AuthService from '../services/auth';
import { toggleLeftDrawer } from '../store/reducers/dashboard/actions';
import { LEFT_DRAWER_WIDTH } from '../helpers/constants';
import TokenService from '../services/token';

const MENU_NOTIFICATIONS = 'notifications_menu';
const MENU_PROFILE = 'profile_menu';
const MENU_ABOUT = 'about_menu';

const openedMixin = (theme) => ({
  width: LEFT_DRAWER_WIDTH,
  transition: theme.transitions.create('width', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.enteringScreen
  }),
  overflowX: 'hidden'
});

const closedMixin = (theme) => ({
  transition: theme.transitions.create('width', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen
  }),
  overflowX: 'hidden',
  width: `calc(${theme.spacing(7)} + 1px)`,
  [theme.breakpoints.up('sm')]: {
    width: `calc(${theme.spacing(9)} + 1px)`
  }
});

const DrawerHeader = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'flex-end',
  padding: theme.spacing(0, 1),
  // necessary for content to be below app bar
  ...theme.mixins.toolbar
}));

const Drawer = styled(MuiDrawer, {
  shouldForwardProp: (prop) => prop !== 'open'
})(({ theme, open }) => ({
  width: LEFT_DRAWER_WIDTH,
  flexShrink: 0,
  whiteSpace: 'nowrap',
  boxSizing: 'border-box',
  ...(open && {
    ...openedMixin(theme),
    '& .MuiDrawer-paper': openedMixin(theme)
  }),
  ...(!open && {
    ...closedMixin(theme),
    '& .MuiDrawer-paper': closedMixin(theme)
  })
}));

//Section App Bar
const AppBar = styled(MuiAppBar, {
  shouldForwardProp: (prop) => prop !== 'open'
})(({ theme, open }) => ({
  zIndex: theme.zIndex.drawer + 1,
  transition: theme.transitions.create(['width', 'margin'], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen
  }),
  ...(open && {
    marginLeft: LEFT_DRAWER_WIDTH,
    width: `calc(100% - ${LEFT_DRAWER_WIDTH}px)`,
    transition: theme.transitions.create(['width', 'margin'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen
    })
  })
}));

const menuPaperProps = {
  elevation: 0,
  sx: {
    overflow: 'visible',
    filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
    mt: 1.5,
    minWidth: 240,
    maxWidth: 320,
    '& .MuiAvatar-root': {
      width: 32,
      height: 32,
      ml: -0.5,
      mr: 1
    },
    '&:before': {
      content: '""',
      display: 'block',
      position: 'absolute',
      top: 0,
      right: 16,
      width: 10,
      height: 10,
      bgcolor: 'background.paper',
      transform: 'translateY(-50%) rotate(45deg)',
      zIndex: 0
    }
  }
};

// Section Notifications Popover
const NotificationItem = React.forwardRef(({ children, ...props }, ref) => (
  <Box
    ref={ref}
    {...props}
    py={1}
    px={2}
    sx={{ ...props.sx, whiteSpace: 'pre-wrap' }}
  >
    {children}
  </Box>
));
NotificationItem.displayName = 'NotificationItem';

//Section Profile Menu
const ProfileMenu = ({ open, anchorEl, onClose, onSelect }) => {
  return (
    <React.Fragment>
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={onClose}
        onClick={onClose}
        PaperProps={menuPaperProps}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <MenuItem onClick={() => onSelect('profile')}>
          <Avatar /> Edit Profile
        </MenuItem>
        <Divider />
        <MenuItem onClick={() => onSelect('logout')}>
          <ListItemIcon>
            <Logout fontSize="small" />
          </ListItemIcon>
          Logout
        </MenuItem>
      </Menu>
    </React.Fragment>
  );
};

//Section Help Menu
const HelpMenu = ({ open, anchorEl, onClose, onSelect }) => {
  return (
    <React.Fragment>
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={onClose}
        onClick={onClose}
        PaperProps={menuPaperProps}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <MenuItem
          key={'About_modal'}
          onClick={() => onSelect('about')}
          className="secondaryLink"
        >
          <InfoIcon color="disabled" />
          &nbsp;
          <Typography ml={1}>About thoughtcastowners</Typography>
        </MenuItem>
        <Link
          style={{
            textDecoration: 'none',
            color: 'black'
          }}
          target="_blank"
          href={'https://www.thoughtcastmagic.com/help'}
        >
          <MenuItem key={'Support_request'} className="supportRequestLink">
            <SupportAgent color="disabled" />
            &nbsp;
            <Typography ml={1}>Support Request</Typography>
          </MenuItem>
        </Link>
      </Menu>
    </React.Fragment>
  );
};

const NotificationsMenu = ({
  open,
  anchorEl,
  onClose,
  notifications,
  onDismissAll,
  onRead,
  ...props
}) => {
  const handleInView = (inView, notification) => {
    if (inView && !notification.is_read) {
      onRead(notification);
    }
  };

  return (
    <Menu
      {...props}
      anchorEl={anchorEl}
      open={open}
      onClose={onClose}
      PaperProps={menuPaperProps}
      transformOrigin={{ horizontal: 'right', vertical: 'top' }}
      anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
    >
      <Box component="h3" my={1} px={2}>
        Notifications
      </Box>
      {notifications.length ? (
        <Box display="flex" justifyContent="end" px={1}>
          <Button variant="text" size="small" onClick={onDismissAll}>
            Dismiss All
          </Button>
        </Box>
      ) : null}
      <Divider />
      <Box
        sx={{
          maxHeight: '25vh',
          overflowY: 'auto'
        }}
      >
        {notifications?.length ? (
          notifications.map((n, index) => (
            <InView
              onChange={(inView) => handleInView(inView, n)}
              key={n.id || index}
            >
              <NotificationItem
                sx={{
                  position: 'relative',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'start'
                }}
              >
                <Typography variant="h7" mb={1} color="primary">
                  {n.notification_type?.name}
                </Typography>
                {htmlParser(n.data?.message)}
                <Box sx={{ position: 'absolute', bottom: 0, right: 6 }}>
                  {moment.utc(n.created).fromNow()}
                </Box>
                <Box
                  display="flex"
                  alignItems="center"
                  sx={{ position: 'absolute', top: 16, right: 10 }}
                >
                  {n.is_read ? (
                    <CheckIcon fontSize="small" color="success" />
                  ) : (
                    <Badge color="error" variant="dot" invisible={false} />
                  )}
                </Box>
              </NotificationItem>
            </InView>
          ))
        ) : (
          <NotificationItem>No Recent Notifications</NotificationItem>
        )}
      </Box>
      <IconButton
        aria-label="close"
        size="small"
        sx={{ position: 'absolute', right: 6, top: 6 }}
        onClick={onClose}
      >
        <CloseIcon fontSize="small" />
      </IconButton>
    </Menu>
  );
};

//Section Main Function
function DashboardLayout({
  user: {
    client: { userData: user }
  },
  ...props
}) {
  const { get, post } = useApi();
  const router = useRouter();
  const [notifications, setNotifications] = useState([]);
  const [anchorEl, setAnchorEl] = useState(null);
  const [openedMenu, setOpenedMenu] = useState('');
  const [helpMenuDialog, setHelpMenuDialog] = useState(false);
  const [userDetails, setUserDetails] = useState([]);

  const newNotificationsCount = notifications.filter((n) => !n.is_read).length;
  const userData = TokenService.getUserData();

  useEffect(() => {
    get(`/api/users/profile`).then((response) => {
      setUserDetails(response.data.data.user);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (userData) {
      // For navbar always open for Desktop other than user role and close for mobile
      if (!isMobile && !userData?.roles.includes('user')) {
        props.dashboard.client.leftDrawer = true;
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userData]);

  // Load notifications interval
  // useEffect(() => {
  //   const loadNewNotifications = async () => {
  //     get(`/api/notifications`)
  //       .then((res) => {
  //         if (res.status === 200) {
  //           setNotifications(res.data?.data || []);
  //         }
  //       })
  //       .catch(() => {
  //         // TODO: Error handle
  //       });
  //   };

  //   loadNewNotifications();
  //   const getNotificationsInterval = setInterval(
  //     () => loadNewNotifications(),
  //     LOAD_DATA_INTERVAL
  //   );
  //   return () => {
  //     clearInterval(getNotificationsInterval);
  //   };
  // }, []);

  const closeMenu = () => {
    setAnchorEl(null);
    setOpenedMenu('');
  };
  const openMenu = (menu, anchorEl) => {
    setAnchorEl(anchorEl);
    setOpenedMenu(menu);
  };

  // Handle select menu item
  const handleSelectMenu = (menu) => {
    switch (menu) {
      case 'profile':
        router.push(`/users/profile`);
        break;

      case 'logout':
        // Clear out the session
        AuthService.logout();

        //Push them back to the login page
        router.push('/');
        break;

      case 'about':
        setHelpMenuDialog(true);
        break;

      default:
        break;
    }

    closeMenu();
  };

  // TODO: Mark Read a Notification
  const handleReadNotification = (n) => {
    if (!n?.id) return;

    get(`/api/notifications/mark-read/${n.id}`)
      .then((res) => {
        if (res.status === 200) {
          setNotifications((prevState) =>
            prevState.map((pn) =>
              pn.id === n.id ? { ...pn, is_read: true } : pn
            )
          );
        }
      })
      .catch(() => {
        // TODO: Proper error handle
      });
  };

  // TODO: Mark Read All Notifications
  const handleDismissAll = () => {
    const unread_notification_ids = notifications
      .filter((n) => !n.is_read)
      .map((n) => n.id);

    post('/api/notifications/read-many', {
      data: { ids: unread_notification_ids }
    })
      .then((res) => {
        if (res.status === 200) {
          setNotifications((preState) => {
            return preState.map((obj) => ({
              ...obj,
              is_read: true
            }));
          });
        }
      })
      .catch(() => {
        // TODO: Error handle
      })
      .finally(() => closeMenu());
  };

  //Section Main Return
  return (
    <>
      <AboutModal
        helpMenuDialog={helpMenuDialog}
        setHelpMenuDialog={setHelpMenuDialog}
      />
      <Box sx={{ display: 'flex' }} className="layout-head">
        <NotificationsMenu
          open={openedMenu === MENU_NOTIFICATIONS}
          anchorEl={anchorEl}
          onClose={closeMenu}
          notifications={notifications}
          onDismissAll={handleDismissAll}
          onRead={handleReadNotification}
        />
        <ProfileMenu
          open={openedMenu === MENU_PROFILE}
          anchorEl={anchorEl}
          onClose={closeMenu}
          onSelect={handleSelectMenu}
        />
        <HelpMenu
          open={openedMenu === MENU_ABOUT}
          anchorEl={anchorEl}
          onClose={closeMenu}
          onSelect={handleSelectMenu}
        />
        <AppBar position="fixed" open={props.dashboard.client.leftDrawer}>
          <Toolbar>
            <IconButton
              color="inherit"
              aria-label="open drawer"
              onClick={() => props.toggleLeftDrawer(true)}
              edge="start"
              sx={{
                marginRight: '34px',
                ...(props.dashboard.client.leftDrawer && { display: 'none' })
              }}
            >
              <MenuIcon />
            </IconButton>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              &nbsp;
            </Typography>
            <IconButton
              edge="end"
              aria-label={`show ${
                props.notifications?.length || 0
              } new notifications`}
              color="inherit"
              aria-describedby="notifications"
              aria-haspopup="true"
              onClick={(e) => openMenu(MENU_NOTIFICATIONS, e.currentTarget)}
            >
              <Badge
                badgeContent={newNotificationsCount}
                color="error"
                overlap="circular"
              >
                <NotificationsIcon style={{ fontSize: 40 }} />
              </Badge>
            </IconButton>

            <Tooltip
              disableFocusListener
              title={user?.username || userDetails?.username || 'Not Logged In'}
            >
              <IconButton
                edge="end"
                aria-label="account of current user"
                color="inherit"
                aria-describedby="account"
                aria-haspopup="true"
                onClick={(e) => openMenu(MENU_PROFILE, e.currentTarget)}
              >
                <AccountCircle style={{ fontSize: 40 }} />
              </IconButton>
            </Tooltip>
            <IconButton
              edge="end"
              aria-label="Get Help"
              color="inherit"
              aria-describedby="help"
              aria-haspopup="true"
              onClick={(e) => openMenu(MENU_ABOUT, e.currentTarget)}
            >
              <HelpIcon style={{ fontSize: 40 }} />
            </IconButton>
          </Toolbar>
        </AppBar>
        <Drawer
          variant="permanent"
          open={props.dashboard.client.leftDrawer}
          ModalProps={{
            keepMounted: true // Better open performance on mobile.
          }}
        >
          <DrawerHeader>
            <IconButton onClick={() => props.toggleLeftDrawer(false)}>
              <ChevronLeftIcon aria-label="Menu Close Arrow" />
            </IconButton>
          </DrawerHeader>
          <Divider />
          <div style={{ paddingLeft: 5 }}>
            <LeftNav />
          </div>
        </Drawer>
        <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
          <DrawerHeader />
          {props.children}
        </Box>
      </Box>
    </>
  );
}

//Section Redux Map
const mapDispatchToProps = (dispatch) => {
  return {
    toggleLeftDrawer: bindActionCreators(toggleLeftDrawer, dispatch)
  };
};

//Section Default Export
export default connect((state) => state, mapDispatchToProps)(DashboardLayout);
