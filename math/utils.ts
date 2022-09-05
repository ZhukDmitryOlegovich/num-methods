import { FixedArr } from './types';

export const map = <A extends number, T, V>(
	a: FixedArr<A, T>,
	callbackfn: (value: T, index: number, array: FixedArr<A, T>) => V,
): FixedArr<A, V> => a.map(callbackfn as any) as any;

export const fromLength = <A extends number, V>(
	length: A,
	callbackfn: (index: number) => V,
): FixedArr<A, V> => Array.from({ length }, (_, i) => callbackfn(i)) as any;

export const sumArr = <A extends number>(a: FixedArr<A, number>, b: FixedArr<A, number>) => map(
	a,
	(_, i) => a[i] + b[i],
);
