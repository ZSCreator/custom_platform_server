'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const BaseRobot_1 = require("../../../../common/pojo/baseClass/BaseRobot");
const commonUtil = require("../../../../utils/lottery/commonUtil");
const robotBetUtil = require("../../../../utils/robot/robotBetUtil");
const pinus_logger_1 = require("pinus-logger");
const logger = (0, pinus_logger_1.getLogger)('robot_out', __filename);
const JsonMgr_1 = require("../../../../../config/data/JsonMgr");
const BET_COUNTDOWN = 25000;
class BaiJiaLeRobot extends BaseRobot_1.BaseRobot {
    constructor(opts) {
        super(opts);
        this.isleavtate = false;
        this.zj_sData = null;
        this.playerGold = 0;
        this.playRound = 0;
        this.leaveRound = commonUtil.randomFromRange(10, 20);
    }
    async baiJiaLeLoaded() {
        try {
            const sceneInfo = (0, JsonMgr_1.get)('scenes/baijia').datas.find(scene => scene.id === this.sceneId);
            this.ChipList = sceneInfo.ChipList;
            const dataFromLoaded = await this.requestByRoute("baijia.mainHandler.loaded", {});
            this.upZhuangCond = dataFromLoaded.upZhuangCond;
            this.playerGold = dataFromLoaded.playerInfo.gold;
            if (dataFromLoaded.roomInfo.status == "BETTING") {
                const countdown = dataFromLoaded.roomInfo["countdownTime"] / 1000;
                this.onBaiJiaStartBet({ countdown });
            }
            return Promise.resolve(dataFromLoaded);
        }
        catch (error) {
            return Promise.reject(error);
        }
    }
    async destroy() {
        this.isleavtate = true;
        await this.leaveGameAndReset();
    }
    registerListener() {
        this.Emitter.on("bj_onEntry", this.bjOnEntry.bind(this));
        this.Emitter.on("baijia_playerTimeOut", this.playerTimeOut.bind(this));
        this.Emitter.on("bj_bet", async (data) => {
            if (this.isleavtate)
                return;
            await this.Check_apply_up_zhuangs();
            await this.onBaiJiaStartBet(data);
        });
        this.Emitter.on("bj_onUpdateZhuangInfo", (data) => {
            this.zj_sData = data;
        });
        this.Emitter.on("bj_onBeting", (data) => {
            if (data.uid == this.uid) {
                this.playerGold = data.gold;
            }
        });
    }
    playerTimeOut(data) {
        this.destroy();
        return;
    }
    async bjOnEntry(data) {
        if (data.player.uid == this.uid) {
            this.playerGold = data.player.gold;
        }
    }
    async onBaiJiaStartBet(data) {
        try {
            const stopBetTimeOut = Date.now() + data["countdown"] * 1000 - 2000;
            if (this.zj_sData && this.zj_sData.zhuangInfo && this.zj_sData.zhuangInfo.uid == this.uid) {
                return;
            }
            if (this.playRound > this.leaveRound ||
                (this.isRobot == 2 && (this.playerGold > this.gold_max || this.playerGold < this.gold_min))) {
                await this.destroy();
                return;
            }
            await this.baiJiaRobotDelayBet(stopBetTimeOut);
        }
        catch (error) {
            logger.warn(`baiJiaLeRobot.onBaiJiaStartBet|${this.uid}|${this.nid}|${this.sceneId}|${this.roomId}|${error}`);
        }
    }
    async Check_apply_up_zhuangs() {
        try {
            let applyZhuangsNum = this.zj_sData ? this.zj_sData.applyZhuangsNum : 0;
            if (this.zj_sData && this.zj_sData.zhuangInfo && (this.zj_sData.zhuangInfo.uid == this.uid ||
                this.zj_sData.applyZhuangs.find(pl => pl && pl.uid == this.uid) ||
                this.zj_sData.applyZhuangsNum > 3)) {
                return;
            }
            let ranLess = commonUtil.randomFromRange(1, 100) <= 40;
            if (applyZhuangsNum == 0) {
                ranLess = true;
            }
            if (this.playerGold > this.upZhuangCond && ranLess) {
                let result = await this.requestByRoute('baijia.mainHandler.applyUpzhuang', {});
            }
        }
        catch (error) {
            logger.info(`baijiale_robot|${this.uid}|${this.playerGold}|${JSON.stringify(error)}`);
        }
    }
    async baiJiaRobotDelayBet(stopBetTimeOut) {
        const { betArea, goldArr } = robotBetUtil.getBaiJiaBetInfo(this.playerGold, this.sceneId, this.ChipList);
        if (!betArea || !goldArr.length) {
            await this.destroy();
            return;
        }
        if (!goldArr.length) {
            return;
        }
        let delayTime = commonUtil.randomFromRange(3000, 9000);
        for (let betNum of goldArr) {
            try {
                if (Date.now() + delayTime >= stopBetTimeOut || this.playerGold < betNum) {
                    break;
                }
                let bets = { area: betArea, bet: betNum };
                await this.delayRequest("baijia.mainHandler.bet", bets, delayTime);
                this.playerGold -= betNum;
                delayTime = commonUtil.randomFromRange(1000, 5000);
            }
            catch (error) {
                logger.info(`baiJiaLeRobot.baiJiaRobotBet|${this.uid}|${JSON.stringify(error)}`);
                break;
            }
        }
        this.playRound++;
    }
}
exports.default = BaiJiaLeRobot;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYmFpSmlhUm9ib3QuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9hcHAvc2VydmVycy9iYWlqaWEvbGliL3JvYm90L2JhaUppYVJvYm90LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLFlBQVksQ0FBQzs7QUFHYiwyRUFBd0U7QUFDeEUsbUVBQW1FO0FBQ25FLHFFQUFzRTtBQUd0RSwrQ0FBeUM7QUFDekMsTUFBTSxNQUFNLEdBQUcsSUFBQSx3QkFBUyxFQUFDLFdBQVcsRUFBRSxVQUFVLENBQUMsQ0FBQztBQUNsRCxnRUFBNkU7QUFHN0UsTUFBTSxhQUFhLEdBQUcsS0FBSyxDQUFDO0FBRTVCLE1BQXFCLGFBQWMsU0FBUSxxQkFBUztJQVloRCxZQUFZLElBQUk7UUFDWixLQUFLLENBQUMsSUFBSSxDQUFDLENBQUM7UUFWaEIsZUFBVSxHQUFHLEtBQUssQ0FBQztRQU9uQixhQUFRLEdBQXVDLElBQUksQ0FBQztRQUloRCxJQUFJLENBQUMsVUFBVSxHQUFHLENBQUMsQ0FBQztRQUNwQixJQUFJLENBQUMsU0FBUyxHQUFHLENBQUMsQ0FBQztRQUNuQixJQUFJLENBQUMsVUFBVSxHQUFHLFVBQVUsQ0FBQyxlQUFlLENBQUMsRUFBRSxFQUFFLEVBQUUsQ0FBQyxDQUFDO0lBQ3pELENBQUM7SUFHRCxLQUFLLENBQUMsY0FBYztRQUNoQixJQUFJO1lBQ0EsTUFBTSxTQUFTLEdBQWMsSUFBQSxhQUFnQixFQUFDLGVBQWUsQ0FBQyxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQyxLQUFLLENBQUMsRUFBRSxLQUFLLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQztZQUM5RyxJQUFJLENBQUMsUUFBUSxHQUFHLFNBQVMsQ0FBQyxRQUFRLENBQUM7WUFDbkMsTUFBTSxjQUFjLEdBQTBDLE1BQU0sSUFBSSxDQUFDLGNBQWMsQ0FBQywyQkFBMkIsRUFBRSxFQUFFLENBQUMsQ0FBQztZQUN6SCxJQUFJLENBQUMsWUFBWSxHQUFHLGNBQWMsQ0FBQyxZQUFZLENBQUM7WUFDaEQsSUFBSSxDQUFDLFVBQVUsR0FBRyxjQUFjLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQztZQUNqRCxJQUFJLGNBQWMsQ0FBQyxRQUFRLENBQUMsTUFBTSxJQUFJLFNBQVMsRUFBRTtnQkFDN0MsTUFBTSxTQUFTLEdBQUcsY0FBYyxDQUFDLFFBQVEsQ0FBQyxlQUFlLENBQUMsR0FBRyxJQUFJLENBQUM7Z0JBQ2xFLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxFQUFFLFNBQVMsRUFBRSxDQUFDLENBQUM7YUFDeEM7WUFDRCxPQUFPLE9BQU8sQ0FBQyxPQUFPLENBQUMsY0FBYyxDQUFDLENBQUM7U0FDMUM7UUFBQyxPQUFPLEtBQUssRUFBRTtZQUNaLE9BQU8sT0FBTyxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQztTQUNoQztJQUNMLENBQUM7SUFHRCxLQUFLLENBQUMsT0FBTztRQUNULElBQUksQ0FBQyxVQUFVLEdBQUcsSUFBSSxDQUFDO1FBQ3ZCLE1BQU0sSUFBSSxDQUFDLGlCQUFpQixFQUFFLENBQUM7SUFDbkMsQ0FBQztJQUdELGdCQUFnQjtRQUVaLElBQUksQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDLFlBQVksRUFBRSxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO1FBQ3pELElBQUksQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDLHNCQUFzQixFQUFFLElBQUksQ0FBQyxhQUFhLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7UUFFdkUsSUFBSSxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUMsUUFBUSxFQUFFLEtBQUssRUFBRSxJQUFJLEVBQUUsRUFBRTtZQUNyQyxJQUFJLElBQUksQ0FBQyxVQUFVO2dCQUFFLE9BQU87WUFDNUIsTUFBTSxJQUFJLENBQUMsc0JBQXNCLEVBQUUsQ0FBQztZQUNwQyxNQUFNLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUN0QyxDQUFDLENBQUMsQ0FBQztRQUVILElBQUksQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDLHVCQUF1QixFQUFFLENBQUMsSUFBSSxFQUFFLEVBQUU7WUFDOUMsSUFBSSxDQUFDLFFBQVEsR0FBRyxJQUFJLENBQUM7UUFDekIsQ0FBQyxDQUFDLENBQUM7UUFDSCxJQUFJLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQyxhQUFhLEVBQUUsQ0FBQyxJQUFJLEVBQUUsRUFBRTtZQUNwQyxJQUFJLElBQUksQ0FBQyxHQUFHLElBQUksSUFBSSxDQUFDLEdBQUcsRUFBQztnQkFDckIsSUFBSSxDQUFDLFVBQVUsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDO2FBQy9CO1FBQ0wsQ0FBQyxDQUFDLENBQUM7SUFDUCxDQUFDO0lBRUQsYUFBYSxDQUFDLElBQUk7UUFDZCxJQUFJLENBQUMsT0FBTyxFQUFFLENBQUM7UUFDZixPQUFPO0lBQ1gsQ0FBQztJQUdELEtBQUssQ0FBQyxTQUFTLENBQUMsSUFBSTtRQUNoQixJQUFJLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBRyxJQUFJLElBQUksQ0FBQyxHQUFHLEVBQUU7WUFDN0IsSUFBSSxDQUFDLFVBQVUsR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQztTQUN0QztJQUNMLENBQUM7SUFHRCxLQUFLLENBQUMsZ0JBQWdCLENBQUMsSUFBSTtRQUN2QixJQUFJO1lBRUEsTUFBTSxjQUFjLEdBQUcsSUFBSSxDQUFDLEdBQUcsRUFBRSxHQUFHLElBQUksQ0FBQyxXQUFXLENBQUMsR0FBRyxJQUFJLEdBQUcsSUFBSSxDQUFDO1lBQ3BFLElBQUksSUFBSSxDQUFDLFFBQVEsSUFBSSxJQUFJLENBQUMsUUFBUSxDQUFDLFVBQVUsSUFBSSxJQUFJLENBQUMsUUFBUSxDQUFDLFVBQVUsQ0FBQyxHQUFHLElBQUksSUFBSSxDQUFDLEdBQUcsRUFBRTtnQkFDdkYsT0FBTzthQUNWO1lBQ0QsSUFBSSxJQUFJLENBQUMsU0FBUyxHQUFHLElBQUksQ0FBQyxVQUFVO2dCQUNoQyxDQUFDLElBQUksQ0FBQyxPQUFPLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFVBQVUsR0FBRyxJQUFJLENBQUMsUUFBUSxJQUFJLElBQUksQ0FBQyxVQUFVLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDLEVBQUU7Z0JBQzdGLE1BQU0sSUFBSSxDQUFDLE9BQU8sRUFBRSxDQUFDO2dCQUNyQixPQUFPO2FBQ1Y7WUFFRCxNQUFNLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxjQUFjLENBQUMsQ0FBQztTQUNsRDtRQUFDLE9BQU8sS0FBSyxFQUFFO1lBQ1osTUFBTSxDQUFDLElBQUksQ0FBQyxrQ0FBa0MsSUFBSSxDQUFDLEdBQUcsSUFBSSxJQUFJLENBQUMsR0FBRyxJQUFJLElBQUksQ0FBQyxPQUFPLElBQUksSUFBSSxDQUFDLE1BQU0sSUFBSSxLQUFLLEVBQUUsQ0FBQyxDQUFDO1NBQ2pIO0lBQ0wsQ0FBQztJQUVELEtBQUssQ0FBQyxzQkFBc0I7UUFDeEIsSUFBSTtZQUVBLElBQUksZUFBZSxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsZUFBZSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDeEUsSUFBSSxJQUFJLENBQUMsUUFBUSxJQUFJLElBQUksQ0FBQyxRQUFRLENBQUMsVUFBVSxJQUFJLENBQzdDLElBQUksQ0FBQyxRQUFRLENBQUMsVUFBVSxDQUFDLEdBQUcsSUFBSSxJQUFJLENBQUMsR0FBRztnQkFDeEMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxJQUFJLEVBQUUsQ0FBQyxHQUFHLElBQUksSUFBSSxDQUFDLEdBQUcsQ0FBQztnQkFDL0QsSUFBSSxDQUFDLFFBQVEsQ0FBQyxlQUFlLEdBQUcsQ0FBQyxDQUNwQyxFQUFFO2dCQUNDLE9BQU87YUFDVjtZQUVELElBQUksT0FBTyxHQUFHLFVBQVUsQ0FBQyxlQUFlLENBQUMsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxJQUFJLEVBQUUsQ0FBQztZQUN2RCxJQUFJLGVBQWUsSUFBSSxDQUFDLEVBQUU7Z0JBQ3RCLE9BQU8sR0FBRyxJQUFJLENBQUM7YUFDbEI7WUFDRCxJQUFJLElBQUksQ0FBQyxVQUFVLEdBQUcsSUFBSSxDQUFDLFlBQVksSUFBSSxPQUFPLEVBQUU7Z0JBRWhELElBQUksTUFBTSxHQUFHLE1BQU0sSUFBSSxDQUFDLGNBQWMsQ0FBQyxrQ0FBa0MsRUFBRSxFQUFFLENBQUMsQ0FBQzthQUNsRjtTQUNKO1FBQUMsT0FBTyxLQUFLLEVBQUU7WUFDWixNQUFNLENBQUMsSUFBSSxDQUFDLGtCQUFrQixJQUFJLENBQUMsR0FBRyxJQUFJLElBQUksQ0FBQyxVQUFVLElBQUksSUFBSSxDQUFDLFNBQVMsQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDLENBQUM7U0FDekY7SUFDTCxDQUFDO0lBR0QsS0FBSyxDQUFDLG1CQUFtQixDQUFDLGNBQXNCO1FBQzVDLE1BQU0sRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLEdBQUcsWUFBWSxDQUFDLGdCQUFnQixDQUFDLElBQUksQ0FBQyxVQUFVLEVBQUUsSUFBSSxDQUFDLE9BQU8sRUFBRSxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUM7UUFDekcsSUFBSSxDQUFDLE9BQU8sSUFBSSxDQUFDLE9BQU8sQ0FBQyxNQUFNLEVBQUU7WUFDN0IsTUFBTSxJQUFJLENBQUMsT0FBTyxFQUFFLENBQUM7WUFDckIsT0FBTztTQUNWO1FBQ0QsSUFBSSxDQUFDLE9BQU8sQ0FBQyxNQUFNLEVBQUU7WUFDakIsT0FBTztTQUNWO1FBRUQsSUFBSSxTQUFTLEdBQUcsVUFBVSxDQUFDLGVBQWUsQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLENBQUM7UUFDdkQsS0FBSyxJQUFJLE1BQU0sSUFBSSxPQUFPLEVBQUU7WUFDeEIsSUFBSTtnQkFFQSxJQUFJLElBQUksQ0FBQyxHQUFHLEVBQUUsR0FBRyxTQUFTLElBQUksY0FBYyxJQUFJLElBQUksQ0FBQyxVQUFVLEdBQUcsTUFBTSxFQUFFO29CQUN0RSxNQUFNO2lCQUNUO2dCQUNELElBQUksSUFBSSxHQUFHLEVBQUUsSUFBSSxFQUFFLE9BQU8sRUFBRSxHQUFHLEVBQUUsTUFBTSxFQUFFLENBQUM7Z0JBQzFDLE1BQU0sSUFBSSxDQUFDLFlBQVksQ0FBQyx3QkFBd0IsRUFBRSxJQUFJLEVBQUUsU0FBUyxDQUFDLENBQUM7Z0JBQ25FLElBQUksQ0FBQyxVQUFVLElBQUksTUFBTSxDQUFDO2dCQUMxQixTQUFTLEdBQUcsVUFBVSxDQUFDLGVBQWUsQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLENBQUM7YUFDdEQ7WUFBQyxPQUFPLEtBQUssRUFBRTtnQkFDWixNQUFNLENBQUMsSUFBSSxDQUFDLGdDQUFnQyxJQUFJLENBQUMsR0FBRyxJQUFJLElBQUksQ0FBQyxTQUFTLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQyxDQUFDO2dCQUNqRixNQUFNO2FBQ1Q7U0FDSjtRQUVELElBQUksQ0FBQyxTQUFTLEVBQUUsQ0FBQztJQUNyQixDQUFDO0NBQ0o7QUF4SkQsZ0NBd0pDIn0=