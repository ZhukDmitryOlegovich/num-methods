export const replaceNaN = (value, def) => (Number.isNaN(value) ? def : value);
const addDataset = (el, dataset) => Object.entries(dataset || {})
    .forEach(([key, value]) => {
    el.dataset[key] = value;
});
export function createR(el, parent) {
    const allInput = {};
    const r = {
        origin: el,
        registerInput: (name, input) => {
            allInput[name] = input;
            parent?.registerInput(name, input);
        },
        addHr: () => el.appendChild(document.createElement('hr')),
        addDataset: (dataset) => addDataset(el, dataset),
        createWrap: (options) => {
            const div = document.createElement('div');
            Object.entries(options?.dataset || {})
                .forEach(([key, value]) => {
                div.dataset[key] = value;
            });
            div.className = options?.className || '';
            el.appendChild(div);
            return createR(div, r);
        },
        addInput: (name, options) => {
            const div = document.createElement('div');
            div.className = options?.className || 'column';
            const span = document.createElement('span');
            span.innerHTML = options?.placeholder || name;
            div.appendChild(span);
            const input = document.createElement('input');
            input.type = options?.type || 'number';
            input.step = options?.step?.toString() || input.step;
            addDataset(div, options?.dataset);
            const value = options?.value;
            input.placeholder = `${value}`;
            switch (typeof value) {
                case 'number':
                    input.valueAsNumber = value;
                    break;
                case 'boolean':
                    input.checked = value;
                    break;
                case 'string':
                    input.value = value;
                    break;
                default: break;
            }
            r.registerInput(name, input);
            div.appendChild(input);
            el.appendChild(div);
            return input;
        },
        getInput: (name) => allInput[name],
        getSpan: (name) => allInput[name].previousElementSibling,
        getValueAsNumber: (name) => replaceNaN(allInput[name].valueAsNumber, +allInput[name].placeholder),
        getValueAsBoolean: (name) => allInput[name].checked,
        setValueAsBoolean: (name, value) => { allInput[name].checked = value; },
        setValueAsString: (name, value) => {
            if (allInput[name].value === value)
                return false;
            allInput[name].value = value;
            return true;
        },
    };
    return r;
}
