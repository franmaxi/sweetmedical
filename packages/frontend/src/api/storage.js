/* eslint-disable no-restricted-globals */

/**
 * Wrapper de localStorage para evitar el error `no-restricted-globals`
 * de eslint-config-react-app en el resto del código.
 * El disable se aplica únicamente a este archivo.
 */
const storage = {
    get: (key) => localStorage.getItem(key),
    set: (key, value) => localStorage.setItem(key, value),
    remove: (key) => localStorage.removeItem(key),
};

export default storage;
