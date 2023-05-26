export const sum = (n, getValue, from = 0) => {
    let ans = 0;
    for (let i = 0; i < n; i++) {
        ans += getValue(from + i);
    }
    return ans;
};
