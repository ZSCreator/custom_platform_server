import { type } from 'ramda';
import lotteryUtil = require('../../app/servers/DragonTiger/lib/util/lotteryUtil');


let ret = lotteryUtil.lottery();
let roomCurrSumBet = 500;
let ret1 = Math.floor(roomCurrSumBet / 300);
console.warn(ret1);
let recommendBet = [Math.floor(roomCurrSumBet / 300) * 100, Math.floor(roomCurrSumBet * 2 / 300) * 100, roomCurrSumBet];
console.warn(recommendBet);
{
    let msg = { betNum: NaN }
    if (typeof msg.betNum != "number" || msg.betNum < 0) {
        console.warn(typeof msg.betNum)
    } else {
        console.warn(111)
    }

}
