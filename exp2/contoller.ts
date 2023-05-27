const wasdKeys = {
	up: 87,
	down: 83,
	left: 65,
	right: 68,
	space: 32,
};

type Keys = keyof typeof wasdKeys;

export const keyController = () => {
	const keysDown: Partial<Record<number, boolean>> = {};

	const keyActive = (key: Keys) => keysDown[wasdKeys[key]] || false;

	window.addEventListener('keydown', (e) => {
		keysDown[e.which] = true;
	});

	window.addEventListener('keyup', (e) => {
		keysDown[e.which] = false;
	});

	return {
		keyActive,
	};
};
