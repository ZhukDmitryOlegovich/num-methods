export const div = (a, b) => (a - (a % b)) / b;
export const mod = (a, b) => a % b;
export const roundBy = (a, b) => div(a, b) * b;
