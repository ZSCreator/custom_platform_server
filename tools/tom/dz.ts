import weights = require('../../app/servers/BingoMoney/lib/config/weights');
import winLines = require('../../app/servers/BingoMoney/lib/config/winLines');
import utils = require("../../app/utils");
import { clone, random, selectElement } from '../../app/utils';



class lottery {
    weight = clone(weights.weights['1']);

    // console.warn(elementKeys);
    window: any[][] = [];
    constructor() {
        let elementKeys = Object.keys(this.weight);
        // 生成一个矩阵
        for (let i = 0; i < 5; i++) {
            const elementSet = elementKeys.map(element => {
                return { key: element, value: this.weight[element][i] };
            });
            // console.warn(elementSet);
            // 一列
            const line = [];

            for (let j = 0; j < 3; j++) {
                // 随机选择一个元素
                line.push(selectElement(elementSet));
            }

            this.window.push(line);
        }
        console.warn(this.window);
    }
    public calculateEarnings() {
        // 选择中奖线
        const selectLines = winLines.winLines.slice(0, 1);
        selectLines.forEach((line, index) => {
            // 这条线上的元素
            console.warn(line);
            const elementLine: any[] = line.Line.map((l, i) => {
                console.warn(i, l - 1);
                return this.window[i][l - 1];
            });
            console.warn(elementLine);
        });
    }
}
let num = 1;
let bigBG = 5;
let Grid = [];
function dddd() {
    bigBG -= num;
    let nCount: number[] = [];
    for (let idx = 0; idx < num; idx++) {
        nCount.push(utils.random(2, 4));
    }
    while (15 - (utils.sum(nCount) + Grid.length) < bigBG * 2) {
        nCount.sort((a, b) => b - a);
        nCount[0]--;
    }
    Grid.push(...new Array(utils.sum(nCount)).fill(null));
    console.warn(nCount, utils.sum(nCount));
}
for (let index = 0; index < 10; index++) {
    dddd()
}