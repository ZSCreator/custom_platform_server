import * as wrjh_logic from '../../app/servers/WanRenJH/lib/wrjh_logic';

// let ret = { cardType: 0, cards: [] };
// let ret1 = { cardType: 0, cards: [] };

// ret.cards = [3, 16, 17, 19, 20];
// ret.cardType = wrjh_logic.getCardType(ret.cards);


// ret1.cards = [0, 13, 17, 19, 20];
// ret1.cardType = wrjh_logic.getCardType(ret1.cards);

// let res = wrjh_logic.shuffle();
// let cards = [2, 37, 42, 40, 17];
// let ret = cards.map(c => console.warn(wrjh_logic.pukes[c]));

// let res = wrjh_logic.getMaxCardtype(cards, []);
// console.warn(res.cards.map(c => wrjh_logic.pukes[c]));
// console.warn(res.cards.map(c => wrjh_logic.getCardValue(c)));

// let result = wrjh_logic.getMaxCardtype([5, 18, 31, 45, 7], []);
// console.warn(result.cards.map(c => wrjh_logic.pukes[c]));

// {
//     let res1 = res.splice(0, 13).map(c => wrjh_logic.getCardValue(c));
//     console.warn(res1);
// }
// {
//     let res1 = res.splice(0, 13).map(c => Math.floor((c - 1) / 13));
//     console.warn(res1);
// }
// {
//     let res1 = res.splice(0, 13).map(c => Math.floor((c - 1) / 13));
//     console.warn(res1);
// }
// let zz = wrjh_logic.bipaiSole([ret, ret1]);
// console.warn(zz);
let delayArr = [1000, 2000, 3000, 4000, 5000];

for (let idx = 0; idx < delayArr.length; idx++) {
    delayArr[idx] = delayArr[idx] + 1000;
}
console.warn(delayArr);