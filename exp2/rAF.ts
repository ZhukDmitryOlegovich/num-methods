export const rAF = <Args extends any[]>(cb: (...args: Args) => void) => {
	let ticking: ReturnType<typeof requestAnimationFrame> | null = null;
	let args: Args | null = null;

	function handleCb1() {
		ticking = null;
		cb(...args!);
	}

	function handleCb2(...nowargs: Args) {
		args = nowargs;
		ticking = ticking || requestAnimationFrame(handleCb1);
	}

	return handleCb2;
};
