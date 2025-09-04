import { toast } from 'sonner';

export interface NotificationOptions {
  duration?: number;
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
}

export const useNotifier = () => {
  const showSuccess = (message: string, options?: NotificationOptions) => {
    toast.success(message, {
      duration: options?.duration || 4000,
      position: options?.position || 'top-right',
    });
  };

  const showError = (message: string, options?: NotificationOptions) => {
    toast.error(message, {
      duration: options?.duration || 6000,
      position: options?.position || 'top-right',
    });
  };

  const showInfo = (message: string, options?: NotificationOptions) => {
    toast.info(message, {
      duration: options?.duration || 4000,
      position: options?.position || 'top-right',
    });
  };

  const showWarning = (message: string, options?: NotificationOptions) => {
    toast.warning(message, {
      duration: options?.duration || 5000,
      position: options?.position || 'top-right',
    });
  };

  const showPromise = <T,>(
    promise: Promise<T>,
    loadingMessage: string,
    successMessage: (result: T) => string,
    errorMessage: (error: unknown) => string
  ) => {
    return toast.promise(promise, {
      loading: loadingMessage,
      success: (result) => successMessage(result),
      error: (error) => errorMessage(error),
    });
  };

  return {
    showSuccess,
    showError,
    showInfo,
    showWarning,
    showPromise,
  };
};