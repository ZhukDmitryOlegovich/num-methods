import { addInput2D } from './input2d';

declare let vis: any;

/* eslint-disable no-unused-vars, no-shadow */
enum NameInput {
	count = 'count',
	delta = 'delta',
	xi = 'xi',
	eta = 'eta',
	thetaMul = 'thetaMul',
	c1 = 'c1',
	c2 = 'c2',
	k = 'k',
	showPerspective = 'showPerspective',
	norma = 'norma',
	kNorma = 'kNorma',
	start = 'start',
	epsilon = 'epsilon',
	recalc = 'recalc	',
}
/* eslint-enable no-unused-vars, no-shadow */

function createGraph3d(data: any, el: HTMLElement) {
	const options2 = {
		width: '100%',
		// костыль, чтобы не привышать размер
		height: 'calc(100% - 4px)',
		style: 'line',
		showPerspective: true,
		showGrid: true,
		keepAspectRatio: true,
		verticalRatio: 1.0,
		legendLabel: 'distance',
		cameraPosition: {
			horizontal: 0.7,
			vertical: 0.4,
			distance: 4.5,
		},

		xLabel: 'ξ sin θ',
		yLabel: 'ξ cos θ',
		zLabel: 'η',

		xMin: -1,
		xMax: 1,
		yMin: -1,
		yMax: 1,
		zMin: 0,
		zMax: 1,

		tooltip: ({
			data: {
				// eslint-disable-next-line no-shadow
				x, y, z, xi, theta,
			},
		}: any) => `<table>
<tr><th>ξ sin θ</th><th>${x}</th></tr>
<tr><td>ξ cos θ</td><td>${y}</td></tr>
<tr><td>η</td><td>${z}</td></tr>
<tr><td>ξ</td><td>${xi}</td></tr>
<tr><td>θ</td><td>${theta}</td></tr>
</table>`,
		yCenter: '50%',
		axisFontSize: 80,
	};

	return new vis.Graph3d(el, data, options2);
}

type TH<T extends 'number' | 'checkbox'> = {
	type?: T,
	value?:
	| (T extends 'number' ? number : never)
	| (T extends 'checkbox' ? boolean : never),
};

const replaceNaN = (value: number, def: number) => (Number.isNaN(value) ? def : value);

function createR(el: HTMLElement) {
	const allInput: Record<string, HTMLInputElement> = {};
	return {
		addHr: () => el.appendChild(document.createElement('hr')),
		addInput: (name: NameInput, options?: (TH<'number'> | TH<'checkbox'>) & {
			placeholder?: string,
			placeholderId?: string,
		}) => {
			const span = document.createElement('span');
			span.innerHTML = options?.placeholder || name;
			const placeholderId = options?.placeholderId;
			if (placeholderId) span.id = placeholderId;
			el.appendChild(span);
			const input = document.createElement('input');
			input.type = options?.type || 'number';
			const value = options?.value;
			input.placeholder = `${value}`;
			switch (typeof value) {
				case 'number':
					input.valueAsNumber = value;
					break;
				case 'boolean':
					input.checked = value;
					break;
				case 'string':
					input.value = value;
					break;
				default: break;
			}
			allInput[name] = input;
			el.appendChild(input);
			return input;
		},
		getInput: (name: NameInput) => allInput[name],
		getValueAsNumber: (name: NameInput) => replaceNaN(
			allInput[name].valueAsNumber, +allInput[name].placeholder,
		),
		getValueAsBoolean: (name: NameInput) => allInput[name].checked,
		setValueAsBoolean: (name: NameInput, value: boolean) => { allInput[name].checked = value; },
		setValueAsString: (name: NameInput, value: string): boolean => {
			if (allInput[name].value === value) return false;
			allInput[name].value = value;
			return true;
		},
	};
}

type R = ReturnType<typeof createR>;

const lengthV = (x: number, y: number, z: number) => Math.sqrt(x * x + y * y + z * z);

const nextPoint = ({
	xi, eta, theta, cosTheta, sinTheta, c1, c2, k, norma, kNorma, delta,
}: Record<'xi' | 'eta' | 'theta' | 'cosTheta' | 'sinTheta' | 'c1' | 'c2' | 'k' | 'kNorma' | 'delta', number> & { norma: boolean; }) => {
	const xiD = 2 * xi
		- 2 * xi * (xi + eta)
		- xi * eta * (cosTheta + c2 * sinTheta);
	const etaD = 2 * eta
		- 2 * eta * (xi + 3 * eta / 4)
		- 2 * xi * eta * (cosTheta - c2 * sinTheta)
		- 2 * k * k * eta;
	const thetaD = c2 * (2 * xi - eta / 2)
		+ sinTheta * (2 * xi + eta)
		+ c2 * cosTheta * (2 * xi - eta)
		+ 2 * c1 * k * k;

	const length = norma ? lengthV(xi, etaD, thetaD) * kNorma : 1;

	return [
		xi + xiD / length * delta,
		eta + etaD / length * delta,
		theta + thetaD / length * delta,
	];
};

function calcDataSet(r: R, { c1, c2 }: { c1?: number, c2?: number; } = {}) {
	const data = new vis.DataSet();

	const count = r.getValueAsNumber(NameInput.count);
	const start = r.getValueAsNumber(NameInput.start);
	const delta = r.getValueAsNumber(NameInput.delta);

	c1 ??= r.getValueAsNumber(NameInput.c1);
	c2 ??= r.getValueAsNumber(NameInput.c2);
	const k = r.getValueAsNumber(NameInput.k);

	const norma = r.getValueAsBoolean(NameInput.norma);
	const kNorma = r.getValueAsNumber(NameInput.kNorma);

	let xi = r.getValueAsNumber(NameInput.xi);
	let eta = r.getValueAsNumber(NameInput.eta);
	let theta = r.getValueAsNumber(NameInput.thetaMul) * Math.PI;

	const dxi = Math.random();
	const deta = Math.random();
	const dtheta = 3 - dxi - deta;

	const epsilon = r.getValueAsNumber(NameInput.epsilon);

	let xi1 = xi + dxi / 3 * epsilon * (Math.random() > 0.5 ? 1 : -1);
	let eta1 = eta + deta / 3 * epsilon * (Math.random() > 0.5 ? 1 : -1);
	let theta1 = theta + dtheta / 3 * epsilon * (Math.random() > 0.5 ? 1 : -1);

	let lyapunov = 0;

	for (let index = 0; index < count + start; index++) {
		const cosTheta = Math.cos(theta);
		const sinTheta = Math.sin(theta);

		if (index >= start) {
			data.add({
				x: xi * sinTheta,
				y: xi * cosTheta,
				z: eta,
				xi,
				theta,
			});
		}

		[xi, eta, theta] = nextPoint({
			xi, eta, sinTheta, cosTheta, c1, c2, k, delta, kNorma, norma, theta,
		});

		[xi1, eta1, theta1] = nextPoint({
			xi: xi1,
			eta: eta1,
			sinTheta: Math.sin(theta1),
			cosTheta: Math.cos(theta1),
			c1,
			c2,
			k,
			delta,
			kNorma,
			norma,
			theta,
		});

		const dxi1 = xi1 - xi;
		const deta1 = eta - eta1;
		const dtheta1 = theta - theta1;
		const length1 = lengthV(dxi1, deta1, dtheta1);

		lyapunov += Math.log(length1 / epsilon);

		xi1 = xi + dxi1 / length1 * epsilon;
		eta1 = eta + deta1 / length1 * epsilon;
		theta1 = theta + theta1 / length1 * epsilon;
	}

	return { data, lyapunov };
}

(() => {
	const inputWrapper = document.getElementById('inputWrapper');
	const outputWrapper = document.getElementById('outputWrapper');

	if (!inputWrapper || !outputWrapper) {
		return;
	}

	const r = createR(inputWrapper);

	r.addInput(NameInput.count, { value: 1000, placeholder: 'Кол-во точек на графике' }).addEventListener('change', updateData);
	r.addInput(NameInput.start, { value: 500, placeholder: 'Начать с точки с индексом' }).addEventListener('change', updateData);
	r.addInput(NameInput.delta, { value: 0.02, placeholder: 'Шаг градиента' }).addEventListener('change', updateData);
	r.addInput(NameInput.norma, { type: 'checkbox', value: false, placeholder: 'Нормализовывать градиент' }).addEventListener('change', updateNorma);
	r.addInput(NameInput.kNorma, { value: 0.12, placeholder: 'Коэффициент нормализации' }).addEventListener('change', updateData);
	r.addInput(NameInput.showPerspective, { type: 'checkbox', placeholder: 'Использовать перспективу' }).addEventListener('change', updatePerspective);
	r.addHr();
	r.addInput(NameInput.c1, { value: 7, placeholder: 'Коэффициент c<sub>1</sub>' }).addEventListener('change', updateData);
	r.addInput(NameInput.c2, { value: -6, placeholder: 'Коэффициент c<sub>2</sub>' }).addEventListener('change', updateData);
	r.addInput(NameInput.k, { value: 1, placeholder: 'Коэффициент k' }).addEventListener('change', updateData);
	r.addHr();
	r.addInput(NameInput.xi, { value: 0.5, placeholder: 'Коэффициент ξ' }).addEventListener('change', updateData);
	r.addInput(NameInput.eta, { value: 0.5, placeholder: 'Коэффициент η' }).addEventListener('change', updateData);
	r.addInput(NameInput.thetaMul, { value: 1, placeholder: 'Коэффициент θ / π' }).addEventListener('change', updateData);
	r.addHr();
	r.addInput(NameInput.epsilon, { value: 0.1, placeholderId: '1' }).addEventListener('change', updateData);
	const wrapperButton = document.createElement('div');
	wrapperButton.style.display = 'flex';
	wrapperButton.style.flexDirection = 'row';
	wrapperButton.style.flexWrap = 'wrap';
	inputWrapper.appendChild(wrapperButton);
	const recalc = document.createElement('button');
	recalc.innerHTML = '&#8635;';
	recalc.addEventListener('click', updateData);
	wrapperButton.appendChild(recalc);
	const calcHotMap = document.createElement('button');
	calcHotMap.innerHTML = '🔥';
	calcHotMap.disabled = window.location.hash === '';
	wrapperButton.appendChild(calcHotMap);
	r.addHr();
	const main = document.createElement('div');
	main.style.outline = '1px solid black';
	main.style.width = '200px';
	main.style.height = '200px';
	main.style.resize = 'both';
	main.style.overflow = 'overlay';
	main.style.backgroundImage = 'url(./hotmap0.1t.png)';
	main.style.backgroundSize = 'contain';
	const cursor = document.createElement('div');
	cursor.style.backgroundColor = 'white';
	cursor.style.width = '10px';
	cursor.style.height = '10px';
	cursor.style.borderRadius = '5px';
	main.style.borderRadius = '5px';
	cursor.style.outline = '1px solid black';
	main.appendChild(cursor);
	const setInput2D = addInput2D(cursor, main, (x, y) => {
		x = 20 * x - 10;
		y = 10 - 20 * y;

		let needUpdate = false;
		needUpdate = r.setValueAsString(NameInput.c1, x.toFixed(2)) || needUpdate;
		needUpdate = r.setValueAsString(NameInput.c2, y.toFixed(2)) || needUpdate;

		if (needUpdate) {
			updateData();
		}
	});
	inputWrapper.appendChild(main);
	setInput2D(
		(r.getValueAsNumber(NameInput.c1) + 10) / 20,
		(10 - r.getValueAsNumber(NameInput.c2)) / 20,
	);

	['0.1f', '0.1t', '0.3f', '0.05f', '0.01f', 'point'].forEach((e) => {
		const changeHotMap = document.createElement('button');
		changeHotMap.innerHTML = `🗺️${e}`;
		changeHotMap.onclick = () => { main.style.backgroundImage = `url(./hotmap${e}.png)`; };
		wrapperButton.appendChild(changeHotMap);
	});

	const upSizeMain = document.createElement('button');
	upSizeMain.innerHTML = '🍄';
	upSizeMain.onclick = () => {
		const size = Math.max(+main.style.width.slice(0, -2), +main.style.height.slice(0, -2));
		main.style.width = `${size * 1.5}px`;
		main.style.height = `${size * 1.5}px`;
	};
	wrapperButton.appendChild(upSizeMain);

	const hideProps = document.createElement('button');
	hideProps.innerHTML = '👀';
	hideProps.onclick = () => {
		(<HTMLElement[]>[...inputWrapper.children]).some((e) => {
			// @ts-ignore
			e.style.display = e.style.display ? null : 'none';
			return e === r.getInput(NameInput.epsilon).previousElementSibling!
				.previousElementSibling;
		});
	};
	wrapperButton.appendChild(hideProps);

	const graph3d = createGraph3d(calcDataSet(r).data, outputWrapper);
	r.setValueAsBoolean(NameInput.showPerspective, graph3d.showPerspective);
	r.getInput(NameInput.kNorma).disabled = !r.getInput(NameInput.norma).checked;

	function updateData() {
		const { data, lyapunov } = calcDataSet(r);
		graph3d.setOptions({ style: 'line' });
		graph3d.setData(data);
		(r.getInput(NameInput.epsilon).previousElementSibling as HTMLElement)
			.innerText = lyapunov.toString();
	}
	function updatePerspective(this: HTMLInputElement) {
		graph3d.setOptions({ showPerspective: this.checked });
	}
	function updateNorma() {
		r.getInput(NameInput.kNorma).disabled = !r.getInput(NameInput.norma).checked;
		updateData();
	}

	calcHotMap.addEventListener('click', () => {
		const arr: any[] = [];
		const chanks: Promise<void>[] = [];

		const mul = 10;

		console.time('calcHotMap');
		for (let p1 = -10 * mul; p1 <= 10 * mul; p1++) {
			for (let p2 = -10 * mul; p2 <= 10 * mul; p2++) {
				const c1 = p1 / mul;
				const c2 = p2 / mul;
				if (chanks.length % 1000 === 0) console.log('chanks', chanks.length);
				chanks.push(
					Promise.resolve().then(() => {
						if (arr.length % 1000 === 0) console.log('arr', arr.length, c1, c2);
						arr.push([
							c1,
							c2,
							calcDataSet(r, { c1, c2 }).lyapunov,
						]);
					}),
				);
			}
		}
		Promise.all(chanks).then(() => { console.log(arr); console.timeEnd('calcHotMap'); });

		// graph3d.setOptions({ style: 'surface' });
		// graph3d.setData(data);
	});

	// const button1 = document.createElement('button');
	// button1.innerText = 'Сгенерить';
	// button1.addEventListener('click', updateData);
	// inputWrapper.appendChild(button1);

	// const p = document.createElement('p');
	// output1.appendChild(p);

	// graph3d.on('cameraPositionChange', (event: any) => {
	// 	console.log(`${'The camera position changed to:\n'
	// 	+ 'Horizontal: '}${event.horizontal}\n`
	// 	+ `Vertical: ${event.vertical}\n`
	// 	+ `Distance: ${event.distance}`);
	// });

	// @ts-ignore
	window.graph3d = graph3d;
})();
