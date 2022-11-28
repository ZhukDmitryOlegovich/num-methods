/* eslint-disable import/prefer-default-export */
export const imports = (a) => fetch(a, {
    headers: {
        Accept: 'application/json',
    },
}).then((e) => e.json());
