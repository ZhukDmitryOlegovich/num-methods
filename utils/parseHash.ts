// eslint-disable-next-line import/prefer-default-export
export const parseHash = () => decodeURIComponent(window.location.hash).slice(1).split('#').map((e) => e.split(':'))
	// eslint-disable-next-line no-return-assign, no-sequences
	.reduce<Record<string, string>>((accum, [key, value]) => (accum[key] = value || '1', accum), {});
