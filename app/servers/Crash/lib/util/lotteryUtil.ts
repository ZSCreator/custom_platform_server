import {MIN_ODDS, SPEED_UP} from '../constants';
import {probabilityOfOdds} from '../config/probability';
import {random} from "../../../../utils";

const COUNT = probabilityOfOdds.reduce((num, line) => num + line.probability, 0);

export class LotteryUtil {
    private flyTime: number = 0;
    private result: number;

    /**
     * 开奖
     */
    lottery() {
        this.genLotteryResult();
        this.calculateLotteryTime();
    }

    /**
     * 获取开奖结果
     */
    getResult() {
        return this.result;
    }

    getFlyTime() {
        return this.flyTime;
    }

    /**
     * 根据最大赔付随机开奖
     */
    private genLotteryResult() {
        const randomNum = random(0, COUNT);

        // 选择开奖倍数
        let count = 0;
        const interval = probabilityOfOdds.find(p => {
            count += p.probability;
            if (count >= randomNum) {
                return true;
            }
        });

        // 计算概率
        if (interval.oddsMax === MIN_ODDS) {
            this.result = MIN_ODDS;
        } else {
            this.result = random(interval.oddsMin * 100, interval.oddsMax * 100) / 100;
        }
    }

    /**
     * 获取到这个赔率的时间
     * @param odds
     */
    getFlyTimeToOdds(odds: number) {
        this.result = odds;
        this.calculateLotteryTime();

        return this.flyTime;
    }

    /**
     * 根据开奖结果计算开奖时间
     */
    private calculateLotteryTime() {
        if (this.result === MIN_ODDS) {
            this.flyTime = 0;
            return;
        }

        let num = 1, last;
        for (let i = 1; i <= 100; i++) {
            last = num;
            num *= SPEED_UP;

            if (num > this.result) {
                const average = 1000 / ((num - last) * 100);
                const diff = (this.result - last) * 100 * average;
                this.flyTime = (i - 1) * 1000 + Math.floor(diff);
                break;
            } else if (num === this.result) {
                this.flyTime = i * 1000;
            }
        }
    }
}

/**
 * 止盈点
 * @param flyTime
 */
export function calculateOdds(flyTime: number) {
    const time = flyTime / 1000;
    const remain = Math.floor(time % 1 * 100) / 100;
    const seconds = Math.floor(time);

    let odds = 1;
    for (let i = 0; i < seconds; i++) {
        odds *= SPEED_UP;
    }

    const num = ((odds * SPEED_UP) - odds) * remain;

    return Math.floor((num + odds) * 100) / 100;
}

/**
 * 生成随机盘路
 */
export function genRandomResult() {
    const lotteryUtil = new LotteryUtil();
    const num = random(10, 20);
    const result = [];

    for (let i = 0; i < num; i++) {
        lotteryUtil.lottery();
        result.push(lotteryUtil.getResult());
    }

    return result;
}