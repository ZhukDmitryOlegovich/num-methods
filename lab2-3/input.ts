import { SquareMatrix, Vector } from '@/math';
import { fromLength } from '@/math/utils';

(() => {
	const node = document.getElementById('lab2-input');

	if (!node) {
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
	inputA.valueAsNumber = -1;
	div2.appendChild(inputA);

	const inputB = document.createElement('input');
	inputB.type = 'number';
	inputB.placeholder = 'b';
	inputB.valueAsNumber = 1;
	div2.appendChild(inputB);

	const inputC = document.createElement('input');
	inputC.type = 'number';
	inputC.placeholder = 'с';
	inputC.value = '1e-5';
	div2.appendChild(inputC);

	const button2 = document.createElement('button');
	button2.innerText = 'Сгенерить';
	div2.appendChild(button2);

	node.appendChild(div2);

	const div = document.createElement('div');
	div.style.width = '100%';

	const textarea = document.createElement('textarea');
	textarea.value = `1 4 8
2 5 8
3 6 9

14 
32 
51`;
	textarea.style.width = '100%';
	textarea.style.height = '130px';
	div.appendChild(textarea);

	button2.onclick = () => {
		textarea.value = '';

		textarea.value += `${fromLength(currentSize, (j) => fromLength(
			currentSize,
			(i) => (
				Math.random() * (inputB.valueAsNumber - inputA.valueAsNumber) + inputA.valueAsNumber
			) * (i === j ? inputC.valueAsNumber : 1),
		).join(' ')).join('\n')}\n\n`;

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

		const x2 = b;
		const b2 = Vector.fromMatrix(a.mul(x2));

		p.innerHTML = '';

		[
			'<b>input: A, b. output: x, diff</b>',
			...[
				{ smartColon: false, smartRow: false },
				{ smartColon: false, smartRow: true },
				{ smartColon: true, smartRow: false },
				{ smartColon: true, smartRow: true },
			].flatMap((options) => {
				const x = a.eliminationGaussian(b, options);
				return [
					options,
					x,
					`<b>${Vector.fromMatrix(a.mul(x).add(b.mulN(-1))).norma().toExponential(10)}</b>`,
				];
			}),
			'',
			'<b>input: A, x. output: b, diff</b>',
			b2,
			Vector.fromMatrix(a.eliminationGaussian(b2).add(x2.mulN(-1))).norma(),
		].forEach((value) => {
			if (typeof value === 'string') {
				p.innerHTML += value;
			} else {
				p.innerHTML += JSON.stringify(value);
			}
			p.innerHTML += '<br>';
		});

		p.innerHTML = `<code>${p.innerHTML}</code>`;
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
