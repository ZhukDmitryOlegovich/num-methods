import functionPlot from 'function-plot';
import { FunctionPlotDatum, FunctionPlotOptions } from 'function-plot/dist/types';

import {
	initDelaunay, randomBetween, Triangle,
} from './util';

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
	div2.className = 'line circle';

	const fromX = 0;
	const fromY = 0;
	const toX = 1;
	const toY = 1;

	const button2 = document.createElement('button');
	button2.innerText = 'Дальше';
	div2.appendChild(button2);

	const button3 = document.createElement('button');
	button3.innerText = 'Автоклик';
	div2.appendChild(button3);

	let skeepRender = false;
	const button4 = document.createElement('button');
	button4.innerText = 'Рендер';
	div2.appendChild(button4);
	button4.onclick = () => {
		skeepRender = !skeepRender;
	};

	const input = document.createElement('input');
	input.type = 'number';
	input.valueAsNumber = 0;
	div2.appendChild(input);

	// eslint-disable-next-line no-multi-assign
	const restart = button3.onclick = () => {
		const id = setInterval(() => button2.click(), input.valueAsNumber);
		button3.onclick = () => {
			clearInterval(id);
			button3.onclick = restart;
		};
	};

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

	const colorNew = 'darkgreen';
	const colorNormal = 'blue';
	const colorRemove = 'purple';
	const colorFail = 'red';

	const pointsPrint: number[][] = [];
	const newPoint: FunctionPlotDatum & { points: number[][] } = {
		points: [],
		fnType: 'points',
		graphType: 'scatter',
		color: colorNew,
	};

	const options: Omit<FunctionPlotOptions, 'data'> & { data: (NonNullable<FunctionPlotOptions['data']>[number] & {triangle?: Triangle})[]; } = {
		grid: false,
		xAxis: { domain: [fromX, toX] },
		yAxis: { domain: [fromY, toY] },
		target: plot,
		data: [{
			points: pointsPrint,
			fnType: 'points',
			graphType: 'scatter',
			color: colorNormal,
		}, newPoint],
		width: 820,
		height: 800,
	};

	const removeAll = () => {
		options.data = options.data.filter(({ color }) => color !== colorRemove);
	};

	const normalizeNew = () => {
		options.data.forEach((dat) => {
			if (dat.color === colorNew) {
				dat.color = colorNormal;
				// dat.color = `#${Math.round(Math.random() * 256 ** 3).toString(16).padStart(6, '0')}`;
			}
		});
		pointsPrint.push(...newPoint.points);
		newPoint.points.length = 0;
	};

	let skeepWait = true;
	let countPoint = 0;

	initDelaunay({
		fromX,
		fromY,
		toX,
		toY,
		async getPoint() {
			skeepWait = false;
			const x = randomBetween(fromX, toX);
			const y = randomBetween(fromY, toY);
			return { x, y };
		},
		async nextStep() {
			// await waitClick();
			if (!skeepRender || countPoint % 100 === 0) {
				p.innerText = countPoint.toString();
			}
			return true;
		},
		async addPoint(point) {
			removeAll();
			countPoint++;
			newPoint.points.push([point.x, point.y]);
			if (!skeepRender) {
				functionPlot(options);
			}
			if (!skeepWait) {
				await waitClick();
			}
		},
		async removePoint() {
			throw new Error('remowe point');
		},
		async createTriangle(triangle) {
			removeAll();
			options.data.push({
				closed: 'sudo' as any as true,
				points: triangle.points.map(({ x, y }) => [x, y]),
				fnType: 'points',
				graphType: 'polyline',
				color: colorNew,
				triangle,
			});
			// functionPlot(options);
			// await waitClick();
		},
		async removeTriangle(triangle) {
			normalizeNew();
			options.data.some((dat) => {
				if (dat.triangle === triangle) {
					dat.color = colorRemove;
					return true;
				}
				return false;
			});
			// functionPlot(options);
			// await waitClick();
		},
		async getIncorrectTriangles(triangles) {
			normalizeNew();
			removeAll();
			options.data.forEach((dat) => {
				const { triangle } = dat;
				if (triangle && triangles.includes(triangle)) {
					dat.color = colorFail;
				}
			});
			if (!skeepRender) {
				functionPlot(options);
			}
			if (!skeepWait) {
				await waitClick();
			}
		},
	});

	functionPlot(options);
})();
