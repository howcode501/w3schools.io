import Router from 'next/router';
import { useEffect, useRef } from 'react';

const useWarnIfUnsavedChanges = (dirty, callback) => {
  // We need to ref to it then we can access to it properly in callback properly
  const ref = useRef(dirty);
  ref.current = dirty;

  useEffect(() => {
    const handleRouteChange = () => {
      // In this case we don't allow to go target path like this
      // we can show modal to tell user here as well
      if (ref.current && !callback()) {
        // push back within shallow method
        throw 'Abort route change. Please ignore this error.';
      }
    };

    // We listen to this event to determine whether to redirect or not
    Router.events.on('routeChangeStart', handleRouteChange);

    return () => {
      Router.events.off('routeChangeStart', handleRouteChange);
    };
  }, []);
};

export default useWarnIfUnsavedChanges;
