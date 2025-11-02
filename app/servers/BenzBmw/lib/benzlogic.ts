// import utils = require('../../../utils');


import benzRoom from './benzRoom';
import benzPlayer from './benzPlayer';
import { RoleEnum } from "../../../common/constant/player/RoleEnum";
import *as utils from "../../../utils";
import benzConst = require('./benzConst');
/** 结算 
 * userBets 玩家押注情况
*/
export function settle_zhuang(roomInfo: benzRoom, Players: benzPlayer[]) {
    try {
        for (const pl of Players) {
            if (pl.bet) {
                pl.profit = 0;
                for (const bet_e of pl.betList) {
                    bet_e.profit = 0;
                    if (roomInfo.lotterys == bet_e.area) {
                        bet_e.profit = bet_e.bet * (benzConst.points.find(c => c.area == bet_e.area).odds - 1);
                        pl.profit += bet_e.bet * (benzConst.points.find(c => c.area == bet_e.area).odds - 1);
                    } else {
                        bet_e.profit = -bet_e.bet;
                        pl.profit -= bet_e.bet;
                    }
                }
            }
        }
        return;
    } catch (e) {
        console.error(`ttz_zhuangService.settle错误 ==> ${e}`);
        return;
    }
}
export function random(min: number, max: number) {
    let count = Math.max(max - min, 0);
    return Math.round(Math.random() * count * 100) / 100;
};
/**根据概率获 */
export function getRanomByWeight() {
    let weights = benzConst.points;
    let sum = 0;
    for (const c of weights) {
        sum = sum + c.prob;
    }

    let compareWeight = random(1, sum);
    let weightIndex = 0;
    while (sum > 0) {
        sum = sum - weights[weightIndex].prob
        if (sum <= compareWeight) {
            let c = weights[weightIndex];
            return c;
        }
        weightIndex = weightIndex + 1;
    }
    return;
}