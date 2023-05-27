import { FixedArr } from './FixedArr';

export const intersects = (
	x11: number, y11: number,
	x12: number, y12: number,
	x21: number, y21: number,
	x22: number, y22: number,
): FixedArr<2, number> | null => {
	const det = (x12 - x11) * (y22 - y21) - (x22 - x21) * (y12 - y11);
	if (det === 0) {
		return null;
	}
	const lambda = ((y22 - y21) * (x22 - x11) + (x21 - x22) * (y22 - y11)) / det;
	const gamma = ((y11 - y12) * (x22 - x11) + (x12 - x11) * (y22 - y11)) / det;
	if ((0 < lambda && lambda < 1) && (0 < gamma && gamma < 1)) {
		return [
			x11 + lambda * (x12 - x11),
			y11 + lambda * (y12 - y11),
		];
	}
	return null;
};
