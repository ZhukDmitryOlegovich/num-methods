import { sum } from './sum.js';
const sigmoid = (x) => 1 / (1 + Math.exp(-x));
const makeM2 = (s1, s2, gen) => Array.from({ length: s1 }, (_, i) => Array.from({ length: s2 }, gen));
export class BNN {
    constructor(inputSize, hiddenSize, outputSize, activeFunction = sigmoid, random = Math.random, matrixs = [
        makeM2(hiddenSize, inputSize, random),
        makeM2(outputSize, hiddenSize, random),
    ]) {
        this.inputSize = inputSize;
        this.hiddenSize = hiddenSize;
        this.outputSize = outputSize;
        this.activeFunction = activeFunction;
        this.matrixs = matrixs;
    }
    calc(inputVec) {
        if (inputVec.length !== this.inputSize) {
            throw new RangeError('incorrect size');
        }
        return this.matrixs.reduce((vec, matrix) => matrix.map((line) => sum(vec.length, (i) => line[i] * vec[i])), inputVec);
    }
}
