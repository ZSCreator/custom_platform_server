import { divideBetGold } from "../../../../utils/robot/robotBetUtil";
// import {beizhiRobot} from "../../../../services/robotService/common/robotAction";
import { getDateSpecifHMSAfterDays, randomFromRange } from "../../../../utils/lottery/commonUtil";
import { randomBetGold } from "../../../../utils/robot/robotGoldUtil";
import { BetAreasName } from '../config/betAreas';

/**
 * 色碟下注信息
 * @param playerGold 下注金币
 * @param sceneId 场
 */
export function splitBetGold(playerGold: number, sceneId: number, ChipList: number[]) {
    // const betSelection: number[] = beizhiRobot(sceneId).yaSection;
    const ran = randomFromRange(1, 100);
    // 随机每把的下注金额
    let betGold = randomBetGold(ChipList, playerGold, ran);
    // 下注金额小于最小可下注金额，金币不足，返回
    if (!betGold) {
        return { 'betType': null, 'betArr': [] };
    }

    let betType: BetAreasName;

    if (ran < 32) {
        betType = BetAreasName.SINGLE;
    } else if (ran < 64) {
        betType = BetAreasName.DOUBLE;
    } else if (ran < 79) {
        betType = BetAreasName.THREE_RED;
    } else if (ran < 94) {
        betType = BetAreasName.THREE_WHITE;
    } else if (ran < 97) {
        betType = BetAreasName.FOUR_WHITE;
    } else {
        betType = BetAreasName.FOUR_RED;
    }
    // 押和的，控制总金币在 25000 以内（即前端的250以内）
    if (betType === BetAreasName.FOUR_RED || betType === BetAreasName.FOUR_WHITE) {
        // 在 5000 到 25000 之间随机一个值
        betGold = Math.min(betGold, randomFromRange(5000, 25000));
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