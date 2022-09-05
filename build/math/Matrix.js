/* eslint-disable no-useless-constructor, import/prefer-default-export */
import { fromLength, sumArr } from './utils.js';
export class Matrix {
    constructor(matrix) {
        this.matrix = matrix;
    }
    countRows() {
        return this.matrix[0].length;
    }
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
}