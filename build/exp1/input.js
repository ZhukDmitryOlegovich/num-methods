"use strict";
(() => {
    const input1 = document.getElementById('exp1-1-input');
    const output2 = document.getElementById('exp1-1-output-2');
    if (!input1) {
        return;
    }
    const allInput = {};
    const addInput = (name, value) => {
        const inputA = document.createElement('input');
        inputA.type = 'number';
        inputA.placeholder = name;
        inputA.valueAsNumber = value;
        input1.appendChild(inputA);
        allInput[name] = inputA;
    };
    const getInput = (name) => allInput[name].valueAsNumber;
    addInput('count', 1000);
    addInput('delta', 0.1);
    addInput('xi', 0.5);
    addInput('eta', 0.5);
    addInput('thetaMul', 1);
    addInput('c1', 7);
    addInput('c2', -6);
    addInput('k', 1);
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    input1.appendChild(checkbox);
    const button1 = document.createElement('button');
    button1.innerText = 'Сгенерить';
    input1.appendChild(button1);
    // const p = document.createElement('p');
    // output1.appendChild(p);
    button1.onclick = () => {
        const data = new vis.DataSet();
        const count = getInput('count');
        const delta = getInput('delta');
        const c1 = getInput('c1');
        const c2 = getInput('c2');
        const k = getInput('k');
        let xi = getInput('xi');
        let eta = getInput('eta');
        let theta = getInput('thetaMul') * Math.PI;
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
        const options2 = {
            width: '100%',
            height: 'calc(100vh - 90px)',
            style: 'line',
            showPerspective: true,
            showGrid: true,
            keepAspectRatio: true,
            verticalRatio: 1.0,
            legendLabel: 'distance',
            cameraPosition: {
                horizontal: 0.7,
                vertical: 0.4,
                distance: 3.1,
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
            axisFontSize: 40,
        };
        const graph3d = new vis.Graph3d(output2, data, options2);
        checkbox.checked = graph3d.showPerspective;
        checkbox.onchange = () => {
            graph3d.setOptions({ showPerspective: checkbox.checked });
        };
        // graph3d.on('cameraPositionChange', (event: any) => {
        // 	console.log(`${'The camera position changed to:\n'
        // 	+ 'Horizontal: '}${event.horizontal}\n`
        // 	+ `Vertical: ${event.vertical}\n`
        // 	+ `Distance: ${event.distance}`);
        // });
        console.log([
            graph3d,
        ]);
        // @ts-ignore
        window.graph3d = graph3d;
    };
})();
