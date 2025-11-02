'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const BaseRobot_1 = require("../../../../common/pojo/baseClass/BaseRobot");
const DragonTigerConst = require("../DragonTigerConst");
const commonUtil = require("../../../../utils/lottery/commonUtil");
const mathUtil = require("../../../../utils/lottery/mathUtil");
const robotBetUtil = require("../../../../utils/robot/robotBetUtil");
const JsonMgr_1 = require("../../../../../config/data/JsonMgr");
const pinus_logger_1 = require("pinus-logger");
const robotlogger = (0, pinus_logger_1.getLogger)('robot_out', __filename);
const events = require("events");
const EventEmitter = events.EventEmitter;
class DragonTigerRobot extends BaseRobot_1.BaseRobot {
    constructor(opts) {
        super(opts);
        this.playerGold = 0;
        this.playRound = 0;
        this.leaveRound = commonUtil.randomFromRange(10, 30);
        this.isBanker = false;
        this.appliedBanker = false;
        this.exitUpzhuanglist_stat = false;
        this.zj_sData = null;
        this.betLowLimit = opts.betLowLimit;
    }
    async dragonTigerLoaded() {
        try {
            const sceneInfo = (0, JsonMgr_1.get)('scenes/DragonTiger').datas.find(scene => scene.id === this.sceneId);
            this.ChipList = sceneInfo.ChipList;
            let res = await this.requestByRoute("DragonTiger.mainHandler.enterGame", {});
            this.playerGold = res["playerInfo"]["gold"];
            if (res["status"] == "BETTING") {
                const countdown = res["countdown"];
                this.onDragonTigerBetStart({ countdown });
            }
            this.nickname = res.playerInfo.nickname;
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
        this.Emitter.on(DragonTigerConst.route.StartBet, (onBetData) => {
            this.onDragonTigerBetStart(onBetData);
            this.onUpdateZhuangInfo();
        });
        this.Emitter.on(DragonTigerConst.route.Start, this.onDTRoomStart.bind(this));
        this.Emitter.on(`${this.nid}_playerTimeOut`, () => { this.destroy(); });
        this.Emitter.on(`${this.nid}_playerExit`, () => { this.destroy(); });
        this.Emitter.on(DragonTigerConst.route.dt_zj_info, (data) => {
            this.zj_sData = data;
        });
    }
    onUpdateZhuangInfo() {
        if (this.zj_sData == null)
            return;
        const szGold = DragonTigerConst.bankerGoldLimit[this.sceneId];
        this.isBanker = this.zj_sData.banker && this.zj_sData.banker.uid === this.uid;
        if (!this.isBanker) {
            const ranLess = commonUtil.randomFromRange(1, 100) <= 30;
            const bankerLength = this.zj_sData.bankerQueue.filter(pl => pl && pl.isRobot == 2).length;
            if (ranLess && bankerLength < 3) {
                this.checkDTApplyBanker();
            }
            else if (bankerLength > 5) {
                this.zj_sData.bankerQueue.sort((c1, c2) => c1.gold - c2.gold);
                if (this.zj_sData.bankerQueue[0].uid == this.uid && this.playerGold > szGold) {
                    this.checkDTLeaveBanker();
                }
            }
        }
    }
    onDTRoomStart(data) {
        this.playerGold = data.gold;
    }
    async checkDTApplyBanker() {
        if (this.appliedBanker) {
            return;
        }
        const szGold = DragonTigerConst.bankerGoldLimit[this.sceneId];
        if (this.playerGold > szGold) {
            try {
                this.appliedBanker = true;
                const res = await this.requestByRoute('DragonTiger.mainHandler.becomeBanker', { isUp: true });
            }
            catch (error) {
                robotlogger.warn(`checkDTApplyBanker|${this.uid}${this.roomId}|${JSON.stringify(error)}`);
            }
        }
    }
    async checkDTLeaveBanker() {
        try {
            if (this.exitUpzhuanglist_stat) {
                return;
            }
            this.exitUpzhuanglist_stat = true;
            await this.requestByRoute('DragonTiger.mainHandler.becomeBanker', { isUp: false });
        }
        catch (error) {
            robotlogger.warn(`checkDTLeaveBanker|${this.uid}|||${JSON.stringify(error)}`);
        }
        finally {
            this.appliedBanker = false;
            this.exitUpzhuanglist_stat = false;
        }
    }
    async onDragonTigerBetStart(onBetData) {
        const countdown = onBetData.countdown * 1000;
        const stopBetTimeOut = Date.now() + countdown - 1000;
        if (this.playRound > this.leaveRound ||
            this.playerGold < this.betLowLimit[0] ||
            (this.isRobot == 2 && (this.playerGold > this.gold_max || this.playerGold < this.gold_min))) {
            return this.destroy();
        }
        if (this.isBanker) {
            return;
        }
        const { betType, betArr } = robotBetUtil.getDragonTigerBetInfo(this.playerGold - this.betLowLimit, this.sceneId, this.ChipList);
        if (betType.length == 0 || commonUtil.isNullOrUndefined(betArr) || !betArr.length) {
            return this.destroy();
        }
        let delayTime = commonUtil.randomFromRange(2000, 3000);
        const delayArr = mathUtil.divideSumToNumArr(countdown - delayTime, betArr.length);
        delayArr.unshift(delayTime);
        for (let i = 0; i < delayArr.length; i++) {
            delayTime = delayArr[i];
            if (Date.now() + delayTime >= stopBetTimeOut || this.playerGold < this.betLowLimit) {
                break;
            }
            if (i > betArr.length - 1)
                break;
            let bets = { area: betType[commonUtil.randomFromRange(0, betType.length - 1)], bet: betArr[i] };
            try {
                await this.delayRequest('DragonTiger.mainHandler.userBet', bets, delayTime);
                this.playerGold -= betArr[i];
            }
            catch (error) {
                robotlogger.info(`龙虎斗下注出错|${this.uid}|${this.nid}|${this.sceneId}|${this.roomId}|${JSON.stringify(error)}`);
                break;
            }
        }
        this.playRound++;
    }
}
exports.default = DragonTigerRobot;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZHJhZ29uVGlnZXJSb2JvdC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL2FwcC9zZXJ2ZXJzL0RyYWdvblRpZ2VyL2xpYi9yb2JvdC9kcmFnb25UaWdlclJvYm90LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLFlBQVksQ0FBQzs7QUFHYiwyRUFBd0U7QUFDeEUsd0RBQXlEO0FBQ3pELG1FQUFtRTtBQUNuRSwrREFBZ0U7QUFDaEUscUVBQXFFO0FBQ3JFLGdFQUE2RTtBQUU3RSwrQ0FBeUM7QUFDekMsTUFBTSxXQUFXLEdBQUcsSUFBQSx3QkFBUyxFQUFDLFdBQVcsRUFBRSxVQUFVLENBQUMsQ0FBQztBQUN2RCxpQ0FBa0M7QUFDbEMsTUFBTSxZQUFZLEdBQUcsTUFBTSxDQUFDLFlBQVksQ0FBQztBQUd6QyxNQUFxQixnQkFBaUIsU0FBUSxxQkFBUztJQWVuRCxZQUFZLElBQUk7UUFDWixLQUFLLENBQUMsSUFBSSxDQUFDLENBQUM7UUFmaEIsZUFBVSxHQUFXLENBQUMsQ0FBQztRQUV2QixjQUFTLEdBQVcsQ0FBQyxDQUFDO1FBRXRCLGVBQVUsR0FBVyxVQUFVLENBQUMsZUFBZSxDQUFDLEVBQUUsRUFBRSxFQUFFLENBQUMsQ0FBQztRQUd4RCxhQUFRLEdBQVksS0FBSyxDQUFDO1FBRTFCLGtCQUFhLEdBQVksS0FBSyxDQUFDO1FBRS9CLDBCQUFxQixHQUFHLEtBQUssQ0FBQztRQUM5QixhQUFRLEdBQWlDLElBQUksQ0FBQztRQUkxQyxJQUFJLENBQUMsV0FBVyxHQUFHLElBQUksQ0FBQyxXQUFXLENBQUM7SUFDeEMsQ0FBQztJQUdELEtBQUssQ0FBQyxpQkFBaUI7UUFDbkIsSUFBSTtZQUNBLE1BQU0sU0FBUyxHQUFjLElBQUEsYUFBZ0IsRUFBQyxvQkFBb0IsQ0FBQyxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQyxLQUFLLENBQUMsRUFBRSxLQUFLLElBQUksQ0FBQyxP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