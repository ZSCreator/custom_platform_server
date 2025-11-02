'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const BaseRobot_1 = require("../../../../common/pojo/baseClass/BaseRobot");
const utils = require("../../../../utils");
const qzpjConst = require("../qzpjConst");
const pinus_logger_1 = require("pinus-logger");
const log_logger = (0, pinus_logger_1.getLogger)('robot', __filename);
class qzpjRobot extends BaseRobot_1.BaseRobot {
    constructor(opts) {
        super(opts);
        this.playTimes = 0;
        this.isControl = false;
        this.Rank = false;
        this.entryCond = 0;
        this.zhuangInfo = "";
        this.seat = opts.seat;
        this.initgold = 10000 * utils.random(3, 10);
        this.has_robmul3 = false;
    }
    async loaded() {
        try {
            let result = await this.requestByRoute("qzpj.mainHandler.loaded", {});
            this.lowBet = result.room.lowBet;
            this.entryCond = result.room.entryCond;
            return Promise.resolve(result);
        }
        catch (error) {
            return Promise.reject(error);
        }
    }
    async destroy() {
        await this.leaveGameAndReset(false);
    }
    registerListener() {
        this.Emitter.on(qzpjConst.route.qzpj_onStart, this.onfahua.bind(this));
        this.Emitter.on(qzpjConst.route.qzpj_onSettlement, this.onEndRound.bind(this));
        this.Emitter.on(qzpjConst.route.qzpj_onSetBanker, (data) => {
            this.zhuangInfo = data.zhuangInfo.uid;
        });
        this.Emitter.on(qzpjConst.route.qzpj_onReadybet, this.onReadybet.bind(this));
    }
    async onReadybet(data) {
        setTimeout(async () => {
            if (this.zhuangInfo == this.uid) {
                return;
            }
            let betNum = qzpjConst.xj_bet_arr[0];
            let ran = utils.random(1, 100);
            if (this.isControl) {
                let _arr = [
                    { group: 0, weight: 90 },
                    { group: 1, weight: 5 },
                    { group: 2, weight: 5 },
                ];
                if (this.Rank) {
                    _arr = [
                        { group: 0, weight: 0 },
                        { group: 1, weight: 20 },
                        { group: 2, weight: 40 },
                        { group: 2, weight: 40 },
                    ];
                }
                let bet = utils.sortProbability_(_arr);
                betNum = data.bet_mul_List[bet];
            }
            else {
                if (this.max_point >= 7) {
                    if (ran <= 90) {
                        betNum = data.bet_mul_List[0];
                    }
                    else if (90 < ran && ran <= 95) {
                        betNum = data.bet_mul_List[1];
                    }
                    else {
                        betNum = data.bet_mul_List[2];
                    }
                }
                else {
                    betNum = data.bet_mul_List[0];
                }
            }
            try {
                await this.delayRequest("qzpj.mainHandler.bet", { betNum: betNum }, utils.random(2, 4) * 1000);
            }
            catch (error) {
                console.warn(JSON.stringify(error));
            }
        }, 1 * 1000);
    }
    async onfahua(data) {
        setTimeout(async () => {
            let isQz = 0;
            if (1 == 1) {
                let _arr = [
                    { group: 0, weight: 50 },
                    { group: 1, weight: 30 },
                    { group: 2, weight: 10 },
                ];
                isQz = utils.sortProbability_(_arr);
            }
            else {
                let _arr = [
                    { group: 0, weight: 20 },
                    { group: 1, weight: 20 },
                    { group: 2, weight: 30 },
                    { group: 3, weight: 30 },
                ];
                isQz = utils.sortProbability_(_arr);
            }
            while (this.gold / this.lowBet < isQz * 30) {
                isQz--;
            }
            try {
                await this.delayRequest("qzpj.mainHandler.robTheBanker", { mul: isQz }, 100);
            }
            catch (error) {
                console.warn(JSON.stringify(error));
            }
        }, utils.random(1, 3) * 1000);
    }
    async onEndRound(res) {
    }
}
exports.default = qzpjRobot;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicXpwalJvYm90LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vYXBwL3NlcnZlcnMvcXpwai9saWIvcm9ib3QvcXpwalJvYm90LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLFlBQVksQ0FBQzs7QUFDYiwyRUFBd0U7QUFDeEUsMkNBQTRDO0FBQzVDLDBDQUEyQztBQUUzQywrQ0FBd0M7QUFDeEMsTUFBTSxVQUFVLEdBQUcsSUFBQSx3QkFBUyxFQUFDLE9BQU8sRUFBRSxVQUFVLENBQUMsQ0FBQztBQUdsRCxNQUFxQixTQUFVLFNBQVEscUJBQVM7SUFtQjlDLFlBQVksSUFBUztRQUNuQixLQUFLLENBQUMsSUFBSSxDQUFDLENBQUM7UUFoQmQsY0FBUyxHQUFXLENBQUMsQ0FBQztRQUd0QixjQUFTLEdBQVksS0FBSyxDQUFDO1FBRTNCLFNBQUksR0FBWSxLQUFLLENBQUM7UUFHdEIsY0FBUyxHQUFXLENBQUMsQ0FBQztRQUt0QixlQUFVLEdBQUcsRUFBRSxDQUFDO1FBSWQsSUFBSSxDQUFDLElBQUksR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDO1FBQ3RCLElBQUksQ0FBQyxRQUFRLEdBQUcsS0FBSyxHQUFHLEtBQUssQ0FBQyxNQUFNLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDO1FBRTVDLElBQUksQ0FBQyxXQUFXLEdBQUcsS0FBSyxDQUFDO0lBQzNCLENBQUM7SUFFRCxLQUFLLENBQUMsTUFBTTtRQUNWLElBQUk7WUFDRixJQUFJLE1BQU0sR0FBRyxNQUFNLElBQUksQ0FBQyxjQUFjLENBQUMseUJBQXlCLEVBQUUsRUFBRSxDQUFDLENBQUM7WUFDdEUsSUFBSSxDQUFDLE1BQU0sR0FBRyxNQUFNLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQztZQUNqQyxJQUFJLENBQUMsU0FBUyxHQUFHLE1BQU0sQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDO1lBQ3ZDLE9BQU8sT0FBTyxDQUFDLE9BQU8sQ0FBQyxN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