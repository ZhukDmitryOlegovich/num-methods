import functionPlot from 'function-plot';
import { FunctionPlotOptions } from 'function-plot/dist/types';

import { SquareMatrix, Vector } from '@/math';
import { fromLength, random } from '@/math/utils';

(() => {
	const node = document.getElementById('lab4-input');
	const plot = document.getElementById('lab4-plot');
	const plot2 = document.getElementById('lab4-plot-2');

	if (!node || !plot || !plot2) {
		return;
	}

	const div2 = document.createElement('div');

	div2.style.display = 'flex';
	div2.style.flexDirection = 'row';
	div2.style.alignItems = 'baseline';

	const inputA = document.createElement('input');
	inputA.type = 'number';
	inputA.placeholder = 'a';
	inputA.valueAsNumber = 0;
	div2.appendChild(inputA);

	const inputB = document.createElement('input');
	inputB.type = 'number';
	inputB.placeholder = 'b';
	inputB.valueAsNumber = 10;
	div2.appendChild(inputB);

	const inputC = document.createElement('input');
	inputC.type = 'number';
	inputC.placeholder = 'Диагональное преобладание';
	inputC.value = '1e-5';
	div2.appendChild(inputC);

	div2.appendChild(document.createTextNode('==='));

	const inputFrom = document.createElement('input');
	inputFrom.type = 'number';
	inputFrom.placeholder = 'from';
	inputFrom.valueAsNumber = 10;
	div2.appendChild(inputFrom);

	const inputTo = document.createElement('input');
	inputTo.type = 'number';
	inputTo.placeholder = 'to';
	inputTo.valueAsNumber = 100;
	div2.appendChild(inputTo);

	const inputStep = document.createElement('input');
	inputStep.type = 'number';
	inputStep.placeholder = 'step';
	inputStep.valueAsNumber = 10;
	div2.appendChild(inputStep);

	div2.appendChild(document.createTextNode('==='));

	const button2 = document.createElement('button');
	button2.innerText = 'Сгенерить';
	div2.appendChild(button2);

	node.appendChild(div2);

	const p = document.createElement('p');
	div2.appendChild(p);

	button2.onclick = () => {
		const a = inputA.valueAsNumber;
		const b = inputB.valueAsNumber;
		const c = inputC.valueAsNumber;

		const from = inputFrom.valueAsNumber;
		const to = inputTo.valueAsNumber;
		const step = inputStep.valueAsNumber;

		const startFrom = Date.now();

		const datas: [number, number][][][] = [[], []];

		let minY = Infinity;
		let maxY = -Infinity;

		for (let N = from; N <= to; N += step) {
			for (let isDiag = 0; isDiag <= 1; isDiag++) {
				let indData = 0;
				const mA = new SquareMatrix(
					fromLength(
						N,
						(i) => fromLength(
							N,
							(j) => random(a, b) * (isDiag && i === j ? c : 1),
						),
					),
				);
				const vX = new Vector(fromLength(N, () => random(0.9, 1.1)));
				const vB = Vector.fromMatrix(mA.mul(vX));

				for (let smartColon = 0; smartColon <= 1; smartColon++) {
					for (let smartRow = 0; smartRow <= 1; smartRow++) {
						const vX2 = mA.eliminationGaussian(
							vB,
							{ smartColon: !!smartColon, smartRow: !!smartRow },
						);
						const diff = Vector.fromMatrix(vX.add(vX2.mulN(-1))).norma();
						if (diff < minY) minY = diff;
						if (diff > maxY) maxY = diff;
						(datas[isDiag][indData++] ??= []).push([N, diff]);
					}
				}
			}
		}

		p.innerText = ((Date.now() - startFrom) / 1000).toPrecision(3);

		const options: Omit<FunctionPlotOptions, 'target' | 'data'> = {
			xAxis: {
				domain: [from, to],
			},
			yAxis: {
				type: 'log',
				domain: [minY, maxY],
			},
			grid: true,
		};

		const fPlot = functionPlot({
			...options,
			target: plot,
			data: datas[0].map((points) => ({
				fnType: 'points',
				graphType: 'polyline',
				points,
			})),
		});

		const fPlot2 = functionPlot({
			...options,
			target: plot2,
			data: datas[1].map((points) => ({
				fnType: 'points',
				graphType: 'polyline',
				points,
			})),
		});

		(fPlot.addLink as any)(fPlot2);
		(fPlot2.addLink as any)(fPlot);
	};
})();
