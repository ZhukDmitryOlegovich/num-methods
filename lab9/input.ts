import functionPlot from 'function-plot';

import { SquareMatrix, Vector } from '@/math';
import { fromLength } from '@/math/utils';

(() => {
	const node = document.getElementById('lab9-input');
	const plot = document.getElementById('lab9-plot');

	if (!node || !plot) {
		return;
	}

	const div2 = document.createElement('div');

	div2.style.display = 'flex';
	div2.style.flexDirection = 'row';
	div2.style.alignItems = 'baseline';

	const select = document.createElement('select');
	select.innerHTML = fromLength(10, (i) => `<option ${i === 2 ? 'selected' : ''} value="${i + 1}">${i + 1}</option>`).join('');
	div2.appendChild(select);
	let currentSize = +select.value;
	select.onchange = () => {
		currentSize = +select.value;
	};

	const inputA = document.createElement('input');
	inputA.type = 'number';
	inputA.placeholder = 'a';
	inputA.valueAsNumber = 1;
	div2.appendChild(inputA);

	const inputB = document.createElement('input');
	inputB.type = 'number';
	inputB.placeholder = 'b';
	inputB.valueAsNumber = 2;
	div2.appendChild(inputB);

	const inputC = document.createElement('input');
	inputC.type = 'number';
	inputC.placeholder = 'с';
	inputC.valueAsNumber = 20;
	div2.appendChild(inputC);

	const button2 = document.createElement('button');
	button2.innerText = 'Сгенерить';
	div2.appendChild(button2);

	node.appendChild(div2);

	const div = document.createElement('div');
	div.style.width = '100%';

	const textarea = document.createElement('textarea');
	textarea.value = `1 0 0
0 1 0
0 0 1

1 1 1`;
	textarea.style.width = '100%';
	textarea.style.height = '80px';
	div.appendChild(textarea);

	button2.onclick = () => {
		textarea.value = '';

		const m = fromLength(currentSize, (j) => fromLength(
			currentSize,
			(i) => (
				Math.random() * (inputB.valueAsNumber - inputA.valueAsNumber) + inputA.valueAsNumber
			) * (i === j ? inputC.valueAsNumber : 1),
		));

		for (let i = 0; i < currentSize; i++) {
			for (let j = 0; j < i; j++) m[i][j] = m[j][i];
		}

		textarea.value += `${m.map((mm) => mm.join(' ')).join('\n')}\n\n`;

		textarea.value += fromLength(
			currentSize,
			() => (
				Math.random() * (inputB.valueAsNumber - inputA.valueAsNumber) + inputA.valueAsNumber
			),
		).join(' ');
	};

	const p = document.createElement('p');
	div.appendChild(p);

	node.appendChild(div);

	const button = document.createElement('button');
	button.innerText = 'Посчитать';
	button.onclick = () => {
		const numbers = textarea.value.match(/\S+/g)?.map(Number).filter((e) => !Number.isNaN(e));

		if (numbers?.length !== currentSize * (currentSize + 1)) {
			p.innerHTML = `<font color="red">Ожидалось ${currentSize * (currentSize + 1)}, а полученно ${numbers?.length}</font>`;
			return;
		}

		const arrNumbers = fromLength(
			currentSize + 1,
			(i) => numbers.slice(i * currentSize, (i + 1) * currentSize),
		);

		const a = new SquareMatrix(arrNumbers.slice(0, currentSize) as any);
		const b = new Vector(arrNumbers[currentSize] as any);

		const data: [number, number][] = [];

		const maxCount = 1000;

		const eigs: number[] = (window as any).math.eigs(a.matrix).values;

		const [minL, maxL] = eigs.reduce<[number, number]>(
			([min, max], v) => [v < min ? v : min, v > max ? v : max], [Infinity, -Infinity],
		);

		const tOpt = 2 / (minL + maxL);
		const count = 20;

		for (let i = 1; i < count; i++) {
			const t = (2 / maxL) * (i / count);
			const res = a.singleParameterMethod(b, { t, maxCount, eps: 1e-5 });
			data.push([t, res.count]);
		}

		console.log({
			data, eigs, minL, maxL,
		});

		const maxY = Math.max(...data.map((e) => e[1]));

		functionPlot({
			xAxis: {
				domain: [
					Math.min(...data.map((e) => e[0])),
					Math.max(...data.map((e) => e[0])),
				],
			},
			yAxis: {
				domain: [
					Math.min(...data.map((e) => e[1]), 0),
					maxY,
				],
			},
			grid: true,
			target: plot,
			data: [
				{
					fnType: 'points',
					graphType: 'polyline',
					points: data,
				},
				{
					fnType: 'points',
					graphType: 'polyline',
					points: [[tOpt, 0], [tOpt, maxY]],
				},
			],
		});
	};
	div2.appendChild(button);

	const buttonAnd = document.createElement('button');
	buttonAnd.innerText = 'Сгенерить & Посчитать';
	buttonAnd.onclick = () => {
		button2.click();
		button.click();
	};
	div2.appendChild(buttonAnd);
})();
