import {BetAreasName} from '../config/betAreas';
import BetArea from "../classes/betArea";
import {random} from "../../../../utils";

/**
 * 开奖工具
 * @property killAreas 必杀区域 不开出来
 * @property drawAreas 和局区域
 */
export class LotteryUtil {
    private result: number = null;
    private winAreas: BetAreasName[] = [];
    private killAreas: BetAreasName[] = [];
    private drawAreas: BetAreasName[] = [];
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
        this.result = random(1, 48);
        return this.result;
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
            if (this.drawAreas.includes(areaName as BetAreasName)) {
                // 如果和区域 退还金币
                area.setDrawResult();
            } else if (this.winAreas.includes(areaName as BetAreasName)) {
                // 如果赢的区域包含在里面 设置赢的结果
                area.setWinResult();
            } else {
                // 没有则设置输的结果
                area.setLossResult();
            }
        }

        return this.result;
    }

    /**
     * 计算赢的位置
     */
    calculationWinAreas() {
        this.winAreas = [];
        this.drawAreas = [];

        // 取得余数
        const remainder = this.result % 4;

        // 计算单双
        this.winAreas.push(remainder % 2 === 0 ? BetAreasName.DOUBLE : BetAreasName.SINGLE);

        // 计算番数
        switch (remainder) {
            case 0: this.winAreas.push(BetAreasName.FOUR); break;
            case 1: this.winAreas.push(BetAreasName.ONE); break;
            case 2: this.winAreas.push(BetAreasName.TWO); break;
            case 3: this.winAreas.push(BetAreasName.THREE); break;
            default: throw new Error('开奖错误');
        }

        // 计算N念K 根据计算的头番算出赢的区域
        switch (remainder) {
            case 0:
                this.winAreas.push(BetAreasName.FOUR_FOR_THREE, BetAreasName.FOUR_FOR_TWO, BetAreasName.FOUR_FOR_ONE);
                break;
            case 1:
                this.winAreas.push(BetAreasName.ONE_FOR_FOUR, BetAreasName.ONE_FOR_THREE, BetAreasName.ONE_FOR_TWO);
                break;
            case 2:
                this.winAreas.push(BetAreasName.TWO_FOR_THREE, BetAreasName.TWO_FOR_ONE, BetAreasName.TWO_FOR_FOUR);
                break;
            case 3:
                this.winAreas.push(BetAreasName.THREE_FOR_FOUR, BetAreasName.THREE_FOR_TWO, BetAreasName.THREE_FOR_ONE);
                break;
            default: throw new Error('开奖错误');
        }

        // 计算出退还金币的区域
        switch (remainder) {
            case 0:
                this.drawAreas.push(BetAreasName.ONE_FOR_FOUR, BetAreasName.TWO_FOR_FOUR, BetAreasName.THREE_FOR_FOUR);
                break;
            case 1:
                this.drawAreas.push(BetAreasName.THREE_FOR_ONE, BetAreasName.TWO_FOR_ONE, BetAreasName.FOUR_FOR_ONE);
                break;
            case 2:
                this.drawAreas.push(BetAreasName.THREE_FOR_TWO, BetAreasName.FOUR_FOR_TWO, BetAreasName.ONE_FOR_TWO);
                break;
            case 3:
                this.drawAreas.push(BetAreasName.FOUR_FOR_THREE, BetAreasName.ONE_FOR_THREE, BetAreasName.TWO_FOR_THREE);
                break;
            default: throw new Error('开奖错误');
        }

        // 计算角数
        switch (remainder) {
            case 0: this.winAreas.push(BetAreasName.ONE_FOUR_ANGLE, BetAreasName.THREE_FOUR_ANGLE); break;
            case 1: this.winAreas.push(BetAreasName.ONE_FOUR_ANGLE, BetAreasName.ONE_TWO_ANGLE); break;
            case 2: this.winAreas.push(BetAreasName.ONE_TWO_ANGLE, BetAreasName.TWO_THREE_ANGLE); break;
            case 3: this.winAreas.push(BetAreasName.TWO_THREE_ANGLE, BetAreasName.THREE_FOUR_ANGLE); break;
            default: throw new Error('开奖错误');
        }

        // 计算门
        switch (remainder) {
            case 0:
                this.winAreas.push(BetAreasName.ONE_TWO_FOUR_DOOR, BetAreasName.ONE_THREE_FOUR_DOOR, BetAreasName.TWO_THREE_FOUR_DOOR);
                break;
            case 1:
                this.winAreas.push(BetAreasName.ONE_TWO_THREE_DOOR, BetAreasName.ONE_TWO_FOUR_DOOR, BetAreasName.ONE_THREE_FOUR_DOOR);
                break;
            case 2:
                this.winAreas.push(BetAreasName.ONE_TWO_THREE_DOOR, BetAreasName.ONE_TWO_FOUR_DOOR, BetAreasName.TWO_THREE_FOUR_DOOR);
                break;
            case 3:
                this.winAreas.push(BetAreasName.TWO_THREE_FOUR_DOOR, BetAreasName.ONE_THREE_FOUR_DOOR, BetAreasName.ONE_TWO_THREE_DOOR);
                break;
            default: throw new Error('开奖错误');
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
        results.push(random(1, 48));
    }

    return results;
}


