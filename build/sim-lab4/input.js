import { imports } from '../utils/imports.js';
import { parseHash } from '../utils/parseHash.js';
function createGraph3d(data, el) {
    const options2 = {
        width: '100%',
        // костыль, чтобы не привышать размер
        height: 'calc(100% - 4px)',
        style: 'dot-color',
        showPerspective: true,
        showGrid: true,
        keepAspectRatio: true,
        verticalRatio: 1.0,
        legendLabel: 'product',
        xLabel: 'f0',
        xMin: -5,
        xMax: 5,
        yLabel: 'f1',
        yMin: -5,
        yMax: 5,
        zLabel: 'f2',
        zMin: -5,
        zMax: 8,
        cameraPosition: {
            horizontal: 0.7,
            vertical: 0.4,
            distance: 4,
        },
        yCenter: '50%',
        axisFontSize: 80,
        tooltip: true,
    };
    return new vis.Graph3d(el, data, options2);
}
const getQuartile = (arr) => {
    const Np1d4 = Math.ceil((arr.length + 1) / 4);
    return [
        arr[Np1d4 * 1],
        arr[Np1d4 * 2],
        arr[Np1d4 * 3],
    ];
};
const getChooseDisp = (arr) => {
    const mediana = arr.reduce((a, elem) => a + elem[4], 0) / arr.length;
    return arr.reduce((a, elem) => a + (elem[4] - mediana) ** 2, 0) / arr.length;
};
// eslint-disable-next-line arrow-body-style
const getDivKvartSize = (arr) => {
    return arr[Math.ceil(3 * arr.length / 4)][4] - arr[Math.ceil(arr.length / 4)][4];
};
const getKorilation = (arr, i) => {
    // eslint-disable-next-line no-underscore-dangle
    const x_ = arr.reduce((a, elem) => a + elem[4], 0) / arr.length;
    // eslint-disable-next-line no-underscore-dangle
    const y_ = arr.reduce((a, elem) => a + elem[i], 0) / arr.length;
    return arr.reduce((_a, _, j) => _a + (arr[j][4] - x_) * (arr[j][i] - y_), 0)
        / Math.sqrt(arr.reduce((_b, b) => _b + (b[i] - y_) ** 2, 0)
            * arr.reduce((_a, a) => _a + (a[4] - x_) ** 2, 0));
};
(() => {
    const outputWrapper = document.getElementById('outputWrapper');
    const text = document.getElementById('text');
    if (!outputWrapper || !text) {
        return;
    }
    const graph3d = (() => {
        const data = new vis.DataSet();
        data.add({ x: 0, y: 0, z: 0 });
        data.add({ x: 1, y: 1, z: 1 });
        return createGraph3d(data, outputWrapper);
    })();
    const calc = () => {
        imports('./parsed_data.json').then((bigData) => {
            const data = new vis.DataSet();
            console.log(bigData);
            const printQuartile = !!(+parseHash().qvartile || 0);
            let needPrint = bigData[+parseHash().index || 0];
            // @ts-ignore
            needPrint = needPrint.filter((a) => a[4] > 1);
            // @ts-ignore
            needPrint = needPrint.sort((a, b) => a[4] - b[4]);
            text.innerText = `Интерквартильный размах: ${getDivKvartSize(needPrint)}
Выборочная дисперсия: ${getChooseDisp(needPrint)}
Корреляции [f0, product]: ${getKorilation(needPrint, 1)}
Корреляции [f1, product]: ${getKorilation(needPrint, 2)}
Корреляции [f2, product]: ${getKorilation(needPrint, 3)}
`;
            if (printQuartile) {
                needPrint = getQuartile(needPrint);
            }
            // @ts-ignore
            needPrint.forEach(([id, x, y, z, style], i, arr) => {
                if (!printQuartile || Math.ceil((arr.length + 1) / 4)) {
                    data.add({
                        x,
                        y,
                        z,
                        style,
                    });
                }
            });
            graph3d.setData(data);
        });
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
