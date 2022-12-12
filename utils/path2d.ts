const between = (
	value: number, min: number, max: number,
) => [
	Math.min(Math.max(value, min), max),
	(Math.min(Math.max(value, min), max) - min) / (max - min),
];

// https://stackoverflow.com/a/14560350
export function linedraw(
	line: HTMLElement, ax: number, ay: number, bx: number, by: number,
) {
	if (ay > by) {
		bx = ax + bx;
		ax = bx - ax;
		bx -= ax;
		by = ay + by;
		ay = by - ay;
		by -= ay;
	}
	let calc = Math.atan2(ax - bx, by - ay);
	calc = calc * 180 / Math.PI;
	const length = Math.sqrt((ax - bx) * (ax - bx) + (ay - by) * (ay - by));
	line.setAttribute('style', `height:${length}px;width:1px;background-color:black;position:absolute;top:${ay}px;left:${ax}px;transform:rotate(${calc}deg);-ms-transform:rotate(${calc}deg);transform-origin:0% 0%;-moz-transform:rotate(${calc}deg);-moz-transform-origin:0% 0%;-webkit-transform:rotate(${calc}deg);-webkit-transform-origin:0% 0%;-o-transform:rotate(${calc}deg);-o-transform-origin:0% 0%;`);
	return line;
}

// eslint-disable-next-line import/prefer-default-export
export const addPath2D = (
	main: HTMLElement,
	buildPoint: () => HTMLElement,
	cb: (x: number, y: number) => void,
	skip?: (event: MouseEvent) => boolean,
) => {
	main.style.position = 'relative';

	const arrPoint: [[number, number], [number, number], HTMLElement, HTMLElement | null][] = [];

	const onmousedown = (baseEvent: MouseEvent) => {
		if (skip?.(baseEvent)) return;

		const cursor = buildPoint();
		main.appendChild(cursor);
		const { offsetWidth, offsetHeight } = cursor;
		const {
			offsetWidth: mainOffsetWidth, offsetHeight: mainOffsetHeight, offsetLeft, offsetTop,
		} = main;

		const x = baseEvent.pageX - offsetLeft;
		const y = baseEvent.pageY - offsetTop;
		const maxLeft = mainOffsetWidth - offsetWidth;
		const maxTop = mainOffsetHeight - offsetHeight;
		const [left, pLeft] = between(x - offsetWidth / 2, 0, maxLeft);
		const [top, pRight] = between(y - offsetHeight / 2, 0, maxTop);
		cursor.style.left = `${left}px`;
		cursor.style.top = `${top}px`;

		if (!arrPoint.length) {
			arrPoint.push([[pLeft, pRight], [x, y], cursor, null]);
		} else {
			const [, [lx, ly]] = arrPoint[arrPoint.length - 1];
			const line = document.createElement('div');
			arrPoint.push([[pLeft, pRight], [x, y], cursor, linedraw(line, lx, ly, x, y)]);
			main.appendChild(line);
		}

		cb(pLeft, pRight);
	};

	main.addEventListener('click', onmousedown);

	return [
		arrPoint,
		(slice?: number) => {
			arrPoint.slice(slice).forEach(([, , a, b]) => {
				a.remove();
				b?.remove();
			});
			arrPoint.length = Math.max(arrPoint.length + (slice ?? -Infinity), 0);
		},
	] as const;
};
