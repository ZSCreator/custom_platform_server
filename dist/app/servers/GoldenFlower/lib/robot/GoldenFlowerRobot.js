'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const BaseRobot_1 = require("../../../../common/pojo/baseClass/BaseRobot");
const commonUtil = require("../../../../utils/lottery/commonUtil");
const zhaJinHuaRobotActionService = require("./GoldenFlowerRobotActionService");
const GoldenFlower_logic = require("../GoldenFlower_logic");
const JsonMgr = require("../../../../../config/data/JsonMgr");
const utils = require("../../../../utils/index");
const pinus_logger_1 = require("pinus-logger");
const logger = (0, pinus_logger_1.getLogger)('robot_out', __filename);
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
        this.capBet = 0;
        this.lowBet = 0;
        this.entryCond = 0;
        this.status = "NONE";
        this.initGold = 0;
        this.bipai_num = 0;
        this.iskanpai = false;
        this.PlayerKanpai_size = 0;
        this.isPlayerFill = 0;
        this.room_status = 'NONE';
        this.cards_type = 0;
        this.rank = 0;
        this.Holds = [];
        this.Holds_type = 0;
        this.leaveRound = commonUtil.randomFromRange(3, 15);
        this.seat = opts.seat;
        this.betNum = opts.betNum;
        this.zjhConfig = JsonMgr.get('robot/zjhConfig').datas;
    }
    async zhaJinHuaLoaded() {
        try {
            const loadedData = await this.requestByRoute('GoldenFlower.mainHandler.loaded', {});
            this.seat = loadedData.seat;
            this.capBet = loadedData.capBet;
            this.room_status = loadedData.room.status;
        }
        catch (error) {
            logger.warn(`zhaJinHuaLoaded|${this.uid}|${JSON.stringify(error)}`);
            return Promise.reject(error);
        }
    }
    async destroy() {
        await this.leaveGameAndReset(false);
        this.zjhConfig = null;
    }
    registerListener() {
        this.Emitter.on("ZJH_onOpts", this.onZhaJinHuaOpts.bind(this));
        this.Emitter.on("ZJH_onSettlement", this.onZhaJinHuaSettle.bind(this));
        this.Emitter.on("ZJH_onFahua", this.msg_GoldenFlower_oper_c.bind(this));
        this.Emitter.on("ZJH_onDeal", (data) => {
            data.players.forEach(m => {
                if (m.seat == this.seat && m.bet != 0) {
                    this.status = "GAME";
                }
            });
            this.room_status == "INGAME";
        });
    }
    onZhaJinHuaOpts(optsData) {
        if (optsData.type === 'kanpai') {
            this.PlayerKanpai_size++;
        }
        else if (optsData.type === 'filling') {
            this.isPlayerFill++;
        }
        else if (optsData.type === 'bipai') {
            this.bipai_num++;
        }
    }
    onZhaJinHuaSettle(settleData) {
        this.clear_delayRequest_time();
        setTimeout(() => {
            this.destroy();
        }, utils.random(1, 3) * 10);
    }
    async zhaJinHuaGetInning() {
        let inIngData;
        try {
            inIngData = await this.requestByRoute('GoldenFlower.mainHandler.getInning', {});
            if (!inIngData || !Array.isArray(inIngData.Holds)) {
                return;
            }
            for (let stripRobot of inIngData.Holds) {
                if (stripRobot && stripRobot.cards != null) {
                    this.Player_size++;
                }
            }
            for (let stripRobot of inIngData.Holds) {
                if (stripRobot && this.uid == stripRobot.uid) {
                    this.cards_type = stripRobot.cardType;
                    this.Holds = stripRobot.cards;
                    break;
                }
            }
            this.rank = 1;
            for (let stripRobot of inIngData.Holds) {
                if (stripRobot && stripRobot.cards != null && this.uid !== stripRobot.uid) {
                    let ret = GoldenFlower_logic.bipaiSole({ "cardType": this.cards_type, "cards": this.Holds }, { "cardType": stripRobot.cardType, "cards": stripRobot.cards });
                    let whoWin = ret > 0 ? { "cardType": this.cards_type, "cards": this.Holds } : { "cardType": stripRobot.cardType, "cards": stripRobot.cards };
                    if (whoWin.cards.toString() != this.Holds.toString()) {
                        this.rank++;
                    }
                }
            }
            for (let stripRobot of inIngData.Holds) {
                if (stripRobot && stripRobot.cards != null && 0 == stripRobot.isRobot) {
                    if (this.rank == 1) {
                        console.log(this.uid);
                    }
                    break;
                }
            }
            this.Holds_type = 0;
            if (this.cards_type == 5) {
                if (this.Holds[0] > 10) {
                    this.Holds_type = 1;
                }
                else {
                    this.Holds_type = 2;
                }
            }
            else if (this.cards_type == 4) {
                if (this.Holds[0] > 10) {
                    this.Holds_type = 3;
                }
                else {
                    this.Holds_type = 4;
                }
            }
            else if (this.cards_type == 3) {
                if (this.Holds[0] > 10) {
                    this.Holds_type = 5;
                }
                else {
                    this.Holds_type = 6;
                }
            }
            else if (this.cards_type == 2) {
                if (this.Holds[0] > 10) {
                    this.Holds_type = 7;
                }
                else {
                    this.Holds_type = 8;
                }
            }
            else if (this.cards_type == 1) {
                if (this.Holds[0] > 10) {
                    this.Holds_type = 9;
                }
                else {
                    this.Holds_type = 10;
                }
            }
            else if (this.cards_type == 0) {
                if (this.Holds[0] > 10) {
                    this.Holds_type = 11;
                }
                else {
                    this.Holds_type = 12;
                }
            }
        }
        catch (error) {
            logger.error(`zhaJinHuaGetInning|${this.uid}|${JSON.stringify(error)}`);
        }
    }
    async msg_GoldenFlower_oper_c(onfa) {
        this.betNum = onfa.betNum;
        let flag = this.capBet / 2 == this.betNum ? true : false;
        if (onfa.fahuaIdx !== this.seat) {
            if (onfa.canBipai == true && this.iskanpai == false) {
                let actionState = zhaJinHuaRobotActionService.Nokanpai_NewPlayerType(onfa.roundTimes, this.PlayerKanpai_size, this.rank, this.Holds_type, this.Player_size, this.cards_type, flag);
                if (onfa.canKanpai && actionState == "kanpai") {
                    await this.zhaJinHuaKanPai();
                }
            }
            return;
        }
        if (onfa.roundTimes === 1) {
            await this.zhaJinHuaGetInning();
        }
        if (this.iskanpai) {
            return this.afterSee(onfa);
        }
        let actionState = zhaJinHuaRobotActionService.Nokanpai_NewPlayerType(onfa.roundTimes, this.PlayerKanpai_size, this.rank, this.Holds_type, this.Player_size, this.cards_type, flag);
        if (actionState == "bipai" && onfa.canBipai == false) {
            actionState = "Cingl";
        }
        if (actionState == "kanpai" && onfa.canKanpai == false)
            actionState = "Cingl";
        switch (actionState) {
            case "Cingl":
                if (this.playerGold < this.betNum * (onfa.member_num + 1)) {
                    await this.zhaJinHuaApplyAndBiPai(onfa);
                }
                else {
                    await this.zhaJinHuaCingl(commonUtil.randomFromRange(1000, 3000));
                }
                break;
            case "kanpai":
                await this.zhaJinHuaKanPai();
                setTimeout(() => {
                    this.afterSee(onfa);
                }, commonUtil.randomFromRange(3000, 5000));
                break;
            case "bipai":
                await this.zhaJinHuaApplyAndBiPai(onfa);
                break;
            case "Fold":
                await this.zhaJinHuaFold();
                break;
            case "filling":
                if (this.playerGold < this.betNum * (onfa.member_num + 1)) {
                    await this.zhaJinHuaApplyAndBiPai(onfa);
                }
                else if (this.betNum >= this.capBet / 2) {
                    await this.zhaJinHuaCingl(commonUtil.randomFromRange(1000, 3000));
                }
                else {
                    let bet = bet_arr[this.sceneId].filter(gold => gold > this.capBet);
                    let multiple = Math.min(...bet, this.capBet);
                    await this.zhaJinHuaFilling(multiple);
                }
                break;
            default:
                console.warn("----1111");
                break;
        }
    }
    async afterSee(onfa) {
        let flag = this.capBet / 2 == this.betNum ? true : false;
        let aseeState = zhaJinHuaRobotActionService.kanpai_NewPlayerType(onfa.roundTimes, this.PlayerKanpai_size, this.rank, this.Holds_type, this.Player_size, this.cards_type, flag, this.nid, this.sceneId);
        if (aseeState == "bipai" && onfa.canBipai == false) {
            aseeState = "Cingl";
        }
        if (onfa.allin) {
            aseeState = "bipai";
        }
        switch (aseeState) {
            case "Cingl":
                if (this.playerGold < this.betNum * (onfa.member_num + 1) * 2) {
                    await this.zhaJinHuaApplyAndBiPai(onfa);
                }
                else {
                    await this.zhaJinHuaCingl(commonUtil.randomFromRange(1000, 3000));
                }
                break;
            case "bipai":
                await this.zhaJinHuaApplyAndBiPai(onfa);
                break;
            case "Fold":
                await this.zhaJinHuaFold();
                break;
            case "filling":
                if (this.playerGold < this.betNum * (onfa.member_num + 1) * 2) {
                    await this.zhaJinHuaApplyAndBiPai(onfa);
                }
                else if (this.betNum >= this.capBet) {
                    await this.zhaJinHuaCingl(commonUtil.randomFromRange(1000, 3000));
                }
                else {
                    let bet = bet_arr[this.sceneId].filter(gold => gold > this.capBet);
                    let multiple = Math.min(...bet, this.capBet);
                    await this.zhaJinHuaFilling(multiple);
                }
                break;
            default:
                console.warn("----0000");
                break;
        }
    }
    async zhaJinHuaKanPai() {
        try {
            const delayTime = commonUtil.randomFromRange(1000, 5000);
            await this.delayRequest('GoldenFlower.mainHandler.kanpai', {}, delayTime);
            this.iskanpai = true;
        }
        catch (error) {
            logger.info(`zhaJinHuaKanPai|${this.uid}|${JSON.stringify(error)}`);
        }
    }
    async zhaJinHuaCingl(delayTime) {
        try {
            const cinglRoute = 'GoldenFlower.mainHandler.cingl';
            let res = await this.delayRequest(cinglRoute, {}, delayTime);
            this.playerGold -= res.betNum;
        }
        catch (error) {
            logger.warn(`zhaJinHuaCingl|${this.uid}|${this.roomId}|${JSON.stringify(error)}`);
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
                const ran = commonUtil.randomFromRange(0, res.list.length - 1);
                await this.delayRequest("GoldenFlower.mainHandler.bipai", { seat: res.list[ran] }, delayTime);
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
            this.playerGold -= res.betNum;
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiR29sZGVuRmxvd2VyUm9ib3QuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9hcHAvc2VydmVycy9Hb2xkZW5GbG93ZXIvbGliL3JvYm90L0dvbGRlbkZsb3dlclJvYm90LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLFlBQVksQ0FBQzs7QUFHYiwyRUFBd0U7QUFDeEUsbUVBQW1FO0FBQ25FLGdGQUFpRjtBQUNqRiw0REFBNkQ7QUFDN0QsOERBQThEO0FBQzlELGlEQUFrRDtBQUdsRCwrQ0FBeUM7QUFDekMsTUFBTSxNQUFNLEdBQUcsSUFBQSx3QkFBUyxFQUFDLFdBQVcsRUFBRSxVQUFVLENBQUMsQ0FBQztBQU1sRCxNQUFNLE9BQU8sR0FBRztJQUNaLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsSUFBSSxDQUFDO0lBQ3JCLENBQUMsR0FBRyxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxDQUFDO0lBQ3ZCLENBQUMsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsS0FBSyxDQUFDO0lBQ3pCLENBQUMsSUFBSSxFQUFFLElBQUksRUFBRSxLQUFLLEVBQUUsS0FBSyxDQUFDO0NBQzdCLENBQUE7QUFFRCxNQUFxQixjQUFlLFNBQVEscUJBQVM7SUFvQ2pELFlBQVksSUFBUztRQUNqQixLQUFLLENBQUMsSUFBSSxDQUFDLENBQUM7UUFuQ2hCLGNBQVMsR0FBVyxDQUFDLENBQUM7UUFFdEIsZUFBVSxHQUFXLENBQUMsQ0FBQztRQUt2QixXQUFNLEdBQVcsQ0FBQyxDQUFDO1FBQ25CLFdBQU0sR0FBVyxDQUFDLENBQUM7UUFDbkIsY0FBUyxHQUFXLENBQUMsQ0FBQztRQUN0QixXQUFNLEdBQXlDLE1BQU0sQ0FBQztRQUV0RCxhQUFRLEdBQVcsQ0FBQyxDQUFDO1FBRXJCLGNBQVMsR0FBVyxDQUFDLENBQUM7UUFFdEIsYUFBUSxHQUFZLEtBQUssQ0FBQztRQUcxQixzQkFBaUIsR0FBVyxDQUFDLENBQUM7UUFJOUIsaUJBQVksR0FBVyxDQUFDLENBQUM7UUFFekIsZ0JBQVcsR0FBVyxNQUFNLENBQUM7UUFFN0IsZUFBVSxHQUFXLENBQUMsQ0FBQztRQUV2QixTQUFJLEdBQVcsQ0FBQyxDQUFDO1FBRWpCLFVBQUssR0FBYSxFQUFFLENBQUM7UUFFckIsZUFBVSxHQUFXLENBQUMsQ0FBQztRQUduQixJQUFJLENBQUMsVUFBVSxHQUFHLFVBQVUsQ0FBQyxlQUFlLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDO1FBQ3BELElBQUksQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQztRQUN0QixJQUFJLENBQUMsTUFBTSxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUM7UUFDMUIsSUFBSSxDQUFDLFNBQVMsR0FBRyxPQUFPLENBQUMsR0FBRyxDQUFDLGlCQUFpQixDQUFDLENBQUMsS0FBSyxDQUFDO0lBQzFELENBQUM7SUFHRCxLQUFLLENBQUMsZUFBZTtRQUNqQixJQUFJO1lBQ0EsTUFBTSxVQUFVLEdBQUcsTUFBTSxJQUFJLENBQUMsY0FBYyxDQUFDLGlDQUFpQyxFQUFFLEVBQUUsQ0FBQyxDQUFDO1lBQ3BGLElBQUksQ0FBQyxJQUFJLEdBQUcsVUFBVSxDQUFDLElBQUksQ0FBQztZQUM1QixJQUFJLENBQUMsTUFBTSxHQUFHLFVBQVUsQ0FBQyxNQUFNLENBQUM7WUFFaEMsSUFBSSxDQUFDLFdBQVcsR0FBRyxVQUFVLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQztTQUM3QztRQUFDLE9BQU8sS0FBSyxFQUFFO1lBQ1osTUFBTSxDQUFDLElBQUksQ0FBQyxtQkFBbUIsSUFBSSxDQUFDLEdBQUcsSUFBSSxJQUFJLENBQUMsU0FBUyxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUMsQ0FBQztZQUNwRSxPQUFPLE9BQU8sQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUM7U0FDaEM7SUFDTCxDQUFDO0lBR0QsS0FBSyxDQUFDLE9BQU87UUFDVCxNQUFNLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUNwQyxJQUFJLENBQUMsU0FBUyxHQUFHLElBQUksQ0FBQztJQUMxQixDQUFDO0lBR0QsZ0JBQWdCO1FBRVosSUFBSSxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUMsWUFBWSxFQUFFLElBQUksQ0FBQyxlQUFlLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7UUFFL0QsSUFBSSxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUMsa0JBQWtCLEVBQUUsSUFBSSxDQUFDLGlCQUFpQixDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO1FBRXZFLElBQUksQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDLGFBQWEsRUFBRSxJQUFJLENBQUMsdUJBQXVCLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7UUFHeEUsSUFBSSxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUMsWUFBWSxFQUFFLENBQUMsSUFBSSxFQUFFLEVBQUU7WUFDbkMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLEVBQUU7Z0JBQ3JCLElBQUksQ0FBQyxDQUFDLElBQUksSUFBSSxJQUFJLENBQUMsSUFBSSxJQUFJLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxFQUFFO29CQUNuQyxJQUFJLENBQUMsTUFBTSxHQUFHLE1BQU0sQ0FBQztpQkFDeEI7WUFDTCxDQUFDLENBQUMsQ0FBQztZQUNILElBQUksQ0FBQyxXQUFXLElBQUksUUFBUSxDQUFBO1FBQ2hDLENBQUMsQ0FBQyxDQUFDO0lBQ1AsQ0FBQztJQUdELGVBQWUsQ0FBQyxRQUFRO1FBQ3BCLElBQUksUUFBUSxDQUFDLElBQUksS0FBSyxRQUFRLEVBQUU7WUFDNUIsSUFBSSxDQUFDLGlCQUFpQixFQUFFLENBQUM7U0FDNUI7YUFDSSxJQUFJLFFBQVEsQ0FBQyxJQUFJLEtBQUssU0FBUyxFQUFFO1lBQ2xDLElBQUksQ0FBQyxZQUFZLEVBQUUsQ0FBQztTQUN2QjthQUNJLElBQUksUUFBUSxDQUFDLElBQUksS0FBSyxPQUFPLEVBQUU7WUFDaEMsSUFBSSxDQUFDLFNBQVMsRUFBRSxDQUFDO1NBQ3BCO0lBQ0wsQ0FBQztJQUdELGlCQUFpQixDQUFDLFVBQW9EO1FBQ2xFLElBQUksQ0FBQyx1QkFBdUIsRUFBRSxDQUFDO1FBQy9CLFVBQVUsQ0FBQyxHQUFHLEVBQUU7WUFDWixJQUFJLENBQUMsT0FBTyxFQUFFLENBQUM7UUFDbkIsQ0FBQyxFQUFFLEtBQUssQ0FBQyxNQUFNLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFDO0lBQ2hDLENBQUM7SUFHRCxLQUFLLENBQUMsa0JBQWtCO1FBQ3BCLElBQUksU0FBUyxDQUFDO1FBQ2QsSUFBSTtZQUNBLFNBQVMsR0FBRyxNQUFNLElBQUksQ0FBQyxjQUFjLENBQUMsb0NBQW9DLEVBQUUsRUFBRSxDQUFDLENBQUM7WUFDaEYsSUFBSSxDQUFDLFNBQVMsSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsU0FBUyxDQUFDLEtBQUssQ0FBQyxFQUFFO2dCQUMvQyxPQUFPO2FBQ1Y7WUFDRCxLQUFLLElBQUksVUFBVSxJQUFJLFNBQVMsQ0FBQyxLQUFLLEVBQUU7Z0JBQ3BDLElBQUksVUFBVSxJQUFJLFVBQVUsQ0FBQyxLQUFLLElBQUksSUFBSSxFQUFFO29CQUN4QyxJQUFJLENBQUMsV0FBVyxFQUFFLENBQUM7aUJBQ3RCO2FBQ0o7WUFDRCxLQUFLLElBQUksVUFBVSxJQUFJLFNBQVMsQ0FBQyxLQUFLLEVBQUU7Z0JBQ3BDLElBQUksVUFBVSxJQUFJLElBQUksQ0FBQyxHQUFHLElBQUksVUFBVSxDQUFDLEdBQUcsRUFBRTtvQkFDMUMsSUFBSSxDQUFDLFVBQVUsR0FBRyxVQUFVLENBQUMsUUFBUSxDQUFDO29CQUN0QyxJQUFJLENBQUMsS0FBSyxHQUFHLFVBQVUsQ0FBQyxLQUFLLENBQUM7b0JBQzlCLE1BQU07aUJBQ1Q7YUFDSjtZQUNELElBQUksQ0FBQyxJQUFJLEdBQUcsQ0FBQyxDQUFDO1lBQ2QsS0FBSyxJQUFJLFVBQVUsSUFBSSxTQUFTLENBQUMsS0FBSyxFQUFFO2dCQUNwQyxJQUFJLFVBQVUsSUFBSSxVQUFVLENBQUMsS0FBSyxJQUFJLElBQUksSUFBSSxJQUFJLENBQUMsR0FBRyxLQUFLLFVBQVUsQ0FBQyxHQUFHLEVBQUU7b0JBQ3ZFLElBQUksR0FBRyxHQUFHLGtCQUFrQixDQUFDLFNBQVMsQ0FBQyxFQUFFLFVBQVUsRUFBRSxJQUFJLENBQUMsVUFBVSxFQUFFLE9BQU8sRUFBRSxJQUFJLENBQUMsS0FBSyxFQUFFLEVBQUUsRUFBRSxVQUFVLEVBQUUsVUFBVSxDQUFDLFFBQVEsRUFBRSxPQUFPLEVBQUUsVUFBVSxDQUFDLEtBQUssRUFBRSxDQUFDLENBQUM7b0JBQzdKLElBQUksTUFBTSxHQUFHLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsVUFBVSxFQUFFLElBQUksQ0FBQyxVQUFVLEVBQUUsT0FBTyxFQUFFLElBQUksQ0FBQyxLQUFLLEVBQUUsQ0FBQyxDQUFDLENBQUMsRUFBRSxVQUFVLEVBQUUsVUFBVSxDQUFDLFFBQVEsRUFBRSxPQUFPLEVBQUUsVUFBVSxDQUFDLEtBQUssRUFBRSxDQUFDO29CQUU3SSxJQUFJLE1BQU0sQ0FBQyxLQUFLLENBQUMsUUFBUSxFQUFFLElBQUksSUFBSSxDQUFDLEtBQUssQ0FBQyxRQUFRLEVBQUUsRUFBRTt3QkFDbEQsSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDO3FCQUNmO2lCQUNKO2FBQ0o7WUFDRCxLQUFLLElBQUksVUFBVSxJQUFJLFNBQVMsQ0FBQyxLQUFLLEVBQUU7Z0JBQ3BDLElBQUksVUFBVSxJQUFJLFVBQVUsQ0FBQyxLQUFLLElBQUksSUFBSSxJQUFJLENBQUMsSUFBSSxVQUFVLENBQUMsT0FBTyxFQUFFO29CQUNuRSxJQUFJLElBQUksQ0FBQyxJQUFJLElBQUksQ0FBQyxFQUFFO3dCQUNoQixPQUFPLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQztxQkFDekI7b0JBQ0QsTUFBTTtpQkFDVDthQUNKO1lBQ0QsSUFBSSxDQUFDLFVBQVUsR0FBRyxDQUFDLENBQUM7WUFDcEIsSUFBSSxJQUFJLENBQUMsVUFBVSxJQUFJLENBQUMsRUFBRTtnQkFDdEIsSUFBSSxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsRUFBRTtvQkFDcEIsSUFBSSxDQUFDLFVBQVUsR0FBRyxDQUFDLENBQUM7aUJBQ3ZCO3FCQUFNO29CQUNILElBQUksQ0FBQyxVQUFVLEdBQUcsQ0FBQyxDQUFDO2lCQUN2QjthQUNKO2lCQUFNLElBQUksSUFBSSxDQUFDLFVBQVUsSUFBSSxDQUFDLEVBQUU7Z0JBQzdCLElBQUksSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFLEVBQUU7b0JBQ3BCLElBQUksQ0FBQyxVQUFVLEdBQUcsQ0FBQyxDQUFDO2lCQUN2QjtxQkFBTTtvQkFDSCxJQUFJLENBQUMsVUFBVSxHQUFHLENBQUMsQ0FBQztpQkFDdkI7YUFDSjtpQkFBTSxJQUFJLElBQUksQ0FBQyxVQUFVLElBQUksQ0FBQyxFQUFFO2dCQUM3QixJQUFJLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxFQUFFO29CQUNwQixJQUFJLENBQUMsVUFBVSxHQUFHLENBQUMsQ0FBQztpQkFDdkI7cUJBQU07b0JBQ0gsSUFBSSxDQUFDLFVBQVUsR0FBRyxDQUFDLENBQUM7aUJBQ3ZCO2FBQ0o7aUJBQU0sSUFBSSxJQUFJLENBQUMsVUFBVSxJQUFJLENBQUMsRUFBRTtnQkFDN0IsSUFBSSxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsRUFBRTtvQkFDcEIsSUFBSSxDQUFDLFVBQVUsR0FBRyxDQUFDLENBQUM7aUJBQ3ZCO3FCQUFNO29CQUNILElBQUksQ0FBQyxVQUFVLEdBQUcsQ0FBQyxDQUFDO2lCQUN2QjthQUNKO2lCQUFNLElBQUksSUFBSSxDQUFDLFVBQVUsSUFBSSxDQUFDLEVBQUU7Z0JBQzdCLElBQUksSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFLEVBQUU7b0JBQ3BCLElBQUksQ0FBQyxVQUFVLEdBQUcsQ0FBQyxDQUFDO2lCQUN2QjtxQkFBTTtvQkFDSCxJQUFJLENBQUMsVUFBVSxHQUFHLEVBQUUsQ0FBQztpQkFDeEI7YUFDSjtpQkFBTSxJQUFJLElBQUksQ0FBQyxVQUFVLElBQUksQ0FBQyxFQUFFO2dCQUM3QixJQUFJLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxFQUFFO29CQUNwQixJQUFJLENBQUMsVUFBVSxHQUFHLEVBQUUsQ0FBQztpQkFDeEI7cUJBQU07b0JBQ0gsSUFBSSxDQUFDLFVBQVUsR0FBRyxFQUFFLENBQUM7aUJBQ3hCO2FBQ0o7U0FDSjtRQUFDLE9BQU8sS0FBSyxFQUFFO1lBQ1osTUFBTSxDQUFDLEtBQUssQ0FBQyxzQkFBc0IsSUFBSSxDQUFDLEdBQUcsSUFBSSxJQUFJLENBQUMsU0FBUyxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUMsQ0FBQztTQUMzRTtJQUNMLENBQUM7SUFHRCxLQUFLLENBQUMsdUJBQXVCLENBQUMsSUFBa0I7UUFDNUMsSUFBSSxDQUFDLE1BQU0sR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDO1FBRTFCLElBQUksSUFBSSxHQUFHLElBQUksQ0FBQyxNQUFNLEdBQUcsQ0FBQyxJQUFJLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDO1FBRXpELElBQUksSUFBSSxDQUFDLFFBQVEsS0FBSyxJQUFJLENBQUMsSUFBSSxFQUFFO1lBQzdCLElBQUksSUFBSSxDQUFDLFFBQVEsSUFBSSxJQUFJLElBQUksSUFBSSxDQUFDLFFBQVEsSUFBSSxLQUFLLEVBQUU7Z0JBQ2pELElBQUksV0FBVyxHQUFHLDJCQUEyQixDQUFDLHNCQUFzQixDQUFDLElBQUksQ0FBQyxVQUFVLEVBQUUsSUFBSSxDQUFDLGlCQUFpQixFQUN4RyxJQUFJLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxVQUFVLEVBQUUsSUFBSSxDQUFDLFdBQVcsRUFBRSxJQUFJLENBQUMsVUFBVSxFQUFFLElBQUksQ0FBQyxDQUFDO2dCQUN6RSxJQUFJLElBQUksQ0FBQyxTQUFTLElBQUksV0FBVyxJQUFJLFFBQVEsRUFBRTtvQkFDM0MsTUFBTSxJQUFJLENBQUMsZUFBZSxFQUFFLENBQUM7aUJBQ2hDO2FBQ0o7WUFDRCxPQUFPO1NBQ1Y7UUFFRCxJQUFJLElBQUksQ0FBQyxVQUFVLEtBQUssQ0FBQyxFQUFFO1lBQ3ZCLE1BQU0sSUFBSSxDQUFDLGtCQUFrQixFQUFFLENBQUM7U0FDbkM7UUFFRCxJQUFJLElBQUksQ0FBQyxRQUFRLEVBQUU7WUFDZixPQUFPLElBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLENBQUM7U0FDOUI7UUFFRCxJQUFJLFdBQVcsR0FBRywyQkFBMkIsQ0FBQyxzQkFBc0IsQ0FBQyxJQUFJLENBQUMsVUFBVSxFQUFFLElBQUksQ0FBQyxpQkFBaUIsRUFDeEcsSUFBSSxDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsVUFBVSxFQUFFLElBQUksQ0FBQyxXQUFXLEVBQUUsSUFBSSxDQUFDLFVBQVUsRUFBRSxJQUFJLENBQUMsQ0FBQztRQUN6RSxJQUFJLFdBQVcsSUFBSSxPQUFPLElBQUksSUFBSSxDQUFDLFFBQVEsSUFBSSxLQUFLLEVBQUU7WUFDbEQsV0FBVyxHQUFHLE9BQU8sQ0FBQztTQUN6QjtRQUNELElBQUksV0FBVyxJQUFJLFFBQVEsSUFBSSxJQUFJLENBQUMsU0FBUyxJQUFJLEtBQUs7WUFDbEQsV0FBVyxHQUFHLE9BQU8sQ0FBQztRQUUxQixRQUFRLFdBQVcsRUFBRTtZQUNqQixLQUFLLE9BQU87Z0JBQ1IsSUFBSSxJQUFJLENBQUMsVUFBVSxHQUFHLElBQUksQ0FBQyxNQUFNLEdBQUcsQ0FBQyxJQUFJLENBQUMsVUFBVSxHQUFHLENBQUMsQ0FBQyxFQUFFO29CQUN2RCxNQUFNLElBQUksQ0FBQyxzQkFBc0IsQ0FBQyxJQUFJLENBQUMsQ0FBQztpQkFDM0M7cUJBQU07b0JBQ0gsTUFBTSxJQUFJLENBQUMsY0FBYyxDQUFDLFVBQVUsQ0FBQyxlQUFlLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUM7aUJBQ3JFO2dCQUNELE1BQU07WUFDVixLQUFLLFFBQVE7Z0JBQ1QsTUFBTSxJQUFJLENBQUMsZUFBZSxFQUFFLENBQUM7Z0JBQzdCLFVBQVUsQ0FBQyxHQUFHLEVBQUU7b0JBQ1osSUFBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsQ0FBQztnQkFDeEIsQ0FBQyxFQUFFLFVBQVUsQ0FBQyxlQUFlLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUM7Z0JBQzNDLE1BQU07WUFDVixLQUFLLE9BQU87Z0JBQ1IsTUFBTSxJQUFJLENBQUMsc0JBQXNCLENBQUMsSUFBSSxDQUFDLENBQUM7Z0JBQ3hDLE1BQU07WUFDVixLQUFLLE1BQU07Z0JBQ1AsTUFBTSxJQUFJLENBQUMsYUFBYSxFQUFFLENBQUM7Z0JBQzNCLE1BQU07WUFDVixLQUFLLFNBQVM7Z0JBS1YsSUFBSSxJQUFJLENBQUMsVUFBVSxHQUFHLElBQUksQ0FBQyxNQUFNLEdBQUcsQ0FBQyxJQUFJLENBQUMsVUFBVSxHQUFHLENBQUMsQ0FBQyxFQUFFO29CQUN2RCxNQUFNLElBQUksQ0FBQyxzQkFBc0IsQ0FBQyxJQUFJLENBQUMsQ0FBQztpQkFDM0M7cUJBQU0sSUFBSSxJQUFJLENBQUMsTUFBTSxJQUFJLElBQUksQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFFO29CQUV2QyxNQUFNLElBQUksQ0FBQyxjQUFjLENBQUMsVUFBVSxDQUFDLGVBQWUsQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQztpQkFDckU7cUJBQU07b0JBRUgsSUFBSSxHQUFHLEdBQUcsT0FBTyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDO29CQUNuRSxJQUFJLFFBQVEsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLEdBQUcsR0FBRyxFQUFFLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQztvQkFDN0MsTUFBTSxJQUFJLENBQUMsZ0JBQWdCLENBQUMsUUFBUSxDQUFDLENBQUM7aUJBQ3pDO2dCQUNELE1BQU07WUFDVjtnQkFDSSxPQUFPLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDO2dCQUN6QixNQUFNO1NBQ2I7SUFDTCxDQUFDO0lBR0QsS0FBSyxDQUFDLFFBQVEsQ0FBQyxJQUFrQjtRQUM3QixJQUFJLElBQUksR0FBRyxJQUFJLENBQUMsTUFBTSxHQUFHLENBQUMsSUFBSSxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQztRQUN6RCxJQUFJLFNBQVMsR0FBRywyQkFBMkIsQ0FBQyxvQkFBb0IsQ0FBQyxJQUFJLENBQUMsVUFBVSxFQUFFLElBQUksQ0FBQyxpQkFBaUIsRUFDbEcsSUFBSSxDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsVUFBVSxFQUFFLElBQUksQ0FBQyxXQUFXLEVBQUUsSUFBSSxDQUFDLFVBQVUsRUFBRSxJQUFJLEVBQUUsSUFBSSxDQUFDLEdBQUcsRUFBRSxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUM7UUFDbkcsSUFBSSxTQUFTLElBQUksT0FBTyxJQUFJLElBQUksQ0FBQyxRQUFRLElBQUksS0FBSyxFQUFFO1lBQ2hELFNBQVMsR0FBRyxPQUFPLENBQUM7U0FDdkI7UUFDRCxJQUFJLElBQUksQ0FBQyxLQUFLLEVBQUU7WUFDWixTQUFTLEdBQUcsT0FBTyxDQUFDO1NBQ3ZCO1FBQ0QsUUFBUSxTQUFTLEVBQUU7WUFDZixLQUFLLE9BQU87Z0JBQ1IsSUFBSSxJQUFJLENBQUMsVUFBVSxHQUFHLElBQUksQ0FBQyxNQUFNLEdBQUcsQ0FBQyxJQUFJLENBQUMsVUFBVSxHQUFHLENBQUMsQ0FBQyxHQUFHLENBQUMsRUFBRTtvQkFDM0QsTUFBTSxJQUFJLENBQUMsc0JBQXNCLENBQUMsSUFBSSxDQUFDLENBQUM7aUJBQzNDO3FCQUFNO29CQUNILE1BQU0sSUFBSSxDQUFDLGNBQWMsQ0FBQyxVQUFVLENBQUMsZUFBZSxDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDO2lCQUNyRTtnQkFDRCxNQUFNO1lBQ1YsS0FBSyxPQUFPO2dCQUVSLE1BQU0sSUFBSSxDQUFDLHNCQUFzQixDQUFDLElBQUksQ0FBQyxDQUFDO2dCQUN4QyxNQUFNO1lBQ1YsS0FBSyxNQUFNO2dCQUVQLE1BQU0sSUFBSSxDQUFDLGFBQWEsRUFBRSxDQUFDO2dCQUMzQixNQUFNO1lBQ1YsS0FBSyxTQUFTO2dCQUtWLElBQUksSUFBSSxDQUFDLFVBQVUsR0FBRyxJQUFJLENBQUMsTUFBTSxHQUFHLENBQUMsSUFBSSxDQUFDLFVBQVUsR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDLEVBQUU7b0JBQzNELE1BQU0sSUFBSSxDQUFDLHNCQUFzQixDQUFDLElBQUksQ0FBQyxDQUFDO2lCQUMzQztxQkFBTSxJQUFJLElBQUksQ0FBQyxNQUFNLElBQUksSUFBSSxDQUFDLE1BQU0sRUFBRTtvQkFFbkMsTUFBTSxJQUFJLENBQUMsY0FBYyxDQUFDLFVBQVUsQ0FBQyxlQUFlLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUM7aUJBQ3JFO3FCQUFNO29CQUVILElBQUksR0FBRyxHQUFHLE9BQU8sQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQztvQkFDbkUsSUFBSSxRQUFRLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxHQUFHLEdBQUcsRUFBRSxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7b0JBQzdDLE1BQU0sSUFBSSxDQUFDLGdCQUFnQixDQUFDLFFBQVEsQ0FBQyxDQUFDO2lCQUN6QztnQkFDRCxNQUFNO1lBQ1Y7Z0JBQ0ksT0FBTyxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQztnQkFDekIsTUFBTTtTQUNiO0lBQ0wsQ0FBQztJQUdELEtBQUssQ0FBQyxlQUFlO1FBQ2pCLElBQUk7WUFDQSxNQUFNLFNBQVMsR0FBRyxVQUFVLENBQUMsZUFBZSxDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsQ0FBQztZQUN6RCxNQUFNLElBQUksQ0FBQyxZQUFZLENBQUMsaUNBQWlDLEVBQUUsRUFBRSxFQUFFLFNBQVMsQ0FBQyxDQUFDO1lBQzFFLElBQUksQ0FBQyxRQUFRLEdBQUcsSUFBSSxDQUFDO1NBQ3hCO1FBQUMsT0FBTyxLQUFLLEVBQUU7WUFDWixNQUFNLENBQUMsSUFBSSxDQUFDLG1CQUFtQixJQUFJLENBQUMsR0FBRyxJQUFJLElBQUksQ0FBQyxTQUFTLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQyxDQUFDO1NBQ3ZFO0lBQ0wsQ0FBQztJQUdELEtBQUssQ0FBQyxjQUFjLENBQUMsU0FBaUI7UUFDbEMsSUFBSTtZQUNBLE1BQU0sVUFBVSxHQUFHLGdDQUFnQyxDQUFDO1lBQ3BELElBQUksR0FBRyxHQUFHLE1BQU0sSUFBSSxDQUFDLFlBQVksQ0FBQyxVQUFVLEVBQUUsRUFBRSxFQUFFLFNBQVMsQ0FBQyxDQUFDO1lBQzdELElBQUksQ0FBQyxVQUFVLElBQUksR0FBRyxDQUFDLE1BQU0sQ0FBQztTQUNqQztRQUFDLE9BQU8sS0FBSyxFQUFFO1lBQ1osTUFBTSxDQUFDLElBQUksQ0FBQyxrQkFBa0IsSUFBSSxDQUFDLEdBQUcsSUFBSSxJQUFJLENBQUMsTUFBTSxJQUFJLElBQUksQ0FBQyxTQUFTLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQyxDQUFDO1NBQ3JGO0lBQ0wsQ0FBQztJQUdELEtBQUssQ0FBQyxzQkFBc0IsQ0FBQyxJQUFrQjtRQUMzQyxJQUFJO1lBQ0EsTUFBTSxTQUFTLEdBQUcsVUFBVSxDQUFDLGVBQWUsQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLENBQUM7WUFDekQsSUFBSSxJQUFJLENBQUMsS0FBSyxFQUFFO2dCQUNaLE1BQU0sR0FBRyxHQUFHLE1BQU0sSUFBSSxDQUFDLFlBQVksQ0FBQyxzQ0FBc0MsRUFBRSxFQUFFLEVBQUUsU0FBUyxDQUFDLENBQUM7YUFDOUY7aUJBQU07Z0JBQ0gsTUFBTSxHQUFHLEdBQUcsTUFBTSxJQUFJLENBQUMsWUFBWSxDQUFDLHFDQUFxQyxFQUFFLEVBQUUsRUFBRSxTQUFTLENBQUMsQ0FBQztnQkFDMUYsSUFBSSxDQUFDLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUU7b0JBQ3RELE9BQU87aUJBQ1Y7Z0JBRUQsTUFBTSxHQUFHLEdBQUcsVUFBVSxDQUFDLGVBQWUsQ0FBQyxDQUFDLEVBQUUsR0FBRyxDQUFDLElBQUksQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLENBQUM7Z0JBQy9ELE1BQU0sSUFBSSxDQUFDLFlBQVksQ0FBQyxnQ0FBZ0MsRUFBRSxFQUFFLElBQUksRUFBRSxHQUFHLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLEVBQUUsU0FBUyxDQUFDLENBQUM7YUFDakc7U0FDSjtRQUFDLE9BQU8sS0FBSyxFQUFFO1lBQ1osTUFBTSxDQUFDLElBQUksQ0FBQyx1QkFBdUIsSUFBSSxDQUFDLEdBQUcsSUFBSSxJQUFJLENBQUMsU0FBUyxDQUFDLEtBQUssQ0FBQyxJQUFJLElBQUksQ0FBQyxLQUFLLElBQUksSUFBSSxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUM7U0FDMUc7SUFDTCxDQUFDO0lBR0QsS0FBSyxDQUFDLGdCQUFnQixDQUFDLFFBQWdCO1FBQ25DLElBQUksR0FBRyxDQUFDO1FBQ1IsSUFBSTtZQUNBLElBQUksU0FBUyxHQUFHLFVBQVUsQ0FBQyxlQUFlLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxDQUFDO1lBQ3ZELEdBQUcsR0FBRyxNQUFNLElBQUksQ0FBQyxZQUFZLENBQUMsa0NBQWtDLEVBQUUsRUFBRSxRQUFRLEVBQUUsRUFBRSxTQUFTLENBQUMsQ0FBQztZQUMzRixJQUFJLENBQUMsTUFBTSxHQUFHLEdBQUcsQ0FBQyxNQUFNLENBQUM7WUFDekIsSUFBSSxDQUFDLFVBQVUsSUFBSSxHQUFHLENBQUMsTUFBTSxDQUFDO1NBQ2pDO1FBQUMsT0FBTyxLQUFLLEVBQUU7WUFDWixNQUFNLENBQUMsSUFBSSxDQUFDLG9CQUFvQixJQUFJLENBQUMsR0FBRyxJQUFJLElBQUksQ0FBQyxTQUFTLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQyxDQUFDO1lBRXJFLEdBQUcsR0FBRyxNQUFNLElBQUksQ0FBQyxjQUFjLENBQUMsQ0FBQyxDQUFDLENBQUM7U0FDdEM7SUFDTCxDQUFDO0lBR0QsS0FBSyxDQUFDLGFBQWE7UUFDZixNQUFNLFNBQVMsR0FBRyxVQUFVLENBQUMsZUFBZSxDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsQ0FBQztRQUN6RCxJQUFJO1lBQ0EsSUFBSSxDQUFDLElBQUksQ0FBQyxRQUFRLEVBQUU7Z0JBQ2hCLE1BQU0sSUFBSSxDQUFDLGVBQWUsRUFBRSxDQUFDO2FBQ2hDO1lBQ0QsTUFBTSxVQUFVLEdBQUcsK0JBQStCLENBQUM7WUFDbkQsSUFBSSxTQUFTLEVBQUU7Z0JBQ1gsTUFBTSxJQUFJLENBQUMsWUFBWSxDQUFDLFVBQVUsRUFBRSxFQUFFLEVBQUUsU0FBUyxDQUFDLENBQUM7YUFDdEQ7aUJBQU07Z0JBQ0gsTUFBTSxJQUFJLENBQUMsY0FBYyxDQUFDLFVBQVUsRUFBRSxFQUFFLENBQUMsQ0FBQzthQUM3QztZQUNELElBQUksQ0FBQyxNQUFNLEdBQUcsTUFBTSxDQUFDO1NBQ3hCO1FBQUMsT0FBTyxLQUFLLEVBQUU7WUFDWixNQUFNLENBQUMsSUFBSSxDQUFDLGlCQUFpQixJQUFJLENBQUMsR0FBRyxJQUFJLElBQUksQ0FBQyxTQUFTLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQyxDQUFDO1NBQ3JFO0lBQ0wsQ0FBQztDQUNKO0FBcFlELGlDQW9ZQyJ9