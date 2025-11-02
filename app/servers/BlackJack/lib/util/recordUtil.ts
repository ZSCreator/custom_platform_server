import {BlackJackBetArea} from "../expansion/BlackJackBetArea";
import {conversionCards} from "../../../../utils/GameUtil";

/**
 * 构建记录需要结果
 * @param dealerArea 庄家结果
 * @param commonAreaList 公共区域结果
 */
export function buildRecordResult(dealerArea: any, commonAreaList: BlackJackBetArea[]) {
    // 构造庄家的牌
    const count = Math.max(...dealerArea.countList);
    let banker = `${conversionCards(dealerArea.pokerList)}/${count > 21 ? '00' : count < 10 ? ('0' + count.toString()) : count.toString()}|`;

    let suffix = ''
    // 构建闲家的牌
    commonAreaList.forEach((area, index) => {
        if (area.getCurrentBet() === 0) {
            return ;
        }

        const count = area.getCount();
        suffix += `${index+1}/${conversionCards(area.getPokerList().basePokerList)}/${count > 21 ? '00' : count < 10 ? ('0' + count.toString()) : count.toString()}|`;
    })

    return `${banker}${suffix}`;
}