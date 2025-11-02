'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const BaseRobot_1 = require("../../../../common/pojo/baseClass/BaseRobot");
const utils = require("../../../../utils");
const DeGameUtil = require("../../../../utils/gameUtil2");
const RobotGameStrategy_1 = require("../../../../services/robotService/DZpipei/services/RobotGameStrategy");
const pinus_logger_1 = require("pinus-logger");
const robotlogger = (0, pinus_logger_1.getLogger)('robot_out', __filename);
class DZpipeirobot extends BaseRobot_1.BaseRobot {
    constructor(opts) {
        super(opts);
        this.RobotGameStrategy = new RobotGameStrategy_1.default();
        this.seat = 0;
        this.sceneId = 0;
        this.inning = 0;
        this.playerGold = 0;
        this.roundCount = 0;
        this.af = 0;
        this.allbet = 0;
        this.allfilling = 0;
        this.heel = 0;
        this.currSumBet = 0;
        this.errorInfo = 0;
        this.leaveTimes = utils.random(10, 50);
        this.playTimes = 0;
        this.flodsPlay = [];
        this.isTiaokong = false;
        this.maxSeat = -1;
        this.isgengfill = 0;
        this.maxais = -1;
        this.maxNum = 0;
        this.descSortAllPlayer = [];
        this.godLikeMod = false;
        this.addGoldTimes = 0;
        this.roomPlayerNum = 0;
    }
    async loaded() {
        try {
            let data = await this.requestByRoute("DZpipei.mainHandler.loaded", {});
            this.sceneId = data.sceneId;
            this.descSortAllPlayer = [];
            for (let pl of data.room.players) {
                if (pl && pl.uid == this.uid) {
                    this.seat = pl.seat;
                    this.currGold = pl.currGold;
                    this.canCarryGold = data.room.canCarryGold;
                }
            }
            return Promise.resolve(data);
        }
        catch (error) {
            return Promise.reject(error);
        }
    }
    registerListener() {
        this.Emitter.on("dz_onDeal", this.onDeal.bind(this));
        this.Emitter.on("dz_onFahua", this.onfahua.bind(this));
        this.Emitter.on("dz_onSettlement", this.onSettlement.bind(this));
        this.Emitter.on("dz_onDeal2", this.onDeal2.bind(this));
        this.Emitter.on("dz_onOpts", this.onOpts.bind(this));
    }
    onSettlement(data) {
        this.descSortAllPlayer = [];
        setTimeout(() => {
            this.destroy();
        }, utils.random(1, 3) * 10);
    }
    onDeal(deal) {
        let playerlist = deal.players;
        for (let val of playerlist) {
            if (val.seat !== this.seat) {
                continue;
            }
            if (val.holds == null) {
                continue;
            }
            this.aipoke = val.holds;
            if (this.uid === deal.default) {
                this.godLikeMod = true;
            }
        }
        this.currSumBet = deal.currSumBet;
        this.fahuaIdx = deal.fahuaIdx;
        this.roundCount = 0;
        this.maxSeat = deal.maxSeat;
    }
    onDeal2(pubpo) {
        this.roundCount++;
        this.aipokeType = pubpo.cardType.type;
        this.otherPoke = [];
        this.otherPokeNum = [];
        for (let pl of pubpo.allPlayer) {
            if (this.flodsPlay.length > 0) {
                if (this.flodsPlay.indexOf(pl.seat) > -1) {
                    continue;
                }
            }
            if (this.roundCount == 1) {
                if (DeGameUtil.sortPokerToType(pl.cardType.cards) > this.maxNum) {
                    this.maxNum = DeGameUtil.sortPokerToType(pl.cardType.cards);
                    this.maxais = pl.seat;
                }
            }
            else {
                if (pl.uid == this.uid) {
                    continue;
                }
                this.otherPokeNum.push(DeGameUtil.sortPokerToType(pl.cardType.cards));
            }
        }
    }
    async onfahua(onfa) {
        const { fahuaIdx, currGold, freedomBet, recommBet, cinglNum } = onfa;
        const t1 = utils.cDate();
        try {
            if (fahuaIdx != this.seat)
                return;
            let currentRanking = -1;
            if (!this.descSortAllPlayer || this.descSortAllPlayer.length == 0) {
                let result = await this.requestByRoute(`DZpipei.mainHandler.robotNeed`, {});
                this.descSortAllPlayer = result.descSortAllPlayer;
            }
            if (this.descSortAllPlayer) {
                currentRanking = this.descSortAllPlayer.findIndex(pl => pl.uid === this.uid) + 1;
            }
            else {
                return;
            }
            let sendMsgTimeout = utils.random(1000, 4000);
            let robotStrategyConfigJson = this.RobotGameStrategy.robotStrategyConfigJson;
            const preFlopFoldProbability = this.RobotGameStrategy.getFoldProbability(this.roundCount, currentRanking);
            const random = utils.random(1, 100);
            if (!this.godLikeMod && preFlopFoldProbability >= random) {
                if (cinglNum == 0) {
                    await this.delayRequest(`DZpipei.mainHandler.cingl`, {}, sendMsgTimeout);
                    return;
                }
                await this.delayRequest(`DZpipei.mainHandler.fold`, {}, sendMsgTimeout);
                return;
            }
            if (!this.godLikeMod && this.roundCount == 0 && cinglNum > 0) {
                const isPass = this.robotComparisonPlayerCard(this.descSortAllPlayer, currentRanking);
                if (isPass) {
                    return await this.delayRequest(`DZpipei.mainHandler.fold`, {}, sendMsgTimeout);
                }
            }
            if (!this.godLikeMod && this.roundCount == 3 && cinglNum > 0) {
                const isPass = this.lastRandomRobotComparisonPlayerCard(this.descSortAllPlayer);
                if (isPass) {
                    return await this.delayRequest(`DZpipei.mainHandler.fold`, {}, sendMsgTimeout);
                }
            }
            if (this.godLikeMod && currGold <= cinglNum) {
                return await this.delayRequest(`DZpipei.mainHandler.cingl`, {}, sendMsgTimeout);
            }
            const preFlopRaiseProbability = this.RobotGameStrategy.getfillingProbability(this.roundCount, currentRanking);
            const random1 = utils.random(1, 59);
            if (preFlopRaiseProbability > random1) {
                let intervalValue = 0;
                const random2 = utils.random(1, 100);
                let isRecommBet = robotStrategyConfigJson['raiseRecommBetProbabilityList'][currentRanking >= 6 ? 5 : currentRanking - 1] > random2;
                if (this.roundCount == 3 || isRecommBet) {
                    await this.raiseRecommBet(currGold, cinglNum, recommBet, intervalValue, robotStrategyConfigJson, sendMsgTimeout, currentRanking);
                }
                else {
                    await this.raiseFreedomBet(currentRanking, cinglNum, freedomBet, currGold, intervalValue, robotStrategyConfigJson, sendMsgTimeout);
                }
                return true;
            }
            else {
                await this.delayRequest(`DZpipei.mainHandler.cingl`, {}, sendMsgTimeout);
                return true;
            }
        }
        catch (error) {
            const t2 = utils.cDate();
            robotlogger.warn('DZpipei|发话阶段出错:', error, t1, t2, this.roomId, this.uid);
        }
    }
    async raiseRecommBet(currGold, cinglNum, recommBet, intervalValue, robotStrategyConfigJson, sendMsgTimeout, currentRanking) {
        const [low, mid, max] = robotStrategyConfigJson['raiseRecommBetList'];
        const random2 = utils.random(0, 100);
        if (max > random2) {
            intervalValue = 2;
        }
        else if (mid > utils.random(0, 100)) {
            intervalValue = 1;
        }
        else {
            intervalValue = 0;
        }
        if (intervalValue > 0) {
            do {
                if (recommBet[intervalValue] > currGold || cinglNum > recommBet[intervalValue]) {
                    intervalValue--;
                }
                else if (intervalValue == 0) {
                    break;
                }
                else {
                    break;
                }
            } while (true);
        }
        if (recommBet[intervalValue] <= currGold && cinglNum <= recommBet[intervalValue]) {
            await this.delayRequest(`DZpipei.mainHandler.filling1`, { type: intervalValue }, sendMsgTimeout);
        }
        else if (this.roundCount == 3 && currentRanking == 1) {
            await this.delayRequest(`DZpipei.mainHandler.allin`, {}, sendMsgTimeout);
        }
        else {
            await this.delayRequest(`DZpipei.mainHandler.cingl`, {}, sendMsgTimeout);
        }
        return true;
    }
    async raiseAddSceneBet(currGold, cinglNum, intervalValue, robotStrategyConfigJson, sendMsgTimeout) {
        const raiseAddSceneBetList = robotStrategyConfigJson['raiseAddSceneBetList'][this.sceneId];
        let betNum = 0;
        if ([0, 1].includes(this.roundCount)) {
            betNum = raiseAddSceneBetList[utils.random(0, 1)];
        }
        else {
            betNum = raiseAddSceneBetList[utils.random(1, 4)];
        }
        if (currGold > betNum && betNum < cinglNum) {
            betNum = cinglNum;
        }
        else if (currGold < betNum) {
            betNum = currGold;
        }
        if (betNum > 0) {
            await this.delayRequest(`DZpipei.mainHandler.filling2`, { betNum: betNum }, sendMsgTimeout);
        }
        else {
            await this.delayRequest(`DZpipei.mainHandler.cingl`, {}, sendMsgTimeout);
        }
        return true;
    }
    async raiseFreedomBet(currentRanking, cinglNum, freedomBet, currGold, intervalValue, robotStrategyConfigJson, sendMsgTimeout) {
        let [min, max] = freedomBet;
        if (max > 0) {
            const percent = robotStrategyConfigJson['raiseFreedomBetList'][currentRanking >= 6 ? 5 : currentRanking - 1];
            intervalValue = min + Math.floor((max - min) * (percent / 100));
            if (intervalValue > currGold)
                intervalValue = currGold;
            if (intervalValue > 0) {
                await this.delayRequest(`DZpipei.mainHandler.filling2`, { betNum: intervalValue }, sendMsgTimeout);
            }
        }
        else if (currentRanking == 1 && this.roundCount == 3) {
            await this.delayRequest(`DZpipei.mainHandler.allin`, {}, sendMsgTimeout);
        }
        else if (cinglNum > 0) {
            await this.delayRequest(`DZpipei.mainHandler.cingl`, {}, sendMsgTimeout);
        }
        else if (currGold > 0) {
            let betNum = (Math.floor(utils.random(1, 9)) / 10) * currGold;
            await this.delayRequest(`DZpipei.mainHandler.filling2`, { betNum: betNum }, sendMsgTimeout);
        }
        else {
            await this.delayRequest(`DZpipei.mainHandler.fold`, {}, sendMsgTimeout);
        }
        return true;
    }
    onOpts(opt) {
        if (opt.type == 'cingl' || opt.type == "allin" || opt.type == "filling") {
            this.allbet++;
            if (opt.type == 'cingl') {
                this.heel++;
            }
            if (opt.type == "allin" || opt.type == "filling") {
                this.allfilling++;
            }
        }
        if (opt.type == 'fold') {
            this.flodsPlay.push(opt.seat);
        }
        this.currSumBet = opt.sumBet;
    }
    destroy() {
        this.leaveGameAndReset(false);
    }
    robotComparisonPlayerCard(descSortAllPlayer, currentRanking) {
        const playerCardList = descSortAllPlayer.filter(pl => pl.isRobot == 0);
        let isPass = false;
        if (playerCardList.length > 0) {
            for (const pl of playerCardList) {
                const arr = pl.holds.map(m => m % 13);
                const alikeCount = DeGameUtil.checkAlike(arr);
                if (alikeCount[2]) {
                    isPass = true;
                }
            }
        }
        if (isPass) {
            const robotCardList = descSortAllPlayer.filter(pl => pl.isRobot == 2);
            if (robotCardList.length >= 2) {
                if (currentRanking <= 2) {
                    return true;
                }
            }
        }
        return false;
    }
    lastRandomRobotComparisonPlayerCard(descSortAllPlayer) {
        const player = descSortAllPlayer[0];
        if (player && player.isRobot == 0) {
            return true;
        }
        else {
            return false;
        }
    }
}
exports.default = DZpipeirobot;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiRHpSb2JvdC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL2FwcC9zZXJ2ZXJzL0RacGlwZWkvbGliL3JvYm90L0R6Um9ib3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsWUFBWSxDQUFDOztBQUNiLDJFQUF3RTtBQUN4RSwyQ0FBMkM7QUFDM0MsMERBQTJEO0FBRTNELDRHQUFxRztBQUNyRywrQ0FBeUM7QUFDekMsTUFBTSxXQUFXLEdBQUcsSUFBQSx3QkFBUyxFQUFDLFdBQVcsRUFBRSxVQUFVLENBQUMsQ0FBQztBQUV2RCxNQUFxQixZQUFhLFNBQVEscUJBQVM7SUFzQ2pELFlBQVksSUFBSTtRQUNkLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUZkLHNCQUFpQixHQUFzQixJQUFJLDJCQUFpQixFQUFFLENBQUM7UUFHN0QsSUFBSSxDQUFDLElBQUksR0FBRyxDQUFDLENBQUM7UUFDZCxJQUFJLENBQUMsT0FBTyxHQUFHLENBQUMsQ0FBQztRQUNqQixJQUFJLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQztRQUNoQixJQUFJLENBQUMsVUFBVSxHQUFHLENBQUMsQ0FBQztRQUNwQixJQUFJLENBQUMsVUFBVSxHQUFHLENBQUMsQ0FBQztRQUNwQixJQUFJLENBQUMsRUFBRSxHQUFHLENBQUMsQ0FBQztRQUNaLElBQUksQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDO1FBQ2hCLElBQUksQ0FBQyxVQUFVLEdBQUcsQ0FBQyxDQUFDO1FBQ3BCLElBQUksQ0FBQyxJQUFJLEdBQUcsQ0FBQyxDQUFDO1FBQ2QsSUFBSSxDQUFDLFVBQVUsR0FBRyxDQUFDLENBQUM7UUFDcEIsSUFBSSxDQUFDLFNBQVMsR0FBRyxDQUFDLENBQUM7UUFDbkIsSUFBSSxDQUFDLFVBQVUsR0FBRyxLQUFLLENBQUMsTUFBTSxDQUFDLEVBQUUsRUFBRSxFQUFFLENBQUMsQ0FBQztRQUN2QyxJQUFJLENBQUMsU0FBUyxHQUFHLENBQUMsQ0FB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