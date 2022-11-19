"use strict";
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
})(NameInput || (NameInput = {}));
/* eslint-enable no-unused-vars, no-shadow */
const desk = {
    [NameInput.count]: 'Кол-во точек на графике',
    [NameInput.delta]: 'Шаг градиента',
    [NameInput.xi]: 'Коэффициент ξ',
    [NameInput.eta]: 'Коэффициент η',
    [NameInput.thetaMul]: 'Коэффициент θ / π',
    [NameInput.c1]: 'Коэффициент c<sub>1</sub>',
    [NameInput.c2]: 'Коэффициент c<sub>2</sub>',
    [NameInput.k]: 'Коэффициент k',
    [NameInput.showPerspective]: 'Использовать перспективу',
    [NameInput.norma]: 'Нормализовывать градиент',
    [NameInput.kNorma]: 'Коэффициент нормализации',
};
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
        tooltip: ({ data: { 
        // eslint-disable-next-line no-shadow
        x, y, z, xi, theta, }, }) => `<table>
<tr><th>ξ sin θ</th><th>${x}</th></tr>
<tr><td>ξ cos θ</td><td>${y}</td></tr>
<tr><td>η</td><td>${z}</td></tr>
<tr><td>ξ</td><td>${xi}</td></tr>
<tr><td>θ</td><td>${theta}</td></tr>
</table>`,
        yCenter: '40%',
        axisFontSize: 80,
    };
    return new vis.Graph3d(el, data, options2);
}
function createR(el) {
    const allInput = {};
    return {
        addInput: (name, options) => {
            const span = document.createElement('span');
            span.innerHTML = desk[name] || name;
            el.appendChild(span);
            const input = document.createElement('input');
            input.type = options?.type || 'number';
            const value = options?.value;
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
        getInput: (name) => allInput[name],
        getValueAsNumber: (name) => allInput[name].valueAsNumber,
        getValueAsBoolean: (name) => allInput[name].checked,
        setValueAsBoolean: (name, value) => { allInput[name].checked = value; },
    };
}
function calcDataSet(r) {
    const data = new vis.DataSet();
    const count = r.getValueAsNumber(NameInput.count);
    const delta = r.getValueAsNumber(NameInput.delta);
    const c1 = r.getValueAsNumber(NameInput.c1);
    const c2 = r.getValueAsNumber(NameInput.c2);
    const k = r.getValueAsNumber(NameInput.k);
    const norma = r.getValueAsBoolean(NameInput.norma);
    const kNorma = r.getValueAsNumber(NameInput.kNorma);
    let xi = r.getValueAsNumber(NameInput.xi);
    let eta = r.getValueAsNumber(NameInput.eta);
    let theta = r.getValueAsNumber(NameInput.thetaMul) * Math.PI;
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
        const length = norma ? Math.sqrt(xi ** 2 + etaD ** 2 + thetaD ** 2) * kNorma : 1;
        xi += xiD / length * delta;
        eta += etaD / length * delta;
        theta += thetaD / length * delta;
    }
    return data;
}
(() => {
    const inputWrapper = document.getElementById('inputWrapper');
    const outputWrapper = document.getElementById('outputWrapper');
    if (!inputWrapper || !outputWrapper) {
        return;
    }
    const r = createR(inputWrapper);
    r.addInput(NameInput.count, { value: 1000 }).addEventListener('change', updateData);
    r.addInput(NameInput.delta, { value: 0.02 }).addEventListener('change', updateData);
    r.addInput(NameInput.norma, { type: 'checkbox', value: false }).addEventListener('change', updateNorma);
    r.addInput(NameInput.kNorma, { value: 0.12 }).addEventListener('change', updateData);
    r.addInput(NameInput.showPerspective, { type: 'checkbox' }).addEventListener('change', updatePerspective);
    inputWrapper.appendChild(document.createElement('hr'));
    r.addInput(NameInput.c1, { value: 7 }).addEventListener('change', updateData);
    r.addInput(NameInput.c2, { value: -6 }).addEventListener('change', updateData);
    r.addInput(NameInput.k, { value: 1 }).addEventListener('change', updateData);
    inputWrapper.appendChild(document.createElement('hr'));
    r.addInput(NameInput.xi, { value: 0.5 }).addEventListener('change', updateData);
    r.addInput(NameInput.eta, { value: 0.5 }).addEventListener('change', updateData);
    r.addInput(NameInput.thetaMul, { value: 1 }).addEventListener('change', updateData);
    const graph3d = createGraph3d(calcDataSet(r), outputWrapper);
    r.setValueAsBoolean(NameInput.showPerspective, graph3d.showPerspective);
    r.getInput(NameInput.kNorma).disabled = !r.getInput(NameInput.norma).checked;
    function updateData() {
        graph3d.setData(calcDataSet(r));
    }
    function updatePerspective() {
        graph3d.setOptions({ showPerspective: this.checked });
    }
    function updateNorma() {
        r.getInput(NameInput.kNorma).disabled = !r.getInput(NameInput.norma).checked;
        updateData();
    }
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
    // window.graph3d = graph3d;
})();
