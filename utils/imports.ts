const cashe: Record<string, Promise<[number, number, number][]>> = {};

/* eslint-disable import/prefer-default-export */
export const imports = (a: string) => {
	cashe[a] ??= fetch(a, {
		headers: {
			Accept: 'application/json',
		},
	}).then((e) => e.json()) as Promise<[number, number, number][]>;
	return cashe[a];
};
