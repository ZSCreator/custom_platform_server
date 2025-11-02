import *as ld_Logic from '../../app/servers/LuckyDice/lib/ld_Logic';
import *as qzpj_logic from '../../app/servers/qzpj/lib/qzpj_logic';

export function random(min: number, max: number) {
    let count = Math.max(max - min, 0);
    return Math.round(Math.random() * count) + min;
}

/**
 * 随机5个骰子
 */
export function getRandomDice(num = 5) {
    let poker: number[] = [];
    for (let i = 0; i < num; i++) {
        poker.push(random(1, 6));
    }
    return poker;
};

console.warn(getRandomDice());
let ret = qzpj_logic.getCardType([13, 13]);
console.warn(ret);