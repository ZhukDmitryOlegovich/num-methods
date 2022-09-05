/* eslint-disable import/prefer-default-export */

import { Matrix } from './Matrix';
import type { FixedArr } from './types';

export class Vector<A extends number> extends Matrix<A, 1> {
	constructor(vector: FixedArr<A, number>) {
		super([vector] as const);
	}

	static fromMatrix<AA extends number>(matrix: Matrix<AA, 1>) {
		return new Vector(matrix.matrix[0]);
	}

	scalar(other: Vector<A>) {
		return this.transpose().mul(other).matrix[0];
	}

	norma() {
		return this.scalar(this);
	}
}
