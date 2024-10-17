/*
 * File Created for APP Inc
 * Project: nextjs-spike
 * User: ***
 * Date: 6/09/2022
 */
import React, { useEffect, useState } from 'react';
//Material UI Imports
import { Box } from '@mui/system';
//Application Imports
import { useApi } from '../../hooks';

export default function CustomerLogo() {
  const [tenantInfo, setTenantInfo] = useState(null);
  const apiContext = useApi();
  const apiRef = React.useRef(apiContext);

  useEffect(() => {
    apiRef.current.get('/tenantinfo').then((res) => {
      if (res && typeof res.data.data !== 'undefined') {
        setTenantInfo(res.data.data.tenantInfo);
      }
    });
  }, []);

  return (
    <>
      {tenantInfo !== null ? (
        <Box
          name={`customer-logo`}
          id="customer-logo"
          component="img"
          sx={{
            height: 100,
            width: 250,
            objectFit: 'contain',
            backgroundSize: '210px 63px',
            backgroundRepeat: 'no-repeat'
          }}
          alt={tenantInfo.instanceName}
          src={
            tenantInfo.instanceLogo
              ? tenantInfo.instanceLogo
              : '/images/default-instance-logo.png'
          }
        />
      ) : (
        ''
      )}
    </>
  );
}
