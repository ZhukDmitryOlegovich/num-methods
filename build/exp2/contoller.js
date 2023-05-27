const wasdKeys = {
    up: 87,
    down: 83,
    left: 65,
    right: 68,
    space: 32,
};
export const keyController = () => {
    const keysDown = {};
    const keyActive = (key) => keysDown[wasdKeys[key]] || false;
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
