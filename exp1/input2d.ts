const between = (
	value: number, min: number, max: number,
) => [Math.min(Math.max(value, min), max), (value - min) / (max - min)];

// eslint-disable-next-line import/prefer-default-export
export const addInput2D = (
	cursor: HTMLElement,
	main: HTMLElement,
	cb: (x: number, y: number) => void,
) => {
	cursor.onmousedown = (baseEvent: MouseEvent) => { // (1) отследить нажатие
		// (2) подготовить к перемещению:
		// разместить поверх остального содержимого и в абсолютных координатах
		cursor.style.position = 'absolute';
		cursor.style.zIndex = '1000';
		main.style.position = 'relative';
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
			const maxLeft = mainOffsetWidth - offsetWidth - 1;
			const maxRight = mainOffsetHeight - offsetHeight - 1;
			const [left, pLeft] = between(x - offsetWidth / 2, -1, maxLeft);
			const [top, pRight] = between(y - offsetHeight / 2, -1, maxRight);
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
};
