import { PlayerInfo } from '../../../common/pojo/entity/PlayerInfo';
import FCSRoom from './FCSRoom';
import JsonConfig = require('../../../pojo/JsonConfig');
import { getLogger } from 'pinus';
import createPlayerRecordService, { RecordGeneralManager } from '../../../common/dao/RecordGeneralManager';
import FCS_logic = require('./FCS_logic');
const Logger = getLogger('server_out', __filename);

/*
 匹配模式 玩家
*/
export default class FCSPlayer extends PlayerInfo {
    /**当前可参与游戏金币 */
    currGold: number;
    status: 'NONE' | 'WAIT' | 'GAME' = 'NONE';
    /**操作状态 */
    state: "PS_NONE" | "PS_OPER" = "PS_NONE";
    /**牌的类型 默认-1 */
    // type: number = -1;
    /**牌类型大小 */
    typeSize: number = 0;
    /**同上 处理每轮谁先操作用 */
    _typeSize: number = 0;
    seat: number;
    /**手牌 */
    holds: number[] = [];
    /**结算 五张牌 组合的最大牌型 */
    cardType: { cards: number[], type: number } = { cards: [], type: 0 };
    /**每轮下注 */
    bet: number = 0;
    /**每局总下注 */
    tatalBet: number = 0;
    /**每轮 操作过 */
    isBet: boolean = false;
    /**是否弃牌 true 是弃牌*/
    isFold: boolean = false;
    /**单局盈利  下注出去的所有钱 回收 回来的*/
    profit: number = 0;
    /**保留初始化金币 */
    initgold: number = 0;
    gameRecordService: RecordGeneralManager;
    /**保存 未发牌 */
    TheCards: number[] = [];
    constructor(i: number, opts: any, sceneId: number) {
        super(opts);
        this.gold = opts.gold;
        this.currGold = opts.gold > opts.currGold ? opts.currGold : opts.gold;
        this.seat = i;
        this.state = "PS_NONE";
        this.initgold = this.gold;
    }

    /**
     * 初始游戏信息(只真对参加游戏的玩家)
     * @param holds 二张底牌
     */
    initGame(holds: number[]) {
        this.holds = holds.slice(0, 2).map(c => c);
        this.TheCards = holds.slice(2).map(c => c);
        this.status = 'GAME';
    }

    /**执行玩家下注
     */
    execBet(roomInfo: FCSRoom, betnum: number) {
        this.bet += betnum;
        this.tatalBet += betnum;
        this.isBet = true;
        roomInfo.roomCurrSumBet += betnum;
        roomInfo.lastBetNum = Math.max(this.bet, roomInfo.lastBetNum);
    }

    /**重置下注信息 */
    resetBet() {
        this.bet = 0;
        this.isBet = false;
    }

    /**可以使用金币 */
    canUserGold() {
        return this.currGold - this.tatalBet;
    }
    /**
     * 操作过 
     * @param maxBetNum 
     */
    canDeal(maxBetNum: number) {
        let status = (this.isBet && (this.bet == maxBetNum)) || (this.canUserGold() == 0);
        return status;
    }

    /**结算 */
    result(roomInfo: FCSRoom) {
        return {
            uid: this.uid,
            seat: this.seat,
            profit: this.profit,
            currGold: this.currGold,
            gold: this.gold,
            holds: this.holds,
            cardType: this.cardType,
            // type: this.type,
            sumBetNum: this.tatalBet,
            roundTimes: roomInfo.roundTimes,
            isFold: this.isFold,
            typeSize: this.typeSize
        };
    }

    /**玩家发牌数据 */
    toGame(uid: string, roundNum: number) {
        let opts = {
            uid: this.uid,
            seat: this.seat,
            gold: this.gold,
            currGold: this.canUserGold(),
            bet: this.bet,
            tatalBet: this.tatalBet,
            holds: this.uid == uid ? this.holds : this.holds.map((c, i) => i == 0 ? 0x99 : c),
            status: this.status,
            isFold: this.isFold,
        }
        return opts;
    }

    strip() {
        return {
            seat: this.seat,
            uid: this.uid,
            nickname: this.nickname,
            headurl: this.headurl,
            gold: this.gold,
            currGold: this.canUserGold(),
            status: this.status,
            bet: this.bet,
            isFold: this.isFold,
            holds: null
        };
    }
    /**添加战绩 金币 加减操作*/
    async addMilitary(roomInfo: FCSRoom) {
        roomInfo.endTime = Date.now();
        try {
            this.gameRecordService = createPlayerRecordService();
            const res = await this.gameRecordService
                .setPlayerBaseInfo(this.uid, false, this.isRobot, this.initgold)
                .setGameInfo(roomInfo.nid, roomInfo.sceneId, roomInfo.roomId)
                .setGameRoundInfo(roomInfo.roundId, roomInfo.realPlayersNumber, 0)
                .setControlType(this.controlType)
                .setGameRecordInfo(Math.abs(this.tatalBet), Math.abs(this.tatalBet), this.profit - this.tatalBet, false)
                .setGameRecordLivesResult(roomInfo.record_history)
                .sendToDB(1);

            this.profit = res.playerRealWin;
            this.gold = res.gold;
            this.initgold = this.gold;
            this.currGold += res.playerRealWin;
            //跑马灯
            roomInfo.addNote(this, this.profit);
        } catch (error) {
            Logger.error(error.stack || error.message || error);
        }
    }

    /**对战类 特有， */
    async only_update_game(roomInfo: FCSRoom) {
        await this.gameRecordService.Later_updateRecord(roomInfo.record_history);
    }

    handler_play(roomInfo: FCSRoom, type: 'cingl' | 'pass' | 'allin' | 'filling', currBet: number) {
        clearTimeout(roomInfo.action_Timeout);
        // 玩家下注
        this.execBet(roomInfo, currBet);
        //记录翻牌玩家操作
        roomInfo.recordDrawBefore(this, currBet, type);
        this.state = "PS_NONE";
        // 通知
        roomInfo.channelIsPlayer('FiveCardStud.onOpts', {
            type: type,
            seat: this.seat,
            uid: this.uid,
            currGold: this.canUserGold(),
            currBet: currBet, // 下注金额
            bet: this.bet, // 当前已经下注金额
            roomCurrSumBet: roomInfo.roomCurrSumBet,
        });
        roomInfo.nextStatus();
    }
    /**弃牌 */
    async handler_fold(roomInfo: FCSRoom) {
        clearTimeout(roomInfo.action_Timeout);

        this.isFold = true;// 标记弃牌
        this.state = "PS_NONE";
        this.status = "WAIT";

        if (roomInfo.roundTimes == 3) {
            this.cardType.type = FCS_logic.GetCardType(this.holds.slice());
            this.cardType.cards = this.holds.slice();
        }

        //记录翻牌玩家操作
        roomInfo.recordDrawBefore(this, 0, 'Fold');
        // 通知
        roomInfo.channelIsPlayer('FiveCardStud.onOpts', {
            type: 'fold',
            seat: this.seat,
            uid: this.uid,
            gold: this.gold,
            currGold: this.canUserGold(),
            headurl: this.headurl
        });
        // 通知
        await this.addMilitary(roomInfo);
        // 检查是否还可以继续
        const list = roomInfo._players.filter(pl => pl && pl.status == 'GAME' && !pl.isFold);
        if (list.length <= 1) {
            roomInfo.partPool();
            roomInfo.settlement();// 结算
        } else {// 否则如果是当前发话玩家点击弃牌 那么就要让下一个发话
            roomInfo.nextStatus();
        }
    }
}

