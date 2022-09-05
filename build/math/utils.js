export const map = (a, callbackfn) => a.map(callbackfn);
export const fromLength = (length, callbackfn) => Array.from({ length }, (_, i) => callbackfn(i));
export const sumArr = (a, b) => map(a, (_, i) => a[i] + b[i]);
