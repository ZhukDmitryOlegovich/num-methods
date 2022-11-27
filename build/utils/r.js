export const replaceNaN = (value, def) => (Number.isNaN(value) ? def : value);
export function createR(el) {
    const allInput = {};
    return {
        addHr: () => el.appendChild(document.createElement('hr')),
        addInput: (name, options) => {
            const span = document.createElement('span');
            span.innerHTML = options?.placeholder || name;
            const placeholderId = options?.placeholderId;
            if (placeholderId)
                span.id = placeholderId;
            el.appendChild(span);
            const input = document.createElement('input');
            input.type = options?.type || 'number';
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
            allInput[name] = input;
            el.appendChild(input);
            return input;
        },
        getInput: (name) => allInput[name],
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
}
