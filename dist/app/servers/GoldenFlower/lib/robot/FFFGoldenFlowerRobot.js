'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const BaseRobot_1 = require("../../../../common/pojo/baseClass/BaseRobot");
const commonUtil = require("../../../../utils/lottery/commonUtil");
const GoldenFlower_logic = require("../GoldenFlower_logic");
const utils = require("../../../../utils/index");
const pinus_logger_1 = require("pinus-logger");
const logger = (0, pinus_logger_1.getLogger)('robot_out', __filename);
class ZhaJinHuaRobot extends BaseRobot_1.BaseRobot {
    constructor(opts) {
        super(opts);
        this.capBet = 0;
        this.lowBet = 0;
        this.status = "NONE";
        this.iskanpai = false;
        this.players = [];
        this.OR = 0;
        this.OC = 0;
        this.room_status = 'NONE';
        this.cards_type = 0;
        this.Holds = [];
        this.Holds_type = 0;
        this.total_Player_size = 0;
        this.bipai_num = 0;
        this.OperOne = false;
        this.seat = opts.seat;
        this.betNum = opts.betNum;
    }
    async zhaJinHuaLoaded() {
        try {
            const loadedData = await this.requestByRoute('GoldenFlower.mainHandler.loaded', {});
            this.seat = loadedData.seat;
            this.capBet = loadedData.capBet;
            this.lowBet = loadedData.lowBet;
        }
        catch (error) {
            logger.warn(`zhaJinHuaLoaded|${this.uid}|${JSON.stringify(error)}`);
            return Promise.reject(error);
        }
    }
    async destroy() {
        await this.leaveGameAndReset(false);
    }
    registerListener() {
        this.Emitter.on("ZJH_onOpts", this.onZhaJinHuaOpts.bind(this));
        this.Emitter.on("ZJH_onSettlement", this.onZhaJinHuaSettle.bind(this));
        this.Emitter.on("ZJH_onFahua", this.msg_GoldenFlower_oper_c.bind(this));
        this.Emitter.on("ZJH_onDeal", (data) => {
            this.players = data.players.map(c => {
                return {
                    seat: c.seat,
                    kanpai: false,
                    fold: false,
                    OR: 0,
                    OC: 0
                };
            });
            this.room_status == "INGAME";
        });
    }
    onZhaJinHuaOpts(optsData) {
        let temp = this.players.find(c => c.seat == optsData.seat);
        if (optsData.type == 'kanpai') {
            if (temp) {
                temp.kanpai = true;
            }
            this.total_Player_size++;
            this.betNum = optsData.betNum;
        }
        else if (optsData.type == 'filling') {
            this.betNum = optsData.betNum;
            if (temp.kanpai) {
                if (optsData.seat != this.seat) {
                    this.OR++;
                }
                temp.OR++;
            }
        }
        else if (optsData.type == 'cingl') {
            if (temp.kanpai) {
                if (optsData.seat != this.seat) {
                    this.OC++;
                }
                temp.OC++;
            }
        }
        else if (optsData.type == 'bipai') {
            if (optsData["iswin"] == false) {
                if (temp) {
                    temp.fold = true;
                }
            }
            else {
                let other = this.players.find(c => c.seat == optsData.other);
                if (other) {
                    other.fold = true;
                }
                temp.OC++;
            }
            this.OC++;
            if (optsData.seat != this.seat && optsData.other != this.seat) {
                this.bipai_num++;
            }
            this.betNum = optsData.betNum;
        }
        else if (optsData.type == "allin") {
            this.bipai_num++;
        }
        else if (optsData.type == "fold") {
            if (temp) {
                temp.fold = true;
            }
        }
    }
    onZhaJinHuaSettle(settleData) {
        this.clear_delayRequest_time();
        setTimeout(() => {
            this.destroy();
        }, utils.random(1, 3) * 10);
    }
    async msg_GoldenFlower_oper_c(data) {
        const delayTime = commonUtil.randomFromRange(1000, 3000);
        this.betNum = data.betNum;
        let rand = commonUtil.randomFromRange(1, 100);
        const rand2 = commonUtil.randomFromRange(1, 100);
        if (data.fahuaIdx !== this.seat) {
            if (this.OperOne && !this.iskanpai && rand <= 20) {
                await this.zhaJinHuaKanPai();
            }
            return;
        }
        this.OperOne = true;
        if (data.roundTimes == 1) {
            if (this.betNum == this.lowBet) {
                if (rand <= 80) {
                    await this.zhaJinHuaCingl(delayTime);
                    return;
                }
                else {
                    if (rand2 <= 85) {
                        await this.zhaJinHuaFilling(this.lowBet * 2);
                        return;
                    }
                    else if (rand2 <= 95) {
                        await this.zhaJinHuaFilling(this.lowBet * 5);
                        return;
                    }
                    await this.zhaJinHuaFilling(this.lowBet * 10);
                    return;
                }
            }
            else if (this.betNum == this.lowBet * 2) {
                if (rand <= 90) {
                    await this.zhaJinHuaCingl(delayTime);
                    return;
                }
                else {
                    if (rand2 <= 50) {
                        await this.zhaJinHuaFilling(this.lowBet * 5);
                        return;
                    }
                    await this.zhaJinHuaFilling(this.lowBet * 10);
                    return;
                }
            }
            else if (this.betNum == this.lowBet * 5) {
                if (rand <= 95) {
                    await this.zhaJinHuaCingl(delayTime);
                    return;
                }
                else {
                    await this.zhaJinHuaFilling(this.lowBet * 10);
                    return;
                }
            }
            if (this.betNum > this.lowBet) {
                await this.zhaJinHuaCingl(delayTime);
                return;
            }
        }
        if (this.total_Player_size == 0) {
            if (rand <= 20) {
                await this.zhaJinHuaCingl(delayTime);
                return;
            }
            else if (rand > 20 && rand <= 25) {
                if (this.betNum == this.lowBet) {
                    await this.zhaJinHuaFilling(this.lowBet * 2);
                    return;
                }
                else if (this.betNum == 2 * this.lowBet) {
                    await this.zhaJinHuaFilling(this.lowBet * 5);
                    return;
                }
                await this.zhaJinHuaCingl(delayTime);
                return;
            }
            else {
                await this.zhaJinHuaKanPai();
            }
        }
        if (!this.iskanpai) {
            if (rand <= 10) {
                return this.fn1([0, 100, 0, 0], data);
            }
            else if (rand > 10 && rand <= 15) {
                return this.fn1([0, 0, 100, 0], data);
            }
            else {
                await this.zhaJinHuaKanPai();
            }
        }
        let action_ran = [0, 0, 0, 100];
        let ret = this.rule1(data);
        if (ret != null) {
            return this.fn1(ret, data);
        }
        let ret2 = this.rule2(data);
        let ret3 = this.rule3(data);
        if (ret2 != null) {
            if (ret3[0] > 0) {
                action_ran = ret3;
            }
            else {
                action_ran = ret2;
            }
        }
        else {
            action_ran = ret3;
        }
        if (data['max_uid'] == this.uid) {
            action_ran[0] = 0;
            action_ran[1] += 10;
        }
        return this.fn1(action_ran, data);
    }
    rule1(data) {
        if (data.roundTimes >= 3) {
            if (this.players.filter(pl => pl && !pl.kanpai).length >= 2) {
                let action_ran = [0, 0, 0, 50];
                return action_ran;
            }
        }
        return null;
    }
    rule2(data) {
        let action_ran = [0, 0, 0, 100];
        const pls = this.players.filter(pl => pl && pl.kanpai == true && pl.seat != this.seat);
        for (const pl of pls) {
            if ([1, 2, 3].includes(this.Holds_type)) {
                if (pl.OC + pl.OR > 1) {
                    return action_ran;
                }
            }
            else if ([4].includes(this.Holds_type)) {
                if (pl.OC + pl.OR > 2) {
                    return action_ran;
                }
            }
            else if ([5].includes(this.Holds_type)) {
                if (pl.OC + pl.OR > 3) {
                    return action_ran;
                }
            }
            else if ([6].includes(this.Holds_type)) {
                if (pl.OC + pl.OR > 5) {
                    return action_ran;
                }
            }
            else if ([7].includes(this.Holds_type)) {
                if (pl.OC + pl.OR > 8) {
                    return action_ran;
                }
            }
            else if ([8].includes(this.Holds_type)) {
                if (pl.OC + pl.OR > 12) {
                    return action_ran;
                }
            }
            else if ([9].includes(this.Holds_type)) {
                if (pl.OC + pl.OR > 16) {
                    return action_ran;
                }
            }
            else {
            }
        }
        return null;
    }
    rule3(data) {
        let action_ran = [0, 0, 0, 100];
        if (this.players.length == 2) {
            if ([1].includes(this.Holds_type)) {
                if (this.OR == 0 && this.OC <= 1) {
                    action_ran = [90, 5, 5, 0];
                }
                else {
                    action_ran = [100, 0, 0, 0];
                }
            }
            else if ([2].includes(this.Holds_type)) {
                if (this.OR == 0 && this.OC <= 1) {
                    action_ran = [5, 40, 40, 20];
                }
                else {
                    action_ran = [60, 0, 0, 40];
                }
            }
            else if ([3].includes(this.Holds_type)) {
                if (this.OR == 0 && this.OC <= 1) {
                    action_ran = [0, 50, 50, 0];
                }
                else {
                    action_ran = [0, 20, 20, 60];
                }
            }
            else {
                if (this.OR == 0 && this.OC <= 1) {
                    action_ran = [0, 50, 50, 0];
                }
                else if (this.OC > 1) {
                    action_ran = [0, 50, 50, 0];
                }
                else if (this.OR >= 1) {
                    action_ran = [0, 50, 50, 0];
                }
            }
        }
        else if (this.players.length == 3) {
            if ([1, 2].includes(this.Holds_type)) {
                if (this.OR == 0 && this.OC <= 1) {
                    action_ran = [90, 5, 5, 0];
                }
                else if (this.OR == 0 && this.OC >= 2) {
                    action_ran = [100, 0, 0, 0];
                }
                else if (this.OC > 2) {
                    action_ran = [100, 0, 0, 0];
                }
                else {
                    action_ran = [50, 0, 0, 50];
                }
            }
            else if ([3].includes(this.Holds_type)) {
                if (this.OR == 0 && this.OC <= 1) {
                    action_ran = [0, 60, 20, 20];
                }
                else if (this.OR == 0 && (this.OC == 1 || this.OC == 2)) {
                    action_ran = [10, 20, 10, 60];
                }
                else if (this.OC > 2) {
                    action_ran = [50, 0, 0, 50];
                }
                else {
                    action_ran = [50, 0, 0, 50];
                }
            }
            else if ([4].includes(this.Holds_type)) {
                if (this.OR == 0 && this.OC <= 1) {
                    action_ran = [0, 50, 50, 0];
                }
                else if (this.OR == 0 && (this.OC == 1 || this.OC == 2)) {
                    action_ran = [0, 30, 0, 70];
                }
                else if (this.OC > 2) {
                    action_ran = [0, 0, 0, 100];
                }
                else {
                    action_ran = [0, 20, 20, 60];
                }
            }
            else {
                if (this.OR == 0 && this.OC <= 1) {
                    action_ran = [0, 50, 50, 0];
                }
                else if (this.OR == 0 && (this.OC == 2 || this.OC == 3)) {
                    action_ran = [0, 50, 50, 0];
                }
                else if (this.OC > 3) {
                    action_ran = [0, 100, 0, 0];
                }
                else {
                    action_ran = [0, 50, 50, 0];
                }
            }
        }
        else if (this.players.length == 4) {
            if ([1, 2].includes(this.Holds_type)) {
                if (this.OR == 0 && this.OC < 1) {
                    action_ran = [90, 5, 5, 0];
                }
                else if (this.OR == 0 && [1, 2].includes(this.OC)) {
                    action_ran = [100, 0, 0, 0];
                }
                else if (this.OC > 2) {
                    action_ran = [100, 0, 0, 0];
                }
                else if (this.OR >= 1) {
                    action_ran = [100, 0, 0, 0];
                }
            }
            else if ([3].includes(this.Holds_type)) {
                if (this.OR == 0 && this.OC < 1) {
                    action_ran = [0, 50, 5, 45];
                }
                else if (this.OR == 0 && [1, 2].includes(this.OC)) {
                    action_ran = [10, 10, 0, 80];
                }
                else if (this.OC > 2) {
                    action_ran = [80, 0, 0, 20];
                }
                else if (this.OR >= 1) {
                    action_ran = [80, 0, 0, 20];
                }
            }
            else if ([4].includes(this.Holds_type)) {
                if (this.OR == 0 && this.OC <= 1) {
                    action_ran = [0, 50, 50, 0];
                }
                else if (this.OR == 0 && [1, 2, 3].includes(this.OC)) {
                    action_ran = [0, 30, 0, 70];
                }
                else if (this.OC > 3) {
                    action_ran = [0, 0, 0, 100];
                }
                else if (this.OR >= 1) {
                    action_ran = [0, 20, 20, 60];
                }
            }
            else {
                if (this.OR == 0 && this.OC <= 1) {
                    action_ran = [0, 50, 50, 0];
                }
                else if (this.OR == 0 && [2, 3].includes(this.OC)) {
                    action_ran = [0, 50, 50, 0];
                }
                else if (this.OC > 3) {
                    action_ran = [0, 100, 0, 0];
                }
                else if (this.OR >= 1) {
                    action_ran = [0, 50, 50, 0];
                }
            }
        }
        else if (this.players.length == 5) {
            if ([1, 2].includes(this.Holds_type)) {
                if (this.OR == 0 && this.OC < 1) {
                    action_ran = [90, 5, 5, 0];
                }
                else if (this.OR == 0 && [1, 2].includes(this.OC)) {
                    action_ran = [100, 0, 0, 0];
                }
                else if (this.OC > 2) {
                    action_ran = [100, 0, 0, 0];
                }
                else if (this.OR >= 1) {
                    action_ran = [100, 0, 0, 0];
                }
            }
            else if ([3].includes(this.Holds_type)) {
                if (this.OR == 0 && this.OC < 1) {
                    action_ran = [0, 50, 5, 45];
                }
                else if (this.OR == 0 && [1, 2].includes(this.OC)) {
                    action_ran = [10, 10, 0, 80];
                }
                else if (this.OC > 2) {
                    action_ran = [80, 0, 0, 20];
                }
                else if (this.OR >= 1) {
                    action_ran = [80, 0, 0, 20];
                }
            }
            else if ([4].includes(this.Holds_type)) {
                if (this.OR == 0 && this.OC <= 1) {
                    action_ran = [0, 50, 50, 0];
                }
                else if (this.OR == 0 && [1, 2, 3].includes(this.OC)) {
                    action_ran = [0, 30, 0, 70];
                }
                else if (this.OC > 3) {
                    action_ran = [0, 0, 0, 100];
                }
                else if (this.OR >= 1) {
                    action_ran = [0, 20, 20, 60];
                }
            }
            else {
                if (this.OR == 0 && this.OC <= 1) {
                    action_ran = [0, 50, 50, 0];
                }
                else if (this.OR == 0 && [2, 3].includes(this.OC)) {
                    action_ran = [0, 50, 50, 0];
                }
                else if (this.OC > 3) {
                    action_ran = [0, 100, 0, 0];
                }
                else if (this.OR >= 1) {
                    action_ran = [0, 50, 50, 0];
                }
            }
        }
        return action_ran;
    }
    fn1(action_ran, data) {
        let action = "";
        let sum = action_ran.reduce((res, val) => res + val, 0);
        let rand = commonUtil.randomFromRange(1, sum);
        const delayTime = commonUtil.randomFromRange(1000, 3000);
        let weightIndex = 0;
        while (sum > 0) {
            sum = sum - action_ran[weightIndex];
            if (sum < rand) {
                if (weightIndex == 0)
                    action = "F";
                if (weightIndex == 1)
                    action = "C";
                if (weightIndex == 2)
                    action = "R";
                if (weightIndex == 3)
                    action = "S";
                break;
            }
            weightIndex = weightIndex + 1;
        }
        if (data['max_uid'] == this.uid) {
            if (action == "F") {
                action = "C";
            }
        }
        if (action == "F") {
            return this.zhaJinHuaFold();
        }
        else if (action == "C") {
            return this.zhaJinHuaCingl(delayTime);
        }
        else if (action == "R") {
            if (this.betNum == this.lowBet) {
                return this.zhaJinHuaFilling(this.lowBet * 2);
            }
            else if (this.betNum == 2 * this.lowBet) {
                return this.zhaJinHuaFilling(this.lowBet * 5);
            }
            else if (this.betNum == 5 * this.lowBet) {
                return this.zhaJinHuaFilling(this.lowBet * 10);
            }
            return this.zhaJinHuaCingl(delayTime);
        }
        else if (action == "S") {
            return this.zhaJinHuaApplyAndBiPai(data);
        }
        console.warn("GoldenFlower_sss", `${this.players.length}|Holds_type:${this.Holds_type}`);
        console.warn(`rand:${rand},OR:${this.OR}, OC:${this.OC}`, action_ran.toString());
    }
    async zhaJinHuaKanPai() {
        try {
            const delayTime = commonUtil.randomFromRange(1000, 5000);
            const data = await this.delayRequest('GoldenFlower.mainHandler.kanpai', {}, delayTime);
            this.Holds = data.holds.cards;
            this.cards_type = data.holds.type;
            this.iskanpai = true;
            this.Holds_type = GoldenFlower_logic.getAi_type(this.Holds, this.cards_type);
        }
        catch (error) {
            logger.info(`zhaJinHuaKanPai|${this.uid}|${JSON.stringify(error)}`);
        }
    }
    async zhaJinHuaCingl(delayTime) {
        try {
            const cinglRoute = 'GoldenFlower.mainHandler.cingl';
            let res = await this.delayRequest(cinglRoute, {}, delayTime);
        }
        catch (error) {
            const res = await this.delayRequest("GoldenFlower.mainHandler.Allfighting", {}, 500);
        }
    }
    async zhaJinHuaApplyAndBiPai(onfa) {
        try {
            const delayTime = commonUtil.randomFromRange(1000, 3000);
            if (onfa.allin) {
                const res = await this.delayRequest("GoldenFlower.mainHandler.Allfighting", {}, delayTime);
            }
            else {
                const res = await this.delayRequest("GoldenFlower.mainHandler.applyBipai", {}, delayTime);
                if (!res || !Array.isArray(res.list) || !res.list.length) {
                    return;
                }
                let ran = res.list.find(c => c.holdStatus == 1);
                if (!ran) {
                    ran = commonUtil.randomFromRange(0, res.list.length - 1);
                    ran = res.list[ran];
                }
                await this.delayRequest("GoldenFlower.mainHandler.bipai", { seat: ran.seat }, 500);
            }
        }
        catch (error) {
            logger.warn(`zhaJinHuaApplyBipai|${this.uid}|${JSON.stringify(error)}|${onfa.allin}|${onfa.canBipai}`);
        }
    }
    async zhaJinHuaFilling(multiple) {
        let res;
        try {
            let delayTime = commonUtil.randomFromRange(1000, 3000);
            res = await this.delayRequest("GoldenFlower.mainHandler.filling", { multiple }, delayTime);
            this.betNum = res.betNum;
        }
        catch (error) {
            logger.info(`zhaJinHuaFilling|${this.uid}|${JSON.stringify(error)}`);
            res = await this.zhaJinHuaCingl(0);
        }
    }
    async zhaJinHuaFold() {
        const delayTime = commonUtil.randomFromRange(1000, 3000);
        try {
            if (!this.iskanpai) {
                await this.zhaJinHuaKanPai();
            }
            const cinglRoute = 'GoldenFlower.mainHandler.fold';
            if (delayTime) {
                await this.delayRequest(cinglRoute, {}, delayTime);
            }
            else {
                await this.requestByRoute(cinglRoute, {});
            }
            this.status = 'NONE';
        }
        catch (error) {
            logger.warn(`zhaJinHuaFold|${this.uid}|${JSON.stringify(error)}`);
        }
    }
}
exports.default = ZhaJinHuaRobot;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiRkZGR29sZGVuRmxvd2VyUm9ib3QuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9hcHAvc2VydmVycy9Hb2xkZW5GbG93ZXIvbGliL3JvYm90L0ZGRkdvbGRlbkZsb3dlclJvYm90LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLFlBQVksQ0FBQzs7QUFHYiwyRUFBd0U7QUFDeEUsbUVBQW1FO0FBRW5FLDREQUE2RDtBQUU3RCxpREFBa0Q7QUFHbEQsK0NBQXlDO0FBQ3pDLE1BQU0sTUFBTSxHQUFHLElBQUEsd0JBQVMsRUFBQyxXQUFXLEVBQUUsVUFBVSxDQUFDLENBQUM7QUFJbEQsTUFBcUIsY0FBZSxTQUFRLHFCQUFTO0lBdUNqRCxZQUFZLElBQVM7UUFDakIsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDO1FBbENoQixXQUFNLEdBQVcsQ0FBQyxDQUFDO1FBRW5CLFdBQU0sR0FBVyxDQUFDLENBQUM7UUFFbkIsV0FBTSxHQUF5QyxNQUFNLENBQUM7UUFFdEQsYUFBUSxHQUFZLEtBQUssQ0FBQztRQUMxQixZQUFPLEdBUUQsRUFBRSxDQUFDO1FBRVQsT0FBRSxHQUFXLENBQUMsQ0FBQztRQUVmLE9BQUUsR0FBVyxDQUFDLENBQUM7UUFFZixnQkFBVyxHQUFXLE1BQU0sQ0FBQztRQUU3QixlQUFVLEdBQVcsQ0FBQyxDQUFDO1FBRXZCLFVBQUssR0FBYSxFQUFFLENBQUM7UUFFckIsZUFBVSxHQUErQyxDQUFDLENBQUM7UUFFM0Qsc0JBQWlCLEdBQUcsQ0FBQyxDQUFDO1FBQ3RCLGNBQVMsR0FBRyxDQUFDLENBQUM7UUFFZCxZQUFPLEdBQUcsS0FBSyxDQUFDO1FBR1osSUFBSSxDQUFDLElBQUksR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDO1FBQ3RCLElBQUksQ0FBQyxNQUFNLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQztJQUM5QixDQUFDO0lBR0QsS0FBSyxDQUFDLGVBQWU7UUFDakIsSUFBSTtZQUNBLE1B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