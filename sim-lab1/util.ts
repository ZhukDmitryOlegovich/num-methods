export const verbose = (...args: any[]) => {
	if (Number(process.env.VERBOSE)) {
		// eslint-disable-next-line no-console
		console.log(...args);
	}
};

export type InputType = { g: number, v0: number, alpfa: number, r: number /* 1.29 */, n: number, m: number, cf: number /* 0.15 */, s: number };

// eslint-disable-next-line import/prefer-default-export
export const solveGalileo = ({
	g, alpfa, v0,
}: InputType) => v0 * v0 * Math.sin(2 * alpfa) / g;

export const solveGalileoHeight = ({
	g, alpfa, v0,
}: InputType) => (v0 * Math.sin(alpfa)) ** 2 / (2 * g);

export const solveIterate = ({
	g, alpfa, v0, r, n, m, cf, s,
}: InputType) => {
	const k = r * cf * s / (2 * m);

	const simpleT = 2 * v0 * Math.sin(alpfa) / g;
	const dt = simpleT / n;

	let x = 0;
	let y = 0;
	let vx = v0 * Math.cos(alpfa);
	let vy = v0 * Math.sin(alpfa);

	while (y > 0 || vy > 0) {
		x += dt * vx;
		y += dt * vy;
		vx -= dt * k * vx / m;
		vy -= dt * (g + k / m * vy);
	}

	return x;
};

export const solveRungeKutta = ({
	v0, alpfa, n, r, s, cf, m, g,
}: InputType) => {
	const k = r * cf * s / (2 * m);

	const Ts = 0;
	const Te = 1000;
	let Y = [0, 0, v0 * Math.cos(alpfa), v0 * Math.sin(alpfa)];
	const ff = (t: number, [x, y, vx, vy]: number[]) => [
		vx,
		vy,
		-k * Math.sqrt(vx ** 2 + vy ** 2) * vx,
		-k * Math.sqrt(vx ** 2 + vy ** 2) * vy - g,
	];

	let T = Ts;
	const h = (Te - Ts) / n;
	// console.log({h});
	for (let iii = 0; iii < n; iii++) {
		const k1 = ff(T, Y);
		const k2 = ff(T + h / 2, Y.map((y, i) => y + h * k1[i] / 2));
		const k3 = ff(T + h / 2, Y.map((y, i) => y + h * k2[i] / 2));
		const k4 = ff(T + h / 2, Y.map((y, i) => y + h * k3[i]));
		T += h;
		Y = Y.map((y, i) => y + h / 6 * (k1[i] + 2 * (k2[i] + k3[i]) + k4[i]));

		if (Y[1] < 0) break;
	}

	return Y[0];
};

export const solveRungeKuttaHeight = ({
	v0, alpfa, n, r, s, cf, m, g,
}: InputType) => {
	const k = r * cf * s / (2 * m);

	const Ts = 0;
	const Te = 1000;
	let Y = [0, 0, v0 * Math.cos(alpfa), v0 * Math.sin(alpfa)];
	const ff = (t: number, [x, y, vx, vy]: number[]) => [
		vx,
		vy,
		-k * Math.sqrt(vx ** 2 + vy ** 2) * vx,
		-k * Math.sqrt(vx ** 2 + vy ** 2) * vy - g,
	];

	let T = Ts;
	const h = (Te - Ts) / n;
	// console.log({h});
	for (let iii = 0; iii < n; iii++) {
		const k1 = ff(T, Y);
		const k2 = ff(T + h / 2, Y.map((y, i) => y + h * k1[i] / 2));
		const k3 = ff(T + h / 2, Y.map((y, i) => y + h * k2[i] / 2));
		const k4 = ff(T + h / 2, Y.map((y, i) => y + h * k3[i]));
		T += h;
		const Yn = Y.map((y, i) => y + h / 6 * (k1[i] + 2 * (k2[i] + k3[i]) + k4[i]));

		if (Yn[1] < Y[1]) break;

		Y = Yn;
	}

	return Y[1];
};
