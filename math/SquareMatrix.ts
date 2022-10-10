/* eslint-disable no-useless-constructor, import/prefer-default-export */

import { Matrix } from './Matrix';
import type { SimpleMatrix } from './types';
import { fromLength } from './utils';
import { Vector } from './Vector';

export class SquareMatrix<A extends number> extends Matrix<A, A> {
	constructor(public matrix: SimpleMatrix<A, A>) {
		super(matrix);
	}

	static fromMatrix<AA extends number>(matrix: Matrix<AA, AA>) {
		return new SquareMatrix(matrix.matrix);
	}

	eliminationGaussian(
		other: Vector<A>,
		option: { smartColon?: boolean; smartRow?: boolean; } = {},
	) {
		const b = other.clone();
		const a = this.clone();
		const n = b.countRows();

		const left = fromLength(n, (i) => i);
		const right = fromLength(n, (i) => i);

		// Прямой ход
		for (let k = 0; k < n - 1; k++) {
			if (option.smartRow || option.smartColon) {
				let max1 = k;
				for (let j = k + 1; j < n && option.smartRow; j++) {
					if (
						Math.abs(a.matrix[left[max1]][right[k]])
						< Math.abs(a.matrix[left[j]][right[k]])
					) {
						max1 = j;
					}
				}

				let max2 = k;
				for (let j = k + 1; j < n && option.smartColon; j++) {
					if (
						Math.abs(a.matrix[left[k]][right[max2]])
						< Math.abs(a.matrix[left[k]][right[j]])
					) {
						max2 = j;
					}
				}

				if (
					Math.abs(a.matrix[left[max1]][right[k]])
					< Math.abs(a.matrix[left[k]][right[max2]])
				) {
					[right[max2], right[k]] = [right[k], right[max2]];
				} else {
					[left[max1], left[k]] = [left[k], left[max1]];
				}
			}

			for (let j = k + 1; j < n; j++) {
				const m = a.matrix[left[k]][right[j]] / a.matrix[left[k]][right[k]];
				for (let i = 0; i < n; i++) {
					a.matrix[left[i]][right[j]] -= m * a.matrix[left[i]][right[k]];
				}
				b.matrix[0][right[j]] -= m * b.matrix[0][right[k]];
			}
		}

		const x = new Vector(fromLength(n, () => 0));

		// Обратный ход
		for (let i = n - 1; i >= 0; i--) {
			x.matrix[0][left[i]] = b.matrix[0][right[i]] / a.matrix[left[i]][right[i]];
			for (let c = n - 1; c > i; c--) {
				x.matrix[0][left[i]] -= a.matrix[left[c]][right[i]]
					* x.matrix[0][left[c]] / a.matrix[left[i]][right[i]];
			}
		}

		return x;
	}

	jakobi(
		other: Vector<A>,
		option: { z?: boolean; eps?: number; maxCount?: number; },
	) {
		const N = this.countColons();
		const { z, eps = 0, maxCount = Infinity } = option;

		const x = new Vector(fromLength(N, () => 0));
		let xBefore = x;
		let count = 0;

		do {
			xBefore = Vector.fromMatrix(x.clone());
			const xNext = z ? x : xBefore;
			for (let i = 0; i < N; i++) {
				x.matrix[0][i] = other.matrix[0][i]
					- fromLength(
						N,
						(j) => (j === i ? 0 : this.matrix[j][i] * xNext.matrix[0][j]),
					)
						.reduce((a, b) => a + b, 0);
			}
			count++;
		} while (
			count < maxCount
			&& eps < Math.abs(Vector.fromMatrix(xBefore.add(x.mulN(-1))).norma())
		);

		return { count, result: x };
	}

	// http://mathhelpplanet.com/static.php?p=javascript-operatsii-nad-matritsami
	// Определитель матрицы
	determinant() {
		const N = this.countColons();
		const B = this.clone();
		let denom = 1;
		let exchanges = 0;
		for (let i = 0; i < N - 1; ++i) {
			let maxN = i;
			let maxValue = Math.abs(B.matrix[i][i]);
			for (let j = i + 1; j < N; ++j) {
				const value = Math.abs(B.matrix[j][i]);
				if (value > maxValue) { maxN = j; maxValue = value; }
			}
			if (maxN > i) {
				const temp = B.matrix[i];
				B.matrix[i] = B.matrix[maxN];
				B.matrix[maxN] = temp;
				++exchanges;
			} else if (maxValue === 0) return maxValue;

			const value1 = B.matrix[i][i];
			for (let j = i + 1; j < N; ++j) {
				const value2 = B.matrix[j][i];
				B.matrix[j][i] = 0;
				for (let k = i + 1; k < N; ++k) {
					B.matrix[j][k] = (B.matrix[j][k] * value1 - B.matrix[i][k] * value2) / denom;
				}
			}
			denom = value1;
		}
		return (exchanges % 2 === 0 ? 1 : -1) * B.matrix[N - 1][N - 1];
	}

	// Союзная матрица
	adjugate() {
		const N = this.countColons();
		return new SquareMatrix(fromLength(N, (i) => fromLength(N, (j) => {
			const B = new SquareMatrix(fromLength(N - 1, () => fromLength(N - 1, () => 0)));
			for (let m = 0; m < j; m++) {
				for (let n = 0; n < i; n++) B.matrix[m][n] = this.matrix[m][n];
				for (let n = i + 1; n < N; n++) B.matrix[m][n - 1] = this.matrix[m][n];
			}
			for (let m = j + 1; m < N; m++) {
				for (let n = 0; n < i; n++) B.matrix[m - 1][n] = this.matrix[m][n];
				for (let n = i + 1; n < N; n++) B.matrix[m - 1][n - 1] = this.matrix[m][n];
			}
			const sign = (i + j) % 2 === 0 ? 1 : -1;
			return sign * B.determinant(); // Функцию Determinant см. выше;
		})));
	}

	// Обратная матрица
	inverse() {
		return this.adjugate().mulN(1 / this.determinant());
	}
}
