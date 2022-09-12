/* eslint-disable import/prefer-default-export */
import { Matrix } from './Matrix';
export class Vector extends Matrix {
    constructor(vector) {
        super([vector]);
    }
    static fromMatrix(matrix) {
        return new Vector(matrix.matrix[0]);
    }
    scalar(other) {
        return this.transpose().mul(other).matrix[0];
    }
    norma() {
        return this.scalar(this);
    }
}
