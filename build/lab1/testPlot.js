/* import functionPlot from 'function-plot'; */
(() => {
    const node = document.getElementById('lab1-testplot');
    if (!node) {
        return;
    }
    functionPlot({
        target: node,
        height: 500,
        // width: node.getBoundingClientRect().width,
        xAxis: { domain: [-1, 11] },
        yAxis: { domain: [-1, 11] },
        grid: true,
        data: [
            {
                fnType: 'points',
                graphType: 'polyline',
                points: [
                    [0, 3],
                    [1, 2],
                    [2, 5],
                    [4, 7],
                    [10, 1],
                ],
            },
            {
                fn: '(x + 5)^2',
            },
        ],
    });
})();
