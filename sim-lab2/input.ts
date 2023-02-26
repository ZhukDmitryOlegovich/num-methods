import functionPlot from 'function-plot';
import { FunctionPlotDatum, FunctionPlotOptions } from 'function-plot/dist/types';

import { initDelaunay, randomBetween } from './util';

type Section = FunctionPlotDatum & {
	points: [
		[number, number],
		[number, number],
		[number, number],
	],
	fnType: 'points',
	graphType: 'polyline';
};

(() => {
	const node = document.getElementById('lab2-input');
	const plot = document.getElementById('lab2-plot');

	if (!node || !plot) {
		console.error('fail not found');
		return;
	}

	const div2 = document.createElement('div');

	div2.style.display = 'flex';
	div2.style.flexDirection = 'row';
	div2.style.alignItems = 'baseline';

	const fromX = 0;
	const fromY = 0;
	const toX = 1;
	const toY = 1;

	const button2 = document.createElement('button');
	button2.innerText = 'Дальше';
	div2.appendChild(button2);

	node.appendChild(div2);

	const p = document.createElement('p');
	div2.appendChild(p);

	const waitClick = <T>(value?: T) => new Promise((res) => {
		const callback = () => {
			res(value);
			button2.removeEventListener('click', callback);
		};

		button2.addEventListener('click', callback);
	});

	initDelaunay({
		fromX,
		fromY,
		toX,
		toY,
		async getPoint() {
			return { x: randomBetween(fromX, toX), y: randomBetween(fromY, toY) };
		},
		async nextStep() {
			await waitClick();
			return true;
		},
	});

	const points = [
		[randomBetween(fromX, toX), randomBetween(fromY, toY)],
		[randomBetween(fromX, toX), randomBetween(fromY, toY)],
		[randomBetween(fromX, toX), randomBetween(fromY, toY)],
	];
	points.push([...points[0]]);

	const options: FunctionPlotOptions = {
		grid: false,
		xAxis: { domain: [fromX, toX] },
		yAxis: { domain: [fromY, toY] },
		target: plot,
		data: [{
			// @ts-ignore
			closed: 'sudo',
			points,
			fnType: 'points',
			graphType: 'polyline',
			color: 'rgba(255, 0, 0, 1)',
		}],
		width: 820,
		height: 800,
	};

	functionPlot(options);
})();
