export type TH<T extends 'number' | 'checkbox'> = {
	type?: T,
	value?:
	| (T extends 'number' ? number : never)
	| (T extends 'checkbox' ? boolean : never),
};

export type Other = {
	placeholder?: string,
	dataset?: Record<string, string>,
	className?: string,
};

export const replaceNaN = (value: number, def: number) => (Number.isNaN(value) ? def : value);

const addDataset = (el: HTMLElement, dataset: Other['dataset']) => Object.entries(dataset || {})
	.forEach(([key, value]) => {
		el.dataset[key] = value;
	});

export function createR(el: HTMLElement, parent?: any) {
	const allInput: Record<string, HTMLInputElement> = {};
	const r = {
		origin: el,
		registerInput: (name: string, input: HTMLInputElement) => {
			allInput[name] = input;
			parent?.registerInput(name, input);
		},
		addHr: () => el.appendChild(document.createElement('hr')),
		addDataset: (dataset: Other['dataset']) => addDataset(el, dataset),
		createWrap: (options?: Other) => {
			const div = document.createElement('div');
			Object.entries(options?.dataset || {})
				.forEach(([key, value]) => {
					div.dataset[key] = value;
				});
			div.className = options?.className || '';
			el.appendChild(div);
			return createR(div, r);
		},
		addInput: (name: string, options?: (TH<'number'> | TH<'checkbox'>) & Other) => {
			const div = document.createElement('div');
			div.className = options?.className || 'column';
			const span = document.createElement('span');
			span.innerHTML = options?.placeholder || name;
			div.appendChild(span);
			const input = document.createElement('input');
			input.type = options?.type || 'number';
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
		getInput: (name: string) => allInput[name],
		getValueAsNumber: (name: string) => replaceNaN(
			allInput[name].valueAsNumber, +allInput[name].placeholder,
		),
		getValueAsBoolean: (name: string) => allInput[name].checked,
		setValueAsBoolean: (name: string, value: boolean) => { allInput[name].checked = value; },
		setValueAsString: (name: string, value: string): boolean => {
			if (allInput[name].value === value) return false;
			allInput[name].value = value;
			return true;
		},
	};
	return r;
}

export type R = ReturnType<typeof createR>;
