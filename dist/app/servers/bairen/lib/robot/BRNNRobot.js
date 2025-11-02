'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const utils = require("../../../../utils");
const BaseRobot_1 = require("../../../../common/pojo/baseClass/BaseRobot");
const commonUtil = require("../../../../utils/lottery/commonUtil");
const mathUtil = require("../../../../utils/lottery/mathUtil");
const robotBetUtil = require("../../../../utils/robot/robotBetUtil");
const pinus_logger_1 = require("pinus-logger");
const robotlogger = (0, pinus_logger_1.getLogger)('robot_out', __filename);
const JsonMgr_1 = require("../../../../../config/data/JsonMgr");
let pl_totalBets = [];
class BullFightRobot extends BaseRobot_1.BaseRobot {
    constructor(opts) {
        super(opts);
        this.initGold = 0;
        this.gold = 0;
        this.exitUpzhuanglist_stat = false;
        this.zj_sData = null;
        this.playRound = 0;
        this.leaveRound = commonUtil.randomFromRange(10, 50);
        this.isBanker = false;
        this.isBetState = true;
    }
    async bullFightLoaded() {
        try {
            const sceneInfo = (0, JsonMgr_1.get)('scenes/bairen').datas.find(scene => scene.id === this.sceneId);
            this.ChipList = sceneInfo.ChipList;
            if (!pl_totalBets.find(m => m.uid == this.uid)) {
                pl_totalBets.push({ uid: this.uid, roomId: this.roomId, totalBet: 0, flag: false });
            }
            let res = await this.requestByRoute(`bairen.mainHandler.loaded`, {});
            if (res.code == 200) {
                this.lowBet = res.room.lowBet;
                this.upZhuangCond = res.room.upZhuangCond;
                this.initGold = this.gold = res.players.find(pl => pl.uid == this.uid).gold;
            }
            this.compensate = this.sceneId == 0 ? 5 : 10;
            return Promise.resolve();
        }
        catch (error) {
            return Promise.reject(error);
        }
    }
    async destroy() {
        this.isBetState = false;
        await this.leaveGameAndReset();
        pl_totalBets = pl_totalBets.filter(m => m.uid != this.uid);
    }
    registerListener() {
        this.Emitter.on(`br_onEntry`, async (dataFromEntry) => {
            await this.onBullFightEntry(dataFromEntry);
        });
        this.Emitter.on("br_onUpdateZhuangInfo", this.onUpdateZhuangInfo.bind(this));
        this.Emitter.on(`br_start`, this.onBullFightBetStart.bind(this));
        this.Emitter.on(`br_over`, this.onBullFightBetOver.bind(this));
    }
    onUpdateZhuangInfo(data) {
        this.isBanker = data.zhuangInfo && data.zhuangInfo.uid === this.uid;
        if (!this.isBanker) {
            const ranLess = commonUtil.randomFromRange(1, 100) <= 30;
            const bankerLength = data.zj_queues.filter(pl => pl && pl.isRobot == 2).length;
            if (ranLess && bankerLength < 3) {
                this.checkBanker();
            }
            if (!this.exitUpzhuanglist_stat && bankerLength > 5) {
                data.zj_queues.sort((c1, c2) => c1.gold - c2.gold);
                if (data.zj_queues[0].uid == this.uid) {
                    this.requestXiaZhuang();
                }
            }
        }
        this.zj_sData = data;
    }
    async onBullFightEntry(dataFromEntryMsg) {
    }
    async onBullFightBetStart(data) {
        const countdown = data.countdownTime * 1000;
        const stopBetTimeOut = Date.now() + countdown - 1000;
        if (this.isBanker || !this.isBetState) {
            return;
        }
        if (this.playRound > this.leaveRound ||
            this.gold < this.lowBet ||
            (this.isRobot == 2 && (this.gold > this.gold_max || this.gold < this.gold_min))) {
            return this.destroy();
        }
        const randomFactor = commonUtil.randomFromRange(1, 100);
        const { betArea, betArr } = robotBetUtil.getBullFightBetInfo(randomFactor, this.gold - this.lowBet, this.zj_sData && this.zj_sData.zhuangInfo ? this.zj_sData.zhuangInfo.gold : 0, this.ChipList);
        if (commonUtil.isNullOrUndefined(betArea) || commonUtil.isNullOrUndefined(betArr) || !betArr.length) {
            return await this.destroy();
        }
        let delayTime = commonUtil.randomFromRange(3000, 5000);
        const delayArr = mathUtil.divideSumToNumArr(countdown - delayTime, betArr.length);
        delayArr.unshift(delayTime);
        let sumCount = 0;
        if (this.zj_sData && this.zj_sData.zhuangInfo) {
            let delay = 1000;
            let zj_gold_peifu = this.zj_sData.zhuangInfo.gold / this.compensate * 0.6;
            let pl_totalBet = pl_totalBets.find(m => m.roomId == this.roomId);
            pl_totalBet.totalBet += utils.sum(betArr);
            if (pl_totalBet.totalBet > zj_gold_peifu) {
                delay = 2000;
            }
            for (let idx = 0; idx < delayArr.length; idx++) {
                delayArr[idx] = delayArr[idx] + delay;
            }
        }
        for (let i = 0; i < delayArr.length; i++) {
            delayTime = delayArr[i];
            if (Date.now() + delayTime >= stopBetTimeOut || !this.isBetState || this.isBanker) {
                break;
            }
            if (i > betArr.length - 1) {
                break;
            }
            sumCount = sumCount + betArr[i];
            if (sumCount * this.compensate > this.gold)
                continue;
            try {
                let res = await this.delayRequest(`bairen.mainHandler.bet`, {
                    bet: betArr[i],
                    area: betArea
                }, delayTime);
                this.gold -= betArr[i];
            }
            catch (error) {
                let context = `bairen.mainHandler.bet|${this.uid}|${this.nid}|${this.sceneId}|${this.roomId}|${error}`;
                robotlogger.info(context);
                break;
            }
        }
        this.playRound++;
    }
    async checkBanker() {
        if (this.gold > this.upZhuangCond) {
            if (this.sceneId == 0 || (this.sceneId == 1 && this.gold >= this.lowBet * 300)) {
                try {
                    await this.delayRequest(`bairen.mainHandler.applyUpzhuang`, {}, 15000);
                }
                catch (error) {
                }
            }
        }
    }
    async requestXiaZhuang() {
        this.exitUpzhuanglist_stat = true;
        await this.requestByRoute(`bairen.mainHandler.exitUpzhuanglist`, {}).catch(error => {
            robotlogger.warn(`bairen.mainHandler.exitUpzhuanglist|${this.uid}||${this.sceneId}|${this.roomId}|${JSON.stringify(error)}`);
        });
        this.isBanker = false;
        this.exitUpzhuanglist_stat = false;
    }
    async onBullFightBetOver(data) {
        let pl_totalBet = pl_totalBets.find(m => m.roomId == this.roomId);
        if (pl_totalBet) {
            pl_totalBet.totalBet = 0;
            pl_totalBet.flag = false;
        }
    }
}
exports.default = BullFightRobot;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQlJOTlJvYm90LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vYXBwL3NlcnZlcnMvYmFpcmVuL2xpYi9yb2JvdC9CUk5OUm9ib3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsWUFBWSxDQUFDOztBQUdiLDJDQUEwQztBQUMxQywyRUFBd0U7QUFFeEUsbUVBQW1FO0FBQ25FLCtEQUFnRTtBQUdoRSxxRUFBc0U7QUFDdEUsK0NBQXlDO0FBQ3pDLE1BQU0sV0FBVyxHQUFHLElBQUEsd0JBQVMsRUFBQyxXQUFXLEVBQUUsVUFBVSxDQUFDLENBQUM7QUFDdkQsZ0VBQTZFO0FBRzdFLElBQUksWUFBWSxHQUFxRSxFQUFFLENBQUM7QUFFeEYsTUFBcUIsY0FBZSxTQUFRLHFCQUFTO0lBa0JqRCxZQUFZLElBQUk7UUFDWixLQUFLLENBQUMsSUFBSSxDQUFDLENBQUM7UUFsQmhCLGFBQVEsR0FBVyxDQUFDLENBQUM7UUFDckIsU0FBSSxHQUFXLENBQUMsQ0FBQztRQU1qQiwwQkFBcUIsR0FBRyxLQUFLLENBQUM7UUFROUIsYUFBUSxHQUF1QyxJQUFJLENBQUM7UUFJaEQsSUFBSSxDQUFDLFNBQVMsR0FBRyxDQUFDLENBQUM7UUFDbkIsSUFBSSxDQUFDLFVBQVUsR0FBRyxVQUFVLENBQUMsZUFBZSxDQUFDLEVBQUUsRUFBRSxFQUFFLENBQUMsQ0FBQztRQUNyRCxJQUFJLENBQUMsUUFBUSxHQUFHLEtBQUssQ0FBQztRQUN0QixJQUFJLENBQUMsVUFBVSxHQUFHLElBQUksQ0FBQztJQUMzQixDQUFDO0lBR0QsS0FBSyxDQUFDLGVBQWU7UUFDakIsSUFBSTtZQUNBLE1BQU0sU0FBUyxHQUFjLElBQUEsYUFBZ0IsRUFBQyxlQUFlLENBQUMsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUFDLEVBQUUsS0FBSyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUM7WUFDOUcsSUFBSSxDQUFDLFFBQVEsR0FBRyxTQUFTLENBQUMsUUFBUSxDQUFDO1lBQ25DLElBQUksQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUU7Z0JBQzVDLFlBQVksQ0FBQyxJQUFJLENBQUMsRUFBRSxHQUFHLEVBQUUsSUFBSSxDQUFDLEdBQUcsRUFBRSxNQUFNLEVBQUUsSUFBSSxDQUFDLE1BQU0sRUFBRSxRQUFRLEVBQUUsQ0FBQyxFQUFFLElBQUksRUFBRSxLQUFLLEVBQUUsQ0FBQyxDQUFDO2FBQ3ZGO1lBQ0QsSUFBSSxHQUFHLEdBQTBDLE1BQU0sSUFBSSxDQUFDLGNBQWMsQ0FBQywyQkFBMkIsRUFBRSxFQUFFLENBQUMsQ0FBQztZQUM1RyxJQUFJLEdBQUcsQ0FBQyxJQUFJLElBQUksR0FBRyxFQUFFO2dCQUNqQixJQUFJLENBQUMsTUFBTSxHQUFHLEdBQUcsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDO2dCQUM5QixJQUFJLENBQUMsWUFBWSxHQUFHLEdBQUcsQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDO2dCQUMxQyxJQUFJLENBQUMsUUFBUSxHQUFHLElBQUksQ0FBQyxJQUFJLEdBQUcsR0FBRyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsR0FBRyxJQUFJLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUM7YUFDL0U7WUFDRCxJQUFJLENBQUMsVUFBVSxHQUFHLElBQUksQ0FBQyxPQUFPLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQztZQUM3QyxPQUFPLE9BQU8sQ0FBQyxPQUFPLEVBQUUsQ0FBQztTQUM1QjtRQUFDLE9BQU8sS0FBSyxFQUFFO1lBQ1osT0FBTyxPQUFPLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDO1NBQ2hDO0lBQ0wsQ0FBQztJQUdELEtBQUssQ0FBQyxPQUFPO1FBQ1QsSUFBSSxDQUFDLFVBQVUsR0FBRyxLQUFLLENBQUM7UUFDeEIsTUFBTSxJQUFJLENBQUMsaUJBQWlCLEVBQUUsQ0FBQztRQUMvQixZQUFZLEdBQUcsWUFBWSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxHQUFHLElBQUksSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDO0lBQy9ELENBQUM7SUFHRCxnQkFBZ0I7UUFFWixJQUFJLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQyxZQUFZLEVBQUUsS0FBSyxFQUFFLGFBQWEsRUFBRSxFQUFFO1lBQ2xELE1BQU0sSUFBSSxDQUFDLGdCQUFnQixDQUFDLGFBQWEsQ0FBQyxDQUFDO1FBQy9DLENBQUMsQ0FBQyxDQUFDO1FBQ0gsSUFBSSxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUMsdUJBQXVCLEVBQUUsSUFBSSxDQUFDLGtCQUFrQixDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO1FBRTdFLElBQUksQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDLFVBQVUsRUFBRSxJQUFJLENBQUMsbUJBQW1CLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7UUFHakUsSUFBSSxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUMsU0FBUyxFQUFFLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztJQUNuRSxDQUFDO0lBRUQsa0JBQWtCLENBQUMsSUFBd0M7UUFDdkQsSUFBSSxDQUFDLFFBQVEsR0FBRyxJQUFJLENBQUMsVUFBVSxJQUFJLElBQUksQ0FBQyxVQUFVLENBQUMsR0FBRyxLQUFLLElBQUksQ0FBQyxHQUFHLENBQUM7UUFDcEUsSUFBSSxDQUFDLElBQUksQ0FBQyxRQUFRLEVBQUU7WUFDaEIsTUFBTSxPQUFPLEdBQUcsVUFBVSxDQUFDLGVBQWUsQ0FBQyxDQUFDLEVBQUUsR0FBRyxDQUFDLElBQUksRUFBRSxDQUFDO1lBQ3pELE1BQU0sWUFBWSxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxJQUFJLEVBQUUsQ0FBQyxPQUFPLElBQUksQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDO1lBQy9FLElBQUksT0FBTyxJQUFJLFlBQVksR0FBRyxDQUFDLEVBQUU7Z0JBQzdCLElBQUksQ0FBQyxXQUFXLEVBQUUsQ0FBQzthQUN0QjtZQUNELElBQUksQ0FBQyxJQUFJLENBQUMscUJBQXFCLElBQUksWUFBWSxHQUFHLENBQUMsRUFBRTtnQkFDakQsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUMsSUFBSSxHQUFHLEVBQUUsQ0FBQyxJQUFJLENBQUMsQ0FBQztnQkFDbkQsSUFBSSxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxJQUFJLENBQUMsR0FBRyxFQUFFO29CQUNuQyxJQUFJLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQztpQkFDM0I7YUFDSjtTQUNKO1FBQ0QsSUFBSSxDQUFDLFFBQVEsR0FBRyxJQUFJLENBQUM7SUFDekIsQ0FBQztJQUdELEtBQUssQ0FBQyxnQkFBZ0IsQ0FBQyxnQkFBZ0I7SUFFdkMsQ0FBQztJQUdELEtBQUssQ0FBQyxtQkFBbUIsQ0FBQyxJQUEyQjtRQUVqRCxNQUFNLFNBQVMsR0FBRyxJQUFJLENBQUMsYUFBYSxHQUFHLElBQUksQ0FBQztRQUU1QyxNQUFNLGNBQWMsR0FBRyxJQUFJLENBQUMsR0FBRyxFQUFFLEdBQUcsU0FBUyxHQUFHLElBQUksQ0FBQztRQUdyRCxJQUFJLElBQUksQ0FBQyxRQUFRLElBQUksQ0FBQyxJQUFJLENBQUMsVUFBVSxFQUFFO1lBQ25DLE9BQU87U0FDVjtRQUVELElBQUksSUFBSSxDQUFDLFNBQVMsR0FBRyxJQUFJLENBQUMsVUFBVTtZQUNoQyxJQUFJLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQyxNQUFNO1lBQ3ZCLENBQUMsSUFBSSxDQUFDLE9BQU8sSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQyxRQUFRLElBQUksSUFBSSxDQUFDLElBQUksR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUMsRUFBRTtZQUNqRixPQUFPLElBQUksQ0FBQyxPQUFPLEVBQUUsQ0FBQztTQUN6QjtRQUVELE1BQU0sWUFBWSxHQUFHLFVBQVUsQ0FBQyxlQUFlLENBQUMsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxDQUFDO1FBSXhELE1BQU0sRUFBRSxPQUFPLEVBQUUsTUFBTSxFQUFFLEdBQUcsWUFBWSxDQUFDLG1CQUFtQixDQUFDLFlBQVksRUFDckUsSUFBSSxDQUFDLElBQUksR0FBRyxJQUFJLENBQUMsTUFBTSxFQUFFLElBQUksQ0FBQyxRQUFRLElBQUksSUFBSSxDQUFDLFFBQVEsQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQztRQUUzSCxJQUFJLFVBQVUsQ0FBQyxpQkFBaUIsQ0FBQyxPQUFPLENBQUMsSUFBSSxVQUFVLENBQUMsaUJBQWlCLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsTUFBTSxFQUFFO1lBQ2pHLE9BQU8sTUFBTSxJQUFJLENBQUMsT0FBTyxFQUFFLENBQUM7U0FDL0I7UUFJRCxJQUFJLFNBQVMsR0FBRyxVQUFVLENBQUMsZUFBZSxDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsQ0FBQztRQUN2RCxNQUFNLFFBQVEsR0FBRyxRQUFRLENBQUMsaUJBQWlCLENBQUMsU0FBUyxHQUFHLFNBQVMsRUFBRSxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUM7UUFFbEYsUUFBUSxDQUFDLE9BQU8sQ0FBQyxTQUFTLENBQUMsQ0FBQztRQUM1QixJQUFJLFFBQVEsR0FBRyxDQUFDLENBQUM7UUFJakIsSUFBSSxJQUFJLENBQUMsUUFBUSxJQUFJLElBQUksQ0FBQyxRQUFRLENBQUMsVUFBVSxFQUFFO1lBQzNDLElBQUksS0FBSyxHQUFHLElBQUksQ0FBQztZQUNqQixJQUFJLGFBQWEsR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDLFVBQVUsQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDLFVBQVUsR0FBRyxHQUFHLENBQUM7WUFDMUUsSUFBSSxXQUFXLEdBQUcsWUFBWSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxNQUFNLElBQUksSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDO1lBQ2xFLFdBQVcsQ0FBQyxRQUFRLElBQUksS0FBSyxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsQ0FBQztZQUMxQyxJQUFJLFdBQVcsQ0FBQyxRQUFRLEdBQUcsYUFBYSxFQUFFO2dCQUN0QyxLQUFLLEdBQUcsSUFBSSxDQUFDO2FBQ2hCO1lBQ0QsS0FBSyxJQUFJLEdBQUcsR0FBRyxDQUFDLEVBQUUsR0FBRyxHQUFHLFFBQVEsQ0FBQyxNQUFNLEVBQUUsR0FBRyxFQUFFLEVBQUU7Z0JBQzVDLFFBQVEsQ0FBQyxHQUFHLENBQUMsR0FBRyxRQUFRLENBQUMsR0FBRyxDQUFDLEdBQUcsS0FBSyxDQUFDO2FBQ3pDO1NBQ0o7UUFJRCxLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsUUFBUSxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRTtZQUN0QyxTQUFTLEdBQUcsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBRXhCLElBQUksSUFBSSxDQUFDLEdBQUcsRUFBRSxHQUFHLFNBQVMsSUFBSSxjQUFjLElBQUksQ0FBQyxJQUFJLENBQUMsVUFBVSxJQUFJLElBQUksQ0FBQyxRQUFRLEVBQUU7Z0JBQy9FLE1BQU07YUFDVDtZQUNELElBQUksQ0FBQyxHQUFHLE1BQU0sQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFFO2dCQUN2QixNQUFNO2FBQ1Q7WUFDRCxRQUFRLEdBQUcsUUFBUSxHQUFHLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUNoQyxJQUFJLFFBQVEsR0FBRyxJQUFJLENBQUMsVUFBVSxHQUFHLElBQUksQ0FBQyxJQUFJO2dCQUN0QyxTQUFTO1lBRWIsSUFBSTtnQkFFQSxJQUFJLEdBQUcsR0FBRyxNQUFNLElBQUksQ0FBQyxZQUFZLENBQUMsd0JBQXdCLEVBQUU7b0JBQ3hELEdBQUcsRUFBRSxNQUFNLENBQUMsQ0FBQyxDQUFDO29CQUNkLElBQUksRUFBRSxPQUFPO2lCQUNoQixFQUFFLFNBQVMsQ0FBQyxDQUFDO2dCQUNkLElBQUksQ0FBQyxJQUFJLElBQUksTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDO2FBQzFCO1lBQUMsT0FBTyxLQUFLLEVBQUU7Z0JBQ1osSUFBSSxPQUFPLEdBQUcsMEJBQTBCLElBQUksQ0FBQyxHQUFHLElBQUksSUFBSSxDQUFDLEdBQUcsSUFBSSxJQUFJLENBQUMsT0FBTyxJQUFJLElBQUksQ0FBQyxNQUFNLElBQUksS0FBSyxFQUFFLENBQUM7Z0JBQ3ZHLFdBQVcsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUM7Z0JBQzFCLE1BQU07YUFDVDtTQUNKO1FBRUQsSUFBSSxDQUFDLFNBQVMsRUFBRSxDQUFDO0lBQ3JCLENBQUM7SUFJRCxLQUFLLENBQUMsV0FBVztRQUNiLElBQUksSUFBSSxDQUFDLElBQUksR0FBRyxJQUFJLENBQUMsWUFBWSxFQUFFO1lBQy9CLElBQUksSUFBSSxDQUFDLE9BQU8sSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxJQUFJLENBQUMsSUFBSSxJQUFJLENBQUMsSUFBSSxJQUFJLElBQUksQ0FBQyxNQUFNLEdBQUcsR0FBRyxDQUFDLEVBQUU7Z0JBQzVFLElBQUk7b0JBQ0EsTUFBTSxJQUFJLENBQUMsWUFBWSxDQUFDLGtDQUFrQyxFQUFFLEVBQUUsRUFBRSxLQUFLLENBQUMsQ0FBQztpQkFDMUU7Z0JBQUMsT0FBTyxLQUFLLEVBQUU7aUJBQ2Y7YUFDSjtTQUNKO0lBQ0wsQ0FBQztJQUVELEtBQUssQ0FBQyxnQkFBZ0I7UUFDbEIsSUFBSSxDQUFDLHFCQUFxQixHQUFHLElBQUksQ0FBQztRQUVsQyxNQUFNLElBQUksQ0FBQyxjQUFjLENBQUMscUNBQXFDLEVBQUUsRUFBRSxDQUFDLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxFQUFFO1lBQy9FLFdBQVcsQ0FBQyxJQUFJLENBQUMsdUNBQXVDLElBQUksQ0FBQyxHQUFHLEtBQUssSUFBSSxDQUFDLE9BQU8sSUFBSSxJQUFJLENBQUMsTUFBTSxJQUFJLElBQUksQ0FBQyxTQUFTLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQyxDQUFDO1FBQ2pJLENBQUMsQ0FBQyxDQUFDO1FBRUgsSUFBSSxDQUFDLFFBQVEsR0FBRyxLQUFLLENBQUM7UUFDdEIsSUFBSSxDQUFDLHFCQUFxQixHQUFHLEtBQUssQ0FBQztJQUN2QyxDQUFDO0lBRUQsS0FBSyxDQUFDLGtCQUFrQixDQUFDLElBQTBCO1FBRy9DLElBQUksV0FBVyxHQUFHLFlBQVksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsTUFBTSxJQUFJLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUNsRSxJQUFJLFdBQVcsRUFBRTtZQUNiLFdBQVcsQ0FBQyxRQUFRLEdBQUcsQ0FBQyxDQUFDO1lBQ3pCLFdBQVcsQ0FBQyxJQUFJLEdBQUcsS0FBSyxDQUFDO1NBQzVCO0lBQ0wsQ0FBQztDQUNKO0FBaE5ELGlDQWdOQyJ9