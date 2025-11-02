import { PlayerInfo } from '../../../common/pojo/entity/PlayerInfo';
import utils = require('../../../utils/index');
import BGRoom from './BGRoom';
import BG_logic = require("./BG_logic");
import createPlayerRecordService from '../../../common/dao/RecordGeneralManager';
import { fixNoRound } from "../../../utils/lottery/commonUtil";
/**一个玩家 */
export default class Player extends PlayerInfo {
    seat: number;

    /**赢取的金币 */
    profit: number = 0;
    /** */
    bet: number = 0;
    status: 'NONE' | 'WAIT' | 'GAME' = 'NONE';
    /**操作状态 */
    state: "PS_NONE" | "PS_OPER" = "PS_NONE";
    initgold: number;
    constructor(i: number, opts: any) {
        super(opts);
        this.seat = i;
        this.gold = opts.gold;
        this.initgold = opts.gold;
    }

    /**
     * 吃实话
     */
    init() {
        this.initControlType();
        this.bet = 0;
        this.initProfit();
    }

    initProfit() {
        this.profit = 0;
    }

    /**结算 */
    async settlement(roomInfo: BGRoom) {
        if (this.bet > 0) {
            const res = await createPlayerRecordService()
                .setPlayerBaseInfo(this.uid, false, this.isRobot, this.initgold)
                .setGameInfo(roomInfo.nid, roomInfo.sceneId, roomInfo.roomId)
                .setGameRoundInfo(roomInfo.roundId, roomInfo.realPlayersNumber, 0)
                .setControlType(this.controlType)
                .setGameRecordInfo(Math.abs(this.bet), Math.abs(this.bet), this.profit, false)
                .setGameRecordLivesResult(roomInfo.record_history)
                .sendToDB(1);
            this.gold = fixNoRound(res.gold);
            this.profit = fixNoRound(res.playerRealWin);
            this.initgold = this.gold;
        }
    }

    action_first(roomInfo: BGRoom, bet: number, location: number, timeout: boolean) {
        this.bet += bet;
        this.gold -= bet;
        const temp_areaList = roomInfo.area_list[location];
        if (temp_areaList.length == 0) {
            temp_areaList.push({ bet: bet, profit: 0, insurance: false, insurance_bet: -1, cards: [], type: 0, operate_status: 0, Points: 0, Points_t: 0, uid: this.uid, addMultiple: false })
        }
        temp_areaList[0].bet = bet;
        roomInfo.channelIsPlayer("BlackGame.action_first", { uid: this.uid, seat: this.seat, bet, location, gold: this.gold });
        roomInfo.record_history.oper.push({ uid: this.uid, oper_type: "下注", bet });
        /**is can next */
        let is_can_next = true;
        for (let key in roomInfo.area_list) {
            const area_list = roomInfo.area_list[key];
            if (area_list.length == 0 || area_list.length == 1 && area_list[0].bet == 0) {
                is_can_next = false;
                break;
            }
        }
        if (!timeout && is_can_next) {
            clearTimeout(roomInfo.Oper_timeout);
            roomInfo.handler_deal();
        }
    }


    /**分牌 */
    action_separatePoker(roomInfo: BGRoom) {
        this.state = "PS_NONE";
        const area = roomInfo.area_list[roomInfo.location][0];
        const bet = area.bet;
        this.bet += bet;
        this.gold -= bet;
        roomInfo.area_list[roomInfo.location] = [utils.clone(area), utils.clone(area)];
        /**各拿一张原始牌 */
        roomInfo.area_list[roomInfo.location][0].cards = [area.cards[0]];
        roomInfo.area_list[roomInfo.location][1].cards = [area.cards[1]];
        /**各获取一张新牌 */
        roomInfo.area_list[roomInfo.location][0].cards.push(roomInfo.allcards.shift());
        roomInfo.area_list[roomInfo.location][1].cards.push(roomInfo.allcards.shift());
        /**分牌后重现获取点数和类型 */
        const res1 = BG_logic.get_Points(roomInfo.area_list[roomInfo.location][0].cards, true);
        const res2 = BG_logic.get_Points(roomInfo.area_list[roomInfo.location][1].cards, true);

        roomInfo.area_list[roomInfo.location][0].type = res1.type;
        roomInfo.area_list[roomInfo.location][0].Points = res1.Points;
        roomInfo.area_list[roomInfo.location][0].Points_t = res1.Points_t;

        roomInfo.area_list[roomInfo.location][1].type = res2.type;
        roomInfo.area_list[roomInfo.location][1].Points = res2.Points;
        roomInfo.area_list[roomInfo.location][1].Points_t = res2.Points_t;

        roomInfo.channelIsPlayer("BlackGame.action_separatePoker", {
            area_list: roomInfo.area_list,
            seat: this.seat,
            location: roomInfo.location, bet: 2 * bet, gold: this.gold
        });
        roomInfo.record_history.oper.push({ uid: this.uid, oper_type: "分牌", bet });
        roomInfo.handler_loop();
    }

    /**加倍 */
    action_addMultiple(roomInfo: BGRoom) {
        const temp_areaList = roomInfo.area_list[roomInfo.location][roomInfo.idx];
        const bet = temp_areaList.bet;

        this.gold -= bet;
        this.bet += bet;
        temp_areaList.addMultiple = true;
        temp_areaList.operate_status = 3;
        temp_areaList.bet = bet * 2;
        roomInfo.record_history.oper.push({ uid: this.uid, oper_type: "加倍", bet });
        this.action_getOnePoker(roomInfo, false);
    }

    /**停牌 */
    action_stop_getCard(roomInfo: BGRoom) {
        this.state = "PS_NONE";
        const temp_areaList = roomInfo.area_list[roomInfo.location][roomInfo.idx];
        temp_areaList.operate_status = 3;
        const opts = {
            area_list: roomInfo.area_list,
            location: roomInfo.location,
            idx: roomInfo.idx,
            seat: this.seat,
            addMultiple: temp_areaList.addMultiple,
            bet: temp_areaList.bet,
            gold: this.gold
        };
        roomInfo.channelIsPlayer("BlackGame.action_stop_getCard", opts);
        roomInfo.record_history.oper.push({ uid: this.uid, oper_type: "停牌" });
        roomInfo.handler_loop();
    }

    /**要牌 */
    action_getOnePoker(roomInfo: BGRoom, flag: boolean) {
        this.state = "PS_NONE";
        const temp_areaList = roomInfo.area_list[roomInfo.location][roomInfo.idx];
        temp_areaList.cards.push(roomInfo.allcards.shift());

        let res = BG_logic.get_Points(temp_areaList.cards, roomInfo.area_list[roomInfo.location].length == 2);

        if (res.Points == 21 || temp_areaList.cards.length == 5) {
            temp_areaList.operate_status = 3;
        }
        temp_areaList.Points = res.Points;
        temp_areaList.Points_t = res.Points_t;
        temp_areaList.type = res.type;
        if (res.type == 0) {
            temp_areaList.operate_status = 2;
        }
        const opts = {
            area_list: roomInfo.area_list,
            location: roomInfo.location,
            idx: roomInfo.idx,
            seat: this.seat,
            addMultiple: temp_areaList.addMultiple,
            bet: roomInfo.area_list[roomInfo.location].reduce((total, c) => (c.bet + total), 0),
            gold: this.gold
        }
        if (flag) {
            roomInfo.record_history.oper.push({ uid: this.uid, oper_type: "要牌" });
        }
        roomInfo.channelIsPlayer("BlackGame.action_getOnePoker", opts);
        roomInfo.handler_loop();
    }

    /**保险 */
    action_insurance(roomInfo: BGRoom, flag: boolean) {
        this.state = "PS_NONE";
        const temp_areaList = roomInfo.area_list[roomInfo.location][roomInfo.idx];
        const bet = flag ? temp_areaList.bet / 2 : 0;
        this.gold -= bet;
        this.bet += bet;

        temp_areaList.insurance_bet = bet;
        roomInfo.record_history.oper.push({ uid: this.uid, oper_type: "买保险", bet: bet });
        roomInfo.channelIsPlayer("BlackGame.action_insurance", { bet, gold: this.gold, seat: this.seat, location: roomInfo.location, operate_status: flag });

        let is_over = true;
        /**有人买保险 */
        let has_insurance = false;
        for (let key in roomInfo.area_list) {
            const area_list = roomInfo.area_list[key];
            if (area_list.length > 0 && area_list[0].insurance == true) {
                if (area_list[0].insurance_bet == -1) {
                    is_over = false;
                    break;
                } else {
                    has_insurance = true;
                }
            }
        }
        if (is_over) {
            clearTimeout(roomInfo.Oper_timeout);
            if (has_insurance) {//A+一个10点 黑桃杰
                roomInfo.handler_check(true);
            } else {
                roomInfo.handler_loop();
            }
        } else {
            roomInfo.insurance_loop();
        }
    }
}
