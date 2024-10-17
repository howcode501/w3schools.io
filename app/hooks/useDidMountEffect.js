/*
 * File Created for APP Inc
 * Project: app
 * User: ***
 * Date: 10/19/2021
 */
import { useEffect, useRef } from 'react';

const useDidMountEffect = (func, deps) => {
  const didMount = useRef(false);

  useEffect(() => {
    if (didMount.current) func();
    else didMount.current = true;
  }, deps);
};

export default useDidMountEffect;
