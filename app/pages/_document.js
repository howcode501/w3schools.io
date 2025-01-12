//This code is used to help NextJS Handle ServerSide Renders, and to prevent it from rendering some CSS that may break while using Material UI
//Section Import
//React Imports
import React from 'react';

//Material UI Imports
//Application Imports
// import createEmotionCache from '../styles/createEmotionCache';
import theme from '../themes/localtheme';
import { GOOGLE_RECAPTCHA } from '../helpers/config';

//NextJS Imports
import Document, { Head, Html, Main, NextScript } from 'next/document';
import Script from 'next/script';

//External Module Imports
// import createEmotionServer from '@emotion/server/create-instance';

//Section Main Function
//The Main Function
export default class MyDocument extends Document {
  render() {
    return (
      <Html lang="en">
        <Head title="Thoughtcastowners App Store">
          {/* PWA primary color */}
          <meta name="theme-color" content={theme.palette.primary.main} />
          <Script
            src={`https://www.google.com/recaptcha/api.js?render=${GOOGLE_RECAPTCHA}`}
            strategy="beforeInteractive"
          />
          <link
            rel="stylesheet"
            href="https://fonts.googleapis.com/css?family=Roboto:300,400,500,700&display=swap"
          />
        </Head>
        <body id={'body'}>
          <Main id={'main-insert'} />
          <NextScript id={'next-insert'} />
        </body>
      </Html>
    );
  }
}

// `getInitialProps` belongs to `_document` (instead of `_app`),
// it's compatible with static-site generation (SSG).
MyDocument.getInitialProps = async (ctx) => {
  // Resolution order
  //
  // On the server:
  // 1. app.getInitialProps
  // 2. page.getInitialProps
  // 3. document.getInitialProps
  // 4. app.render
  // 5. page.render
  // 6. document.render
  //
  // On the server with error:
  // 1. document.getInitialProps
  // 2. app.render
  // 3. page.render
  // 4. document.render
  //
  // On the client
  // 1. app.getInitialProps
  // 2. page.getInitialProps
  // 3. app.render
  // 4. page.render

  const originalRenderPage = ctx.renderPage;

  // You can consider sharing the same emotion cache between all the SSR requests to speed up performance.
  // However, be aware that it can have global side effects.
  // const cache = createEmotionCache();
  // const { extractCriticalToChunks } = createEmotionServer(cache);

  ctx.renderPage = () =>
    originalRenderPage({
      //eslint-disable-next-line react/display-name
      // enhanceApp: (App) => (props) => <App emotionCache={cache} {...props} />
    });

  const initialProps = await Document.getInitialProps(ctx);
  // This is important. It prevents emotion to render invalid HTML.
  // See https://github.com/mui-org/material-ui/issues/26561#issuecomment-855286153
  // const emotionStyles = extractCriticalToChunks(initialProps.html);
  // const emotionStyleTags = emotionStyles.styles.map((style) => (
  //  <style
  //    data-emotion={`${style.key} ${style.ids.join(' ')}`}
  //    key={style.key}
  // eslint-disable-next-line react/no-danger
  //    dangerouslySetInnerHTML={{ __html: style.css }}
  //  />
  // ));

  return {
    ...initialProps,
    // Styles fragment is rendered after the app and page rendering finish.
    styles: [...React.Children.toArray(initialProps.styles)]
  };
};
