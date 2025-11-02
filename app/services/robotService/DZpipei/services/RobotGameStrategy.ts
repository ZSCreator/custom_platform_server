
export default class RobotGameStrategy {
    robotStrategyConfigJson = {
        /**牌殇值 */
        // pokerType: [0, 1, 2, 3, 4, 5],
        // pokerType_text: "牌殇值",
        //
        // /**[牌殇值]*0.05 */
        // preFlopFoldBaseValue: 5,
        //
        // /**0|0.02|0.05|0.1|0.2|0.3+[牌殇值]*0.05 */
        preFlopFoldList: [0, 10, 15, 20, 60, 70],

        /**翻牌前:加注概率 */
        preFlopRaiseList: [40, 20, 10, 5, 3, 0],

        /**翻牌圈:弃牌概率 */
        flopRoundFoldList: [0, 10, 20, 30, 50, 60],

        /**翻牌圈:加注概率 */
        flopRoundRaiseList: [40, 20, 10, 5, 3, 0],

        /**转牌圈:弃牌概率 */
        turnRoundFoldList: [0, 20, 40, 60, 70, 90],

        /**转牌圈:加注概率 */
        turnRoundRaiseList: [40, 20, 10, 5, 0, 0],

        /**河牌圈:弃牌概率 */
        riverRoundFoldList: [0, 40, 50, 65, 70, 90],

        /**河牌圈:加注概率 */
        riverRoundRaiseList: [60, 20, 15, 5, 0, 0],

        /**推荐加注概率 */
        raiseRecommBetProbabilityList: [70, 60, 50, 50, 50, 50],
        /**自由加注概率 */
        raiseFreedomBetProbabilityList: [70, 60, 50, 50, 50, 50],

        /**推荐加注:选择具体某一个值概率 */
        raiseRecommBetList: [20, 35, 45],

        /**自由加注:具体百分比 如 min:50,max:100; 数组选择50，表示自由加注为75 Glod */
        raiseFreedomBetList: [30, 30, 20, 20, 10, 0],

        /** 如果场景是0,1,2 ,那么取对应的数组,然后再进行随机选一个数字进行加注  */
        raiseAddSceneBetList: [[100, 200, 500, 1000, 2000], [1000, 2000, 5000, 10000, 20000], [5000, 10000, 25000, 50000, 100000]],

        /**准备检测概率 */
        readyProbability: 85,

        /**准备检测间隔 */
        readyTime: 3000,

        /**离开概率 */
        leaveProbability: 2,

        /**离开检测间隔 */
        leaveTime: 3000,
    };


    /**
     * 翻牌前弃牌概率
     * @param {number} pokerPowerRank 牌力排名 (0-6) Ps:首轮可能 6
     * @returns {number}
     */
    getFoldProbability(roundCount = 0, pokerPowerRank: number) {
        pokerPowerRank = pokerPowerRank >= 6 ? 5 : pokerPowerRank - 1;
        switch (roundCount) {
            case 0:
                {
                    // const pokerTypeNum = this.robotStrategyConfigJson['pokerType'][pokerPowerRank];
                    // const preFlopFoldValue = this.robotStrategyConfigJson['preFlopFoldList'][pokerPowerRank];
                    // // if (pokerPowerRank === 1)
                    // //     return 0;
                    // // 基准值 + (系数*手牌类型)
                    // let ret = this.robotStrategyConfigJson['preFlopFoldBaseValue'] * pokerTypeNum;
                    // let resultNum = preFlopFoldValue + parseInt(`${ret}`);
                    // resultNum = resultNum >= 100 ? 100 : resultNum;
                    return this.robotStrategyConfigJson['flopRoundFoldList'][pokerPowerRank];
                }
            case 1:
                return this.robotStrategyConfigJson['flopRoundFoldList'][pokerPowerRank];
            case 2:
                return this.robotStrategyConfigJson['turnRoundFoldList'][pokerPowerRank];
            case 3:
                return this.robotStrategyConfigJson['riverRoundFoldList'][pokerPowerRank];
            default:
                break;
        }

    }

    /**
     * 加注概率
     * @param {number} pokerPowerRank 牌力排名
     * @returns {number}
     */
    getfillingProbability(roundCount: number = 1, pokerPowerRank) {
        pokerPowerRank = pokerPowerRank >= 6 ? 5 : pokerPowerRank - 1;
        switch (roundCount) {
            case 0:
                return this.robotStrategyConfigJson['preFlopRaiseList'][pokerPowerRank];
            case 1:
                return (this.robotStrategyConfigJson['flopRoundRaiseList'][pokerPowerRank]);
            case 2:
                return (this.robotStrategyConfigJson['turnRoundRaiseList'][pokerPowerRank]);
            case 3:
                return (this.robotStrategyConfigJson['riverRoundRaiseList'][pokerPowerRank]);
            default:
                break;
        }
    }
}