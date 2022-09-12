const createTable = (data: (string | number | (string | number)[])[][]) => {
	const table = document.createElement('table');
	data.forEach((data2) => {
		const tr = document.createElement('tr');
		data2.forEach((value) => {
			const td = document.createElement('td');
			td.innerHTML = Array.isArray(value) ? value.map(String).join('<br>') : String(value);
			tr.appendChild(td);
		});
		table.appendChild(tr);
	});
	return table;
};

const SQRT = '√' as const;

(() => {
	const node = document.getElementById('lab1-testcircle');

	if (!node) {
		return;
	}

	const approximate = [
		['Math.SQRT2', Math.SQRT2],
		['7 / 5', 7 / 5],
		['17 / 12', 17 / 12],
	] as const;

	const functions = [
		[`(${SQRT}2 - 1)^6`, (s2: number) => (s2 - 1) ** 6, (s2: number) => 6 * (s2 - 1) ** 5],
		[`(3 - 2${SQRT}2)^3`, (s2: number) => (3 - 2 * s2) ** 3, (s2: number) => -6 * (3 - 2 * s2) ** 2],
		[`99 - 70${SQRT}2`, (s2: number) => 99 - 70 * s2, () => -70],
	] as const;

	// from https://www.wolframalpha.com/input?i=%28sqrt%282%29-1%29%5E6
	const origin = 0.0050506338833465838817893053211345001229687236136348776324183406;

	node.appendChild(createTable([
		['', ...functions.map(([name]) => name)],
		...approximate.map(([name, s2]) => [name, ...functions.map(([, f, f2]) => {
			const res = f(s2);
			const diff = (res - origin) / origin * 100;
			const diff2 = f2(Math.SQRT2) * Math.abs(Math.SQRT2 - s2) / origin * 100;
			return [
				res,
				`(${diff > 0 ? '+' : ''}${diff.toPrecision(5)}%)`,
				`(${diff2 > 0 ? '+' : ''}${diff2.toPrecision(5)}%)`,
			];
		})]),
	]));
})();
