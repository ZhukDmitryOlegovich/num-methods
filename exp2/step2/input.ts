import functionPlot from 'function-plot';
import { FunctionPlotOptions } from 'function-plot/dist/types';

import { fromLength } from '@/math/utils';
import { parseHash } from '@/utils/parseHash';

import { Arr10 } from '../FixedArr';
import { M2 } from '../Matrix';
import { ONN } from '../ONN';
import { rAF } from '../rAF';

(() => {
	const node = document.getElementById('step1-input');
	const plot = document.getElementById('step1-plot');
	// const plot2 = document.getElementById('step1-plot2');

	if (!node || !plot) {
		console.error('fail not found');
		return;
	}

	const div = document.createElement('div');

	div.style.display = 'flex';
	div.style.flexDirection = 'row';
	div.style.alignItems = 'baseline';

	div.appendChild(document.createTextNode('t (step)\xa0'));

	const inputT = document.createElement('input');
	inputT.type = 'number';
	inputT.placeholder = 't';
	inputT.valueAsNumber = 0.004;
	div.appendChild(inputT);

	div.appendChild(document.createTextNode('\xa0| to (end)\xa0'));

	const inputTo = document.createElement('input');
	inputTo.type = 'number';
	inputTo.placeholder = 'to';
	inputTo.valueAsNumber = 0.3;
	div.appendChild(inputTo);

	const button2 = document.createElement('button');
	button2.innerText = 'Сгенерить';
	div.appendChild(button2);

	node.appendChild(div);

	const p = document.createElement('p');
	div.appendChild(p);

	const size1: Pick<FunctionPlotOptions, 'height' | 'width'> = {
		height: undefined,
		width: undefined,
	};

	button2.onclick = () => {
		const startFrom = Date.now();

		const t = inputT.valueAsNumber;
		const to = inputTo.valueAsNumber;

		const bigData: [number, number][][] = [];

		const f: Arr10 = [21, 14, 10, 15, 20, 25, 12.5, 17.5, 17.5, 22.5];

		// const getA = (h: number) => {
		// 	if (h === 0 || h === 1) {
		// 		return 4;
		// 	}
		// 	return 1;
		// };
		// const K = fromLength(10, (i) => fromLength(10, (j) => {
		// 	const kij = (() => {
		// 		if ((i === 0)
		// 			|| (i === 1) || (i === j)) {
		// 			return 0;
		// 		}
		// 		return 1;
		// 	})();
		// 	return getA(i) * getA(j) * kij;
		// })) as M2;

		const e: Arr10 = [4, 4, 1, 1, 1, 1, 1, 1, 1, 1];
		const K = fromLength(10, (i) => fromLength(10, (j) => e[i] * e[j])) as M2;

		const onn = new ONN(K, f);
		console.log({ K, f });

		const saveDate = (now: number) => {
			onn.dphi.forEach((dphi, i) => {
				(bigData[i] ??= []).push([now, dphi]);
			});
		};

		let now = 0;
		saveDate(now);
		for (let i = 0; now <= to; i += 1, now = t * i) {
			onn.step(t);
			saveDate(now);
		}

		p.innerText = ((Date.now() - startFrom) / 1000).toPrecision(3);
		console.log({ bigData });

		const options: Omit<FunctionPlotOptions, 'target' | 'data'> = {
			// xAxis: {
			// 	// domain: [from, to],
			// },
			// yAxis: {
			// 	// type: 'log',
			// 	domain: [minY, maxY],
			// },
			grid: true,
		};

		const graphType = parseHash().g ? 'scatter' : 'polyline';

		const createPlot = (
			data: [number, number][][], target: HTMLElement, size: typeof size1,
		) => {
			const syncSizePrev = (contentRect: DOMRectReadOnly) => {
				size.height = Math.round(contentRect.height) - 20;
				size.width = Math.round(contentRect.width) - 20;
			};
			syncSizePrev(target.getBoundingClientRect());

			const bigOptions: FunctionPlotOptions & { target: HTMLElement; } = {
				...options,
				...size,
				xAxis: {
					domain: [
						Math.min(...data.flatMap((p_) => p_.map((pp_) => pp_[0]))),
						Math.max(...data.flatMap((p_) => p_.map((pp_) => pp_[0]))),
					],
					label: 'Время',
				},
				yAxis: {
					domain: [
						Math.min(...data.flatMap((p_) => p_.map((pp_) => pp_[1]))),
						Math.max(...data.flatMap((p_) => p_.map((pp_) => pp_[1]))),
					],
					label: 'Частота',
				},
				target,
				tip: {
					xLine: true,
					yLine: true,
					renderer(x, y, index) {
						const args = { x, y, index };
						console.log({ args });
						return JSON.stringify(args);
					},
				},
				data: data.map((points) => ({
					fnType: 'points',
					graphType,
					points,
				})),
				// data: [{
				// 	fn: 'x^2',
				// }],
			};

			const syncSize = (contentRect: DOMRectReadOnly) => {
				syncSizePrev(contentRect);
				bigOptions.height = size.height;
				bigOptions.height = size.height;

				console.log('update', size);

				functionPlot(bigOptions);
			};

			const resizeObserver = new ResizeObserver(rAF((entries) => {
				for (const entry of entries) {
					syncSize(entry.contentRect);
				}
			}));

			resizeObserver.observe(bigOptions.target);

			functionPlot(bigOptions);
		};

		createPlot(bigData, plot, size1);
	};

	button2.click();
})();
