"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BlackJackRobotImpl = void 0;
const BaseRobot_1 = require("../../../../common/pojo/baseClass/BaseRobot");
const BlackJackRoomChannelEventName_1 = require("../enum/BlackJackRoomChannelEventName");
const BlackJackBetArea_1 = require("../expansion/BlackJackBetArea");
const BlackJackRobotAgent_1 = require("../expansion/robotExpansion/BlackJackRobotAgent");
const robotBetUtil_1 = require("../../../../utils/robot/robotBetUtil");
const index_1 = require("../../../../utils/index");
const ramda_1 = require("ramda");
const JsonMgr_1 = require("../../../../../config/data/JsonMgr");
const pinus_logger_1 = require("pinus-logger");
const robotlogger = (0, pinus_logger_1.getLogger)('robot_out', __filename);
class BlackJackRobotImpl extends BaseRobot_1.BaseRobot {
    constructor(opts) {
        super(opts);
        this.seat = -1;
        this.initGold = 0;
        this.gold = 0;
        this.targetRound = 0;
        this.playingRound = 0;
        this.countDown = 0;
        this.betActionTimer = null;
        this.delayedSendTimer = null;
        this.agent = new BlackJackRobotAgent_1.BlackJackRobotAgent(this);
        const sceneInfo = (0, JsonMgr_1.get)('scenes/BlackJack').datas.find(scene => scene.id === this.sceneId);
        this.ChipList = sceneInfo.ChipList;
        this.dealerPokerArea = new BlackJackBetArea_1.BlackJackBetArea(0);
        this.commonAreaPokerList = Array.from({ length: 3 }).map(() => new BlackJackBetArea_1.BlackJackBetArea(0));
        this.separateAreaPokerList = Array.from({ length: 3 }).map(() => new BlackJackBetArea_1.BlackJackBetArea(0));
        const targetRoundValue = (0, index_1.random)(0, 100);
        if (targetRoundValue > 80) {
            this.targetRound = (0, index_1.random)(5, 15);
        }
        else if (targetRoundValue > 50) {
            this.targetRound = (0, index_1.random)(2, 12);
        }
        else {
            this.targetRound = (0, index_1.random)(2, 5);
        }
    }
    async loaded() {
        try {
            const result = await this.agent.loaded();
            if (!result || result.code != 200) {
                await this.destroy();
                return false;
            }
            this.gold = result.data.currentPlayer.gold;
            this.initGold = result.data.currentPlayer.gold;
            return true;
        }
        catch (e) {
            await this.destroy();
            return false;
        }
    }
    registerListener() {
        this.Emitter.on(BlackJackRoomChannelEventName_1.BlackJackRoomChannelEventName.Betting, (data) => this.betBefore(data));
        this.Emitter.on(BlackJackRoomChannelEventName_1.BlackJackRoomChannelEventName.ShowInitPokerList, (data) => this.getInitPokerList(data));
        this.Emitter.on(BlackJackRoomChannelEventName_1.BlackJackRoomChannelEventName.Player, (data) => this.robotAction(data));
        this.Emitter.on(BlackJackRoomChannelEventName_1.BlackJackRoomChannelEventName.Settlement, (data) => this.settlement(data));
        this.Emitter.on(`${this.nid}_playerTimeOut`, () => this.timeout());
    }
    timeout() {
        this.destroy();
    }
    nextGameRound() {
        this.clearBetAreaTimer();
        this.playingRound++;
        this.countDown = 0;
        this.dealerPokerArea = new BlackJackBetArea_1.BlackJackBetArea(0);
        this.commonAreaPokerList = Array.from({ length: 3 }).map(() => new BlackJackBetArea_1.BlackJackBetArea(0));
        this.separateAreaPokerList = Array.from({ length: 3 }).map(() => new BlackJackBetArea_1.BlackJackBetArea(0));
    }
    async destroy(flags = true) {
        this.clearBetAreaTimer();
        await this.leaveGameAndReset(flags);
        this.agent.destroy();
        this.agent = null;
    }
    clearBetAreaTimer() {
        clearTimeout(this.betActionTimer);
        clearTimeout(this.delayedSendTimer);
    }
    betBefore({ countDown }) {
        if (this.targetRound < this.playingRound) {
            this.destroy();
            return;
        }
        this.nextGameRound();
        this.countDown = countDown;
        const stopBetTimeOut = Date.now() + countDown * 1000 - 1000;
        const yaSection = this.ChipList;
        let sum = this.gold / 100;
        let ran = (0, index_1.random)(1, 100);
        let bet = sum - sum % yaSection[0];
        if (bet <= yaSection[0]) {
            bet = yaSection[0];
        }
        if (ran <= 70) {
            bet = bet * (0, index_1.random)(9, 20);
        }
        else if (ran > 70 && ran <= 90) {
            bet = bet * (0, index_1.random)(6, 8);
        }
        else {
            bet = bet * (0, index_1.random)(1, 5);
        }
        if (this.gold < bet) {
            return;
        }
        const baseRandomArea = { 0: [0, 1], 1: [1, 2], 2: [2, 0] };
        const areaList = [];
        if (this.gold > this.initGold) {
            if (ran <= 60) {
                areaList.push(0, 1, 2);
            }
            else if (ran > 60 && ran <= 85) {
                areaList.push((0, index_1.random)(0, 2));
            }
            else {
                areaList.push(...baseRandomArea[(0, index_1.random)(0, 2)]);
            }
        }
        else {
            if (ran <= 40) {
                areaList.push(0, 1, 2);
            }
            else if (ran > 40 && ran <= 90) {
                areaList.push((0, index_1.random)(0, 2));
            }
            else {
                areaList.push(...baseRandomArea[(0, index_1.random)(0, 2)]);
            }
        }
        let waitTime = 0;
        switch (areaList.length) {
            case 1:
                waitTime = (0, index_1.random)(3, 5);
                break;
            case 2:
                waitTime = (0, index_1.random)(2, 4);
                break;
            case 3:
                waitTime = (0, index_1.random)(2, 3);
                break;
            default:
                waitTime = (0, index_1.random)(2, 3);
                break;
        }
        this.betActionTimer = setTimeout(() => {
            this.betBeginning(bet, areaList, stopBetTimeOut);
        }, waitTime * 1000);
    }
    async betBeginning(betGold, areaList, stopBetTimeOut) {
        const yaSection = this.ChipList;
        let goldList = (0, robotBetUtil_1.divideBetGold)(yaSection, betGold);
        if (goldList.length > 5) {
            goldList = goldList.slice(0, 3);
        }
        while ((0, ramda_1.sum)(goldList) > this.gold / 2) {
            goldList.shift();
        }
        try {
            for (const areaIdx of areaList) {
                for (const gold of goldList) {
                    let time = (0, index_1.random)(1e1, 1e3);
                    if (Date.now() + time > stopBetTimeOut)
                        time = Math.max(0, (0, index_1.random)(0, stopBetTimeOut - Date.now()));
                    await this.delayRequest("BlackJack.mainHandler.bet", { areaIdx, bet: gold }, time);
                }
            }
        }
        catch (error) {
        }
    }
    getInitPokerList({ dealerPoker, commonPokerList }) {
        this.clearBetAreaTimer();
        const { pokerList: dealerPokerList, countList: dealerCountList } = dealerPoker;
        this.dealerPokerArea.setPokerList(dealerPokerList, dealerCountList);
        this.commonAreaPokerList.forEach((area, areaIdx) => {
            const { pokerList, countList } = commonPokerList[areaIdx];
            area.setPokerList([...pokerList], [...countList]);
        });
    }
    robotAction({ countDown, commonPokerList, separatePokerList, areaIdx, isSeparatePoker, playerList }) {
        this.countDown = countDown;
        const playerExist = playerList.find(p => p.uid === this.uid);
        if (!playerExist) {
            return;
        }
        const { pokerList, countList } = isSeparatePoker ? playerExist.separatePokerList[areaIdx] : playerExist.commonPokerList[areaIdx];
        if (isSeparatePoker) {
            this.separateAreaPokerList[areaIdx].setPokerList([...pokerList], [...countList]);
        }
        else {
            this.commonAreaPokerList[areaIdx].setPokerList([...pokerList], [...countList]);
        }
        const maxCount = Math.max(...countList);
        if (maxCount < 17) {
            this.agent.getOnePoker(areaIdx);
        }
    }
    settlement({ countDown, playerList }) {
        this.countDown = countDown;
        const playerExist = playerList.find(p => p.uid === this.uid);
        if (!playerExist) {
            if (this.playingRound >= 2) {
                this.destroy();
            }
            return;
        }
        this.gold = playerExist.gold;
    }
}
exports.BlackJackRobotImpl = BlackJackRobotImpl;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQmxhY2tKYWNrUm9ib3RJbXBsLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vYXBwL3NlcnZlcnMvQmxhY2tKYWNrL2xpYi9yb2JvdC9CbGFja0phY2tSb2JvdEltcGwudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEsMkVBQXdFO0FBQ3hFLHlGQUFzRjtBQUN0RixvRUFBaUU7QUFDakUseUZBQXNGO0FBQ3RGLHVFQUFxRTtBQUNyRSxtREFBaUQ7QUFHakQsaUNBQTRCO0FBQzVCLGdFQUE2RTtBQUM3RSwrQ0FBeUM7QUFDekMsTUFBTSxXQUFXLEdBQUcsSUFBQSx3QkFBUyxFQUFDLFdBQVcsRUFBRSxVQUFVLENBQUMsQ0FBQztBQUd2RCxNQUFhLGtCQUFtQixTQUFRLHFCQUFTO0lBcUM3QyxZQUFZLElBQUk7UUFDWixLQUFLLENBQUMsSUFBSSxDQUFDLENBQUM7UUFwQ2hCLFNBQUksR0FBVyxDQUFDLENBQUMsQ0FBQztRQUtsQixhQUFRLEdBQVcsQ0FBQyxDQUFDO1FBRXJCLFNBQUksR0FBVyxDQUFDLENBQUM7UUFFakIsZ0JBQVcsR0FBVyxDQUFDLENBQUM7UUFHeEIsaUJBQVksR0FBVyxDQUFDLENBQUM7UUFNekIsY0FBUyxHQUFXLENBQUMsQ0FBQztRQVl0QixtQkFBYyxHQUFpQixJQUFJLENBQUM7UUFFcEMscUJBQWdCLEdBQWlCLElBQUksQ0FBQztRQUtsQyxJQUFJLENBQUMsS0FBSyxHQUFHLElBQUkseUNBQW1CLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDM0MsTUFBTSxTQUFTLEdBQUcsSUFBQSxhQUFnQixFQUFDLGtCQUFrQixDQUFDLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDLEtBQUssQ0FBQyxFQUFFLEtBQUssSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBQ3RHLElBQUksQ0FBQyxRQUFRLEdBQUcsU0FBUyxDQUFDLFFBQVEsQ0FBQztRQUNuQyxJQUFJ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