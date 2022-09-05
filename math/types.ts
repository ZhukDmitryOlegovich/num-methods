export type NotAbstract<O, T extends O> = O extends T ? never : T;

// from https://github.com/type-challenges/type-challenges/issues/15137
export type IsUnion<T, R = T> = [T] extends [never]
	? false
	: T extends T
	? Exclude<R, T> extends never
	? false
	: true : never;

export type NotUnion<U> = IsUnion<U> extends true ? never : U;

export type FixedArr<Length extends number, T> = Omit<readonly T[], 'length'>
	& { length: NotUnion<NotAbstract<number, Length>>; };
