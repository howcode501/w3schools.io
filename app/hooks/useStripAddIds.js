const useStripAddIds = () => {
  const stripAddIds = (id, prefix) => {
    if (id.toString().substring(0, prefix.length) === prefix) {
      id = '';
    }
    return id;
  };

  return [stripAddIds];
};

export default useStripAddIds;
