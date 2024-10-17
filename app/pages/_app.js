//Section Import
//React Imports
import React, { useEffect, useState } from 'react';
import { SnackbarProvider } from 'notistack';

//Material UI Imports
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Modal from '@mui/material/Modal';

//Application Imports
import localTheme from '../themes/localtheme';
import wrapper from '../store/wrapper';
import DashboardLayout from '../Layouts/dashboardLayout';
import Unauthorized from './unauthorized';
import Footer from '../components/Footer';
import '../styles/globals.scss';

//NextJS Imports
import Head from 'next/head';
import { useRouter } from 'next/router';

//External Module Imports
import { MAX_NOTIFICATION_COUNT } from '../helpers/constants';
// import createEmotionCache from '../styles/createEmotionCache';
import TokenService from '../services/token';
import { useApi } from '../hooks';

// Client-side cache, shared for the whole session of the user in the browser.
// const clientSideEmotionCache = createEmotionCache();

//Section Main Function
function ThoughtcastownersApp(props) {
  //Use the Router to Navigate
  let router = useRouter();
  const [modalOpen, setModalOpen] = useState(false);
  const [passCount, setPassCount] = useState(0);
  const [title, setTitle] = useState('thoughtcastowners');
  const { get } = useApi();

  const handleClose = () => {
    //Do Nothing
  };

  //TODO Load the page that they tried to go to, after Login
  //So first, let's make a note of what page they were trying to go to!

  const { Component, pageProps } = props; // emotionCache = clientSideEmotionCache,
  //Applies the specified Layout, if not specified, it applies the dashboard by default
  const Layout = Component.Layout || DashboardLayout;
  // onst [tokenValue, setToken] = useState(null);
  const [isAllowed, setIsAllowed] = useState(true);
  //  let socket = null;

  const auth = TokenService.getUserIsLoggedIn();
  // console.log("auth " + auth);
  const pathName = router.asPath;
  let role = undefined;
  let pageString = '';
  const token = TokenService.getLocalAccessToken();

  useEffect(() => {
    async function fetchData() {
      await get('/tenantinfo/instancename')
        .then((res) => {
          if (res && res.data && res.data.instanceName) {
            setTitle(res.data.instanceName);
          } else {
            setTitle('ThoughtCast Owners Portal');
          }
        })
        .catch(() => {});
    }

    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router.asPath]);

  // Check to see if it's an unprotected page
  const CheckUnProtected = async () => {
    // List of UnProtected Paths
    const unprotectedPages = [
      '/login',
      '/login/step2',
      '/password',
      '/password/forgot-password',
      '***/password/forgot-password',
      '/password/confirm1',
      '/password/reset-password',
      '***/password/reset-password',
      '/login/nomatch',
      '/signup',
      '/'
    ];

    // Check to see if path is an allowed unprotected page
    if (unprotectedPages.indexOf(pathName) >= 0) {
      // If it is, close the Please Wait Modal
      return true;
      // If it's not, do more work
    } else {
      // Roll through unprotected array
      for (let i = 0; i < unprotectedPages.length; i++) {
        if (unprotectedPages[i].includes('***')) {
          pageString = unprotectedPages[i].replace('***', '');

          if (pathName.startsWith(pageString)) {
            return true;
          }
        }
      }
    }

    // This page does not appear to be a protected page
    return false;
  };

  const renderPageOnRole = async () => {
    //First check to see if they already have a token

    //See if the Token is set
    if (token) {
      // Close the Please Wait Modal
      setModalOpen(false);
      setPassCount(3);

      // Now Let's Check Permissions
      let tokenData = undefined;

      // If they are authenticated start a socket
      if (auth != undefined) {
        tokenData = TokenService.getDecodedToken();
        role = tokenData.roles[0];
      } else {
        setModalOpen(true);
      }

      const protectedFromUser = [
        '/users',
        '/groups',
        '/permissions',
        '/audit-logs',
        '/servers',
        '/system-config',
        '/regions',
        '/virtualization-pools'
      ];
      const protectedFromAdmin = ['/regions', '/virtualization-pools'];

      if (role === 'user') {
        if (pathName.match(/.*users\/profile/)) {
          setIsAllowed(true);
        } else {
          const protectedPaths = [...protectedFromAdmin, ...protectedFromUser];
          if (protectedPaths.some((path) => pathName.startsWith(path))) {
            setIsAllowed(false);
          } else {
            setIsAllowed(true);
          }
        }
      }

      if (role === 'administrator') {
        // console.log("Getting here");
        if (protectedFromAdmin.some((path) => pathName.startsWith(path))) {
          setIsAllowed(false);
        } else {
          setIsAllowed(true);
        }
      } else if (role === 'msp') {
        setIsAllowed(true);
      }

      // There isn't a token, so we need to handle this page.
    } else {
      // Check to see if it's unprotected
      const pageStatus = await CheckUnProtected();
      // console.log("Not Logged In");
      // console.log("Page Status " + pageStatus);

      if (
        pageStatus ||
        pathName === '/unauthorized' ||
        pathName === '/invalid-access'
      ) {
        // Close the Please Wait Modal
        setModalOpen(false);
        setPassCount(passCount + 1);
      } else {
        // Make sure the Modal is open
        setModalOpen(true);
        setPassCount(passCount + 1);
      }
      // 404 error hide modal
      if (props !== undefined) {
        if (props.router.state.route === '/_error') {
          setModalOpen(false);
        }
      }
    }
  };

  useEffect(() => {
    renderPageOnRole();
  }, [renderPageOnRole]);

  useEffect(() => {
    const waitRetry = () => {
      if (passCount < 3) {
        setPassCount(passCount + 1);
        // console.log("First Pass 2");
        setTimeout(() => {
          // console.log("First Pass Completed " + passCount);
          renderPageOnRole();
        }, 1500);
      } else {
        // console.log("We should redirect now");
        // window.location = "/login";
      }
    };

    waitRetry();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [passCount]);

  useEffect(() => {}, []);

  const modalStyle = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 400,
    bgcolor: 'background.paper',
    border: '2px solid #000',
    boxShadow: 24,
    p: 4
  };

  const ComponentToRender = isAllowed ? Component : Unauthorized;
  return (
    //Connects to EmotionCache Above for Caching the Layout and Styles
    <>
      <Head>
        <title id="app-title">{title}</title>
        <meta name="viewport" content="initial-scale=1, width=device-width" />
        <meta charset="utf-8" />
        <link rel="icon" href="/images/favicon.png" />
      </Head>
      {/* CssBaseline kickstart an elegant, consistent, and simple baseline to build upon. */}
      <CssBaseline />
      <SnackbarProvider
        maxSnack={MAX_NOTIFICATION_COUNT}
        anchorOrigin={{ horizontal: 'right', vertical: 'top' }}
      >
        {/* Defines the Theme from the Themes Directory */}
        <ThemeProvider theme={localTheme}>
          {/* Uses the Layout Switch Above to determine which Layout to use for the page */}
          <Layout>
            <Modal
              open={modalOpen}
              onClose={handleClose}
              aria-labelledby="modal-modal-title"
              aria-describedby="modal-modal-description"
              id="user-validation-modal"
            >
              <Box sx={modalStyle}>
                <Typography
                  id="validate-modal-title"
                  variant="h6"
                  component="h2"
                >
                  Please wait!
                </Typography>
                <Typography id="validate-modal-description" sx={{ mt: 2 }}>
                  We are validating your account.
                </Typography>
              </Box>
            </Modal>
            <ComponentToRender {...pageProps} setTitle={setTitle} />
          </Layout>
          <Box component="div" mt={20} id={'footer-box-inside'}>
            <Footer />
          </Box>
        </ThemeProvider>
      </SnackbarProvider>
    </>
  );
}

//Default Export
export default wrapper.withRedux(ThoughtcastownersApp);
