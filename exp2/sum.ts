export const sum = (n: number, getValue: (index: number) => number, from = 0) => {
	let ans = 0;
	for (let i = 0; i < n; i++) {
		ans += getValue(from + i);
	}
	return ans;
};
