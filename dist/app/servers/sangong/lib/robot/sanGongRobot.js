'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const BaseRobot_1 = require("../../../../common/pojo/baseClass/BaseRobot");
const sangongConst = require("../sangongConst");
const commonUtil = require("../../../../utils/lottery/commonUtil");
const utils = require("../../../../utils");
const pinus_logger_1 = require("pinus-logger");
const robotlogger = (0, pinus_logger_1.getLogger)('robot_out', __filename);
class SanGongRobot extends BaseRobot_1.BaseRobot {
    constructor(opts) {
        super(opts);
        this.onStartRob_num = 0;
        this.playRound = 0;
        this.leaveRound = commonUtil.randomFromRange(5, 20);
        this.entryCond = 0;
    }
    async sanGongLoaded() {
        try {
            const loadedData = await this.requestByRoute('sangong.mainHandler.loaded', {});
            this.entryCond = loadedData.room.players.find(pl => pl && pl.uid == this.uid).gold;
        }
        catch (error) {
            robotlogger.warn(`chinesePokerLoaded|${this.uid}|${this.nid}|${this.sceneId}|${this.roomId}|${error}`);
            return Promise.reject(error);
        }
    }
    destroy() {
        this.leaveGameAndReset(false);
    }
    registerListener() {
        this.Emitter.on(sangongConst.route.RobState, this.onStartRob.bind(this));
        this.Emitter.on(sangongConst.route.BetState, this.onSanGongBet.bind(this));
        this.Emitter.on(sangongConst.route.LookState, this.onSanGongLook.bind(this));
        this.Emitter.on(sangongConst.route.KickPlayer, this.onSanGongKick.bind(this));
        this.Emitter.on(sangongConst.route.SettleResult, this.SettleResult.bind(this));
    }
    onSanGongKick(onKicked) {
        if (this.uid == onKicked.uid) {
            return this.destroy();
        }
    }
    async onSanGongBet(onBetData) {
        if (onBetData.Banker.uid == this.uid) {
            return;
        }
        const selfInfo = onBetData.players.find(pl => pl && pl.uid == this.uid);
        const ran = Math.random();
        let odds = 1;
        if (selfInfo) {
            if (selfInfo.control) {
                odds = 4;
            }
            else if (ran < 0.1) {
                odds = 4;
            }
            else if (ran > 0.9 || selfInfo.control) {
                odds = 3;
            }
            else if (ran >= 0.1 && ran < 0.7) {
                odds = 2;
            }
            else {
                odds = 1;
            }
            let delayTime = Math.min(commonUtil.randomFromRange(1000, 4000), onBetData.countdown);
            await this.delayRequest('sangong.mainHandler.bet', { odds }, delayTime);
        }
    }
    async onStartRob(rob) {
        let odds = 0;
        const selfData = rob.players.find(pl => pl && pl.uid == this.uid);
        if (selfData) {
            const ran = Math.random();
            if (ran < 0.85) {
                odds = 1;
            }
        }
        let delayTime = commonUtil.randomFromRange(2000, 4000);
        let t1 = utils.cDate();
        this.onStartRob_num++;
        try {
            let res = await this.delayRequest('sangong.mainHandler.robBanker', { odds }, delayTime);
        }
        catch (error) {
            let t2 = utils.cDate();
            console.warn(`${this.onStartRob_num}||t1:${t1}||||${t2}|||${this.nickname}`);
        }
    }
    async SettleResult(data) {
        setTimeout(() => {
            this.destroy();
        }, utils.random(1, 3) * 10);
    }
    async onSanGongLook(onLookData) {
        try {
            let pl = onLookData.players.find(pl => pl && pl.uid == this.uid);
            if (pl) {
                let ran = utils.random(0, 3);
                let delayTime = commonUtil.randomFromRange(0, onLookData.countdown - 2000);
                let res = await this.delayRequest('sangong.mainHandler.openCardType', { location: ran }, delayTime);
            }
        }
        catch (error) {
            robotlogger.warn("sangongrobot", JSON.stringify(error));
        }
    }
}
exports.default = SanGongRobot;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2FuR29uZ1JvYm90LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vYXBwL3NlcnZlcnMvc2FuZ29uZy9saWIvcm9ib3Qvc2FuR29uZ1JvYm90LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLFlBQVksQ0FBQzs7QUFHYiwyRUFBd0U7QUFDeEUsZ0RBQWlEO0FBQ2pELG1FQUFvRTtBQUNwRSwyQ0FBNEM7QUFFNUMsK0NBQXlDO0FBQ3pDLE1BQU0sV0FBVyxHQUFHLElBQUEsd0JBQVMsRUFBQyxXQUFXLEVBQUUsVUFBVSxDQUFDLENBQUM7QUFFdkQsTUFBcUIsWUFBYSxTQUFRLHFCQUFTO0lBUS9DLFlBQVksSUFBSTtRQUNaLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUZoQixtQkFBYyxHQUFHLENBQUMsQ0FBQztRQUdmLElBQUksQ0FBQyxTQUFTLEdBQUcsQ0FBQyxDQUFDO1FBQ25CLElBQUksQ0FBQyxVQUFVLEdBQUcsVUFBVSxDQUFDLGVBQWUsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUM7UUFDcEQsSUFBSSxDQUFDLFNBQVMsR0FBRyxDQUFDLENBQUM7SUFDdkIsQ0FBQztJQUdELEtBQUssQ0FBQyxhQUFhO1FBQ2YsSUFBSTtZQUNBLE1BQU0sVUFBVSxHQUFHLE1BQU0sSUFBSSxDQUFDLGNBQWMsQ0FBQyw0QkFBNEIsRUFBRSxFQUFFLENBQUMsQ0FBQztZQUMvRSxJQUFJLENBQUMsU0FBUyxHQUFHLFVBQVUsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsSUFBSSxFQUFFLENBQUMsR0FBRyxJQUFJLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUM7U0FDdEY7UUFBQyxPQUFPLEtBQUssRUFBRTtZQUNaLFdBQVcsQ0FBQyxJQUFJLENBQUMsc0JBQXNCLElBQUksQ0FBQyxHQUFHLElBQUksSUFBSSxDQUFDLEdBQUcsSUFB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