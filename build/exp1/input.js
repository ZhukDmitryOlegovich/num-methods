import { addInput2D } from '../utils/input2d.js';
import { parseHash } from '../utils/parseHash.js';
import { createR } from '../utils/r.js';
/* eslint-disable no-unused-vars, no-shadow */
var NameInput;
(function (NameInput) {
    NameInput["count"] = "count";
    NameInput["delta"] = "delta";
    NameInput["xi"] = "xi";
    NameInput["eta"] = "eta";
    NameInput["thetaMul"] = "thetaMul";
    NameInput["c1"] = "c1";
    NameInput["c2"] = "c2";
    NameInput["k"] = "k";
    NameInput["showPerspective"] = "showPerspective";
    NameInput["norma"] = "norma";
    NameInput["kNorma"] = "kNorma";
    NameInput["start"] = "start";
    NameInput["epsilon"] = "epsilon";
    NameInput["recalc"] = "recalc\t";
})(NameInput || (NameInput = {}));
/* eslint-enable no-unused-vars, no-shadow */
function createGraph3d(data, el) {
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
        tooltip: ({ data: { 
        // eslint-disable-next-line no-shadow
        x, y, z, xi, theta, }, }) => `<table>
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
const lengthV2 = (x, y, z) => (x * x + y * y + z * z);
const lengthV = (x, y, z) => Math.sqrt(x * x + y * y + z * z);
const nextPoint = ({ xi, eta, theta, cosTheta, sinTheta, c1, c2, k, norma, kNorma, delta, }) => {
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
const randomV = () => {
    const x = 2 * Math.random() - 1;
    const y = 2 * Math.random() - 1;
    const z = 2 * Math.random() - 1;
    const len = lengthV(x, y, z);
    if (len < 0.01)
        return randomV();
    return [x / len, y / len, z / len];
};
function calcDataSet(r, { c1, c2, type } = {}) {
    const data = new vis.DataSet();
    const count = r.getValueAsNumber(NameInput.count);
    const start = r.getValueAsNumber(NameInput.start);
    const delta = r.getValueAsNumber(NameInput.delta);
    c1 ?? (c1 = r.getValueAsNumber(NameInput.c1));
    c2 ?? (c2 = r.getValueAsNumber(NameInput.c2));
    type ?? (type = 'lyapunov');
    const k = r.getValueAsNumber(NameInput.k);
    const norma = r.getValueAsBoolean(NameInput.norma);
    const kNorma = r.getValueAsNumber(NameInput.kNorma);
    let xi = r.getValueAsNumber(NameInput.xi);
    let eta = r.getValueAsNumber(NameInput.eta);
    let theta = r.getValueAsNumber(NameInput.thetaMul) * Math.PI;
    const [dxi, deta, dtheta] = randomV();
    const epsilon = r.getValueAsNumber(NameInput.epsilon);
    let xi1 = xi + dxi * epsilon;
    let eta1 = eta + deta * epsilon;
    let theta1 = theta + dtheta * epsilon;
    let lyapunov = 0;
    const simpleData = [];
    for (let index = 0; index < count + start; index++) {
        const cosTheta = Math.cos(theta);
        const sinTheta = Math.sin(theta);
        if (index >= start) {
            if (type === 'simpleData' || type === 'all') {
                simpleData.push([
                    xi * sinTheta,
                    xi * cosTheta,
                    eta,
                ]);
            }
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
            lyapunov += Math.log(length1 / epsilon);
            xi1 = xi + dxi1 / length1 * epsilon;
            eta1 = eta + deta1 / length1 * epsilon;
            theta1 = theta + theta1 / length1 * epsilon;
        }
    }
    return { data, lyapunov, simpleData };
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
    l1.addInput(NameInput.start, { value: +parseHash().start || 500, placeholder: 'Начать с точки с индексом' }).addEventListener('change', updateData);
    l1.addInput(NameInput.delta, { value: 0.02, placeholder: 'Шаг градиента' }).addEventListener('change', updateData);
    const r1 = b1.createWrap({ className: 'column flex-fill' });
    r1.addInput(NameInput.norma, { type: 'checkbox', value: false, placeholder: 'Нормализовывать градиент' }).addEventListener('change', updateNorma);
    r1.addInput(NameInput.kNorma, { value: 0.12, placeholder: 'Коэффициент нормализации' }).addEventListener('change', updateData);
    r1.addInput(NameInput.showPerspective, { type: 'checkbox', placeholder: 'Использовать перспективу' }).addEventListener('change', updatePerspective);
    r.addHr().className = 'hide';
    const b2 = r.createWrap({ className: 'row flex-fill' });
    const l2 = b2.createWrap({ className: 'column flex-fill transform' });
    l2.addInput(NameInput.c1, { value: 7, placeholder: 'Коэффициент c<sub>1</sub>' }).addEventListener('change', updateData);
    l2.addInput(NameInput.c2, { value: -6, placeholder: 'Коэффициент c<sub>2</sub>' }).addEventListener('change', updateData);
    l2.addInput(NameInput.k, { value: 1, placeholder: 'Коэффициент k', className: 'hide column' }).addEventListener('change', updateData);
    const r2 = b2.createWrap({ className: 'column flex-fill hide' });
    r2.addInput(NameInput.xi, { value: 0.5, placeholder: 'Коэффициент ξ' }).addEventListener('change', updateData);
    r2.addInput(NameInput.eta, { value: 0.5, placeholder: 'Коэффициент η' }).addEventListener('change', updateData);
    r2.addInput(NameInput.thetaMul, { value: 1, placeholder: 'Коэффициент θ / π' }).addEventListener('change', updateData);
    r.addHr();
    r.addInput(NameInput.epsilon, { value: 0.001, placeholder: 'Показатель Ляпунова' }).addEventListener('change', updateData);
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
    const syncInput2D = () => setInput2D((r.getValueAsNumber(NameInput.c1) + 10) / 20, (10 - r.getValueAsNumber(NameInput.c2)) / 20);
    syncInput2D();
    r.getInput(NameInput.c1).addEventListener('change', syncInput2D);
    r.getInput(NameInput.c2).addEventListener('change', syncInput2D);
    ['0.1f', '0.1t', '0.3f', '0.05f', '0.01f', '0.001f', 'point'].forEach((e) => {
        const changeHotMap = document.createElement('button');
        changeHotMap.innerHTML = `🗺️${e}`;
        changeHotMap.id = `hotmap${e}`;
        changeHotMap.onclick = () => { main.style.backgroundImage = `url(./hotmap${e}.png)`; };
        wrapperButton.appendChild(changeHotMap);
    });
    const graph3d = (() => {
        const { data, lyapunov } = calcDataSet(r);
        r.getInput(NameInput.epsilon).previousElementSibling
            .innerText = `Показатель Ляпунова: ${lyapunov.toString()}`;
        return createGraph3d(data, outputWrapper);
    })();
    const hideProps = document.createElement('button');
    let open = true;
    hideProps.innerHTML = '👀';
    hideProps.onclick = () => {
        if (inputWrapper.dataset.hideOn == null) {
            inputWrapper.dataset.hideOn = '';
        }
        else {
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
    const { hotmap, see, calchot } = parseHash();
    if (hotmap)
        document.getElementById(`hotmap${hotmap}`)?.click();
    if (+see)
        hideProps.click();
    calcHotMap.disabled = !+calchot;
    r.setValueAsBoolean(NameInput.showPerspective, graph3d.showPerspective);
    r.getInput(NameInput.kNorma).disabled = !r.getInput(NameInput.norma).checked;
    const calcRadius = (simpleData) => {
        const [sumX, sumY, sumZ] = simpleData.reduce((accum, sd) => {
            accum[0] += sd[0];
            accum[1] += sd[1];
            accum[2] += sd[2];
            return accum;
        }, [0, 0, 0]);
        const midX = sumX / simpleData.length;
        const midY = sumY / simpleData.length;
        const midZ = sumZ / simpleData.length;
        return Math.sqrt(simpleData.reduce((sum, sd) => sum + lengthV2(sd[0] - midX, sd[1] - midY, sd[2] - midZ), 0));
    };
    function updateData() {
        const { data, lyapunov, simpleData } = calcDataSet(r, { type: 'all' });
        graph3d.setOptions({ style: calcRadius(simpleData) > 0.1 ? 'line' : 'dot' });
        graph3d.setData(data);
        r.getInput(NameInput.epsilon).previousElementSibling
            .innerText = `Показатель Ляпунова: ${lyapunov.toString()}`;
    }
    function updatePerspective() {
        graph3d.setOptions({ showPerspective: this.checked });
    }
    function updateNorma() {
        r.getInput(NameInput.kNorma).disabled = !r.getInput(NameInput.norma).checked;
        updateData();
    }
    calcHotMap.addEventListener('click', (event) => {
        const arr = [];
        const chanks = [];
        const mul = 10;
        const isRadius = event.ctrlKey;
        console.log({ isRadius });
        console.time('calcHotMap');
        for (let p1 = -10 * mul; p1 <= 10 * mul; p1++) {
            for (let p2 = -10 * mul; p2 <= 10 * mul; p2++) {
                const c1 = p1 / mul;
                const c2 = p2 / mul;
                if (chanks.length % 10000 === 0)
                    console.log('chanks', chanks.length);
                chanks.push(Promise.resolve().then(() => {
                    if (arr.length % 1000 === 0)
                        console.log('arr', arr.length, c1, c2);
                    const { lyapunov, simpleData } = calcDataSet(r, { c1, c2, type: isRadius ? 'simpleData' : 'lyapunov' });
                    arr.push([
                        c1,
                        c2,
                        isRadius ? calcRadius(simpleData) : lyapunov,
                    ]);
                }));
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
