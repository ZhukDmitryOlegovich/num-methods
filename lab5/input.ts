import functionPlot from 'function-plot';
import { FunctionPlotOptions } from 'function-plot/dist/types';

import { SquareMatrix, Vector } from '@/math';
import { fromLength, random } from '@/math/utils';

declare let vis: any;

(() => {
	const input1 = document.getElementById('lab5-1-input');
	const output1 = document.getElementById('lab5-1-output');
	const output2 = document.getElementById('lab5-1-output-2');
	const output3 = document.getElementById('lab5-1-output-3');

	if (!input1 || !output1) {
		return;
	}

	const button1 = document.createElement('button');
	button1.innerText = 'Сгенерить';
	input1.appendChild(button1);

	const p = document.createElement('p');
	output1.appendChild(p);

	const mu = <N extends number>(A: SquareMatrix<N>) => A.normaMax() * A.inverse().normaMax();

	const N = 5;

	button1.onclick = () => {
		const x = new Vector(fromLength(N, () => 1));
		const countTest = 100;

		let minX = Infinity;
		let maxX = -Infinity;
		let minY = Infinity;
		let maxY = -Infinity;

		const data = new vis.DataSet();
		const data2 = new vis.DataSet();
		let counter = 0;

		const AA: number[][][] = [];

		fromLength(
			countTest,
			() => new SquareMatrix(fromLength(N, () => fromLength(N, () => random(0, 10)))),
		).forEach((A) => {
			const muA = mu(A);
			const f = A.mul(x);
			const xx = muA;

			const yy = muA * (0.1 / f.normaMax() + N * 0.1 / A.normaMax());

			minX = Math.min(minX, xx);
			maxX = Math.max(maxX, xx);
			minY = Math.min(minY, yy);
			maxY = Math.max(maxY, yy);

			let count = 0;

			for (let i = 0.1; i <= 0.9; i += 0.1) {
				const hdf = i / f.normaMax();
				const hdA = N * i / A.normaMax();
				const hyy = muA * (hdf + hdA);

				data.add({
					id: counter++, x: xx, y: hyy, z: hdf, style: hdf,
				});
				data2.add({
					id: counter++, x: xx, y: hyy, z: hdA, style: hdA,
				});

				(AA[count++] ??= []).push([xx, hyy]);
			}
		});

		const options: Omit<FunctionPlotOptions, 'target' | 'data'> = {
			xAxis: {
				domain: [minX, maxX],
			},
			yAxis: {
				domain: [minY, maxY],
			},
			grid: true,
		};

		functionPlot({
			...options,
			target: output1,
			data: AA.map((points) => ({
				fnType: 'points',
				// graphType: 'polyline',
				graphType: 'scatter',
				points,
			})),
		});

		// specify options
		// const options2 = {
		// 	width: '600px',
		// 	height: '600px',
		// 	style: 'surface',
		// 	showPerspective: true,
		// 	showGrid: true,
		// 	showShadow: false,
		// 	keepAspectRatio: true,
		// 	verticalRatio: 0.5,
		// };
		const options2 = {
			width: '600px',
			height: '600px',
			style: 'dot-color',
			showPerspective: true,
			showGrid: true,
			keepAspectRatio: true,
			verticalRatio: 1.0,
			legendLabel: 'distance',
			cameraPosition: {
				horizontal: -0.35,
				vertical: 0.22,
				distance: 1.8,
			},
		};

		console.log([
			new vis.Graph3d(output2, data, options2),
			new vis.Graph3d(output3, data2, options2),
		]);
	};
})();
