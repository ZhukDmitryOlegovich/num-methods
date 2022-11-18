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
}
/* eslint-enable no-unused-vars, no-shadow */

(() => {
	const inputWrapper = document.getElementById('inputWrapper');
	const outputWrapper = document.getElementById('outputWrapper');

	if (!inputWrapper || !outputWrapper) {
		return;
	}

	const allInput: Record<string, HTMLInputElement> = {};

	const desk: Record<NameInput, string> = {
		[NameInput.count]: 'Кол-во точек на графике',
		[NameInput.delta]: 'Шаг графика',
		[NameInput.xi]: 'Коэффициент ξ',
		[NameInput.eta]: 'Коэффициент η',
		[NameInput.thetaMul]: 'Коэффициент θ / π',
		[NameInput.c1]: 'Коэффициент c<sub>1</sub>',
		[NameInput.c2]: 'Коэффициент c<sub>2</sub>',
		[NameInput.k]: 'Коэффициент k',
	};

	const addInput = (name: NameInput, value: number) => {
		const span = document.createElement('span');
		span.innerHTML = desk[name] || name;
		inputWrapper.appendChild(span);
		const inputA = document.createElement('input');
		inputA.type = 'number';
		inputA.placeholder = name;
		inputA.valueAsNumber = value;
		inputWrapper.appendChild(inputA);
		allInput[name] = inputA;
	};

	const getInput = (name: NameInput) => allInput[name].valueAsNumber;

	addInput(NameInput.count, 1000);
	addInput(NameInput.delta, 0.1);
	addInput(NameInput.xi, 0.5);
	addInput(NameInput.eta, 0.5);
	addInput(NameInput.thetaMul, 1);
	addInput(NameInput.c1, 7);
	addInput(NameInput.c2, -6);
	addInput(NameInput.k, 1);

	const span = document.createElement('span');
	span.innerHTML = 'Использовать перспективу';
	inputWrapper.appendChild(span);

	const checkbox = document.createElement('input');
	checkbox.type = 'checkbox';
	inputWrapper.appendChild(checkbox);

	const button1 = document.createElement('button');
	button1.innerText = 'Сгенерить';
	inputWrapper.appendChild(button1);

	// const p = document.createElement('p');
	// output1.appendChild(p);

	const calcDataSet = () => {
		const data = new vis.DataSet();
		const count = getInput(NameInput.count);
		const delta = getInput(NameInput.delta);

		const c1 = getInput(NameInput.c1);
		const c2 = getInput(NameInput.c2);
		const k = getInput(NameInput.k);

		let xi = getInput(NameInput.xi);
		let eta = getInput(NameInput.eta);
		let theta = getInput(NameInput.thetaMul) * Math.PI;

		for (let index = 1; index < count; index++) {
			const cosTheta = Math.cos(theta);
			const sinTheta = Math.sin(theta);

			data.add({
				x: xi * sinTheta,
				y: xi * cosTheta,
				z: eta,
				xi,
				theta,
			});

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

			const length = Math.sqrt(xiD * xiD + etaD * etaD + thetaD * thetaD);

			xi += xiD / length * delta;
			eta += etaD / length * delta;
			theta += thetaD / length * delta;
		}

		return data;
	};

	const createGraph3d = (data: any) => {
		const options2 = {
			width: '100%',
			// костыль, чтобы не привышать размер
			height: 'calc(100% - 3px)',
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
			yCenter: '40%',
			axisFontSize: 80,
		};

		return new vis.Graph3d(outputWrapper, data, options2);
	};

	const didUpdate = (graph3d: any) => {
		checkbox.checked = graph3d.showPerspective;
	};

	const graph3d = createGraph3d(calcDataSet());
	didUpdate(graph3d);

	// graph3d.on('cameraPositionChange', (event: any) => {
	// 	console.log(`${'The camera position changed to:\n'
	// 	+ 'Horizontal: '}${event.horizontal}\n`
	// 	+ `Vertical: ${event.vertical}\n`
	// 	+ `Distance: ${event.distance}`);
	// });

	// @ts-ignore
	// window.graph3d = graph3d;

	const updateData = () => {
		graph3d.setData(calcDataSet());
		didUpdate(graph3d);
	};

	button1.onclick = updateData;

	Object.values(allInput).forEach((input) => input.addEventListener('change', updateData));
	checkbox.onchange = () => {
		graph3d.setOptions({ showPerspective: checkbox.checked });
	};
})();
