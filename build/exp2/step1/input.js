/* import functionPlot from 'function-plot'; */
import { fromLength } from '../../math/utils.js';
import { parseHash } from '../../utils/parseHash.js';
import { ONN } from '../ONN.js';
import { rAF } from '../rAF.js';
(() => {
    const node = document.getElementById('step1-input');
    const plot = document.getElementById('step1-plot');
    const plot2 = document.getElementById('step1-plot2');
    if (!node || !plot || !plot2) {
        console.error('fail not found');
        return;
    }
    const div = document.createElement('div');
    div.style.display = 'flex';
    div.style.flexDirection = 'row';
    div.style.alignItems = 'baseline';
    div.appendChild(document.createTextNode('t (step)\xa0'));
    const inputT = document.createElement('input');
    inputT.type = 'number';
    inputT.placeholder = 't';
    inputT.valueAsNumber = 0.001;
    div.appendChild(inputT);
    div.appendChild(document.createTextNode('\xa0| from (start)\xa0'));
    const inputFrom = document.createElement('input');
    inputFrom.type = 'number';
    inputFrom.placeholder = 'from';
    inputFrom.valueAsNumber = 0;
    div.appendChild(inputFrom);
    div.appendChild(document.createTextNode('\xa0| to (end)\xa0'));
    const inputTo = document.createElement('input');
    inputTo.type = 'number';
    inputTo.placeholder = 'to';
    inputTo.valueAsNumber = 0.3;
    div.appendChild(inputTo);
    const button2 = document.createElement('button');
    button2.innerText = 'Сгенерить';
    div.appendChild(button2);
    node.appendChild(div);
    const p = document.createElement('p');
    div.appendChild(p);
    const size1 = {
        height: undefined,
        width: undefined,
    };
    button2.onclick = () => {
        const startFrom = Date.now();
        const initPhi = Array.from({ length: 10 }, (_, i) => Math.random() * 2 * Math.PI);
        const t = inputT.valueAsNumber;
        const to = inputTo.valueAsNumber;
        const from = inputFrom.valueAsNumber;
        const filterByTime = (data) => data.map((minidata) => minidata.filter(([time]) => from <= time && time <= to));
        // const f = Array.from({ length: 10 }, (_, i) => (
        // 	i > 5 ? Math.random() * 30 : Math.random() * 20 - 10));
        const [a, b] = [plot, plot2].map((thisPlot, ii) => {
            const bigData = [];
            const f = [21, 14, 10, 15, 20, 25, 12.5, 17.5, ii === 1 ? 40 : 17.5, 22.5];
            const e = [4, 4, 1, 1, 1, 1, 1, 1, 1, 1];
            const K = fromLength(10, (i) => fromLength(10, (j) => e[i] * e[j]));
            const onn = new ONN(K, f, initPhi);
            console.log({ K, f });
            const saveDate = (now) => {
                onn.dphi.forEach((dphi, i) => {
                    (bigData[i] ?? (bigData[i] = [])).push([now, dphi / (2 * Math.PI)]);
                });
            };
            let now = 0;
            saveDate(now);
            for (let i = 0; now <= to; i += 1, now = t * i) {
                onn.step(t);
                saveDate(now);
            }
            console.log({ bigData });
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
            const graphType = parseHash().g ? 'scatter' : 'polyline';
            const createPlot = (data, target, size) => {
                const syncSizePrev = (contentRect) => {
                    size.height = Math.round(contentRect.height) - 20;
                    size.width = Math.round(contentRect.width) - 20;
                };
                syncSizePrev(target.getBoundingClientRect());
                const xDomainData = filterByTime(data).flatMap((p_) => p_.map((pp_) => pp_[1]));
                const bigOptions = {
                    ...options,
                    ...size,
                    xAxis: {
                        domain: [
                            // Math.min(...data.flatMap((p_) => p_.map((pp_) => pp_[0]))),
                            // Math.max(...data.flatMap((p_) => p_.map((pp_) => pp_[0]))),
                            from,
                            to,
                        ],
                        label: 'Время',
                    },
                    yAxis: {
                        domain: [
                            Math.min(...xDomainData),
                            Math.max(...xDomainData),
                        ],
                        label: 'Частота',
                    },
                    target,
                    tip: {
                        xLine: true,
                        yLine: true,
                        renderer(x, y, index) {
                            const args = { x, y, index };
                            console.log({ args });
                            return JSON.stringify(args);
                        },
                    },
                    data: data.map((points) => ({
                        fnType: 'points',
                        graphType,
                        points,
                    })),
                };
                const syncSize = (contentRect) => {
                    syncSizePrev(contentRect);
                    bigOptions.height = size.height;
                    bigOptions.height = size.height;
                    console.log('update', size);
                    functionPlot(bigOptions);
                };
                const resizeObserver = new ResizeObserver(rAF((entries) => {
                    for (const entry of entries) {
                        syncSize(entry.contentRect);
                    }
                }));
                resizeObserver.observe(bigOptions.target);
                return functionPlot(bigOptions);
            };
            return createPlot(bigData, thisPlot, size1);
        });
        a.addLink(b);
        b.addLink(a);
        p.innerText = ((Date.now() - startFrom) / 1000).toFixed(3);
    };
    button2.click();
})();
