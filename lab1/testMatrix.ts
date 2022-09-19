import math from 'mathjs';

import { Matrix } from '@/math';

console.log(JSON.stringify(
	// @ts-ignore
	math.multiply(math.matrix([[1, 2], [3, 4]]), math.matrix([[1.2, -7.2], [1.5, 7.8]])).toArray(),
));
console.log(JSON.stringify(
	new Matrix([[1, 2], [3, 4]] as const)
		.mul(new Matrix([[1.2, -7.2], [1.5, 7.8]] as const)).matrix,
));
