import {getDateSpecifHMSAfterDays} from "../../../../utils/lottery/commonUtil";
import {BetAreasName} from '../config/betAreas';
import {get} from "../../../../../config/data/JsonMgr";
import {random} from "../../../../utils";

/**
 * 猜AB下注信息
 * @param playerGold 下注金币
 * @param sceneId 场
 */
export function splitBetGold(playerGold: number, sceneId: number): {betType: BetAreasName, betGold: number} {
    const scene = get('scenes/andarBahar').datas.find(scene => scene.id === sceneId);

    let betType: BetAreasName;

    if (Math.random() < 0.5) {
        betType = BetAreasName.BAHAR;
    } else {
        betType = BetAreasName.ANDAR;
    }

    // 只押注一次
    let betCount;

    // 凌晨三点到7点减少下注
    let temp1 = getDateSpecifHMSAfterDays(0, 3);
    let temp2 = getDateSpecifHMSAfterDays(0, 7);
    if (Date.now() > temp1 && Date.now() < temp2) {
        betCount = random(1, 3);
    } else {
        betCount = random(1, 5);
    }

    const betGold = factorial(scene.lowBet, betCount);
    // 返回的是 下注区域 和 金币数组
    return { betType,  betGold};
}

function factorial(num: number, count: number): number {
    if (count <= 0) {
        return num;
    }

    return factorial(num * 2, --count);
}