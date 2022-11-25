import bigData from './data.js';
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
})(NameInput || (NameInput = {}));
/* eslint-enable no-unused-vars, no-shadow */
function createGraph3d(data, el) {
    const options2 = {
        width: '100%',
        // костыль, чтобы не привышать размер
        height: 'calc(100% - 4px)',
        style: 'surface',
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
        yCenter: '40%',
        axisFontSize: 80,
    };
    return new vis.Graph3d(el, data, options2);
}
function calcDataSet(k, fromX) {
    const data = new vis.DataSet();
    bigData.forEach(([x, y, z], i) => {
        if ((k === 1 || ((x * 100) % k === 0 && (y * 100) % k === 0)) && x >= fromX) {
            data.add({
                x, y, z, style: z,
            });
        }
    });
    return data;
}
(() => {
    const outputWrapper = document.getElementById('outputWrapper');
    if (!outputWrapper) {
        return;
    }
    const data = new vis.DataSet();
    data.add({ x: 0, y: 0, z: 0 });
    data.add({ x: 1, y: 1, z: 1 });
    const graph3d = createGraph3d(data, outputWrapper);
    const calc = () => {
        // eslint-disable-next-line no-restricted-globals
        const [k = 1, fromX = 0.1, pr] = window.location.hash.slice(1).split(':').map((e) => (!e || isNaN(+e) ? undefined : +e));
        console.log({ k, fromX, pr });
        graph3d.setData(calcDataSet(k, fromX));
        graph3d.setOptions({ showPerspective: !!pr });
    };
    window.addEventListener('hashchange', calc);
    calc();
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
