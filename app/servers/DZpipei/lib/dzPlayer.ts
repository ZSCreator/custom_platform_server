import { RoleEnum } from '../../../common/constant/player/RoleEnum';
import { PlayerInfo } from '../../../common/pojo/entity/PlayerInfo';
import JsonConfig = require('../../../pojo/JsonConfig');
import dzRoom from './dzRoom';
import { buildRecordResult } from "./util/recordUtil";
import { getLogger } from 'pinus-logger';
import createPlayerRecordService, { RecordGeneralManager } from '../../../common/dao/RecordGeneralManager';
const Logger = getLogger('server_out', __filename);

/**玩家状态 */
export enum PlayerStatus {
    NONE = 'NONE',
    WAIT = 'WAIT',
    GAME = 'GAME'
}

/**操作状态 */
export enum OptionState {
    PS_NONE = 'PS_NONE',
    PS_OPER = 'PS_OPER'
}

/*
 匹配模式 玩家
*/
export default class dzPlayer extends PlayerInfo {
    /**当前可参与游戏金币 */
    currGold: number;
    status: PlayerStatus = PlayerStatus.NONE;
    /**操作状态 */
    state: OptionState = OptionState.PS_NONE;
    /**牌的类型 默认-1 */
    type: number = -1;
    /**牌类型大小 */
    typeSize: number = 0;
    seat: number;
    /**手牌 */
    holds: number[] = null;
    /**结算 五张牌 组合的最大牌型 */
    cardType: { cards: number[], type: number, prompt: number[] } = { cards: [], type: 0, prompt: [] };
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
    /**推荐加注 */
    recommendBet: number[] = [];
    /**玩家的类型 小盲 大盲*/
    playerType: 'SB' | 'BB' | '' = '';
    gameRecordService: RecordGeneralManager;
    constructor(i: number, opts: any, roomInfo: dzRoom) {
        super(opts);
        this.gold = opts.gold;
        this.currGold = opts.gold > opts.currGold ? opts.currGold : opts.gold;
        this.seat = i;
        this.state = OptionState.PS_NONE;
        this.status = PlayerStatus.NONE;
    }

    /**
     * 初始游戏信息(只真对参加游戏的玩家)
     * @param holds 二张底牌
     * @param chouShui 
     */
    initGame(holds: number[]) {
        this.holds = holds.map(c => c);
        this.status = PlayerStatus.GAME;
        this.initControlType();
    }

    /**执行玩家下注
     */
    execBet(roomInfo: dzRoom, betnum: number) {
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
     * 是否可以发牌了
     * @param maxBetNum 
     */
    canDeal(maxBetNum: number) {
        let status = (this.isBet && (this.bet == maxBetNum)) || (this.canUserGold() == 0);
        return status;
    }

    /**结算 */
    result(roomInfo: dzRoom) {
        let flag = (this.isFold || roomInfo.roundTimes < 3);
        return {
            uid: this.uid,
            seat: this.seat,
            profit: this.profit,
            currGold: this.currGold,
            gold: this.gold,
            holds: flag ? null : this.holds,
            cardType: flag ? null : this.cardType,
            type: flag ? null : this.type,
            sumBetNum: this.tatalBet,
            roundTimes: roomInfo.roundTimes,
            isFold: this.isFold
        };
    }

    /**玩家发牌数据 */
    toGame(uid: string) {
        return {
            uid: this.uid,
            seat: this.seat,
            gold: this.gold,
            currGold: this.canUserGold(),
            bet: this.bet,
            tatalBet: this.tatalBet,
            holds: uid == this.uid ? this.holds : null,
            playerType: this.playerType,
            status: this.status
        };
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
    async addMilitary(roomInfo: dzRoom) {
        roomInfo.endTime = Date.now();
        if (roomInfo._players.find(p => p && p.isRobot === RoleEnum.REAL_PLAYER)) {
            roomInfo.zipResult = buildRecordResult(roomInfo._players, roomInfo.publicCardToSort);
        }
        try {
            this.gameRecordService = createPlayerRecordService();
            const res = await this.gameRecordService
                .setPlayerBaseInfo(this.uid, false, this.isRobot, this.gold)
                .setGameInfo(roomInfo.nid, roomInfo.sceneId, roomInfo.roomId)
                .setGameRoundInfo(roomInfo.roundId, roomInfo.realPlayersNumber, 0)
                .setControlType(this.controlType)
                .setGameRecordInfo(Math.abs(this.tatalBet), Math.abs(this.tatalBet), this.profit - this.tatalBet, false)
                .addResult(roomInfo.zipResult)
                .setGameRecordLivesResult(roomInfo.record_history)
                .sendToDB(1);
            this.profit = res.playerRealWin;
            this.gold = res.gold;
            this.currGold += res.playerRealWin;
            //跑马灯
            roomInfo.addNote(this, this.profit);
        } catch (error) {
            Logger.error(error.stack || error.message || error);
        }
    }

    /**对战类 特有， */
    async only_update_game(roomInfo: dzRoom) {
        // if (roomInfo.record_history.info.some(c => c && c.profit === 0) && roomInfo.sceneId <= 4) {
        //     console.debug("dz0000");
        // }
        await this.gameRecordService.Later_updateRecord(roomInfo.record_history);
    }

    /**机器人需要字段 */
    robotStrip() {
        return {
            uid: this.uid,
            type: this.type,
            cardType: this.cardType,
            seat: this.seat,
            isRobot: this.isRobot
        }
    }

    /**包装玩家手牌 */
    stripHolds() {
        return {
            uid: this.uid,
            holds: this.holds,
            type: this.type,
            isFold: this.isFold
        }
    }

    stripSelfPoker() {
        return {
            uid: this.uid,
            holds: this.holds,
            type: this.type,
            cardType: this.cardType,
        }
    }

    /**
     * 机器人需要的数据
     * @returns {{uid: *, isRobot: *, holds: (null|*), cardType}}
     */
    stripRobotNeed() {
        return {
            uid: this.uid,
            isRobot: this.isRobot,
            holds: this.holds,
            type: this.type,
        }
    }
    /**弃牌 */
    async handler_fold(roomInfo: dzRoom, type: 'fold') {
        clearTimeout(roomInfo.Oper_timeout);
        //记录翻牌玩家操作
        roomInfo.recordDrawBefore(this, 0, type);
        this.state = OptionState.PS_NONE;
        // 通知
        await this.addMilitary(roomInfo);
        this.isFold = true;// 标记弃牌3
        this.status = PlayerStatus.NONE;
        roomInfo.channelIsPlayer('dz_onOpts', {
            type: 'fold',
            uid: this.uid,
            seat: this.seat,
            gold: this.gold,
            currGold: this.currGold,
        });
        // 检查是否还可以继续
        const list = roomInfo._players.filter(pl => pl && pl.status == 'GAME' && !pl.isFold);
        if (list.length <= 1) {
            roomInfo.partPool();
            roomInfo.settlement();// 结算
        } else {// 否则如果是当前发话玩家点击弃牌 那么就要让下一个发话
            roomInfo.nextStatus(this);
        }
    }

    /**设置玩家状态 */
    setStatus(status: PlayerStatus) {
        this.status = status;
    }
}

