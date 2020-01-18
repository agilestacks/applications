export const localStorageGet = (name) => window.localStorage &&  window.localStorage.getItem(name);
export const localStorageSet = (name, value) => window.localStorage &&  window.localStorage.setItem(name, value);
