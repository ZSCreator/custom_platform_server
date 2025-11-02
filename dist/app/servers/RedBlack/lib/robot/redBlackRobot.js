'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const BaseRobot_1 = require("../../../../common/pojo/baseClass/BaseRobot");
const RedBlackConst = require("../RedBlackConst");
const mathUtil = require("../../../../utils/lottery/mathUtil");
const CommonUtil = require("../../../../utils/lottery/commonUtil");
const robotBetUtil = require("../../../../utils/robot/robotBetUtil");
const JsonMgr_1 = require("../../../../../config/data/JsonMgr");
const pinus_logger_1 = require("pinus-logger");
const robotlogger = (0, pinus_logger_1.getLogger)('robot_out', __filename);
class RedBlackRobot extends BaseRobot_1.BaseRobot {
    constructor(opts) {
        super(opts);
        this.playerGold = 0;
        this.playRound = 0;
        this.leaveRound = CommonUtil.randomFromRange(1, 10);
        this.betLowLimit = opts.betLowLimit;
    }
    async redBlackLoaded() {
        try {
            const sceneInfo = (0, JsonMgr_1.get)('scenes/RedBlack').datas.find(scene => scene.id === this.sceneId);
            this.ChipList = sceneInfo.ChipList;
            let res = await this.requestByRoute("RedBlack.mainHandler.enterGame", {});
            this.playerGold = res.players.gold;
            return Promise.resolve();
        }
        catch (error) {
            return Promise.reject(error);
        }
    }
    async destroy() {
        await this.leaveGameAndReset();
    }
    registerListener() {
        this.Emitter.on(RedBlackConst.route.StartBet, (onBetData) => {
            this.onRedBlackStart(onBetData);
        });
        this.Emitter.on(RedBlackConst.route.Settle, (onBetData) => {
            const Me = onBetData.userWin.find(c => c && c.uid == this.uid);
            if (Me)
                this.playerGold = Me.gold;
        });
    }
    async onRedBlackStart(onBetData) {
        const countdown = onBetData.countdown * 1000;
        const stopBetTimeOut = Date.now() + countdown;
        if (this.playRound > this.leaveRound ||
            (this.isRobot == 2 && (this.playerGold > this.gold_max || this.playerGold < this.gold_min))) {
            return this.destroy();
        }
        const { betType, betArr } = robotBetUtil.getRedBlackBetInfo(this.playerGold, this.sceneId > 0 ? this.sceneId - 1 : 0, this.ChipList);
        if (CommonUtil.isNullOrUndefined(betType) || !betArr.length) {
            return this.destroy();
        }
        let delayTime = CommonUtil.randomFromRange(2000, 4000);
        const delayArr = mathUtil.divideSumToNumArr(countdown - delayTime, betArr.length).filter(num => num >= 200);
        delayArr.unshift(delayTime);
        for (let i = 0; i < delayArr.length; i++) {
            delayTime = delayArr[i];
            if (Date.now() + delayTime >= stopBetTimeOut || this.playerGold < this.betLowLimit) {
                break;
            }
            if (!betArr[i]) {
                break;
            }
            let bets = {};
            bets[betType] = betArr[i];
            try {
                await this.delayRequest('RedBlack.mainHandler.userBet', bets, delayTime);
                this.playerGold -= betArr[i];
            }
            catch (error) {
                robotlogger.info(`红黑下注出错|${this.uid}|${this.nid}|${this.sceneId}|${this.roomId}|${error}`);
                break;
            }
        }
        this.playRound++;
    }
}
exports.default = RedBlackRobot;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVkQmxhY2tSb2JvdC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL2FwcC9zZXJ2ZXJzL1JlZEJsYWNrL2xpYi9yb2JvdC9yZWRCbGFja1JvYm90LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLFlBQVksQ0FBQzs7QUFHYiwyRUFBd0U7QUFDeEUsa0RBQW1EO0FBQ25ELCtEQUFnRTtBQUNoRSxtRUFBb0U7QUFDcEUscUVBQXNFO0FBRXRFLGdFQUE2RTtBQUU3RSwrQ0FBeUM7QUFDekMsTUFBTSxXQUFXLEdBQUcsSUFBQSx3QkFBUyxFQUFDLFdBQVcsRUFBRSxVQUFVLENBQUMsQ0FBQztBQUl2RCxNQUFxQixhQUFjLFNBQVEscUJBQVM7SUFNaEQsWUFBWSxJQUFTO1FBQ2pCLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUNaLElBQUksQ0FBQyxVQUFVLEdBQUcsQ0FBQyxDQUFDO1FBQ3BCLElBQUksQ0FBQyxTQUFTLEdBQUcsQ0FBQyxDQUFDO1FBQ25CLElBQUksQ0FBQyxVQUFVLEdBQUcsVUFBVSxDQUFDLGVBQWUsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUM7UUFDcEQsSUFBSSxDQUFDLFdBQVcsR0FBRyxJQUFJLENBQUMsV0FBVyxDQUFDO0lBQ3hDLENBQUM7SUFHRCxLQUFLLENBQUMsY0FBYztRQUNoQixJQUFJO1lBQ0EsTUFBTSxTQUFTLEdBQWMsSUFBQSxhQUFnQixFQUFDLGlCQUFpQixDQUFDLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDLEtBQUssQ0FBQyxFQUFFLEtBQUssSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDO1lBQ2hILElBQUksQ0FBQyxRQUFRLEdBQUcsU0FBUyxDQUFDLFFBQVEsQ0FBQztZQUNuQyxJQUFJLEdBQUcsR0FBaUQsTUFBTSxJQUFJLENBQUMsY0FBYyxDQUFDLGdDQUFnQyxFQUFFLEVBQUUsQ0FBQyxDQUFDO1lBQ3hILElBQUks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