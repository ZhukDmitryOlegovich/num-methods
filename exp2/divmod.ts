export const div = (a: number, b: number) => (a - (a % b)) / b;

export const mod = (a: number, b: number) => a % b;

export const roundBy = (a: number, b: number) => div(a, b) * b;
