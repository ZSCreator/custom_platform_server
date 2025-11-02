export function genereteBall() {
    let arr: number[] = [];
    for (let idx = 1; idx <= 32; idx++) {
        arr.push(idx);
    }
    arr.sort((a, b) => 0.5 - Math.random());
    return arr;
}