import { MinusOne } from './MinusOne';

export type FixedArr<Length extends number, Value> = Length extends 0
	? []
	: [Value, ...FixedArr<MinusOne<Length>, Value>];

export type Arr10 = FixedArr<10, number>;
