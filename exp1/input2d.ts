const between = (
	value: number, min: number, max: number,
) => [Math.min(Math.max(value, min), max), (value - min) / (max - min)];

// eslint-disable-next-line import/prefer-default-export
export const addInput2D = (
	cursor: HTMLElement,
	main: HTMLElement,
	cb: (x: number, y: number) => void,
) => {
	// (2) подготовить к перемещению:
	// разместить поверх остального содержимого и в абсолютных координатах
	cursor.style.position = 'absolute';
	cursor.style.zIndex = '1000';
	main.style.position = 'relative';

	cursor.onmousedown = (baseEvent: MouseEvent) => { // (1) отследить нажатие
		// переместим в body, чтобы мяч был точно не внутри position:relative
		// main.appendChild(cursor);
		// и установим абсолютно спозиционированный мяч под курсор

		const { offsetWidth, offsetHeight } = cursor;
		const {
			offsetWidth: mainOffsetWidth, offsetHeight: mainOffsetHeight, offsetLeft, offsetTop,
		} = main;

		// передвинуть мяч под координаты курсора
		// и сдвинуть на половину ширины/высоты для центрирования
		function moveAt(x: number, y: number) {
			const maxLeft = mainOffsetWidth - offsetWidth;
			const maxTop = mainOffsetHeight - offsetHeight;
			const [left, pLeft] = between(x - offsetWidth / 2, 0, maxLeft);
			const [top, pRight] = between(y - offsetHeight / 2, 0, maxTop);
			cursor.style.left = `${left}px`;
			cursor.style.top = `${top}px`;
			cb(pLeft, pRight);
		}

		const onMouseMove = (event: MouseEvent) => {
			moveAt(event.pageX - offsetLeft, event.pageY - offsetTop);
		};

		// (3) перемещать по экрану
		document.addEventListener('mousemove', onMouseMove);
		document.body.classList.add('off-user-select');

		// (4) положить мяч, удалить более ненужные обработчики событий
		const onmouseup = () => {
			document.removeEventListener('mousemove', onMouseMove);
			document.removeEventListener('mouseup', onmouseup);
			document.removeEventListener('mouseleave', onmouseup);
			document.body.classList.remove('off-user-select');
		};

		document.addEventListener('mouseup', onmouseup);
		document.addEventListener('mouseleave', onmouseup);

		cursor.ondragstart = () => false;
	};

	return (x: number, y: number) => {
		const { offsetWidth, offsetHeight } = cursor;
		const {
			offsetWidth: mainOffsetWidth, offsetHeight: mainOffsetHeight,
		} = main;

		const maxLeft = mainOffsetWidth - offsetWidth;
		const maxTop = mainOffsetHeight - offsetHeight;

		const left = x * maxLeft;
		const top = y * maxTop;

		cursor.style.left = `${left}px`;
		cursor.style.top = `${top}px`;
	};
};
