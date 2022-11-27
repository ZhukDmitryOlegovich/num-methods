export type TH<T extends 'number' | 'checkbox'> = {
	type?: T,
	value?:
	| (T extends 'number' ? number : never)
	| (T extends 'checkbox' ? boolean : never),
};

export const replaceNaN = (value: number, def: number) => (Number.isNaN(value) ? def : value);

export function createR(el: HTMLElement) {
	const allInput: Record<string, HTMLInputElement> = {};
	return {
		addHr: () => el.appendChild(document.createElement('hr')),
		addInput: (name: string, options?: (TH<'number'> | TH<'checkbox'>) & {
			placeholder?: string,
			dataset?: Record<string, string>;
		}) => {
			const span = document.createElement('span');
			span.innerHTML = options?.placeholder || name;
			el.appendChild(span);
			const input = document.createElement('input');
			input.type = options?.type || 'number';
			Object.entries(options?.dataset || {})
				.forEach(([key, value]) => {
					input.dataset[key] = value;
					span.dataset[key] = value;
				});
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
}

export type R = ReturnType<typeof createR>;
