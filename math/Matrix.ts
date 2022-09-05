/* eslint-disable no-useless-constructor, import/prefer-default-export */

import type { FixedArr } from './types';
import { fromLength, sumArr } from './utils';

type SimpleMatrix<A extends number, B extends number> = FixedArr<B, FixedArr<A, number>>;

export class Matrix<A extends number, B extends number> {
	constructor(public matrix: SimpleMatrix<A, B>) { /* empty */ }

	countRows(): A {
		return this.matrix[0].length;
	}

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
}
