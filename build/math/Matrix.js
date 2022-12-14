/* eslint-disable no-useless-constructor, import/prefer-default-export */
import { fromLength, map, sumArr } from './utils.js';
/**
 * A = Height \
 * B = Width \
 * A x B = Height x Width
 */
export class Matrix {
    constructor(matrix) {
        this.matrix = matrix;
    }
    clone() {
        return new Matrix(fromLength(this.countColons(), (i) => [...this.colon(i)]));
    }
    /**
     * @return Height
     */
    countRows() {
        return this.matrix[0].length;
    }
    /**
     * @return Width
     */
    countColons() {
        return this.matrix.length;
    }
    colon(i) {
        return this.matrix[i];
    }
    row(i) {
        return this.matrix.map((colon) => colon[i]);
    }
    add(other) {
        return new Matrix(fromLength(this.countColons(), (i) => sumArr(this.colon(i), other.colon(i))));
    }
    transpose() {
        return new Matrix(fromLength(this.countRows(), (i) => this.row(i)));
    }
    mul(other) {
        return new Matrix(fromLength(other.countColons(), (i) => fromLength(this.countRows(), (j) => other.matrix[i].reduce((accum, _, k) => accum + this.matrix[k][j] * other.matrix[i][k], 0))));
    }
    mulN(other) {
        return new Matrix(map(this.matrix, (a) => map(a, (x) => x * other)));
    }
    normaMax() {
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
