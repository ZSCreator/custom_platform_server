import { PlayerInfo } from '../../../common/pojo/entity/PlayerInfo';
import * as mailModule from '../../../modules/mailModule';
import JsonConfig = require('../../../pojo/JsonConfig');
import ld_Logic = require("./Erba_logic");
import ErbaRoom from './ErbaRoom';
import utils = require('../../../utils/index');
import createPlayerRecordService, { RecordGeneralManager } from '../../../common/dao/RecordGeneralManager';

/**一个玩家 */
export default class ldPlayer extends PlayerInfo {
    seat: number;
    /**WAIT.等待 READY.准备 GAME.游戏中 */
    status: "NONE" | "WAIT" | "GAME" = "NONE";
    /**操作状态 */
    state: "PS_NONE" | "PS_OPER" = "PS_NONE"
    /**下注倍数 */
    bet_mul: number = 0;

    /**利润 */
    profit: number = 0;

    startGrab_List: number[];
    bet_mul_List: number[];

    gameRecordService: RecordGeneralManager;
    /**抢庄倍数 */
    Grab_num: number = -1;
    /**手牌 */
    HoleCard: number[] = [];
    /**保留初始化金币 */
    initgold: number = 0;
    constructor(i: number, opts: any) {
        super(opts);
        this.seat = i;//座位号
        this.gold = opts.gold;
        this.initgold = this.gold;
    }

    /**初始游戏信息 */
    initGame() {
        this.status = "GAME";
        this.HoleCard = [];
        this.bet_mul = 0;
        this.Grab_num = -1;
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
            bet_mul: this.bet_mul,
            profit: this.profit,
            HoleCard: this.HoleCard,
        };
    }


    /**金币结算 */
    async updateGold(roomInfo: ErbaRoom) {
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
    async only_update_game(roomInfo: ErbaRoom) {
        await this.gameRecordService.Later_updateRecord(roomInfo.record_history);
    }
    /**抢庄 */
    handler_grab(roomInfo: ErbaRoom, Grab_num: number) {
        this.Grab_num = Grab_num;
        roomInfo.channelIsPlayer("Erba.note_grab", { seat: this.seat, Grab_num });
        roomInfo.record_history.oper.push({ seat: this.seat, Grab_num, uid: this.uid });
        const gamePlayer = roomInfo.players.filter(pl => !!pl);
        if (gamePlayer.every(c => c && c.Grab_num >= 0)) {
            roomInfo.handler_banker()
        }
    }

    handler_Bet(roomInfo: ErbaRoom, bet_mul: number) {
        this.bet_mul = bet_mul;
        roomInfo.channelIsPlayer("Erba.note_bet_mul", { seat: this.seat, bet_mul });
        roomInfo.record_history.oper.push({ seat: this.seat, bet_mul, uid: this.uid });
        const gamePlayer = roomInfo.players.filter(pl => pl && pl.uid != roomInfo.banker.uid);
        if (gamePlayer.every(c => c.bet_mul > 0)) {
            roomInfo.handler_sice();
        }
    }
}

