export const handleError = (error) => {
  if (error.response) {
    return error.response.data.message || 'An error occurred';
  } else if (error.request) {
    return 'Network error. Please check your connection.';
  } else {
    return error.message || 'An unexpected error occurred';
  }
};

export const handleApiError = (error, defaultMessage = 'An error occurred') => {
  try {
    if (error.response?.data?.message) {
      return error.response.data.message;
    }
    if (error.response?.data?.errors?.[0]?.msg) {
      return error.response.data.errors[0].msg;
    }
    return defaultMessage;
  } catch {
    return defaultMessage;
  }
};
