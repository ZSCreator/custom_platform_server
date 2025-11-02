import { resolve } from 'bluebird';
import GoldenFlower_logic = require('../../app/servers/GoldenFlower/lib/GoldenFlower_logic');

let pls = [
    {
        cardType: 1,
        cards: [5, 9 + 13, 6]
    },
    {
        cardType: 1,
        cards: [5 + 13, 9 + 13 * 2, 6 + 13]
    }
]
let ret = GoldenFlower_logic.bipaiSole(pls[0], pls[1]);
console.warn(ret == 1 ? "玩家1大" : "玩家2大");
let ret1 = GoldenFlower_logic.judgeCards(pls[0].cards,);
let ret2 = GoldenFlower_logic.judgeCards(pls[1].cards,);
console.warn(ret1, ret2);
function judgeShunza(cards: number[]) {
    const ShunzaCards = cards.map(card => card % 13).sort((card1, card2) => {
        return card1 - card2;
    });
    if (ShunzaCards[0] === 0 && ShunzaCards[1] === 11 && ShunzaCards[2] === 12) {
        return true;
    }

    for (let i = 0, len = ShunzaCards.length - 1; i < len; i++) {
        if (ShunzaCards[i] + 1 !== ShunzaCards[i + 1]) return false;
    }
    return true;
}

console.warn(judgeShunza([1, 2, 3]))