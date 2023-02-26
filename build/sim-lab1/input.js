/* import functionPlot from 'function-plot'; */
import { solveGalileo, solveGalileoHeight, solveRungeKutta, solveRungeKuttaHeight, } from './util.js';
(() => {
    const node = document.getElementById('lab1-input');
    const plot = document.getElementById('lab1-plot');
    const plot2 = document.getElementById('lab1-plot-2');
    const plot3 = document.getElementById('lab1-plot-3');
    const plot4 = document.getElementById('lab1-plot-4');
    if (!node || !plot || !plot2 || !plot3 || !plot4) {
        console.error('fail not found');
        return;
    }
    const div2 = document.createElement('div');
    div2.style.display = 'flex';
    div2.style.flexDirection = 'row';
    div2.style.alignItems = 'baseline';
    const inputD = document.createElement('input');
    inputD.type = 'number';
    inputD.placeholder = 'Диаметр';
    inputD.valueAsNumber = 0.22;
    div2.appendChild(inputD);
    const inputP = document.createElement('input');
    inputP.type = 'number';
    inputP.placeholder = 'Плотность';
    inputP.valueAsNumber = 7310;
    div2.appendChild(inputP);
    const inputV0g = document.createElement('input');
    inputV0g.type = 'number';
    inputV0g.placeholder = 'V0 global';
    inputV0g.valueAsNumber = 105;
    div2.appendChild(inputV0g);
    const inputAg = document.createElement('input');
    inputAg.type = 'number';
    inputAg.placeholder = 'A global';
    inputAg.valueAsNumber = 36;
    div2.appendChild(inputAg);
    div2.appendChild(document.createTextNode('=== скорость'));
    const inputVFrom = document.createElement('input');
    inputVFrom.type = 'number';
    inputVFrom.placeholder = 'from';
    inputVFrom.valueAsNumber = 0;
    div2.appendChild(inputVFrom);
    const inputVTo = document.createElement('input');
    inputVTo.type = 'number';
    inputVTo.placeholder = 'to';
    inputVTo.valueAsNumber = 100;
    div2.appendChild(inputVTo);
    div2.appendChild(document.createTextNode('=== угол'));
    const inputAFrom = document.createElement('input');
    inputAFrom.type = 'number';
    inputAFrom.placeholder = 'from';
    inputAFrom.valueAsNumber = 0;
    div2.appendChild(inputAFrom);
    const inputATo = document.createElement('input');
    inputATo.type = 'number';
    inputATo.placeholder = 'to';
    inputATo.valueAsNumber = 90;
    div2.appendChild(inputATo);
    const button2 = document.createElement('button');
    button2.innerText = 'Сгенерить';
    div2.appendChild(button2);
    node.appendChild(div2);
    const p = document.createElement('p');
    div2.appendChild(p);
    button2.onclick = () => {
        var _a, _b, _c, _d, _e, _f, _g, _h;
        const startFrom = Date.now();
        const d = inputD.valueAsNumber;
        const ra = d / 2;
        const s = ra ** 2 * Math.PI;
        const pp = inputP.valueAsNumber;
        const m = 4 / 3 * Math.PI * ra ** 3 * pp;
        const cf = 0.15;
        const r = 1.29;
        const g = 9.83;
        const n = +window.n || 2 ** 20;
        const vFrom = inputVFrom.valueAsNumber;
        const vTo = inputVTo.valueAsNumber;
        const v0g = inputV0g.valueAsNumber;
        const aFrom = inputAFrom.valueAsNumber / 180 * Math.PI;
        const aTo = inputATo.valueAsNumber / 180 * Math.PI;
        const ag = inputAg.valueAsNumber / 180 * Math.PI;
        const datas = [[], []];
        const datas2 = [[], []];
        const end = 100;
        for (let N = 0; N <= end; N++) {
            {
                const v0 = vFrom + (vTo - vFrom) * N / end;
                const input = {
                    alpfa: ag,
                    cf,
                    g,
                    m,
                    n,
                    r,
                    s,
                    v0,
                };
                ((_a = datas[0])[0] ?? (_a[0] = [])).push([v0, solveGalileo(input)]);
                ((_b = datas[0])[1] ?? (_b[1] = [])).push([v0, solveRungeKutta(input)]);
                ((_c = datas2[0])[0] ?? (_c[0] = [])).push([v0, solveGalileoHeight(input)]);
                ((_d = datas2[0])[1] ?? (_d[1] = [])).push([v0, solveRungeKuttaHeight(input)]);
            }
            {
                const alpfa = aFrom + (aTo - aFrom) * N / end;
                const input = {
                    alpfa,
                    cf,
                    g,
                    m,
                    n,
                    r,
                    s,
                    v0: v0g,
                };
                ((_e = datas[1])[0] ?? (_e[0] = [])).push([alpfa / Math.PI * 180, solveGalileo(input)]);
                ((_f = datas[1])[1] ?? (_f[1] = [])).push([alpfa / Math.PI * 180, solveRungeKutta(input)]);
                ((_g = datas2[1])[0] ?? (_g[0] = [])).push([alpfa / Math.PI * 180, solveGalileoHeight(input)]);
                ((_h = datas2[1])[1] ?? (_h[1] = [])).push([alpfa / Math.PI * 180, solveRungeKuttaHeight(input)]);
            }
        }
        p.innerText = ((Date.now() - startFrom) / 1000).toPrecision(3);
        console.log(datas);
        const options = {
            // xAxis: {
            // 	// domain: [from, to],
            // },
            // yAxis: {
            // 	// type: 'log',
            // 	domain: [minY, maxY],
            // },
            grid: true,
        };
        const graphType = +window.g ? 'scatter' : 'polyline';
        const fPlot = functionPlot({
            ...options,
            xAxis: {
                domain: [
                    Math.min(...datas[0].flatMap((p_) => p_.map((pp_) => pp_[0]))),
                    Math.max(...datas[0].flatMap((p_) => p_.map((pp_) => pp_[0]))),
                ],
                label: 'скорость',
            },
            yAxis: {
                domain: [
                    Math.min(...datas[0].flatMap((p_) => p_.map((pp_) => pp_[1]))),
                    Math.max(...datas[0].flatMap((p_) => p_.map((pp_) => pp_[1]))),
                ],
                label: 'дальность',
            },
            target: plot,
            data: datas[0].map((points) => ({
                fnType: 'points',
                graphType,
                points,
            })),
        });
        const fPlot2 = functionPlot({
            ...options,
            xAxis: {
                domain: [
                    Math.min(...datas[1].flatMap((p_) => p_.map((pp_) => pp_[0]))),
                    Math.max(...datas[1].flatMap((p_) => p_.map((pp_) => pp_[0]))),
                ],
                label: 'угол',
            },
            yAxis: {
                domain: [
                    Math.min(...datas[1].flatMap((p_) => p_.map((pp_) => pp_[1]))),
                    Math.max(...datas[1].flatMap((p_) => p_.map((pp_) => pp_[1]))),
                ],
                label: 'дальность',
            },
            target: plot2,
            data: datas[1].map((points) => ({
                fnType: 'points',
                graphType,
                points,
            })),
        });
        const fPlot3 = functionPlot({
            ...options,
            xAxis: {
                domain: [
                    Math.min(...datas2[0].flatMap((p_) => p_.map((pp_) => pp_[0]))),
                    Math.max(...datas2[0].flatMap((p_) => p_.map((pp_) => pp_[0]))),
                ],
                label: 'скорость',
            },
            yAxis: {
                domain: [
                    Math.min(...datas2[0].flatMap((p_) => p_.map((pp_) => pp_[1]))),
                    Math.max(...datas2[0].flatMap((p_) => p_.map((pp_) => pp_[1]))),
                ],
                label: 'высота',
            },
            target: plot3,
            data: datas2[0].map((points) => ({
                fnType: 'points',
                graphType,
                points,
            })),
        });
        const fPlot4 = functionPlot({
            ...options,
            xAxis: {
                domain: [
                    Math.min(...datas2[1].flatMap((p_) => p_.map((pp_) => pp_[0]))),
                    Math.max(...datas2[1].flatMap((p_) => p_.map((pp_) => pp_[0]))),
                ],
                label: 'угол',
            },
            yAxis: {
                domain: [
                    Math.min(...datas2[1].flatMap((p_) => p_.map((pp_) => pp_[1]))),
                    Math.max(...datas2[1].flatMap((p_) => p_.map((pp_) => pp_[1]))),
                ],
                label: 'высота',
            },
            target: plot4,
            data: datas2[1].map((points) => ({
                fnType: 'points',
                graphType,
                points,
            })),
        });
        fPlot.addLink(fPlot);
        fPlot2.addLink(fPlot2);
        fPlot3.addLink(fPlot3);
        fPlot4.addLink(fPlot4);
    };
})();
