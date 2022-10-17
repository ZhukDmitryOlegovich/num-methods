/* import functionPlot from 'function-plot'; */
import { SquareMatrix, Vector } from '../math/index.js';
import { fromLength, random } from '../math/utils.js';
(() => {
    const node = document.getElementById('lab7-input');
    const plot = document.getElementById('lab7-plot');
    if (!node || !plot) {
        return;
    }
    const div2 = document.createElement('div');
    div2.style.display = 'flex';
    div2.style.flexDirection = 'row';
    div2.style.alignItems = 'baseline';
    const inputA = document.createElement('input');
    inputA.type = 'number';
    inputA.placeholder = 'a';
    inputA.valueAsNumber = 1;
    div2.appendChild(inputA);
    const inputB = document.createElement('input');
    inputB.type = 'number';
    inputB.placeholder = 'b';
    inputB.valueAsNumber = 5;
    div2.appendChild(inputB);
    const inputC = document.createElement('input');
    inputC.type = 'number';
    inputC.placeholder = 'с';
    inputC.value = '1e3';
    div2.appendChild(inputC);
    node.appendChild(div2);
    const div = document.createElement('div');
    div.style.width = '100%';
    node.appendChild(div);
    const button = document.createElement('button');
    button.innerText = 'Посчитать';
    button.onclick = () => {
        const from = inputA.valueAsNumber;
        const to = inputB.valueAsNumber;
        const diag = inputC.valueAsNumber;
        const data1 = [];
        const data2 = [];
        for (let size = 3; size <= 100; size++) {
            let res1 = null;
            let res2 = null;
            const maxCount = 10000;
            do {
                const A = new SquareMatrix(fromLength(size, (i) => fromLength(size, (j) => random(from, to) * (i === j ? diag : 1))));
                const x = new Vector(fromLength(size, () => random(from, to)));
                const b = Vector.fromMatrix(A.mul(x));
                res1 = A.jakobi(b, { z: true, eps: 1e-6, maxCount });
                if (res1.count >= maxCount)
                    res1 = null;
                res2 = A.jakobi(b, { z: false, eps: 1e-6, maxCount });
                if (res2.count >= maxCount)
                    res2 = null;
            } while (!res1 || !res2);
            data1.push([size, res1.count]);
            data2.push([size, res2.count]);
        }
        console.log({ data1, data2 });
        functionPlot({
            xAxis: {
                domain: [2, 101],
            },
            yAxis: {
                domain: [
                    Math.min(...data1.map((e) => e[1]), ...data2.map((e) => e[1])),
                    Math.max(...data1.map((e) => e[1]), ...data2.map((e) => e[1])),
                ],
            },
            grid: true,
            target: plot,
            data: [
                {
                    fnType: 'points',
                    graphType: 'polyline',
                    points: data1,
                },
                {
                    fnType: 'points',
                    graphType: 'polyline',
                    points: data2,
                },
            ],
        });
    };
    div2.appendChild(button);
})();
