import { MinusOne } from './MinusOne';

export type Matrix<Size extends number, Value> = Size extends 0
	? Value
	: Matrix<MinusOne<Size>, Value>[];

export type M1 = Matrix<1, number>;
export type M2 = Matrix<2, number>;
