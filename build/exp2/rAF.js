export const rAF = (cb) => {
    let ticking = null;
    let args = null;
    function handleCb1() {
        ticking = null;
        cb(...args);
    }
    function handleCb2(...nowargs) {
        args = nowargs;
        ticking = ticking || requestAnimationFrame(handleCb1);
    }
    return handleCb2;
};
