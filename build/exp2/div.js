export const div = (a, b) => (a - (a % b)) / b;
export const roundBy = (a, b) => div(a, b) * b;
