import {red, white} from '../constants';
import {BetAreasName} from '../config/betAreas';
import BetArea from "../classes/betArea";
import {random} from "../../../../utils";

// 色碟两面
const plates = [red, white];

/**
 * 开奖工具
 * @property plates 四个碟子的八面
 * @property killAreas 必杀区域 不开出来
 */
export class LotteryUtil {
    private result = null;
    private winAreas: BetAreasName[] = [];
    private killAreas: BetAreasName[] = [];
    betAreas: {[key in BetAreasName]: BetArea};

    /**
     *
     * @param killAreas
     */
    setKillAreas(killAreas: BetAreasName[]) {
        this.killAreas = killAreas;
        return this;
    }

    /**
     * 设置押注区域详情
     * @param betAreas
     */
    setBetAreas(betAreas: {[key in BetAreasName]: BetArea}) {
        this.betAreas = betAreas;
    }

    /**
     * 获取必杀区域
     */
    getKillAreas(): BetAreasName[] {
        return this.killAreas;
    }

    /**
     * 开奖区域包含必杀区域
     */
    isContain() {
        return !!this.killAreas.find(areaName => this.winAreas.includes(areaName));
    }

    /**
     * 随机开奖
     */
    genLotteryResult() {
        const result = [];

        // 随机取四个
        for (let i = 0; i < 4; i++) {
            const index = random(0, plates.length - 1);
            result.push(plates[index]);

            // plates.sort((a, b) => Math.random() - 0.5);
            // plates.sort((a, b) => Math.random() - 0.5);
            //
            // result.push(plates.shift());
        }

        this.result = result;
        return result;
    }

    /**
     * 开奖
     */
    lottery() {
        // 随机开奖
        this.genLotteryResult();

        // 计算赢的区域
        this.calculationWinAreas();

        // 如果有必杀区域 则开出不包含必杀区域的结果
        if (this.killAreas.length > 0 && this.isContain()) {
            return this.lottery();
        }

        // 计算输赢结果
        for (let [areaName, area] of  Object.entries(this.betAreas)) {
            // 如果开奖区域包含 则赢 不包含则输
            this.winAreas.includes(areaName as BetAreasName) ? area.setWinResult() : area.setLossResult();
        }

        return this.result;
    }

    /**
     * 计算赢的位置
     */
    calculationWinAreas() {
        this.winAreas = [];
        // 计算单双
        const redCount = this.result.filter(plate => plate === red).length;
        const whiteCount = this.result.filter(plate => plate === white).length;

        // 如果 红能被2整除证明是双 否则则为单
        this.winAreas.push(redCount % 2 === 0 ? BetAreasName.DOUBLE : BetAreasName.SINGLE);

        // 计算是否有三个白蝶 或者三个红蝶
        if (whiteCount === 3) {
            this.winAreas.push(BetAreasName.THREE_WHITE);
        } else if (redCount === 3) {
            this.winAreas.push(BetAreasName.THREE_RED);
        }

        // 计算是否是四个红蝶 或者四个白蝶
        if (redCount === 4) {
            this.winAreas.push(BetAreasName.FOUR_RED);
        } else if (whiteCount === 4) {
            this.winAreas.push(BetAreasName.FOUR_WHITE);
        }
    }

    /**
     * 获取赢得区域
     */
    getWinAreas() {
        return this.winAreas;
    }

    /**
     * 获取开奖结果
     */
    getResult() {
        return this.result;
    }
}
//
// for (let i = 0; i < 100; i++) {
//     console.log(new LotteryUtil().genLotteryResult())
// }

/**
 * 生成随机盘路
 */
export function genRandomResult() {
    const num = random(10, 20);
    const results = [];

    for (let i = 0; i < num; i++) {
        const result = [];
        for (let i = 0; i < 4; i++) {
            const index = random(0, plates.length - 1);
            result.push(plates[index]);
        }

        results.push(result);
    }

    return results;
}