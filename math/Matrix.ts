/* eslint-disable no-useless-constructor, import/prefer-default-export */

import type { FixedArr, SimpleMatrix } from './types';
import { fromLength, map, sumArr } from './utils';

/**
 * A = Height \
 * B = Width \
 * A x B = Height x Width
 */
export class Matrix<A extends number, B extends number> {
	constructor(public matrix: SimpleMatrix<A, B>) { /* empty */ }

	clone(): Matrix<A, B> {
		return new Matrix<A, B>(
			fromLength(
				this.countColons(),
				(i) => [...this.colon(i)] as any as FixedArr<A, number>,
			),
		);
	}

	/**
	 * @return Height
	 */
	countRows(): A {
		return this.matrix[0].length;
	}

	/**
	 * @return Width
	 */
	countColons(): B {
		return this.matrix.length;
	}

	colon(i: number): FixedArr<A, number> {
		return this.matrix[i];
	}

	row(i: number): FixedArr<B, number> {
		return this.matrix.map((colon) => colon[i]) as any as FixedArr<B, number>;
	}

	add(other: Matrix<A, B>) {
		return new Matrix<A, B>(
			fromLength(
				this.countColons(),
				(i) => sumArr(this.colon(i), other.colon(i)),
			),
		);
	}

	transpose() {
		return new Matrix<B, A>(
			fromLength(
				this.countRows(),
				(i) => this.row(i),
			),
		);
	}

	mul<C extends number>(other: Matrix<B, C>): Matrix<A, C> {
		return new Matrix<A, C>(
			fromLength(
				other.countColons(),
				(i) => fromLength(
					this.countRows(),
					(j) => other.matrix[i].reduce(
						(accum, _, k) => accum + this.matrix[k][j] * other.matrix[i][k], 0,
					),
				),
			),
		);
	}

	mulN(other: number): Matrix<A, B> {
		return new Matrix<A, B>(map(this.matrix, (a) => map(a, (x) => x * other)));
	}

	normaMax(): number {
		let max = -Infinity;

		for (let i = 0; i < this.countRows(); i++) {
			let sum = 0;
			for (let j = 0; j < this.countColons(); j++) {
				sum += Math.abs(this.matrix[j][i]);
			}
			max = Math.max(max, sum);
		}

		return max;
	}
}
