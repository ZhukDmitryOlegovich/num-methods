import { keyController } from '../contoller.js';
import { intersects } from '../intersects.js';
import { Car, Point, Vector } from './Car.js';
import { left, right } from './path.js';
(() => {
    const node = document.getElementById('step2-input');
    const canvas = document.getElementById('step2-canvas');
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
    const hideProps = document.createElement('button');
    let visiblePath = true;
    hideProps.innerHTML = '👀';
    hideProps.onclick = () => { visiblePath = !visiblePath; };
    div.appendChild(hideProps);
    node.appendChild(div);
    const fps = document.createElement('code');
    text.appendChild(fps);
    const ctx = canvas.getContext('2d');
    if (!ctx) {
        console.error('fail not found ctx');
        return;
    }
    // eslint-disable-next-line no-unused-vars
    const aToPi = (angle) => angle / 180 * Math.PI;
    // eslint-disable-next-line no-unused-vars
    const piToA = (radian) => radian * 180 / Math.PI;
    const fillRect = ({ x, y, w, h, a = 0, cx = x + w / 2, cy = y + h / 2, }) => {
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
    const car = new Car(205, 320, {
        speed: { min: -s, max: s },
        turn: Math.PI,
        resistance: s,
        dspeed: 2 * s,
    });
    car.angle = -Math.PI / 2;
    const OK = 'red';
    const FAIL = 'green';
    let carColor = OK;
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
    // const arrPoints: [number, number][] = [];
    // canvas.addEventListener('mousedown', (e) => {
    // 	if (e.ctrlKey) {
    // 		arrPoints.pop();
    // 		return;
    // 	}
    // 	arrPoints.push([e.clientX - canvas.offsetLeft, e.clientY - canvas.offsetTop]);
    // 	console.log(arrPoints);
    // });
    const drawPath = (points, options = {}) => {
        if (!points.length) {
            return;
        }
        ctx.lineWidth = 1;
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
    };
    let collision = [];
    let carEyes = [];
    let carEyesCollision = [];
    const eyesInfo = [];
    const depthEye = 200;
    const draw = () => {
        drawCar();
        if (visiblePath) {
            drawPath(left, { close: true });
            drawPath(right, { close: true });
        }
        collision.forEach(([x1, y1, x2, y2]) => {
            drawPath([[x1, y1], [x2, y2]], { close: false, color: 'lightgrey' });
        });
        carEyes.forEach(([x1, y1, x2, y2]) => {
            drawPath([[x1, y1], [x2, y2]], { close: false, color: 'black' });
        });
        carEyesCollision.forEach((data, i) => {
            eyesInfo[i] ?? (eyesInfo[i] = (() => {
                const p = document.createElement('code');
                text.appendChild(p);
                return p;
            })());
            if (!data) {
                eyesInfo[i].innerText = `${i}: 0.000`;
                return;
            }
            const [point, l2] = data;
            eyesInfo[i].innerText = `${i}: ${(1 - Math.sqrt(l2) / depthEye).toFixed(3)}`;
            const [x, y] = point;
            ctx.beginPath();
            ctx.fillStyle = 'lightgrey';
            ctx.strokeStyle = 'black';
            ctx.arc(x, y, 3, 0, 2 * Math.PI);
            ctx.fill();
            ctx.stroke();
        });
    };
    let lastInc = start;
    let arrDeltaTime = [];
    let lastFPS = 'NaN';
    setInterval(() => {
        const newFPS = (arrDeltaTime.length / arrDeltaTime.reduce((a, b) => a + b, 0)).toFixed(0);
        if (newFPS !== lastFPS) {
            lastFPS = newFPS;
            fps.innerText = `fps: ${newFPS}`;
        }
    }, 300);
    const at = (arr, index) => arr[((index % arr.length) + arr.length) % arr.length];
    const length2 = (x1, y1, x2, y2) => (x1 - x2) ** 2 + (y1 - y2) ** 2;
    const checkCollision = () => {
        const x = w / 2;
        const y = h / 2;
        const $moveToCar = (point) => point.$rotate(car.angle).$move(car.position);
        const carPoints = [
            [x, y],
            [x, -y],
            [-x, -y],
            [-x, y],
        ].map((data) => new Point(...data)).map($moveToCar);
        carEyes = [
            [[x, 0], 0],
            [[x, y], Math.PI / 12],
            [[x, y], Math.PI / 4],
            [[x, y], Math.PI / 2],
            [[-x, y], 3 * Math.PI / 4],
            [[-x, 0], Math.PI],
        ]
            .flatMap((data) => (data[0][1] === 0 && data[1] % Math.PI === 0
            ? [data]
            : [data, [[data[0][0], -data[0][1]], -data[1]]]))
            .map(([data, a]) => {
            const p1 = new Point(...data);
            $moveToCar(p1);
            const p2 = p1.clone().$move(Vector.Polar(depthEye, a + car.angle));
            return [...p1.toArr(), ...p2.toArr()];
        });
        const carCollision = carPoints
            .map((point) => point.toArr())
            .map((point, i, arr) => [...point, ...at(arr, i + 1)]);
        const createLinesWithClosePath = (path) => path
            .map((point, i, arr) => [...point, ...at(arr, i + 1)]);
        const checkCollisionByLines = (line) => carCollision
            .some((carLine) => intersects(...carLine, ...line));
        const allCheckColisionLine = [
            left, right,
        ].flatMap(createLinesWithClosePath);
        collision = allCheckColisionLine.filter(checkCollisionByLines);
        carEyesCollision = carEyes.map((line) => allCheckColisionLine.reduce((ans, oLine) => {
            const inter = intersects(...line, ...oLine);
            if (inter) {
                const l2 = length2(line[0], line[1], ...inter);
                if (!ans || l2 < ans[1]) {
                    return [inter, l2];
                }
            }
            return ans;
        }, null));
        carColor = collision.length === 0 ? OK : FAIL;
    };
    const inc = () => {
        const now = Date.now();
        const deltaTime = (now - lastInc) / 1000;
        arrDeltaTime.push(deltaTime);
        arrDeltaTime = arrDeltaTime.slice(-20);
        lastInc = now;
        if (keyActive('space')) {
            car.direction = 'stop';
        }
        else if (keyActive('up')) {
            car.direction = 'forward';
        }
        else if (keyActive('down')) {
            car.direction = 'back';
        }
        else {
            car.direction = null;
        }
        if (keyActive('left')) {
            car.turn = 'left';
        }
        else if (keyActive('right')) {
            car.turn = 'right';
        }
        else {
            car.turn = null;
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
})();
