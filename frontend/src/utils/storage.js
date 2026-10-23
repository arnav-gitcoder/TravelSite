const STORAGE_KEY = 'travel_app_data';

export const saveToLocalStorage = (key, value) => {
  try {
    const data = localStorage.getItem(STORAGE_KEY) || '{}';
    const parsed = JSON.parse(data);
    parsed[key] = value;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed));
  } catch (error) {
    console.error('Storage error:', error);
  }
};

export const getFromLocalStorage = (key) => {
  try {
    const data = localStorage.getItem(STORAGE_KEY) || '{}';
    const parsed = JSON.parse(data);
    return parsed[key];
  } catch (error) {
    console.error('Storage error:', error);
    return null;
  }
};

export const removeFromLocalStorage = (key) => {
  try {
    const data = localStorage.getItem(STORAGE_KEY) || '{}';
    const parsed = JSON.parse(data);
    delete parsed[key];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed));
  } catch (error) {
    console.error('Storage error:', error);
  }
};
