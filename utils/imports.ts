const cashe: Record<string, Promise<any>> = {};

/* eslint-disable import/prefer-default-export */
export const importsJSON = <T = [number, number, number][]>(a: string) => {
	cashe[a] ??= fetch(a, {
		headers: {
			Accept: 'application/json',
		},
	}).then((e) => e.json());
	return cashe[a] as Promise<T>;
};
