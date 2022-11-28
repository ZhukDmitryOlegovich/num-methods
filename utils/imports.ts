/* eslint-disable import/prefer-default-export */
export const imports = (a: string) => fetch(a, {
	headers: {
		Accept: 'application/json',
	},
}).then((e) => e.json()) as Promise<[number, number, number][]>;
