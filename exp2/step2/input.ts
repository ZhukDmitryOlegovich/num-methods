import brain from 'brain.js';

import { importsJSON } from '@/utils/imports';
import { parseHash } from '@/utils/parseHash';

import { keyController } from '../contoller';
import { intersects } from '../intersects';
import { ONN } from '../ONN';
import { Car, Point, Vector } from './Car';
import {
	checkpoints, paths, SLine, SPoint,
} from './path';

// type Net = InstanceType<typeof brain.NeuralNetwork>;
// type Data = Parameters<Net['train']>[0];

const net = new brain.NeuralNetwork<number[], number[]>({
	activation: 'sigmoid',
	hiddenLayers: [6],
	iterations: 2000 * (+parseHash().iter || 1),
	learningRate: +parseHash().rate || 0.2,
});

/* eslint-disable */
declare global {
	var net: brain.NeuralNetwork<number[], number[]>;
	var paths: SPoint[][][];
	var checkpoints: SLine[][];
}
/* eslint-enable */

window.net = net;
window.paths = paths;
window.checkpoints = checkpoints;

const useONN = !!+parseHash().onn;
if (useONN) {
	// @ts-ignore
	net.overrideLayerType = ONN;
	const originToJSON = net.toJSON;
	net.toJSON = function toJSON(...args) {
		const data = originToJSON.apply(this, args);
		data.type = 'ONN';
		return data;
	};
}

let netTrained = false;

(() => {
	const node = document.getElementById('step2-input');
	const canvas = document.getElementById('step2-canvas') as HTMLCanvasElement | null;
	const text = document.getElementById('step2-text');

	if (!node || !canvas || !text) {
		console.error('fail not found');
		return;
	}

	const div = document.createElement('div');

	div.style.display = 'flex';
	div.style.flexDirection = 'row';
	div.style.alignItems = 'baseline';

	const buttonUp = document.createElement('button');
	buttonUp.innerText = 'вперед (W)';
	buttonUp.style.pointerEvents = 'none';
	div.appendChild(buttonUp);

	const buttonBack = document.createElement('button');
	buttonBack.innerText = 'назад (S)';
	buttonBack.style.pointerEvents = 'none';
	div.appendChild(buttonBack);

	const buttonStop = document.createElement('button');
	buttonStop.innerText = 'стоп (space)';
	buttonStop.style.pointerEvents = 'none';
	div.appendChild(buttonStop);

	const buttonLeft = document.createElement('button');
	buttonLeft.innerText = 'влево (A)';
	buttonLeft.style.pointerEvents = 'none';
	div.appendChild(buttonLeft);

	const buttonRight = document.createElement('button');
	buttonRight.innerText = 'вправо (D)';
	buttonRight.style.pointerEvents = 'none';
	div.appendChild(buttonRight);

	const hidePath = document.createElement('button');
	let visiblePath = true;
	hidePath.innerHTML = '👀';
	hidePath.onclick = () => {
		visiblePath = !visiblePath;
		hidePath.innerHTML = visiblePath ? '👀' : '🕶️';
	};
	div.appendChild(hidePath);
	if (+parseHash().hidePath) {
		hidePath.click();
	}

	const hideCheckpoint = document.createElement('button');
	let visibleCheckpoint = true;
	hideCheckpoint.innerHTML = '✔️';
	hideCheckpoint.onclick = () => {
		visibleCheckpoint = !visibleCheckpoint;
		hideCheckpoint.innerHTML = visibleCheckpoint ? '✔️' : '❌';
	};
	div.appendChild(hideCheckpoint);
	if (+parseHash().hideCheckpoint) {
		hideCheckpoint.click();
	}

	const hideEye = document.createElement('button');
	let visibleEye = true;
	hideEye.innerHTML = '🦇';
	hideEye.onclick = () => {
		visibleEye = !visibleEye;
		hideEye.innerHTML = visibleEye ? '🦇' : '🚗';
	};
	div.appendChild(hideEye);
	if (+parseHash().hideEye) {
		hideEye.click();
	}

	const useBotButton = document.createElement('button');
	let useBot = true;
	useBotButton.innerHTML = '🦾';
	useBotButton.onclick = () => {
		useBot = !useBot;
		useBotButton.innerHTML = useBot ? '🦾' : '💪';
	};
	div.appendChild(useBotButton);
	if (+parseHash().people) {
		useBotButton.click();
	}

	const restartButton = document.createElement('button');
	restartButton.innerHTML = '🔄';
	div.appendChild(restartButton);

	const restartLoopButton = document.createElement('button');
	let restartLoop = true;
	restartLoopButton.innerHTML = '1️⃣';
	restartLoopButton.onclick = () => {
		restartLoop = !restartLoop;
		restartLoopButton.innerHTML = restartLoop ? '1️⃣' : '♾️';
	};
	div.appendChild(restartLoopButton);
	if (+parseHash().inf) {
		restartLoopButton.click();
	}

	let indexTrack = 0;
	let selCheckpoint = window.checkpoints[indexTrack];
	let selPath = window.paths[indexTrack];
	const changeTracktButton = document.createElement('button');
	const pref = '🏎️';
	const makeNum = (n: number) => n.toFixed(0).split('').map((nn) => String.fromCharCode(+nn + 48, 65039, 8419)).join('');
	changeTracktButton.innerHTML = pref + makeNum(indexTrack + 1);
	changeTracktButton.onclick = () => {
		restart();
		indexTrack += 1;
		indexTrack %= window.paths.length;
		selCheckpoint = window.checkpoints[indexTrack];
		selPath = window.paths[indexTrack];
		changeTracktButton.innerHTML = pref + makeNum(indexTrack + 1);
	};
	div.appendChild(changeTracktButton);

	node.appendChild(div);

	const fps = document.createElement('code');
	fps.style.marginBottom = '1em';
	text.appendChild(fps);

	const ctx = canvas.getContext('2d');

	if (!ctx) {
		console.error('fail not found ctx');
		return;
	}

	type AllOrNever<T> = T | Partial<Record<keyof T, never>>;

	// eslint-disable-next-line no-unused-vars
	const aToPi = (angle: number) => angle / 180 * Math.PI;
	// eslint-disable-next-line no-unused-vars
	const piToA = (radian: number) => radian * 180 / Math.PI;

	const fillRect = ({
		x, y, w, h, a = 0, cx = x + w / 2, cy = y + h / 2,
	}: {
		x: number,
		y: number,
		w: number,
		h: number,
		a?: number,
	} & AllOrNever<{
		cx: number,
		cy: number,
	}>) => {
		ctx.translate(cx, cy);
		ctx.rotate(a);
		ctx.translate(-cx, -cy);

		ctx.fillRect(x, y, w, h);

		ctx.setTransform(1, 0, 0, 1, 0, 0);
	};

	const start = Date.now();

	const { keyActive } = keyController();

	const w = 20;
	const h = 10;

	const s = 300;

	let startAfterReset = start;

	const car = new Car(55, 320, {
		maxSpeed: s,
		turn: Math.PI,
		resistance: s,
		dspeed: 2 * s,
		angle: -Math.PI / 2,
	});

	const carColor = 'red';

	const drawCar = () => {
		const cx = car.position.x;
		const cy = car.position.y;
		const x = cx - w / 2;
		const y = cy - h / 2;
		const a = car.angle;
		ctx.fillStyle = carColor;
		fillRect({
			x, y, w, h, cx, cy, a,
		});

		const miniW = w / 8;
		const miniH = h / 3;

		ctx.fillStyle = 'black';
		fillRect({
			x: x + w - miniW - 1, y: y + 1, w: miniW, h: miniH, cx, cy, a,
		});
		fillRect({
			x: x + w - miniW - 1, y: y + h - miniH - 1, w: miniW, h: miniH, cx, cy, a,
		});
	};

	const isClickCheck = parseHash().click === 'check';
	const isClickPath = parseHash().click === 'path';

	const arrCheck: SLine[] = [];
	if (isClickCheck) {
		let lastPoint: SPoint | null = null;
		canvas.addEventListener('click', (e) => {
			if (e.ctrlKey) {
				if (lastPoint) {
					lastPoint = null;
				} else if (arrCheck.length !== 0) {
					[lastPoint] = arrCheck.pop()!;
				}
				return;
			}

			const point: SPoint = [e.clientX - canvas.offsetLeft, e.clientY - canvas.offsetTop];

			if (lastPoint) {
				arrCheck.push([lastPoint, point]);
				lastPoint = null;
			} else {
				lastPoint = point;
			}

			console.log('==>', arrCheck);
		});
	}

	const arrPoints: SPoint[] = [];
	if (isClickPath) {
		canvas.addEventListener('click', (e) => {
			if (e.ctrlKey) {
				arrPoints.pop();
				return;
			}

			const point: SPoint = [e.clientX - canvas.offsetLeft, e.clientY - canvas.offsetTop];

			arrPoints.push(point);

			console.log('==>', arrPoints);
		});
	}

	const drawPath = (
		points: SPoint[],
		options: { close?: boolean, color?: string; lineWidth?: number; } = {},
	) => {
		if (!points.length) {
			return;
		}
		ctx.lineWidth = options.lineWidth || 1;
		ctx.strokeStyle = options.color || 'darkrgey';

		ctx.beginPath();
		ctx.moveTo(...points[0]);

		points.slice(1).forEach((point) => {
			ctx.lineTo(...point);
		});

		if (options.close) {
			ctx.lineTo(...points[0]);
		}

		ctx.stroke();
		ctx.closePath();

		ctx.lineWidth = 1;
	};

	let collision: SLine[] = [];
	let carEyes: SLine[] = [];
	let carEyesCollision: ([NonNullable<ReturnType<typeof intersects>>, number] | null)[] = [];

	const eyesInfo: HTMLElement[] = [];
	let hoverIndex: number | null = null;
	let speedIndo: HTMLElement | null = null;
	const otherInfo: HTMLElement[] = [];

	const depthEye = 200;

	let nowCheckpointIndex = -1;
	let nextCheckpointIndex = 0;
	let countOkCheckpoints = 0;
	let countNotOkCheckpoints = 0;

	const chOK = 'rgba(0,255,0,.2)';
	const chN = 'rgba(255,255,0,.2)';
	const chF = 'rgba(255,0,0,.2)';

	const neuralValueInput: number[] = [];
	const neuralValueOutput: number[] = [];

	const draw = () => {
		drawCar();
		if (visiblePath) {
			selPath.forEach((path) => drawPath(path, { close: true }));
		}
		if (isClickPath) {
			drawPath(arrPoints, { close: true });
		}
		collision.forEach((line) => {
			drawPath(line, { close: false, color: 'lightgrey' });
		});
		if (visibleEye) {
			carEyes.forEach((line, i) => {
				drawPath(line, { close: false, color: hoverIndex === i ? 'lightgreen' : 'black', lineWidth: hoverIndex === i ? 3 : 1 });
			});
		}
		if (visibleCheckpoint) {
			selCheckpoint.forEach((line, index) => {
				drawPath(line, {
					close: false,
					color: index === nextCheckpointIndex
						? chOK
						: index === nowCheckpointIndex
							? chN
							: chF,
					lineWidth: 3,
				});
			});
		}
		if (isClickCheck) {
			arrCheck.forEach((line) => {
				drawPath(line, {
					close: false,
					color: chOK,
					lineWidth: 3,
				});
			});
		}
		carEyesCollision.forEach((data, i) => {
			eyesInfo[i] ??= (() => {
				const p = document.createElement('code');
				p.classList.add('select');
				p.addEventListener('mouseover', () => {
					hoverIndex = i;
				});
				p.addEventListener('mouseout', () => {
					if (hoverIndex === i) {
						hoverIndex = null;
					}
				});
				text.appendChild(p);
				return p;
			})();
			if (!data) {
				neuralValueInput[i] = 0;
				eyesInfo[i].innerText = `eye${i}: 0`;
				return;
			}
			const [point, l2] = data;
			neuralValueInput[i] = 1 - Math.sqrt(l2) / depthEye;
			eyesInfo[i].innerText = `eye${i}: ${neuralValueInput[i].toFixed(2)}`;

			if (visibleEye) {
				const [x, y] = point;
				ctx.beginPath();
				ctx.fillStyle = 'lightgrey';
				ctx.strokeStyle = 'black';
				ctx.arc(x, y, 3, 0, 2 * Math.PI);
				ctx.fill();
				ctx.stroke();
			}
		});
		speedIndo ??= (() => {
			const p = document.createElement('code');
			p.style.marginBottom = '1em';
			text.appendChild(p);
			return p;
		})();
		const speedIndexNeuralValue = carEyesCollision.length;
		neuralValueInput[speedIndexNeuralValue] = (car.speed / car.options.maxSpeed + 1) / 2;
		speedIndo.innerText = `speed: ${neuralValueInput[speedIndexNeuralValue].toFixed(2)}`;

		let ind = -1;
		otherInfo[++ind] ??= (() => {
			const p = document.createElement('code');
			text.appendChild(p);
			return p;
		})();
		neuralValueOutput[ind] = Math.max(car.getDirection(), 0);
		otherInfo[ind].innerText = `direction: ${neuralValueOutput[ind].toFixed(2)}`;
		otherInfo[++ind] ??= (() => {
			const p = document.createElement('code');
			p.style.marginBottom = '1em';
			text.appendChild(p);
			return p;
		})();
		neuralValueOutput[ind] = (car.getTurn() + 1) / 2;
		otherInfo[ind].innerText = `turn: ${neuralValueOutput[ind].toFixed(2)}`;

		otherInfo[++ind] ??= (() => {
			const p = document.createElement('code');
			text.appendChild(p);
			return p;
		})();
		otherInfo[ind].innerText = `ok: ${countOkCheckpoints}`;
		otherInfo[++ind] ??= (() => {
			const p = document.createElement('code');
			text.appendChild(p);
			return p;
		})();
		otherInfo[ind].innerText = `not-ok: ${countNotOkCheckpoints}`;
		otherInfo[++ind] ??= (() => {
			const p = document.createElement('code');
			text.appendChild(p);
			return p;
		})();
		otherInfo[ind].innerText = `time: ${((Date.now() - startAfterReset) / 1000).toFixed(0)}`;

		dataForNeural.push({ in: [...neuralValueInput], out: [...neuralValueOutput] });
	};

	let lastInc = start;
	let arrDeltaTime: number[] = [];
	let lastFPS = 'NaN';

	setInterval(() => {
		const newFPS = (arrDeltaTime.length / arrDeltaTime.reduce((a, b) => a + b, 0)).toFixed(0);
		if (newFPS !== lastFPS) {
			lastFPS = newFPS;
			fps.innerText = `fps: ${newFPS}`;
		}
	}, 300);

	const dataForNeural: { in: number[], out: number[]; }[] = [];
	const bigData: { in: number[], out: number[]; }[] = [];

	const at = <Arr extends any[]>(arr: Arr, index: number): Arr[number] => arr[
		((index % arr.length) + arr.length) % arr.length
	];

	const length2 = (
		x1: number, y1: number, x2: number, y2: number,
	) => (x1 - x2) ** 2 + (y1 - y2) ** 2;

	let wasFinish = false;

	const restart = () => {
		wasFinish = countOkCheckpoints >= selCheckpoint.length;

		if (countOkCheckpoints >= selCheckpoint.length) {
			bigData.push(...dataForNeural);
			console.log('=>', bigData);
			if (restartLoop) {
				car.$reset();
				nowCheckpointIndex = -1;
				nextCheckpointIndex = 0;
			}
		} else {
			if (netTrained && useBot && restartLoop && !wasFinish) {
				window.location.reload();
			}
			car.$reset();
			nowCheckpointIndex = -1;
			nextCheckpointIndex = 0;
		}

		console.log('restart');

		dataForNeural.length = 0;
		startAfterReset = Date.now();
		countOkCheckpoints = 0;
		countNotOkCheckpoints = 0;
	};
	restartButton.onclick = restart;

	const checkCollision = () => {
		const x = w / 2;
		const y = h / 2;

		const moveToCar = (point: SPoint) => new Point(...point)
			.$rotate(car.angle)
			.$move(car.position);

		const carPoints = ([
			[x, y],
			[x, -y],
			[-x, -y],
			[-x, y],
		] as SPoint[]).map(moveToCar);

		type Eye = [SPoint, number][];

		carEyes = ([
			[[x, 0], 0],
			[[x, y], Math.PI / 12],
			[[x, y], Math.PI / 4],
			[[x, y], Math.PI / 2],
			[[-x, y], 3 * Math.PI / 4],
			[[-x, 0], Math.PI],
		] as Eye)
			.flatMap((data): Eye => (data[0][1] === 0 && data[1] % Math.PI === 0
				? [data]
				: [data, [[data[0][0], -data[0][1]], -data[1]]]))
			.map(([data, a]): SLine => {
				const p1 = moveToCar(data);
				const p2 = p1.clone().$move(Vector.Polar(depthEye, a + car.angle));
				return [p1.toArr(), p2.toArr()];
			});

		const carCollision = carPoints
			.map((point) => point.toArr())
			.map((point, i, arr): SLine => [point, at(arr, i + 1)]);

		const createLinesWithClosePath = (path: SPoint[]) => path
			.map((point, i, arr): SLine => [point, at(arr, i + 1)]);

		const checkCollisionByLines = (line: SLine) => carCollision
			.some((carLine) => intersects(carLine, line));

		const allCheckColisionLine = selPath.flatMap(createLinesWithClosePath);

		collision = allCheckColisionLine.filter(checkCollisionByLines);

		const findIndexCheckpointCollision = selCheckpoint.findIndex(checkCollisionByLines);

		if (
			findIndexCheckpointCollision !== -1
			&& nowCheckpointIndex !== findIndexCheckpointCollision
		) {
			if (findIndexCheckpointCollision === nextCheckpointIndex) {
				countOkCheckpoints++;
			} else {
				countNotOkCheckpoints++;
			}

			nowCheckpointIndex = findIndexCheckpointCollision;
			nextCheckpointIndex = (nowCheckpointIndex + 1) % selCheckpoint.length;
		}

		carEyesCollision = carEyes.map((line) => allCheckColisionLine.reduce<
			[NonNullable<ReturnType<typeof intersects>>, number] | null
		>((ans, oLine) => {
			const inter = intersects(line, oLine);
			if (inter) {
				const l2 = length2(line[0][0], line[0][1], ...inter);
				if (!ans || l2 < ans[1]) {
					return [inter, l2];
				}
			}
			return ans;
		}, null));

		if (collision.length
			|| countNotOkCheckpoints !== 0
			|| countOkCheckpoints >= selCheckpoint.length) {
			restart();
		}
		// carColor = collision.length === 0 ? OK : FAIL;
	};

	const inc = () => {
		const now = Date.now();
		const deltaTime = (now - lastInc) / 1000;
		arrDeltaTime.push(deltaTime);
		arrDeltaTime = arrDeltaTime.slice(-20);
		lastInc = now;

		if (netTrained && useBot) {
			const run = net.run(neuralValueInput);
			// стало от 0 до 1
			// а надо от -1 до 1
			// eslint-disable-next-line prefer-destructuring
			car.direction = 2 * run[0] - 1;
			car.turn = 2 * run[1] - 1;

			// car.direction = Math.max(car.direction, 0.02);
		} else {
			if (keyActive('space')) {
				car.direction = 'stop';
			} else if (keyActive('up')) {
				car.direction = 'forward';
			} else if (keyActive('down')) {
				car.direction = 'back';
			} else {
				car.direction = null;
			}

			if (keyActive('left')) {
				car.turn = 'left';
			} else if (keyActive('right')) {
				car.turn = 'right';
			} else {
				car.turn = null;
			}
		}

		buttonUp.disabled = (car.direction !== 'forward');
		buttonBack.disabled = (car.direction !== 'back');
		buttonStop.disabled = (car.direction !== 'stop');
		buttonLeft.disabled = (car.turn !== 'left');
		buttonRight.disabled = (car.turn !== 'right');

		car.$step(deltaTime);

		checkCollision();
	};

	const step = () => {
		requestAnimationFrame(step);
		inc();
		ctx.save();
		ctx.setTransform(1, 0, 0, 1, 0, 0);
		ctx.clearRect(0, 0, canvas.width, canvas.height);
		draw();
		ctx.restore();
	};

	requestAnimationFrame(step);

	const seePath = parseHash().see;

	if (+parseHash().train) {
		importsJSON<{ in: number[], out: number[]; }[]>('../data.json').then(async (data) => {
			const normalData = data.map((pieceData) => {
				const output = pieceData.out;
				output[0] = output[0] / 2 + 0.5;

				return {
					input: pieceData.in,
					// см. https://github.com/BrainJS/brain.js#for-training-with-neuralnetwork
					output,
				};
			});

			const norm2 = (x: unknown): x is number => typeof x === 'number' && 0 <= x && x <= 1;
			const norm = (x: unknown): x is number[] => Array.isArray(x) && x.every(norm2);

			console.log(normalData.find(({ input, output }) => !(norm(input) && norm(output))));

			const trainPart = 1;
			const trainSize = Math.round(normalData.length * trainPart);
			const trainData = normalData.slice(0, trainSize);
			console.log('=>', 'start', 'netTrained', trainData);

			console.time('netTrained');
			await net.trainAsync(trainData);

			console.timeEnd('netTrained');
			restart();
			netTrained = true;
			if (!useBot) {
				useBotButton.click();
			}
			console.log('=>', 'complite', 'netTrained');
		}).finally(() => {
			console.log('=>', 'finally', 'netTrained');
		});
	} else if (seePath) {
		importsJSON<any>(seePath).then((data) => {
			console.log('=>', 'start', 'netSee', { seePath });

			if (useONN) {
				if (data.type !== 'ONN') {
					throw new TypeError('incorrect type, waited ONN');
				}
			} else if (data.type !== 'NeuralNetwork') {
				throw new TypeError('incorrect type, waited NeuralNetwork');
			}

			data.type = 'NeuralNetwork';
			net.fromJSON(data);
			netTrained = true;
			console.log('=>', 'complite', 'netSee');
		}).finally(() => {
			console.log('=>', 'finally', 'netSee');
		});
	}
})();
