import functionPlot from 'function-plot';
import { FunctionPlotOptions } from 'function-plot/dist/types';

import { solveMishen } from './util';

(() => {
	const node = document.getElementById('lab3-input');
	const plot = document.getElementById('lab3-plot');

	if (!node || !plot) {
		console.error('fail not found');
		return;
	}

	const div2 = document.createElement('div');

	div2.style.display = 'flex';
	div2.style.flexDirection = 'row';
	div2.style.alignItems = 'baseline';

	const button2 = document.createElement('button');
	button2.innerText = 'Сгенерить';
	div2.appendChild(button2);

	div2.appendChild(document.createTextNode('=== эпсилон'));

	const inputEps = document.createElement('input');
	inputEps.type = 'number';
	inputEps.placeholder = 'Epsilon';
	inputEps.valueAsNumber = 0.01;
	div2.appendChild(inputEps);

	div2.appendChild(document.createTextNode('=== учитываемое кол-во точек'));

	const inputCount = document.createElement('input');
	inputCount.type = 'number';
	inputCount.placeholder = 'Кол-во точек';
	inputCount.valueAsNumber = 100;
	div2.appendChild(inputCount);

	node.appendChild(div2);

	const p = document.createElement('code');
	div2.appendChild(p);

	button2.onclick = () => {
		const { prevValues, value } = solveMishen({
			s: [
				[0.3, 0.3, 0.4],
				[0, 0.2, 0.8],
			],
			eps: inputEps.valueAsNumber,
			countLast: inputCount.valueAsNumber,
		});

		p.innerText = value.toString();
		prevValues.unshift(0);

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

		const graphType = +(window as any).g ? 'scatter' : 'polyline';

		functionPlot({
			...options,
			xAxis: {
				domain: [
					0,
					prevValues.length,
				],
				label: 'кол-во интераций',
			},
			yAxis: {
				domain: [
					Math.min(...prevValues),
					Math.max(...prevValues),
				],
				label: 'значение',
			},
			target: plot,
			data: [{
				fnType: 'points',
				graphType,
				points: prevValues.map((val, i) => [i, val]),
			}],
		});
	};
})();
