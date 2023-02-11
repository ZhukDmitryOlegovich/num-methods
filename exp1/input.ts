import { addInput2D } from '@/utils/input2d';
import { parseHash } from '@/utils/parseHash';
import { addPath2D } from '@/utils/path2d';
import { createR, R } from '@/utils/r';

declare let vis: any;

// https://www.geogebra.org/graphing/d2nexq56

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
	recalc = 'recalc',
	radius = 'radius',
	lyapunov = 'lyapunov',
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
			distance: 2.3,
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
		yCenter: '38%',
		axisFontSize: 80,
	};

	return new vis.Graph3d(el, data, options2);
}

const lengthV2 = (x: number, y: number, z: number) => (x * x + y * y + z * z);
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

const randomV = (): [number, number, number] => {
	const x = 2 * Math.random() - 1;
	const y = 2 * Math.random() - 1;
	const z = 2 * Math.random() - 1;
	const len = lengthV(x, y, z);
	if (len < 0.01) return randomV();
	return [x / len, y / len, z / len];
};

function calcDataSet(r: R, { c1, c2, type }: { c1?: number, c2?: number; type?: 'lyapunov' | 'radius' | 'all'; } = {}) {
	const data = new vis.DataSet();

	const count = r.getValueAsNumber(NameInput.count);
	const start = r.getValueAsNumber(NameInput.start);
	const delta = r.getValueAsNumber(NameInput.delta);

	c1 ??= r.getValueAsNumber(NameInput.c1);
	c2 ??= r.getValueAsNumber(NameInput.c2);
	type ??= 'lyapunov';
	const k = r.getValueAsNumber(NameInput.k);

	const norma = r.getValueAsBoolean(NameInput.norma);
	const kNorma = r.getValueAsNumber(NameInput.kNorma);

	let xi = r.getValueAsNumber(NameInput.xi);
	let eta = r.getValueAsNumber(NameInput.eta);
	let theta = r.getValueAsNumber(NameInput.thetaMul) * Math.PI;

	let sumX = 0;
	let sumY = 0;
	let sumZ = 0;

	const [dxi, deta, dtheta] = randomV();

	const epsilon = r.getValueAsNumber(NameInput.epsilon);

	let xi1 = xi + dxi * epsilon;
	let eta1 = eta + deta * epsilon;
	let theta1 = theta + dtheta * epsilon;

	let lyapunov = 0;
	const simpleData: [number, number, number][] = [];

	for (let index = 0; index < count + start; index++) {
		const cosTheta = Math.cos(theta);
		const sinTheta = Math.sin(theta);

		if (index >= start) {
			const x = xi * sinTheta;
			const y = xi * cosTheta;
			const z = eta;

			if (type === 'all' || type === 'radius') {
				sumX += x;
				sumY += y;
				sumZ += z;

				simpleData.push([x, y, z]);
			}

			data.add({
				x,
				y,
				z,
				xi,
				theta,
			});
		}

		[xi, eta, theta] = nextPoint({
			xi, eta, sinTheta, cosTheta, c1, c2, k, delta, kNorma, norma, theta,
		});

		if (type === 'lyapunov' || type === 'all') {
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

			if (index >= start) lyapunov += Math.log(length1 / epsilon);

			xi1 = xi + dxi1 / length1 * epsilon;
			eta1 = eta + deta1 / length1 * epsilon;
			theta1 = theta + theta1 / length1 * epsilon;
		}
	}

	const midX = sumX / simpleData.length;
	const midY = sumY / simpleData.length;
	const midZ = sumZ / simpleData.length;

	const radius = (type === 'all' || type === 'radius')
		? simpleData.reduce(
			(sum, sd) => sum + lengthV(sd[0] - midX, sd[1] - midY, sd[2] - midZ),
			0,
		) / simpleData.length : 0;

	return { data, lyapunov, radius };
}

(() => {
	const inputWrapper = document.getElementById('inputWrapper');
	const outputWrapper = document.getElementById('outputWrapper');

	if (!inputWrapper || !outputWrapper) {
		return;
	}

	const r = createR(inputWrapper);

	const b1 = r.createWrap({ className: 'row flex-fill hide' });
	const l1 = b1.createWrap({ className: 'column flex-fill' });
	l1.addInput(NameInput.count, { value: +parseHash().count || 1000, placeholder: 'Кол-во точек на графике' }).addEventListener('change', updateData);
	l1.addInput(NameInput.start, { value: +parseHash().start || 5000, placeholder: 'Начать с точки с индексом' }).addEventListener('change', updateData);
	l1.addInput(NameInput.delta, { value: 0.02, placeholder: 'Шаг градиента' }).addEventListener('change', updateData);
	const r1 = b1.createWrap({ className: 'column flex-fill' });
	r1.addInput(NameInput.norma, { type: 'checkbox', value: false, placeholder: 'Нормализовывать градиент' }).addEventListener('change', updateNorma);
	r1.addInput(NameInput.kNorma, { value: 0.12, placeholder: 'Коэффициент нормализации' }).addEventListener('change', updateData);
	r1.addInput(NameInput.showPerspective, { type: 'checkbox', placeholder: 'Использовать перспективу' }).addEventListener('change', updatePerspective);
	r.addHr().className = 'hide';
	const b2 = r.createWrap({ className: 'row flex-fill' });
	const l2 = b2.createWrap({ className: 'column flex-fill transform' });
	l2.addInput(NameInput.c1, { value: 7, placeholder: 'Коэффициент c<sub>1</sub>', step: 0.01 }).addEventListener('change', updateData);
	l2.addInput(NameInput.c2, { value: -6, placeholder: 'Коэффициент c<sub>2</sub>', step: 0.01 }).addEventListener('change', updateData);
	l2.addInput(NameInput.k, { value: 1, placeholder: 'Коэффициент k', className: 'hide column' }).addEventListener('change', updateData);
	const r2 = b2.createWrap({ className: 'column flex-fill hide' });
	r2.addInput(NameInput.xi, { value: 0.5, placeholder: 'Коэффициент ξ' }).addEventListener('change', updateData);
	r2.addInput(NameInput.eta, { value: 0.5, placeholder: 'Коэффициент η' }).addEventListener('change', updateData);
	r2.addInput(NameInput.thetaMul, { value: 1, placeholder: 'Коэффициент θ / π' }).addEventListener('change', updateData);
	r.addHr();
	const b3 = r.createWrap({ className: 'row flex-fill' });
	b3.addInput(NameInput.epsilon, { value: 0.001, placeholder: 'Эпсилон ε' }).addEventListener('change', updateData);
	const r3 = b3.createWrap({ className: 'column flex-fill' });
	r3.addInput(NameInput.lyapunov, { placeholder: 'П. Ляпунова: ' }).addEventListener('change', updateData);
	const codeL = document.createElement('code');
	codeL.className = 'number';
	r3.getSpan(NameInput.lyapunov).appendChild(codeL);
	r3.getInput(NameInput.lyapunov).style.display = 'none';
	r3.addInput(NameInput.radius, { placeholder: 'Радиус: ' }).addEventListener('change', updateData);
	const codeR = document.createElement('code');
	codeR.className = 'number';
	r3.getSpan(NameInput.radius).appendChild(codeR);
	r3.getInput(NameInput.radius).style.display = 'none';
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
	wrapperButton.appendChild(calcHotMap);
	r.addHr();
	const main = document.createElement('div');
	main.style.outline = '1px dashed black';
	main.style.width = '500px';
	main.style.height = '500px';
	main.style.resize = 'both';
	main.style.overflow = 'hidden';
	main.style.backgroundImage = 'url(./hotmappoint.png)';
	main.style.backgroundSize = 'contain';
	main.style.borderRadius = '5px';
	main.style.cursor = 'crosshair';
	const cursor = document.createElement('div');
	cursor.style.backgroundColor = 'white';
	cursor.style.width = '4px';
	cursor.style.height = '4px';
	cursor.style.borderRadius = '5px';
	cursor.style.outline = '1px auto black';
	main.appendChild(cursor);

	const setC1C2 = (x: number, y: number) => {
		x = 20 * x - 10;
		y = 10 - 20 * y;

		let needUpdate = false;
		needUpdate = r.setValueAsString(NameInput.c1, x.toFixed(2)) || needUpdate;
		needUpdate = r.setValueAsString(NameInput.c2, y.toFixed(2)) || needUpdate;

		if (needUpdate) {
			updateData();
		}
	};

	const setInput2D = addInput2D(cursor, main, setC1C2, ({ ctrlKey }) => ctrlKey);

	const [path, clearPath] = addPath2D(main, () => {
		const point = document.createElement('div');
		point.style.backgroundColor = 'white';
		point.style.width = '8px';
		point.style.height = '8px';
		point.style.borderRadius = '8px';
		point.style.outline = '1px auto black';
		point.style.position = 'absolute';
		point.style.zIndex = '100';
		return point;
	}, () => console.log(path), ({ ctrlKey }) => !ctrlKey);
	inputWrapper.appendChild(main);
	const syncInput2D = () => setInput2D(
		(r.getValueAsNumber(NameInput.c1) + 10) / 20,
		(10 - r.getValueAsNumber(NameInput.c2)) / 20,
	);
	r.getInput(NameInput.c1).addEventListener('change', syncInput2D);
	r.getInput(NameInput.c2).addEventListener('change', syncInput2D);

	// ['0.1f', '0.1t', '0.3f', '0.05f', '0.01f', '0.001f', 'point'].forEach((e) => {
	// 	const changeHotMap = document.createElement('button');
	// 	changeHotMap.innerHTML = `🗺️${e}`;
	// 	changeHotMap.id = `hotmap${e}`;
	// 	changeHotMap.onclick = () => { main.style.backgroundImage = `url(./hotmap${e}.png)`; };
	// 	wrapperButton.appendChild(changeHotMap);
	// });

	const graph3d = (() => {
		const { data, lyapunov, radius } = calcDataSet(r, { type: 'all' });
		codeL.innerText = lyapunov.toExponential(2);
		codeR.innerText = radius.toExponential(2);
		return createGraph3d(data, outputWrapper);
	})();

	const hideProps = document.createElement('button');
	let open = true;
	hideProps.innerHTML = '👀';
	hideProps.onclick = () => {
		if (inputWrapper.dataset.hideOn == null) {
			inputWrapper.dataset.hideOn = '';
		} else {
			delete inputWrapper.dataset.hideOn;
		}

		const size = open ? 700 : 500;
		main.style.width = `${size}px`;
		main.style.height = `${size}px`;

		graph3d.redraw();
		setTimeout(() => graph3d.redraw(), 10);

		open = !open;
	};
	wrapperButton.appendChild(hideProps);
	const clearPathB = document.createElement('button');
	clearPathB.innerHTML = '🗑️';
	clearPathB.onclick = () => {
		clearPath(-1);
	};
	wrapperButton.appendChild(clearPathB);
	const stAnim = document.createElement('button');
	stAnim.innerHTML = '▶️';
	{
		const onclick = () => {
			stAnim.innerHTML = '⏹️';

			const p = path.map(([l]) => l);
			const L = [0];
			for (let i = 1; i < p.length; i++) {
				L.push(
					L.at(-1)!
					+ Math.sqrt((p[i - 1][0] - p[i][0]) ** 2 + (p[i - 1][1] - p[i][1]) ** 2),
				);
			}

			let t = 0;
			let rotate = 1;
			let d = Date.now();

			const i = setInterval(() => {
				const d1 = Date.now();
				t += rotate * (d1 - d) / 1000 * (+parseHash().speed || 0.2);
				d = d1;

				if (t > L.at(-1)!) {
					t = 2 * L.at(-1)! - t;
					rotate *= -1;
				}

				if (t < 0) {
					t = -t;
					rotate *= -1;
				}

				let f = L.findIndex((v) => t < v);

				if (f === -1) f = L.length - 1;

				const pp = (t - L[f - 1]) / (L[f] - L[f - 1]);

				setC1C2(
					p[f - 1][0] + pp * (p[f][0] - p[f - 1][0]),
					p[f - 1][1] + pp * (p[f][1] - p[f - 1][1]),
				);
				syncInput2D();
			}, 10);

			stAnim.onclick = () => {
				stAnim.innerHTML = '▶️';
				stAnim.onclick = onclick;
				clearInterval(i);
			};
		};
		stAnim.onclick = onclick;
	}
	wrapperButton.appendChild(stAnim);

	[0.01, 0.1, 1, 10, 100].forEach((x) => {
		const step1 = document.createElement('button');
		step1.innerHTML = `±${x}`;
		step1.onclick = () => Object.values(r.allInput).forEach((e) => { e.step = x.toString(); });
		wrapperButton.appendChild(step1);
	});

	const { hotmap, see, calchot } = parseHash();
	if (hotmap) document.getElementById(`hotmap${hotmap}`)?.click();
	if (+see) hideProps.click();
	calcHotMap.disabled = !+calchot;

	syncInput2D();

	r.setValueAsBoolean(NameInput.showPerspective, graph3d.showPerspective);
	r.getInput(NameInput.kNorma).disabled = !r.getInput(NameInput.norma).checked;

	function updateData() {
		const { data, lyapunov, radius } = calcDataSet(r, { type: 'all' });
		graph3d.setOptions({ style: radius <= 1e-3 ? 'dot' : 'line' });
		graph3d.setData(data);
		codeL.innerText = lyapunov.toExponential(2);
		codeR.innerText = radius.toExponential(2);
	}
	function updatePerspective(this: HTMLInputElement) {
		graph3d.setOptions({ showPerspective: this.checked });
	}
	function updateNorma() {
		r.getInput(NameInput.kNorma).disabled = !r.getInput(NameInput.norma).checked;
		updateData();
	}

	calcHotMap.addEventListener('click', (event) => {
		const arr: any[] = [];
		const chanks: Promise<void>[] = [];

		const mul = +parseHash().mul || 10;
		const fromC1 = +parseHash().fromC1 || -10;
		const toC1 = +parseHash().toC1 || 10;
		const fromC2 = +parseHash().fromC2 || -10;
		const toC2 = +parseHash().toC2 || 10;
		const isRadius = !event.ctrlKey;

		Object.entries({
			isRadius, mul, fromC1, toC1, fromC2, toC2,
		}).forEach(([k, v]) => console.log({ [k]: v }));

		console.time('calcHotMap');
		for (let p1 = fromC1 * mul; p1 <= toC1 * mul; p1++) {
			for (let p2 = fromC2 * mul; p2 <= toC2 * mul; p2++) {
				const c1 = p1 / mul;
				const c2 = p2 / mul;
				chanks.push(
					Promise.resolve().then(() => {
						if (arr.length % 1000 === 0) console.log('arr', arr.length, c1, c2);
						const { lyapunov, radius } = calcDataSet(r, { c1, c2, type: isRadius ? 'radius' : 'lyapunov' });
						arr.push([
							c1,
							c2,
							isRadius ? radius : lyapunov,
						]);
					}),
				);
			}
		}
		console.log('chanks', chanks.length);
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
