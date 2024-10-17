import React, { useEffect } from 'react';
import { Container, Typography } from '@mui/material';
import { useApi } from '../../hooks';
import TokenService from '../../services/token';

export default function invalid() {
  //TODO Fix all of this code so that we do not have to use disable lines for it to work!
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const apiContext = useApi();
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const apiRef = React.useRef(apiContext);

  // eslint-disable-next-line react-hooks/rules-of-hooks
  useEffect(() => {
    async function fetchData() {
      // eslint-disable-next-line no-constant-condition
      if (true) {
        await apiRef.current
          .get('/auth/refresh-token')
          .then(async (res) => {
            let { accessToken } = res.data;
            await TokenService.getDecodedToken(accessToken);
          })
          .catch(() => {});
      }
    }
    fetchData();
  }, []);
  return (
    <Container component="main" maxWidth="md">
      <div className="mt-15">
        <Typography component="div" variant="h5" id="invalid-access-text">
          {
            'You do not have permissions for this application. Please contact your administrator if you have questions.'
          }
        </Typography>
      </div>
    </Container>
  );
}
