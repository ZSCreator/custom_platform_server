"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const PlayerInfo_1 = require("../../../common/pojo/entity/PlayerInfo");
const RecordGeneralManager_1 = require("../../../common/dao/RecordGeneralManager");
const DiceConst_1 = require("./DiceConst");
const Dice_logic_1 = require("./Dice_logic");
const RoleEnum_1 = require("../../../common/constant/player/RoleEnum");
const utils = require("../../../utils/index");
const Dice_logic = require("./Dice_logic");
class DicePlayer extends PlayerInfo_1.PlayerInfo {
    constructor(i, opts) {
        super(opts);
        this.status = 'NONE';
        this.state = "PS_NONE";
        this.profit = 0;
        this.initgold = 0;
        this.Number_draws = 3;
        this.Number_extra = 3;
        this.area_DiceList = {};
        this.totalPoint = 0;
        this.subtotal = 0;
        this.seat = i;
        this.gold = opts.gold;
        this.initgold = this.gold;
        for (let idx = 0; idx < 13; idx++) {
            this.area_DiceList[idx] = { DiceList: [], points: 0, submit: false };
        }
    }
    initGame() {
        this.status = "GAME";
        this.profit = 0;
        this.initControlType();
    }
    strip() {
        return {
            seat: this.seat,
            uid: this.uid,
            headurl: this.headurl,
            nickname: encodeURI(this.nickname),
            gold: this.gold,
            status: this.status,
            profit: this.profit,
            subtotal: this.subtotal,
            totalPoint: this.totalPoint,
            Number_draws: this.Number_draws,
            Number_extra: this.Number_extra,
        };
    }
    gettotalPoint() {
        this.totalPoint = 0;
        this.subtotal = 0;
        for (const key in this.area_DiceList) {
            if (this.area_DiceList[key].submit) {
                this.totalPoint += this.area_DiceList[key].points;
                if (parseInt(key) <= DiceConst_1.AreaBet.POINTS_6) {
                    this.subtotal += this.area_DiceList[key].points;
                }
            }
        }
        if (this.subtotal >= 63) {
            this.totalPoint += 35;
        }
        return this.totalPoint;
    }
    async handler_Play(roomInfo) {
        await roomInfo.control.runControl();
        const lotteryUtil = new Dice_logic_1.LotteryUtil(roomInfo.save_DiceList, this.area_DiceList);
        let controlNum = roomInfo.controlNum;
        if (controlNum !== 0 && this.isRobot === RoleEnum_1.RoleEnum.ROBOT) {
            controlNum = -(controlNum);
        }
        lotteryUtil.setControlNum(controlNum);
        const result = lotteryUtil.lottery();
        roomInfo.curr_DiceList = result;
        let save_DiceList = Dice_logic.GetArr(roomInfo.save_DiceList, result);
        roomInfo.record_history.oper.push({ uid: this.uid, oper_type: "Play", update_time: utils.cDate(), msg: `${save_DiceList}` });
        for (let idx = 0; idx < 13; idx++) {
            if (this.area_DiceList[idx].submit == false) {
                this.area_DiceList[idx].points = Dice_logic.CalculatePoints(this.area_DiceList, idx, save_DiceList);
            }
        }
        let opts = {
            curr_DiceList: roomInfo.curr_DiceList,
            save_DiceList: roomInfo.save_DiceList,
            seat: this.seat,
            roomId: roomInfo.roomId,
            players: roomInfo.players.map(pl => {
                return {
                    seat: pl.seat,
                    Number_draws: pl.Number_draws,
                    Number_extra: pl.Number_extra,
                    area_DiceList: pl.area_DiceList
                };
            }),
        };
        roomInfo.channelIsPlayer("Dice.Play", opts);
    }
    handler_set(roomInfo, Mod, Idx) {
        roomInfo.record_history.oper.push({ uid: this.uid, oper_type: "set", update_time: utils.cDate(), msg: `${Mod}|${Idx}` });
        if (Mod) {
            if (roomInfo.curr_DiceList[Idx] > 0) {
                roomInfo.save_DiceList[Idx] = roomInfo.curr_DiceList[Idx];
                roomInfo.curr_DiceList[Idx] = 0;
            }
        }
        else {
            if (roomInfo.save_DiceList[Idx]) {
                roomInfo.curr_DiceList[Idx] = roomInfo.save_DiceList[Idx];
                roomInfo.save_DiceList[Idx] = 0;
            }
        }
        let opts = {
            curr_DiceList: roomInfo.curr_DiceList,
            save_DiceList: roomInfo.save_DiceList,
            seat: this.seat,
            Mod: Mod,
            Idx: Idx,
        };
        roomInfo.channelIsPlayer("Dice.set", opts);
    }
    handler_submit(roomInfo, area) {
        let curr_DiceList = Dice_logic.GetArr(roomInfo.save_DiceList, roomInfo.curr_DiceList);
        roomInfo.record_history.oper.push({ uid: this.uid, oper_type: "submit", update_time: utils.cDate(), msg: `${area}|${curr_DiceList.toString()}` });
        this.area_DiceList[area].DiceList = curr_DiceList.slice();
        this.area_DiceList[area].points = Dice_logic.CalculatePoints(this.area_DiceList, area, curr_DiceList.slice());
        const alikeCounts = utils.checkAlike(curr_DiceList.slice());
        let alikeCount = alikeCounts.find(c => c.count == 5);
        if (alikeCount && alikeCount.count == 5) {
            if (this.area_DiceList[DiceConst_1.AreaBet.BAOZI].submit && this.area_DiceList[DiceConst_1.AreaBet.BAOZI].points > 0) {
                this.area_DiceList[DiceConst_1.AreaBet.BAOZI].points += 100;
            }
        }
        this.area_DiceList[area].submit = true;
        this.gettotalPoint();
        let opts = {
            seat: this.seat,
            area_DiceList: this.area_DiceList,
            totalPoint: this.totalPoint,
            subtotal: this.subtotal,
            idx: area
        };
        roomInfo.channelIsPlayer("Dice.submit", opts);
        roomInfo.checkHasNextPlayer();
    }
    async updateGold(roomInfo) {
        this.gameRecordService = (0, RecordGeneralManager_1.default)();
        if (this.profit < 0 && Math.abs(this.profit) > this.gold) {
            this.profit = -this.gold;
        }
        const res = await this.gameRecordService
            .setPlayerBaseInfo(this.uid, false, this.isRobot, this.initgold)
            .setGameInfo(roomInfo.nid, roomInfo.sceneId, roomInfo.roomId)
            .setGameRoundInfo(roomInfo.roundId, roomInfo.realPlayersNumber, 0)
            .setGameRecordInfo(Math.abs(this.profit), Math.abs(this.profit), this.profit, false)
            .setControlType(this.controlType)
            .setGameRecordLivesResult(roomInfo.record_history)
            .sendToDB(1);
        this.gold = res.gold;
        this.initgold = this.gold;
        this.profit = res.playerRealWin;
    }
    async only_update_game(roomInfo) {
        await this.gameRecordService.Later_updateRecord(roomInfo.record_history);
    }
}
exports.default = DicePlayer;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiRGljZVBsYXllci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL2FwcC9zZXJ2ZXJzL0RpY2VQb2tlci9saWIvRGljZVBsYXllci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLHVFQUFvRTtBQUVwRSxtRkFBMkc7QUFDM0csMkNBQXNDO0FBQ3RDLDZDQUEyQztBQUMzQyx1RUFBb0U7QUFDcEUsOENBQStDO0FBQy9DLDJDQUE0QztBQUc1QyxNQUFxQixVQUFXLFNBQVEsdUJBQVU7SUFtQjlDLFlBQVksQ0FBUyxFQUFFLElBQVM7UUFDNUIsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDO1FBbEJoQixXQUFNLEdBQXNDLE1BQU0sQ0FBQztRQUVuRCxVQUFLLEdBQTBCLFNBQVMsQ0FBQTtRQUV4QyxXQUFNLEdBQVcsQ0FBQyxDQUFDO1FBR25CLGFBQVEsR0FBVyxDQUFDLENBQUM7UUFFckIsaUJBQVksR0FBRyxDQUFDLENBQUM7UUFFakIsaUJBQVksR0FBRyxDQUFDLENBQUM7UUFDakIsa0JBQWEsR0FBK0UsRUFBRSxDQUFDO1FBRS9GLGVBQVUsR0FBRyxDQUFDLENBQUM7UUFFZixhQUFRLEdBQUcsQ0FBQyxDQUFDO1FBR1QsSUFBSSxDQUFDLElBQUksR0FBRyxDQUFDLENBQUM7UUFDZCxJQUFJLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUM7UUFDdEIsSUFBSSxDQUFDLFFBQVEsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDO1FBQzFCLEtBQUssSUFBSSxHQUFHLEdBQUcsQ0FBQyxFQUFFLEdBQUcsR0FBRyxFQUFFLEVBQUUsR0FBRyxFQUFFLEVBQUU7WUFDL0IsSUFBSSxDQUFDLGFBQWEsQ0FBQyxHQUFHLENBQUMsR0FBRyxFQUFFLFFBQVEsRUFBRSxFQUFFLEVBQUUsTUFBTSxFQUFFLENBQUMsRUFBRSxNQUFNLEVBQUUsS0FBSyxFQUFFLENBQUE7U0FDdkU7SUFDTCxDQUFDO0lBR0QsUUFBUTtRQUNK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