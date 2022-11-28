const cashe = {};
/* eslint-disable import/prefer-default-export */
export const imports = (a) => {
    cashe[a] ?? (cashe[a] = fetch(a, {
        headers: {
            Accept: 'application/json',
        },
    }).then((e) => e.json()));
    return cashe[a];
};
