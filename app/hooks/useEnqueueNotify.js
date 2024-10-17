import { useSnackbar } from 'notistack';

const useEnqueueNotify = () => {
  const snackbarInstance = useSnackbar();

  const toggleNotify = (content, variant) => {
    if (!snackbarInstance) {
      return;
    }
    snackbarInstance.enqueueSnackbar(content, { variant });
  };

  return [toggleNotify];
};

export default useEnqueueNotify;
