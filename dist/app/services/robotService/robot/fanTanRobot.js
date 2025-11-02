"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const BaseRobot_1 = require("../../../common/pojo/baseClass/BaseRobot");
const CommonUtil = require("../../../utils/lottery/commonUtil");
const mathUtil = require("../../../utils/lottery/mathUtil");
const pinus_logger_1 = require("pinus-logger");
const robotlogger = (0, pinus_logger_1.getLogger)('robot_out', __filename);
const constants_1 = require("../../../servers/fanTan/lib/constants");
const robotUtil_1 = require("../../../servers/fanTan/lib/util/robotUtil");
const JsonMgr_1 = require("../../../../config/data/JsonMgr");
var RequestRoute;
(function (RequestRoute) {
    RequestRoute["bet"] = "fanTan.mainHandler.bet";
    RequestRoute["load"] = "fanTan.mainHandler.load";
})(RequestRoute || (RequestRoute = {}));
class FanTanRobot extends BaseRobot_1.BaseRobot {
    constructor(opts) {
        super(opts);
        this.playerGold = 0;
        this.playRound = 0;
        this.leaveRound = CommonUtil.randomFromRange(10, 20);
        this.betLowLimit = opts.betLowLimit;
    }
    async load() {
        const sceneInfo = (0, JsonMgr_1.get)('scenes/fanTan').datas.find(scene => scene.id === this.sceneId);
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
        let betCount = 0;
        for (let i = 0; i < delayArr.length; i++) {
            delayTime = delayArr[i];
            if (Date.now() + delayTime >= stopBetTime || this.playerGold < this.betLowLimit) {
                break;
            }
            let bets = {};
            bets[betType] = betArr[i];
            betCount += betArr[i];
            if (this.playerGold < betCount) {
                break;
            }
            try {
                await this.delayRequest(RequestRoute.bet, { bets }, delayTime);
                this.playerGold -= betArr[i];
            }
            catch (error) {
                robotlogger.warn(`番摊机器人下注出错|${this.uid}|${this.nid}|${this.sceneId}|${this.roomId}|${error.message}`, 'info');
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
exports.default = FanTanRobot;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZmFuVGFuUm9ib3QuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9hcHAvc2VydmljZXMvcm9ib3RTZXJ2aWNlL3JvYm90L2ZhblRhblJvYm90LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsd0VBQXFFO0FBQ3JFLGdFQUFnRTtBQUNoRSw0REFBNEQ7QUFDNUQsK0NBQXlDO0FBQ3pDLE1BQU0sV0FBVyxHQUFHLElBQUEsd0JBQVMsRUFBQyxXQUFXLEVBQUUsVUFBVSxDQUFDLENBQUM7QUFDdkQscUVBQTRFO0FBQzVFLDBFQUEwRTtBQUMxRSw2REFBMEU7QUFLMUUsSUFBSyxZQUdKO0FBSEQsV0FBSyxZQUFZO0lBQ2IsOENBQThCLENBQUE7SUFDOUIsZ0RBQWdDLENBQUE7QUFDcEMsQ0FBQyxFQUhJLFlBQVksS0FBWixZQUFZLFFBR2hCO0FBS0QsTUFBcUIsV0FBWSxTQUFRLHFCQUFTO0lBUzlDLFlBQVksSUFBSTtRQUNaLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQztRQVRoQixlQUFVLEdBQVcsQ0FBQyxDQUFDO1FBRXZCLGNBQVMsR0FBVyxDQUFDLENBQUM7UUFFdEIsZUFBVSxHQUFXLFVBQVUsQ0FBQyxlQUFlLENBQUMsRUFBRSxFQUFFLEVBQUUsQ0FBQyxDQUFDO1FBTXBELElBQUksQ0FBQyxXQUFXLEdBQUcsSUFBSSxDQUFDLFdBQVcsQ0FBQztJQUN4QyxDQUFDO0lBS0QsS0FBSyxDQUFDLElBQUk7UUFDTixNQUFNLFNBQVMsR0FBRyxJQUFBLGFBQWdCLEVBQUMsZUFBZSxDQUFDLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDLEtBQUssQ0FBQyxFQUFFLEtBQUssSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBQ25HLElBQUksQ0FBQyxRQUFRLEdBQUcsU0FBUyxDQUFDLFFBQVEsQ0FBQztRQUNuQyxNQUFNLElBQUksR0FBRyxNQUFNLElBQUksQ0FBQyxjQUFjLENBQUMsWUFBWSxDQUFDLElBQUksRUFBRSxFQUFFLENBQUMsQ0FBQztRQUU5RCxJQUFJLElBQUksQ0FBQyxLQUFLLEtBQUsscUJBQVMsQ0FBQyxHQUFHLEVBQUU7WUFDOUIsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQztTQUNsQjtJQUVMLENBQUM7SUFLRCxLQUFLLENBQUMsT0FBTztRQUNULE1BQU0sSUFBSSxDQUFDLGlCQUFpQixFQUFFLENBQUM7SUFDbkMsQ0FBQztJQUtELGdCQUFnQjtRQUVaLElBQUksQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDLG9CQUFRLENBQUMsZUFBZSxFQUFFLENBQUMsSUFBSSxFQUFFLEVBQUUsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7UUFDcEUsSUFBSSxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUMsb0JBQVEsQ0FBQyxzQkFBc0IsRUFBRSxDQUFDLElBQUksRUFBRSxFQUFFLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO0lBQ3RGLENBQUM7SUFNRCxLQUFLLENBQUMsR0FBRyxDQUFDLElBQTJCO1FBRWpDLE1BQU0sU0FBUyxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUM7UUFFakMsTUFBTSxXQUFXLEdBQUcsSUFBSSxDQUFDLEdBQUcsRUFBRSxHQUFHLFNBQVMsR0FBRyxJQUFJLENBQUM7UUFHbEQsSUFBSSxJQUFJLENBQUMsU0FBUyxHQUFHLElBQUksQ0FBQyxVQUFVLElBQUksSUFBSSxDQUFDLFVBQVUsR0FBRyxJQUFJLENBQUMsV0FBVyxFQUFFO1lBQ3hFLE9BQU8sSUFBSSxDQUFDLE9BQU8sRUFBRSxDQUFDO1NBQ3pCO1FBR0QsTUFBTSxFQUFFLE9BQU8sRUFBRSxNQUFNLEVBQUUsR0FBRyxJQUFBLHdCQUFZLEVBQUMsSUFBSSxDQUFDLFVBQVUsR0FBRyxJQUFJLENBQUMsV0FBVyxFQUFFLElBQUksQ0FBQyxPQUFPLEVBQUUsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDO1FBRTFHLElBQUksVUFBVSxDQUFDLGlCQUFpQixDQUFDLE9BQU8sQ0FBQyxJQUFJLFVBQVUsQ0FBQyxpQkFBaUIsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxNQUFNLEVBQUU7WUFDakcsT0FBTyxJQUFJLENBQUMsT0FBTyxFQUFFLENBQUM7U0FDekI7UUFFRCxJQUFJLFNBQVMsR0FBRyxVQUFVLENBQUMsZUFBZSxDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsQ0FBQztRQUN2RCxNQUFNLFFBQVEsR0FBRyxRQUFRLENBQUMsaUJBQWlCLENBQUMsU0FBUyxHQUFHLFNBQVMsRUFBRSxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUM7UUFFbEYsUUFBUSxDQUFDLE9BQU8sQ0FBQyxTQUFTLENBQUMsQ0FBQztRQUU1QixJQUFJLFFBQVEsR0FBRyxDQUFDLENBQUM7UUFFakIsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLFFBQVEsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLEVBQUU7WUFDdEMsU0FBUyxHQUFHLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUV4QixJQUFJLElBQUksQ0FBQyxHQUFHLEVBQUUsR0FBRyxTQUFTLElBQUksV0FBVyxJQUFJLElBQUksQ0FBQyxVQUFVLEdBQUcsSUFBSSxDQUFDLFdBQVcsRUFBRTtnQkFDN0UsTUFBTTthQUNUO1lBRUQsSUFBSSxJQUFJLEdBQThCLEVBQUUsQ0FBQztZQUN6QyxJQUFJLENBQUMsT0FBTyxDQUFDLEdBQUcsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBRTFCLFFBQVEsSUFBSSxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFFdEIsSUFBSSxJQUFJLENBQUMsVUFBVSxHQUFHLFFBQVEsRUFBRTtnQkFDNUIsTUFBTTthQUNUO1lBRUQsSUFBSTtnQkFFQSxNQUFNLElBQUksQ0FBQyxZQUFZLENBQUMsWUFBWSxDQUFDLEdBQUcsRUFBRSxFQUFFLElBQUksRUFBRSxFQUFFLFNBQVMsQ0FBQyxDQUFDO2dCQUUvRCxJQUFJLENBQUMsVUFBVSxJQUFJLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQzthQUNoQztZQUFDLE9BQU8sS0FBSyxFQUFFO2dCQUNaLFdBQVcsQ0FBQyxJQUFJLENBQUMsYUFBYSxJQUFJLENBQUMsR0FBRyxJQUFJLElBQUksQ0FBQyxHQUFHLElBQUksSUFBSSxDQUFDLE9BQU8sSUFBSSxJQUFJLENBQUMsTUFBTSxJQUFJLEtBQUssQ0FBQyxPQUFPLEVBQUUsRUFBRSxNQUFNLENBQUMsQ0FBQztnQkFDOUcsTUFBTTthQUNUO1NBQ0o7UUFDRCxJQUFJLENBQUMsU0FBUyxFQUFFLENBQUM7SUFDckIsQ0FBQztJQUVELFVBQVUsQ0FBQyxJQUFJO1FBRVgsTUFBTSxFQUFFLEdBQUcsSUFBSSxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsR0FBRyxLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUUxRCxJQUFJLEVBQUUsRUFBRTtZQUNKLElBQUksQ0FBQyxVQUFVLEdBQUcsRUFBRSxDQUFDLElBQUksQ0FBQztTQUM3QjtJQUNMLENBQUM7Q0FDSjtBQTlHRCw4QkE4R0MifQ==