import React from 'react';
// import Image from 'next/image';
import Link from '@mui/material/Link';
import Typography from '@mui/material/Typography';
import Box from '@mui/system/Box';
import './footer.module.scss';

const Footer = () => {
  return (
    <Box
      sx={{ display: 'flex', justifyContent: 'center' }}
      id={'footer-container'}
    >
      <Typography
        component="div"
        variant="body2"
        align="center"
        className="secondaryText"
        id={'footer-copyright'}
      >
        {/* <div className="brandLogo" id={'footer-brand-logo-box'}>
          <Image
            src="/images/Logo_footer.png"
            alt="Logo"
            width={384}
            height={74}
            id={'footer-brand-logo'}
          />
        </div> */}
        {'Copyright © '} {new Date().getFullYear()}{' '}
        <Link
          href="https://thoughtcastowners.com/"
          target="_blank"
          className="secondaryLink"
          id={'footer-link'}
        >
          thoughtcastowners.com.
          <br />
        </Link>{' '}
      </Typography>
    </Box>
  );
};

export default Footer;
