import GoldenFlower_logic = require('../../app/servers/GoldenFlower/lib/GoldenFlower_logic');



let ret = GoldenFlower_logic.getCardType([41, 48, 14]);
console.warn(ret)
ret = GoldenFlower_logic.getCardType([13, 20, 30]);
console.warn(ret)
let ret1 = GoldenFlower_logic.bipaiSole({ cardType: 0, cards: [41, 48, 14] }, { cardType: 0, cards: [13, 20, 30] });

// ret = goldFlo_logic.specialPoker(1, [0, 1, 13]);
console.warn(ret1)
