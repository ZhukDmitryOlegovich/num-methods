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
    eliminationGaussian(other, option = {}) {
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
                    if (Math.abs(a.matrix[left[max1]][right[k]])
                        < Math.abs(a.matrix[left[j]][right[k]])) {
                        max1 = j;
                    }
                }
                let max2 = k;
                for (let j = k + 1; j < n && option.smartColon; j++) {
                    if (Math.abs(a.matrix[left[k]][right[max2]])
                        < Math.abs(a.matrix[left[k]][right[j]])) {
                        max2 = j;
                    }
                }
                if (Math.abs(a.matrix[left[max1]][right[k]])
                    < Math.abs(a.matrix[left[k]][right[max2]])) {
                    [right[max2], right[k]] = [right[k], right[max2]];
                }
                else {
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
}
