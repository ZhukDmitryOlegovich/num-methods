"use strict";
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
        yCenter: '50%',
        axisFontSize: 80,
        tooltip: true,
    };
    return new vis.Graph3d(el, data, options2);
}
const parseHash = () => window.location.hash.slice(1).split('#').map((e) => e.split(':'))
    // eslint-disable-next-line no-return-assign, no-sequences
    .reduce((accum, [key, value]) => (accum[key] = value, accum), {});
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
        const { k = '1', fromX = '-Infinity', max = 'Infinity', min = '-Infinity', slice, grid = '1', pr, filename = '../../neural2-3/data.json', yCenter = graph3d.yCenter, style = graph3d.style, } = parseHash();
        console.log({ k, fromX, pr });
        import(filename, { assert: { type: "json" } }).then(({ default: bigData }) => {
            const data = new vis.DataSet();
            // @ts-ignore
            console.log(bigData);
            bigData.forEach(([x, y, z], i) => {
                if ((+k === 1 || ((x * 10) % +k === 0 && (y * 10) % +k === 0)) && x >= +fromX) {
                    data.add({
                        x, y, z, style: Math.max(Math.min(z, +max), +min),
                        ...(slice === undefined ? {} : { filter: +slice < z ? 'up' : 'down' })
                    });
                }
            });
            console.log(data);
            graph3d.setData(data);
            graph3d.setOptions({ showPerspective: !!+pr, yCenter, showSurfaceGrid: !!+grid, style });
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
