import React from 'react';

const useCacheAsyncValidator = (asyncHandler) => {
  const [cache, setCache] = React.useState();
  const [valid, setValid] = React.useState(false);

  const cacheValidator = async (value) => {
    if (value !== cache) {
      setCache(value);
      const isValid = await asyncHandler(value);
      setValid(isValid);
      return isValid;
    }

    return valid;
  };

  return [cacheValidator];
};

export default useCacheAsyncValidator;
