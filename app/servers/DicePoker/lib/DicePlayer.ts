import { PlayerInfo } from '../../../common/pojo/entity/PlayerInfo';
import DiceRoom from './DiceRoom';
import createPlayerRecordService, { RecordGeneralManager } from '../../../common/dao/RecordGeneralManager';
import { AreaBet } from './DiceConst';
import { LotteryUtil } from "./Dice_logic";
import { RoleEnum } from "../../../common/constant/player/RoleEnum";
import utils = require('../../../utils/index');
import Dice_logic = require("./Dice_logic");

/**一个玩家 */
export default class DicePlayer extends PlayerInfo {
    seat: number;
    status: 'NONE' | 'WAIT' | 'GAME' | 'FOLD' = 'NONE';
    /**操作状态 */
    state: "PS_NONE" | "PS_OPER" = "PS_NONE"
    /**利润 */
    profit: number = 0;
    gameRecordService: RecordGeneralManager;
    /**保留初始化金币 */
    initgold: number = 0;
    /**每回合次数 */
    Number_draws = 3;
    /**额外次数 */
    Number_extra = 3;
    area_DiceList: { [key: number]: { DiceList: number[], points: number, submit: boolean } } = {};
    /**总分数 */
    totalPoint = 0;
    /**小计 */
    subtotal = 0;
    constructor(i: number, opts: any) {
        super(opts);
        this.seat = i;//座位号
        this.gold = opts.gold;
        this.initgold = this.gold;
        for (let idx = 0; idx < 13; idx++) {
            this.area_DiceList[idx] = { DiceList: [], points: 0, submit: false }
        }
    }

    /**初始游戏信息 */
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
                if (parseInt(key) <= AreaBet.POINTS_6) {
                    this.subtotal += this.area_DiceList[key].points;
                }
            }
        }
        if (this.subtotal >= 63) {
            this.totalPoint += 35;
        }
        return this.totalPoint;
    }

    async handler_Play(roomInfo: DiceRoom) {

        await roomInfo.control.runControl();
        const lotteryUtil = new LotteryUtil(roomInfo.save_DiceList, this.area_DiceList);

        let controlNum = roomInfo.controlNum;
        if (controlNum !== 0 && this.isRobot === RoleEnum.ROBOT) {
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
                }
            }),
        }
        roomInfo.channelIsPlayer("Dice.Play", opts);
    }

    handler_set(roomInfo: DiceRoom, Mod: boolean, Idx: number) {
        roomInfo.record_history.oper.push({ uid: this.uid, oper_type: "set", update_time: utils.cDate(), msg: `${Mod}|${Idx}` });
        if (Mod) {
            if (roomInfo.curr_DiceList[Idx] > 0) {
                roomInfo.save_DiceList[Idx] = roomInfo.curr_DiceList[Idx];
                roomInfo.curr_DiceList[Idx] = 0;
            }
        } else {
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
        }
        roomInfo.channelIsPlayer("Dice.set", opts);
    }

    handler_submit(roomInfo: DiceRoom, area: AreaBet) {
        let curr_DiceList = Dice_logic.GetArr(roomInfo.save_DiceList, roomInfo.curr_DiceList);
        roomInfo.record_history.oper.push({ uid: this.uid, oper_type: "submit", update_time: utils.cDate(), msg: `${area}|${curr_DiceList.toString()}` });
        this.area_DiceList[area].DiceList = curr_DiceList.slice();
        this.area_DiceList[area].points = Dice_logic.CalculatePoints(this.area_DiceList, area, curr_DiceList.slice());
        /**特殊情况 */
        const alikeCounts = utils.checkAlike(curr_DiceList.slice());
        let alikeCount = alikeCounts.find(c => c.count == 5)
        if (alikeCount && alikeCount.count == 5) {
            if (this.area_DiceList[AreaBet.BAOZI].submit && this.area_DiceList[AreaBet.BAOZI].points > 0) {
                this.area_DiceList[AreaBet.BAOZI].points += 100;
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
        }
        roomInfo.channelIsPlayer("Dice.submit", opts);
        roomInfo.checkHasNextPlayer();
    }
    /**金币结算 */
    async updateGold(roomInfo: DiceRoom) {
        this.gameRecordService = createPlayerRecordService();
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

    /**对战类 特有， */
    async only_update_game(roomInfo: DiceRoom) {
        await this.gameRecordService.Later_updateRecord(roomInfo.record_history);
    }
}

