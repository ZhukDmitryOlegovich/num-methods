/* eslint-disable no-useless-constructor, import/prefer-default-export */
import { Matrix } from './Matrix.js';
import { fromLength } from './utils.js';
import { Vector } from './Vector.js';
export class SquareMatrix extends Matrix {
    constructor(matrix) {
        super(matrix);
        this.matrix = matrix;
    }
    static fromMatrix(matrix) {
        return new SquareMatrix(matrix.matrix);
    }
    eliminationGaussian(other) {
        const b = other.clone();
        const a = this.clone();
        const n = b.countRows();
        // Прямой ход
        for (let k = 1; k < n; k++) {
            for (let j = k; j < n; j++) {
                const m = a.matrix[k - 1][j] / a.matrix[k - 1][k - 1];
                for (let i = 0; i < n; i++) {
                    a.matrix[i][j] -= m * a.matrix[i][k - 1];
                }
                b.matrix[0][j] -= m * b.matrix[0][k - 1];
            }
        }
        const x = new Vector(fromLength(n, () => 0));
        // Обратный ход
        for (let i = n - 1; i >= 0; i--) {
            x.matrix[0][i] = b.matrix[0][i] / a.matrix[i][i];
            for (let c = n - 1; c > i; c--) {
                x.matrix[0][i] -= a.matrix[c][i] * x.matrix[0][c] / a.matrix[i][i];
            }
        }
        return x;
    }
}
