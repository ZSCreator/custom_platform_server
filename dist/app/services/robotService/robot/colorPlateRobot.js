"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const BaseRobot_1 = require("../../../common/pojo/baseClass/BaseRobot");
const CommonUtil = require("../../../utils/lottery/commonUtil");
const mathUtil = require("../../../utils/lottery/mathUtil");
const pinus_logger_1 = require("pinus-logger");
const constants_1 = require("../../../servers/colorPlate/lib/constants");
const robotUtil_1 = require("../../../servers/colorPlate/lib/util/robotUtil");
const JsonMgr_1 = require("../../../../config/data/JsonMgr");
const logger = (0, pinus_logger_1.getLogger)('robot_out', __filename);
var RequestRoute;
(function (RequestRoute) {
    RequestRoute["bet"] = "colorPlate.mainHandler.bet";
    RequestRoute["load"] = "colorPlate.mainHandler.load";
})(RequestRoute || (RequestRoute = {}));
class ColorPlateRobot extends BaseRobot_1.BaseRobot {
    constructor(opts) {
        super(opts);
        this.playerGold = 0;
        this.playRound = 0;
        this.leaveRound = CommonUtil.randomFromRange(10, 20);
        this.betLowLimit = opts.betLowLimit;
    }
    async load() {
        const sceneInfo = (0, JsonMgr_1.get)('scenes/colorPlate').datas.find(scene => scene.id === this.sceneId);
        this.ChipList = sceneInfo.ChipList;
        const data = await this.requestByRoute(RequestRoute.load, {});
        if (data.state === constants_1.RoomState.BET) {
            this.bet(data);
        }
    }
    async destroy() {
        await this.leaveGameAndReset();
    }
    registerListener() {
        this.Emitter.on(constants_1.MsgRoute.START_BET_STATE, (data) => this.bet(data));
        this.Emitter.on(constants_1.MsgRoute.START_SETTLEMENT_STATE, (data) => this.settlement(data));
    }
    async bet(data) {
        const countdown = data.countdown;
        const stopBetTime = Date.now() + countdown - 1000;
        if (this.playRound > this.leaveRound || this.playerGold < this.betLowLimit) {
            return this.destroy();
        }
        const { betType, betArr } = (0, robotUtil_1.splitBetGold)(this.playerGold - this.betLowLimit, this.sceneId, this.ChipList);
        if (CommonUtil.isNullOrUndefined(betType) || CommonUtil.isNullOrUndefined(betArr) || !betArr.length) {
            return this.destroy();
        }
        let delayTime = CommonUtil.randomFromRange(2000, 3000);
        const delayArr = mathUtil.divideSumToNumArr(countdown - delayTime, betArr.length);
        delayArr.unshift(delayTime);
        for (let i = 0; i < delayArr.length; i++) {
            delayTime = delayArr[i];
            if (Date.now() + delayTime >= stopBetTime || this.playerGold < this.betLowLimit) {
                break;
            }
            let bets = {};
            bets[betType] = betArr[i];
            try {
                await this.delayRequest(RequestRoute.bet, { bets }, delayTime);
                this.playerGold -= betArr[i];
            }
            catch (error) {
                logger.info(`色碟下注出错|${this.uid}|${this.nid}|${this.sceneId}|${this.roomId}|${error}`, 'info');
                break;
            }
        }
        this.playRound++;
    }
    settlement(data) {
        const me = data.gamePlayers.find(p => p.uid === this.uid);
        if (me) {
            this.playerGold = me.gold;
        }
    }
}
exports.default = ColorPlateRobot;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29sb3JQbGF0ZVJvYm90LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vYXBwL3NlcnZpY2VzL3JvYm90U2VydmljZS9yb2JvdC9jb2xvclBsYXRlUm9ib3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSx3RUFBcUU7QUFDckUsZ0VBQWdFO0FBQ2hFLDREQUE0RDtBQUM1RCwrQ0FBeUM7QUFDekMseUVBQWdGO0FBQ2hGLDhFQUE4RTtBQUM5RSw2REFBMEU7QUFDMUUsTUFBTSxNQUFNLEdBQUcsSUFBQSx3QkFBUyxFQUFDLFdBQVcsRUFBRSxVQUFVLENBQUMsQ0FBQztBQU1sRCxJQUFLLFlBR0o7QUFIRCxXQUFLLFlBQVk7SUFDYixrREFBa0MsQ0FBQTtJQUNsQyxvREFBb0MsQ0FBQTtBQUN4QyxDQUFDLEVBSEksWUFBWSxLQUFaLFlBQVksUUFHaEI7QUFLRCxNQUFxQixlQUFnQixTQUFRLHFCQUFTO0lBUWxELFlBQVksSUFBSTtRQUNaLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQztRQVJoQixlQUFVLEdBQVcsQ0FBQyxDQUFDO1FBRXZCLGNBQVMsR0FBVyxDQUFDLENBQUM7UUFFdEIsZUFBVSxHQUFXLFVBQVUsQ0FBQyxlQUFlLENBQUMsRUFBRSxFQUFFLEVBQUUsQ0FBQyxDQUFDO1FBS3BELElBQUksQ0FBQyxXQUFXLEdBQUcsSUFBSSxDQUFDLFdBQVcsQ0FBQztJQUN4QyxDQUFDO0lBS0QsS0FBSyxDQUFDLElBQUk7UUFDTixNQUFNLFNBQVMsR0FBRyxJQUFBLGFBQWdCLEVBQUMsbUJBQW1CLENBQUMsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUFDLEVBQUUsS0FBSyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUM7UUFDdkcsSUFBSSxDQUFDLFFBQVEsR0FBRyxTQUFTLENBQUMsUUFBUSxDQUFDO1FBQ25DLE1BQU0sSUFBSSxHQUFHLE1BQU0sSUFBSSxDQUFD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