import React from 'react';

const useLocalTimezone = () => {
  const [localTimezone, setLocalTimezone] = React.useState('');

  React.useEffect(() => {
    const date = new Date();
    const dateStr = date.toString();
    // eslint-disable-next-line
    setLocalTimezone(dateStr.match(/\(([^\)]+)\)$/)[1]);
  }, []);

  return { localTimezone };
};

export default useLocalTimezone;
