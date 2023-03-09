type InputType = { s: number[][], eps: number, countLast: number; };

// eslint-disable-next-line import/prefer-default-export
export const solveMishen = ({
	s, eps, countLast,
}: InputType) => {
	let allCount = 0;
	let allIteration = 0;
	const prevValues: number[] = [];

	const getLast = () => prevValues.slice(-countLast);

	while (
		prevValues.length < countLast
		|| Math.max(...getLast()) - Math.min(...getLast()) > 2 * eps
	) {
		allIteration++;
		let count = 0;

		for (let index = 0; s[index];) {
			count++;
			const sum = s[index].reduce((a, b) => a + b, 0);
			let r = Math.random() * sum;
			index = s[index].findIndex((val) => {
				if (val > r) {
					return true;
				}
				r -= val;
				return false;
			});
		}

		allCount += count;
		prevValues.push(allCount / allIteration);
	}

	return {
		value: (Math.max(...getLast()) + Math.min(...getLast())) / 2,
		prevValues,
	};
};
