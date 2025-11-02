'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const BaseRobot_1 = require("../../../../common/pojo/baseClass/BaseRobot");
const commonUtil = require("../../../../utils/lottery/commonUtil");
const JsonMgr = require("../../../../../config/data/JsonMgr");
const utils = require("../../../../utils");
const TeenPatti_logic = require("../TeenPatti_logic");
const pinus_logger_1 = require("pinus-logger");
const robotlogger = (0, pinus_logger_1.getLogger)('robot_out', __filename);
const bet_arr = [
    [100, 200, 500, 1000],
    [500, 1000, 2500, 5000],
    [1000, 2000, 5000, 10000],
    [2000, 4000, 10000, 20000],
];
class ZhaJinHuaRobot extends BaseRobot_1.BaseRobot {
    constructor(opts) {
        super(opts);
        this.playRound = 0;
        this.playerGold = 0;
        this.multipleLimit = 0;
        this.lowBet = 0;
        this.entryCond = 0;
        this.initGold = 0;
        this.bipai_num = 0;
        this.iskanpai = false;
        this.apply_kanpai = false;
        this.Kanpai_size = 0;
        this.Fill_num = 0;
        this.cingl_num = 0;
        this.room_status = 'NONE';
        this.cards_type = 0;
        this.rank = 0;
        this.Holds = [];
        this.Holds_type = "";
        this.record_history = [];
        this.isfold = false;
        this.isInit = false;
        this.next_action = "";
        this.rejectBiPai = 0;
        this.rejectBiPai_numb = 0;
        this.seat = opts.seat;
        this.betNum = opts.betNum;
        this.zjhConfig = JsonMgr.get('robot/zjhConfig').datas;
    }
    async Loaded() {
        try {
            const loadedData = await this.requestByRoute('TeenPatti.mainHandler.loaded', {});
            this.seat = loadedData.seat;
            this.room_status = loadedData.room.status;
            this.lowBet = loadedData.lowBet;
            this.playerGold = loadedData.room.players.find(c => c && c.uid == this.uid);
        }
        catch (error) {
            robotlogger.warn(`TeenPatti|${this.uid}|${JSON.stringify(error)}`);
            return Promise.reject(error);
        }
    }
    async destroy() {
        await this.leaveGameAndReset(false);
        this.zjhConfig = null;
    }
    registerListener() {
        this.Emitter.on("TeenPatti_onOpts", this.onZhaJinHuaOpts.bind(this));
        this.Emitter.on("TeenPatti_onSettlement", this.onZhaJinHuaSettle.bind(this));
        this.Emitter.on("TeenPatti_onFahua", this.msg_jh_oper_c.bind(this));
        this.Emitter.on("TeenPatti_onDeal", (data) => {
        });
        this.Emitter.on("TeenPatti_test", (data) => {
        });
    }
    onZhaJinHuaOpts(optsData) {
        if (optsData.type == 'kanpai') {
            this.Kanpai_size++;
            if (optsData.seat == this.seat) {
                this.iskanpai = true;
            }
        }
        else if (optsData.type == 'filling') {
            this.Fill_num++;
        }
        else if (optsData.type == 'applyBipai') {
            if (optsData.other == this.seat) {
                let type = 0;
                let ran = commonUtil.randomFromRange(1, 100);
                if (this.Holds_type == 'Y2' ||
                    this.Holds_type == 'Y3') {
                }
                else if ((this.Holds_type == "Y4" || this.Holds_type == "Y5") && ran <= 50) {
                    type = 1;
                }
                else if (this.Holds_type == "Y6" || this.Holds_type == "Y7") {
                    this.rejectBiPai_numb--;
                    if (this.rejectBiPai_numb == 0 && ran <= 50) {
                        type = 1;
                    }
                }
                this.handler_agreeBiPai(type);
            }
            this.bipai_num++;
        }
        else if (optsData.type == "rejectBiPai") {
            if (optsData.other == this.seat) {
                this.rejectBiPai++;
                if (this.Holds_type == 'Y2' ||
                    this.Holds_type == 'Y3') {
                    this.next_action = "Fold";
                }
                else if (this.rejectBiPai >= 2 && (this.Holds_type == "Y4" || this.Holds_type == "Y5")) {
                    this.next_action = "Fold";
                }
            }
            this.bipai_num++;
        }
        else if (optsData.type == "cingl") {
            this.cingl_num++;
        }
    }
    onZhaJinHuaSettle(settleData) {
        this.clear_delayRequest_time();
        setTimeout(() => {
            this.destroy();
        }, utils.random(1, 3) * 10);
    }
    async msg_jh_oper_c(data_) {
        const time = `${utils.random(0, 9)}${utils.random(0, 9)}${utils.random(0, 9)}${utils.random(0, 9)}`;
        let ran = commonUtil.randomFromRange(1, 100);
        if (this.isfold)
            return;
        this.betNum = data_.betNum;
        let flag = this.multipleLimit / 2 == this.betNum ? true : false;
        if (data_.fahuaIdx !== this.seat) {
            if (data_.canKanpai && ran <= 50) {
                await this.handler_kanpai(data_, 1, time);
            }
            return;
        }
        if (data_['max_uid'] == this.uid && data_.isControl) {
            this.Holds_type = "Y7";
        }
        if (this.iskanpai) {
            return this.afterSee(data_, time);
        }
        if (this.Kanpai_size == 0 && this.Fill_num == 0 && this.cingl_num == 0) {
            if (ran <= 30) {
                return this.handler_Cingl(time);
            }
            else if (ran >= 31 && ran <= 40) {
                return this.handler_Filling();
            }
            else {
                await this.handler_kanpai(data_, 2, null);
                return this.afterSee(data_, time);
            }
        }
        else {
            if (ran <= 5) {
                return this.handler_Cingl(time);
            }
            else if (ran >= 6 && ran <= 10) {
                return this.handler_Filling();
            }
            else {
                await this.handler_kanpai(data_, 2, null);
                return this.afterSee(data_, time);
            }
        }
    }
    async afterSee(data, time) {
        let flag = this.multipleLimit / 2 == this.betNum ? true : false;
        let ran = commonUtil.randomFromRange(1, 100);
        let actionState = "";
        if (this.Holds_type == "Y1") {
            actionState = "Fold";
        }
        else if (this.Holds_type == "Y2") {
            if (this.bipai_num > 0) {
                actionState = "Fold";
            }
            else {
                if (this.Fill_num + this.cingl_num > 0 && ran <= 50) {
                    actionState = "Fold";
                }
                else {
                    actionState = "bipai";
                }
            }
        }
        else if (this.Holds_type == "Y3") {
            if (this.bipai_num >= 2) {
                actionState = ran >= 50 ? "Fold" : "bipai";
            }
            else if (this.Fill_num > 0) {
                actionState = ran >= 50 ? "Fold" : "bipai";
            }
            else if (this.cingl_num >= 3) {
                actionState = "Fold";
            }
            else {
                actionState = "bipai";
            }
        }
        else if (this.Holds_type == "Y4") {
            if (this.bipai_num >= 2 || this.Fill_num >= 0 || this.cingl_num >= 3 ||
                data.totalBet >= this.lowBet * 16) {
                actionState = "bipai";
            }
            else {
                actionState = ran >= 50 ? "Fold" : "bipai";
                if (data.max_uid == this.uid) {
                    actionState = "bipai";
                }
            }
        }
        else if (this.Holds_type == "Y5") {
            if (this.Kanpai_size >= 4 || data.totalBet >= this.lowBet * 32) {
                actionState = "bipai";
            }
            else {
                actionState = ran >= 50 ? "Cingl" : "filling";
            }
        }
        else if (this.Holds_type == "Y6") {
            if (data.totalBet >= this.lowBet * 32) {
                actionState = "bipai";
            }
            else {
                actionState = ran >= 50 ? "Cingl" : "filling";
            }
        }
        else if (this.Holds_type == "Y7") {
            actionState = ran >= 50 ? "Cingl" : "filling";
        }
        if (actionState == "bipai" && data.canBipai == false) {
            actionState = "Cingl";
        }
        if (this.next_action != "" && data.max_uid != this.uid) {
            actionState = this.next_action;
        }
        if (data.max_uid == this.uid && actionState == "Fold") {
            actionState = "bipai";
        }
        switch (actionState) {
            case "Cingl":
                if (this.playerGold < this.betNum * (data.member_num + 1) * 2) {
                    await this.handler_ApplyAndBiPai(time);
                }
                else {
                    await this.handler_Cingl(time);
                }
                break;
            case "bipai":
                await this.handler_ApplyAndBiPai(time);
                break;
            case "Fold":
                await this.handler_Fold(commonUtil.randomFromRange(1050, 3000));
                break;
            case "filling":
                if (this.playerGold < this.betNum * (data.member_num + 1) * 2) {
                    await this.handler_ApplyAndBiPai(time);
                }
                else if (this.betNum >= this.multipleLimit * this.lowBet) {
                    await this.handler_Cingl(time);
                }
                else {
                    await this.handler_Filling();
                }
                break;
            default:
                console.warn("actionState", 1000000, this.isInit, this.Holds_type, utils.cDate());
                break;
        }
    }
    async handler_kanpai(data, flag, time) {
        let delayTime = commonUtil.randomFromRange(1050, 3000);
        if (flag == 1)
            delayTime = 10;
        if (this.apply_kanpai)
            return;
        this.apply_kanpai = true;
        try {
            const res = await this.delayRequest('TeenPatti.mainHandler.kanpai', {}, delayTime);
            const { holds, type } = res;
            this.iskanpai = true;
            this.Holds = holds.cards;
            this.cards_type = holds.type;
            this.Holds_type = TeenPatti_logic.getAi_type(this.Holds, this.cards_type);
            if (data['max_uid'] == this.uid && data.isControl) {
                this.Holds_type = "Y7";
            }
            if (this.Holds_type == "Y6") {
                this.rejectBiPai_numb = 1;
            }
            else if (this.Holds_type == "Y7") {
                this.rejectBiPai_numb = 2;
            }
            this.record_history.push({ uid: this.uid, oper_type: `kanpai|${time}|${flag}`, update_time: utils.cDate() });
        }
        catch (error) {
            robotlogger.warn(`TeenPatti|KanPai|${this.uid}|${this.iskanpai}|${data.roundTimes}|${JSON.stringify(error)}`);
            for (const oper of this.record_history) {
                robotlogger.warn(`${oper.uid}|${oper.oper_type}|${oper.update_time}`);
            }
        }
    }
    async handler_Cingl(time) {
        const delayTime = commonUtil.randomFromRange(1000, 3000);
        try {
            let res = await this.delayRequest("TeenPatti.mainHandler.cingl", {}, delayTime);
            this.record_history.push({ uid: this.uid, oper_type: `cingl_2|${time}`, update_time: utils.cDate() });
            this.playerGold = res.gold;
        }
        catch (error) {
            robotlogger.warn(`TeenPatti|Cingl|${this.uid}|${JSON.stringify(error)}`);
        }
    }
    async handler_ApplyAndBiPai(time) {
        try {
            const delayTime = commonUtil.randomFromRange(1000, 3000);
            const res = await this.delayRequest("TeenPatti.mainHandler.applyBipai", {}, delayTime);
            this.record_history.push({ uid: this.uid, oper_type: `applyBipai_2|${time}`, update_time: utils.cDate() });
        }
        catch (error) {
            robotlogger.warn(`TeenPatti|applyBipai|${this.uid}|${JSON.stringify(error)}`);
            await this.handler_Cingl("");
        }
    }
    async handler_Filling() {
        try {
            let delayTime = commonUtil.randomFromRange(1000, 3000);
            let res = await this.delayRequest("TeenPatti.mainHandler.filling", {}, delayTime);
            this.record_history.push({ uid: this.uid, oper_type: 'filling', update_time: utils.cDate() });
            this.betNum = res.betNum;
            this.playerGold = res.gold;
        }
        catch (error) {
            robotlogger.warn(`TeenPatti|Filling|${this.uid}|${JSON.stringify(error)}`);
        }
    }
    async handler_Fold(delayTime) {
        try {
            const cinglRoute = 'TeenPatti.mainHandler.fold';
            await this.delayRequest(cinglRoute, { roomId: this.roomId }, delayTime);
            this.record_history.push({ uid: this.uid, oper_type: `fold|${delayTime}`, update_time: utils.cDate() });
            this.isfold = true;
        }
        catch (error) {
            robotlogger.warn(`TeenPatti|Fold|${this.uid}|${JSON.stringify(error)}`);
        }
    }
    async handler_agreeBiPai(type) {
        let delayTime = utils.random(1000, 3000);
        this.delayRequest("TeenPatti.mainHandler.agreeBiPai", { type: type }, delayTime);
    }
}
exports.default = ZhaJinHuaRobot;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVGVlblBhdHRpUm9ib3QuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9hcHAvc2VydmVycy9UZWVuUGF0dGkvbGliL3JvYm90L1RlZW5QYXR0aVJvYm90LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLFlBQVksQ0FBQzs7QUFHYiwyRUFBd0U7QUFDeEUsbUVBQW1FO0FBR25FLDhEQUE4RDtBQUM5RCwyQ0FBNEM7QUFHNUMsc0RBQXNEO0FBQ3RELCtDQUF5QztBQUN6QyxNQUFNLFdBQVcsR0FBRyxJQUFBLHdCQUFTLEVBQUMsV0FBVyxFQUFFLFVBQVUsQ0FBQyxDQUFDO0FBTXZELE1BQU0sT0FBTyxHQUFHO0lBQ1osQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxJQUFJLENBQUM7SUFDckIsQ0FBQyxHQUFHLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLENBQUM7SUFDdkIsQ0FBQyxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxLQUFLLENBQUM7SUFDekIsQ0FBQyxJQUFJLEVBQUUsSUFBSSxFQUFFLEtBQUssRUFBRSxLQUFLLENBQUM7Q0FDN0IsQ0FBQTtBQUVELE1BQXFCLGNBQWUsU0FBUSxxQkFBUztJQWdEakQsWUFBWSxJQUFTO1FBQ2pCLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQztRQS9DaEIsY0FBUyxHQUFXLENBQUMsQ0FBQztRQUN0QixlQUFVLEdBQVcsQ0FBQyxDQUFDO1FBTXZCLGtCQUFhLEdBQVcsQ0FBQyxDQUFDO1FBQzFCLFdBQU0sR0FBVyxDQUFDLENBQUM7UUFDbkIsY0FBUyxHQUFXLENBQUMsQ0FBQztRQUd0QixhQUFRLEdBQVcsQ0FBQyxDQUFDO1FBRXJCLGNBQVMsR0FBVyxDQUFDLENBQUM7UUFFdEIsYUFBUSxHQUFZLEtBQUssQ0FBQztRQUMxQixpQkFBWSxHQUFHLEtBQUssQ0FBQztRQUdyQixnQkFBVyxHQUFXLENBQUMsQ0FBQztRQUl4QixhQUFR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