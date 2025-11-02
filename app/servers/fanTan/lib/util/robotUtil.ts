import { divideBetGold } from "../../../../utils/robot/robotBetUtil";
// import {beizhiRobot} from "../../../../services/robotService/common/robotAction";
import { getDateSpecifHMSAfterDays, randomFromRange } from "../../../../utils/lottery/commonUtil";
import { randomBetGold } from "../../../../utils/robot/robotGoldUtil";
import { BetAreasName, doubleAreas, jointAreas, singleAreas, threeAreas } from '../config/betAreas';
import { random } from "../../../../utils";

/**
 * 番摊下注信息
 * @param playerGold 下注金币
 * @param sceneId 场
 */
export function splitBetGold(playerGold: number, sceneId: number, ChipList: number[]) {

    const ran = randomFromRange(1, 100);
    // 随机每把的下注金额
    let betGold = randomBetGold(ChipList, playerGold, ran);
    // 下注金额小于最小可下注金额，金币不足，返回
    if (!betGold) {
        return { 'betType': null, 'betArr': [] };
    }

    let betType: BetAreasName;

    switch (true) {
        // 有25%的概率下番
        case (ran < 25):
            betType = singleAreas[random(0, singleAreas.length - 1)];
            break;

        // 有15%概率下念
        case (ran < 35):
            betType = jointAreas[random(0, jointAreas.length - 1)];
            break;

        // 有20%概率下角
        case (ran < 55):
            betType = doubleAreas[random(0, doubleAreas.length - 1)];
            break;

        // 有25%概率下单双
        case (ran < 80):
            betType = Math.random() < 0.5 ? BetAreasName.SINGLE : BetAreasName.DOUBLE;
            break;

        // 有20%概率下门
        case (ran <= 100):
            betType = threeAreas[random(0, threeAreas.length - 1)];
            break;
        default:
            throw new Error('番摊机器人拆分下注错误');
    }

    let betArr = divideBetGold(ChipList, betGold);
    // 凌晨三点到7点减少下注
    let temp1 = getDateSpecifHMSAfterDays(0, 3);
    let temp2 = getDateSpecifHMSAfterDays(0, 7);
    if (Date.now() > temp1 && Date.now() < temp2 && betArr.length > 3) {
        betArr = betArr.slice(0, 2);
    }
    // 返回的是 下注区域 和 金币数组
    return { betType, betArr };
};