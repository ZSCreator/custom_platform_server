

let windowTranscript = [
    ["Scatter", "Scatter", "A", "G", "A", "A"],
    ["A", "C", "B", "F", "G", "A"],
    ["G", "A", "H", "I", "I", "C"],
    ["D", "B", "D", "E", "A", "A"],
    ["B", "B", "B", "D", "E", "B"]
]

console.warn("原始数据", windowTranscript);
for (let i = 0; i < windowTranscript.length; i++) {
    for (let j = 0; j < windowTranscript[i].length; j++) {
        if (windowTranscript[i][j] == "A") {
            windowTranscript[i][j] = "del"
        }
    }
}
console.warn("标记消除", windowTranscript);
for (let j = 0; j < windowTranscript[0].length; j++) {
    for (let i = windowTranscript.length - 1; i >= 0; i--) {
        const element = windowTranscript[i][j];
        if (element == "del" && i - 1 >= 0) {
            for (let ii = i - 1; ii >= 0; ii--) {
                if (windowTranscript[ii][j] != "del") {
                    [windowTranscript[i][j], windowTranscript[ii][j]]
                        = [windowTranscript[ii][j], windowTranscript[i][j]];
                    break;
                }
            }
        }
    }
}
console.warn("下落后", windowTranscript);
// ts-node String.ts
//需要交换的两个变量
// 补全的行信息
const newly = [];
for (let j = 0; j < windowTranscript[0].length; j++) {
    const completionColumn = [];
    for (let i = windowTranscript.length - 1; i >= 0; i--) {
        // console.warn(windowTranscript[i][j])
        if (windowTranscript[i][j] == "del") {
            windowTranscript[i][j] = "F";
            completionColumn.push({ type: windowTranscript[i][j] });
        }
    }
    newly.push(completionColumn);
}
console.warn("掉落数据", newly);
// console.warn(completionColumn);
console.warn("掉落后", windowTranscript);
