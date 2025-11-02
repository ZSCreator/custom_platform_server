'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const BaseRobot_1 = require("../../../../common/pojo/baseClass/BaseRobot");
const utils = require("../../../../utils");
const qznnConst = require("../qznnConst");
const pinus_logger_1 = require("pinus-logger");
const log_logger = (0, pinus_logger_1.getLogger)('robot', __filename);
class qznnRobot extends BaseRobot_1.BaseRobot {
    constructor(opts) {
        super(opts);
        this.playTimes = 0;
        this.isPlayGame = 1;
        this.isTiaoKong = false;
        this.entryCond = 0;
        this.seat = opts.seat;
        this.initgold = 10000 * utils.random(3, 10);
        this.leaveTimes = utils.random(10, 20);
    }
    async loaded() {
        try {
            let result = await this.requestByRoute("qznnpp.mainHandler.loaded", {});
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
        this.Emitter.on('qz_onStart', (data) => {
            if (data.gamePlayer.find(pl => pl && pl.uid == this.uid)) {
                this.isPlayGame = 1;
            }
        });
        this.Emitter.on("qz_onRobzhuang", this.onfahua.bind(this));
        this.Emitter.on("qz_onSettlement", this.onEndRound.bind(this));
        this.Emitter.on("qz_onReadybet", this.onReadybet.bind(this));
        this.Emitter.on("qz_onLook", this.onLook.bind(this));
    }
    onLook(data) {
    }
    async onReadybet(data) {
        if (data.zhuangInfo.uid == this.uid) {
            return;
        }
        if (!data.players.find(pl => pl && pl.uid == this.uid)) {
            return;
        }
        if (this.isPlayGame == 0) {
            return;
        }
        let betNum = 5;
        let ran = utils.random(1, 100);
        if (this.isTiaoKong) {
            if (ran <= 30) {
                betNum = qznnConst.xj_bet_arr[1];
            }
            else if (ran > 30 && ran <= 60) {
                betNum = qznnConst.xj_bet_arr[2];
            }
            else {
                betNum = qznnConst.xj_bet_arr[3];
            }
        }
        else {
            if (ran <= 80) {
                betNum = qznnConst.xj_bet_arr[0];
            }
            else if (ran > 80 && ran <= 95) {
                betNum = qznnConst.xj_bet_arr[1];
            }
            else if (ran > 95 && ran <= 99) {
                betNum = qznnConst.xj_bet_arr[2];
            }
            else {
                betNum = qznnConst.xj_bet_arr[3];
            }
        }
        try {
            await this.delayRequest("qznnpp.mainHandler.bet", { betNum: betNum }, utils.random(1, 3) * 1000);
        }
        catch (error) {
            log_logger.warn(`qznnpp.mainHandler.bet|${JSON.stringify(error)}`);
        }
    }
    async onfahua(onfa) {
        let isQz = 0;
        const ran = utils.random(1, 100);
        if (ran > 35 && ran <= 60) {
            isQz = 1;
        }
        else if (ran > 60 && ran <= 85) {
            isQz = 2;
        }
        else if (ran > 85) {
            isQz = 3;
        }
        try {
            await this.delayRequest("qznnpp.mainHandler.robzhuang", { mul: isQz }, utils.random(1, 3) * 1000);
        }
        catch (error) {
            log_logger.warn(`qznnpp.mainHandler.robzhuang|${JSON.stringify(error)}`);
        }
    }
    qzUtil(robotHands_c) {
        let robotHands = robotHands_c.map(m => {
            let num = m % 13 + 1;
            (num >= 10) && (num = 10);
            return num;
        });
        let isQiang = 0;
        for (let i of robotHands) {
            if (utils.sum(i) % 10 == 0) {
                isQiang = 1;
                break;
            }
        }
        return isQiang;
    }
    async onEndRound(res) {
        setTimeout(() => {
            this.destroy();
        }, utils.random(1, 3) * 10);
    }
}
exports.default = qznnRobot;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicXpubnBwcm9ib3QuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9hcHAvc2VydmVycy9xem5ucHAvbGliL3JvYm90L3F6bm5wcHJvYm90LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLFlBQVksQ0FBQzs7QUFDYiwyRUFBd0U7QUFDeEUsMkNBQTRDO0FBQzVDLDBDQUEyQztBQUMzQywrQ0FBd0M7QUFDeEMsTUFBTSxVQUFVLEdBQUcsSUFBQSx3QkFBUyxFQUFDLE9BQU8sRUFBRSxVQUFVLENBQUMsQ0FBQztBQUdsRCxNQUFxQixTQUFVLFNBQVEscUJBQVM7SUFXOUMsWUFBWSxJQUFTO1FBQ25CLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQztRQVJkLGNBQVMsR0FBVyxDQUFDLENBQUM7UUFFdEIsZUFBVSxHQUFVLENBQUMsQ0FBQztRQUN0QixlQUFVLEdBQVksS0FBSyxDQUFDO1FBRzVCLGNBQVMsR0FBVyxDQUFDLENBQUM7UUFHcEIsSUFBSSxDQUFDLElBQUksR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDO1FBQ3RCLElBQUksQ0FBQyxRQUFRLEdBQUcsS0FBSyxHQUFHLEtBQUssQ0FBQyxNQUFNLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDO1FBQzVDLElBQUksQ0FBQyxVQUFVLEdBQUcsS0FBSyxDQUFDLE1BQU0sQ0FBQyxFQUFFLEVBQUUsRUFBRSxDQUFDLENBQUM7SUFDekMsQ0FBQztJQUVELEtBQUssQ0FBQyxNQUFNO1FBQ1YsSUFBSTtZQUNGLElBQUksTUFBTSxHQUFHLE1BQU0sSUFBSSxDQUFDLGNBQWMsQ0FBQywyQkFBMkIsRUFBRSxFQUFFLENBQUMsQ0FBQztZQUV4RSxJQUFJLENBQUMsU0FBUyxHQUFHLE1BQU0sQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDO1lBQ3ZDLE9BQU8sT0FBTyxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQztTQUNoQztRQUFDLE9BQU8sS0FBSyxFQUFFO1lB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