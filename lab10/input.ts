import { Matrix, SquareMatrix } from '@/math';
import { fromLength } from '@/math/utils';

(() => {
	const node = document.getElementById('lab10-input');

	if (!node) {
		return;
	}

	const div2 = document.createElement('div');

	div2.style.display = 'flex';
	div2.style.flexDirection = 'row';
	div2.style.alignItems = 'baseline';

	const select = document.createElement('select');
	select.innerHTML = fromLength(10, (i) => `<option ${i === 1 ? 'selected' : ''} value="${i + 1}">${i + 1}</option>`).join('');
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

	const button2 = document.createElement('button');
	button2.innerText = 'Сгенерить';
	div2.appendChild(button2);

	node.appendChild(div2);

	const div = document.createElement('div');
	div.style.width = '100%';

	const textarea = document.createElement('textarea');
	textarea.value = `4 3
6 3`;
	textarea.style.width = '100%';
	textarea.style.height = '130px';
	div.appendChild(textarea);

	button2.onclick = () => {
		textarea.value = '';

		textarea.value += `${fromLength(currentSize, (j) => fromLength(
			currentSize,
			() => (
				Math.random() * (inputB.valueAsNumber - inputA.valueAsNumber) + inputA.valueAsNumber
			),
		).join(' ')).join('\n')}\n\n`;
	};

	const p = document.createElement('p');
	div.appendChild(p);

	node.appendChild(div);

	const button = document.createElement('button');
	button.innerText = 'Посчитать';
	button.onclick = () => {
		const numbers = textarea.value.match(/\S+/g)?.map(Number).filter((e) => !Number.isNaN(e));

		if (numbers?.length !== currentSize * currentSize) {
			p.innerHTML = `<font color="red">Ожидалось ${currentSize * currentSize}, а полученно ${numbers?.length}</font>`;
			return;
		}

		const arrNumbers = fromLength(
			currentSize,
			(i) => numbers.slice(i * currentSize, (i + 1) * currentSize),
		);

		const a = SquareMatrix.fromMatrix(new SquareMatrix(arrNumbers as any).transpose());
		const { L, U } = a.decomposeLU();

		p.innerHTML = '';

		const print = (m: Matrix<number, number>) => m.transpose().matrix.map((e) => e.join(' ')).join('<br>');

		[
			'<b>= L</b>',
			print(L),
			'',
			'<b>= U</b>',
			print(U),
			'',
			'<b>= LU</b>',
			print(L.mul(U)),
			'',
			'<b>= A - LU</b>',
			print(a.add(L.mul(U).mulN(-1))),
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
