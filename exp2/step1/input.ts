import functionPlot from 'function-plot';
import { FunctionPlotOptions } from 'function-plot/dist/types';

import { fromLength } from '@/math/utils';

import { Arr10 } from '../FixedArr';
import { M2 } from '../Matrix';
import { ONN } from '../ONN';
import { rAF } from '../rAF';

(() => {
	const node = document.getElementById('step1-input');
	const plot = document.getElementById('step1-plot');
	const plot2 = document.getElementById('step1-plot2');

	if (!node || !plot || !plot2) {
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
	inputT.valueAsNumber = 0.001;
	div.appendChild(inputT);

	div.appendChild(document.createTextNode('\xa0| from (start)\xa0'));

	const inputFrom = document.createElement('input');
	inputFrom.type = 'number';
	inputFrom.placeholder = 'from';
	inputFrom.valueAsNumber = 0;
	div.appendChild(inputFrom);

	div.appendChild(document.createTextNode('\xa0| to (end)\xa0'));

	const inputTo = document.createElement('input');
	inputTo.type = 'number';
	inputTo.placeholder = 'to';
	inputTo.valueAsNumber = 0.3;
	div.appendChild(inputTo);

	const button2 = document.createElement('button');
	button2.innerText = 'Сгенерировать';
	div.appendChild(button2);

	node.appendChild(div);

	const p = document.createElement('p');
	div.appendChild(p);

	const size: Pick<FunctionPlotOptions, 'height' | 'width'> = {
		height: undefined,
		width: undefined,
	};

	const getONNBigData = (
		K: number[][], f: number[], initPhi: number[] | undefined,
		to: number, t: number,
	) => {
		const bigData: [number, number][][] = [];
		const onn = new ONN(K, f, initPhi);

		const saveDate = (now: number) => {
			onn.dphi.forEach((dphi, i) => {
				(bigData[i] ??= []).push([now, dphi / (2 * Math.PI)]);
			});
		};

		let now = 0;
		saveDate(now);
		for (let i = 0; now <= to; i += 1, now = t * i) {
			onn.step(t);
			saveDate(now);
		}

		return bigData;
	};

	const createGraphic = (
		target: HTMLElement,
		bigData: [number, number][][],
		from: number,
		to: number,
	) => {
		const options: Omit<FunctionPlotOptions, 'target' | 'data'> = {
			grid: true,
		};

		const syncSizePrev = (contentRect: DOMRectReadOnly) => {
			size.height = Math.round(contentRect.height) - 20;
			size.width = Math.round(contentRect.width) - 20;
		};
		syncSizePrev(target.getBoundingClientRect());

		const xDomainData = bigData.flatMap((p_) => p_.map((pp_) => pp_[1]));

		const bigOptions: FunctionPlotOptions & { target: HTMLElement; } = {
			...options,
			...size,
			xAxis: {
				domain: [
					// Math.min(...bigData.flatMap((p_) => p_.map((pp_) => pp_[0]))),
					// Math.max(...bigData.flatMap((p_) => p_.map((pp_) => pp_[0]))),
					from,
					to,
				],
				label: 'Время',
			},
			yAxis: {
				domain: [
					Math.min(...xDomainData),
					Math.max(...xDomainData),
				],
				label: 'Частота',
			},
			target,
			// tip: {
			// 	xLine: true,
			// 	yLine: true,
			// 	renderer(x, y, index) {
			// 		const args = { x, y, index };
			// 		console.log({ args });
			// 		return JSON.stringify(args);
			// 	},
			// },
			data: bigData.map((points) => ({
				fnType: 'points',
				graphType: 'polyline',
				points,
			})),
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

		return functionPlot(bigOptions);
	};

	button2.onclick = () => {
		const startFrom = Date.now();
		const initPhi = Array.from({ length: 10 }, (_, i) => Math.random() * 2 * Math.PI);
		const t = inputT.valueAsNumber;
		const to = inputTo.valueAsNumber;
		const from = inputFrom.valueAsNumber;

		// const f = Array.from({ length: 10 }, (_, i) => (
		// 	i > 5 ? Math.random() * 30 : Math.random() * 20 - 10));

		const [a, b] = [plot, plot2].map((target, ii) => {
			const f: Arr10 = [21, 14, 10, 15, 20, 25, 12.5, 17.5, ii === 1 ? 40 : 17.5, 22.5];
			const e: Arr10 = [4, 4, 1, 1, 1, 1, 1, 1, 1, 1];
			const K = fromLength(10, (i) => fromLength(10, (j) => e[i] * e[j])) as M2;
			console.log({ K, f });

			const bigData = getONNBigData(K, f, initPhi, to, t);

			console.log({ bigData });

			return createGraphic(target, bigData, from, to);
		});

		(a.addLink as any)(b);
		(b.addLink as any)(a);

		p.innerText = ((Date.now() - startFrom) / 1000).toFixed(3);
	};

	button2.click();
})();
