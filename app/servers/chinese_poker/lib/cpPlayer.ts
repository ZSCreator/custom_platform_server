import { PlayerInfo } from '../../../common/pojo/entity/PlayerInfo';
import utils = require('../../../utils/index');
import PlayerManagerDao from "../../../common/dao/daoManager/Player.manager";
import cp_logic = require('./cp_logic');
import cpRoom from './cpRoom';
import createPlayerRecordService, { RecordGeneralManager } from '../../../common/dao/RecordGeneralManager';
// 一个玩家
export default class cpPlayer extends PlayerInfo {
    seat: number;
    status: 'NONE' | 'WAIT' | 'GAME' = 'NONE';
    /**默认为假，真不参与比牌直接算输了 */
    biPai_status: boolean = false;
    /**手牌 */
    cards: number[] = [];
    /**最优组合 */
    card_arr: { cards: number[], type: number[] }[] = [];
    /**特殊牌型 */
    specialType: cp_logic.SpecialType = 0;
    /**牌型{cards,type} 
     * 牌的类型 默认-1(同花顺> 铁支>葫芦>同花>顺子>三条>两对>一对>高牌)
    */
    cardType1: { cards: number[], type: number } = null;
    /**牌型{ */
    cardType2: { cards: number[], type: number } = null;
    /**牌型{ */
    cardType3: { cards: number[], type: number } = null;
    /**临时记录打枪一个玩家的赢的注数 */
    tmp_gain: number = 0;
    /**头道输赢水数 */
    gain1: number = 0;
    /**中道输赢水数 */
    gain2: number = 0;
    /**尾道输赢水数 */
    gain3: number = 0;
    /**特殊牌型水数 */
    specialgain: number = 0;
    /**冲三，中墩葫芦，四条（中墩），同花顺（中墩），四条（下墩），同花顺（下墩） */
    extension: number[] = [0, 0, 0, 0, 0, 0];
    /**本次 结算的钱 */
    profit: number = 0;
    /**本次 输赢的注数 包含打枪 */
    sumgain: number = 0;
    /**打枪次数记录 */
    shoot: { uid: string, seat: number, shoot_gain: number[] }[] = [];
    /**手牌状态 0.正常 1.配置 */
    holdStatus: 0 | 1 = 0;
    /**下注 */
    bet: number = 0;
    BiPaicards: number[][] = [];
    gameRecordService: RecordGeneralManager;
    /**保留初始化金币 */
    initgold: number = 0;
    constructor(i: number, opts: any) {
        super(opts);
        this.seat = i;
        this.gold = opts.gold || 0;
        this.initgold = this.gold;
    }
    /**包装机器人数据 */
    stripRobot() {
        return {
            cards: this.BiPaicards,
            seat: this.seat,
            uid: this.uid,
            isRobot: this.isRobot,
            cardType1: this.cardType1,
            cardType2: this.cardType2,
            cardType3: this.cardType3,
            specialgain: this.specialgain
        }
    }
    /**准备 */
    prepare() {
        if (this.status != `NONE`)
            this.status = "WAIT";

        this.holdStatus = 0;
        this.cards = null;
        this.card_arr = null;
        this.cardType1 = null;
        this.extension = [0, 0, 0, 0, 0, 0];
        this.biPai_status = false;
        this.gain1 = 0;// 头道输赢水数
        this.gain2 = 0;// 中道输赢水数
        this.gain3 = 0;// 尾道输赢水数s
        this.tmp_gain = 0;
        this.profit = 0;
        this.specialgain = 0;
        this.sumgain = 0;
        this.shoot = [];
        this.BiPaicards = [];
    }

    /**初始游戏信息 */
    initGame(cards: number[], bet: number) {
        this.status = 'GAME';
        this.cards = cards;
        this.bet = bet;
        this.initControlType();
    }

    /**结算信息 */
    wrapSettlement() {
        return {
            uid: this.uid,
            nickname: this.nickname,
            seat: this.seat,//座位号
            cardType1: this.cardType1,//{cards,type}//头道   牌的类型 默认-1(同花顺> 铁支>葫芦>同花>顺子>三条>两对>一对>高牌)
            cardType2: this.cardType2,//
            cardType3: this.cardType3,//
            specialType: this.specialType,//特殊牌型，13张 一起算的 那种
            gain1: this.gain1,//头道 输赢注数
            gain2: this.gain2,//中道  输赢注数
            gain3: this.gain3,//尾道   输赢注数
            tmp_gain: this.tmp_gain,//打枪计分
            specialgain: this.specialgain,//特殊牌型12张
            sumgain: this.sumgain,//本次 输赢的注数 包含打枪
            last_profit: this.profit,//本次 结算的钱
            shoot: this.shoot,//打枪次数 [uid1,uid2]
            extension: this.extension,
            BiPaicards: this.BiPaicards,//头道 中道 尾道
            biPai_status: this.biPai_status,//相公了
            gold: this.gold
        };
    }

    /**第一次发牌的数据 */
    toGame(uid: string) {
        return {
            uid: this.uid,
            headurl: this.headurl,
            nickname: this.nickname,
            seat: this.seat,
            gold: this.gold,
            bet: this.bet,
            cards: uid == this.uid ? this.cards : null,
            card_arr: uid == this.uid ? this.card_arr : null,
            holdStatus: this.holdStatus,
            status: this.status,
            BiPaicards: uid == this.uid ? this.BiPaicards : null
        };
    }

    strip() {
        return {
            seat: this.seat,
            uid: this.uid,
            headurl: this.headurl,
            nickname: (this.nickname),
            gold: this.gold,
            status: this.status,
            holds: this.holdStatus == 1 ? this.cards : null,
            ip: this.ip,
            holdStatus: this.holdStatus,
            bet: this.bet,
            isRobot: this.isRobot,
            BiPaicards: this.BiPaicards
        };
    }
    /**牌局信息 */
    Record_strip(roomInfo: cpRoom) {
        let cards = [];
        cards.push(...this.BiPaicards[0], ...this.BiPaicards[1], ...this.BiPaicards[2]);
        let shoot = [0, 0];
        if (this.shoot.length >= 1) shoot[0] = 1;
        roomInfo.players.forEach(m => {
            if (!!m && m.shoot.some(c => c.uid == this.uid))
                shoot[1] = 1;
        });

        return {
            uid: this.uid,
            nickname: (this.nickname),
            isRobot: this.isRobot,
            bet: this.bet,
            gain1: this.gain1,// 头道输赢水数
            gain2: this.gain2,// 中道输赢水数
            gain3: this.gain3,// 尾道输赢水数
            last_profit: this.profit,
            specialgain: this.specialgain,
            sumgain: this.sumgain,
            shoot: shoot,//[1,1],打枪 被打枪
            cards: cards,
            seat: this.seat,
        };
    }

    /**玩家游戏内充值数据包装 */
    rechargeStrip() {
        return {
            uid: this.uid,
            seat: this.seat,
            gold: this.gold,
        }
    }
    kickStrip() {
        return {
            uid: this.uid,
            seat: this.seat
        };
    }

    /**结算金币 */
    async settlement(roomInfo: cpRoom) {
        let validBet = this.bet;
        if (Math.abs(this.profit) > this.bet && this.profit < 0) {
            validBet = Math.abs(this.profit);
        }
        this.gameRecordService = createPlayerRecordService();
        const res = await this.gameRecordService
            .setPlayerBaseInfo(this.uid, false, this.isRobot, this.initgold)
            .setGameInfo(roomInfo.nid, roomInfo.sceneId, roomInfo.roomId)
            .setGameRoundInfo(roomInfo.roundId, roomInfo.realPlayersNumber, 0)
            .setGameRecordInfo(Math.abs(this.bet), validBet, this.profit, false)
            .setControlType(this.controlType)
            // .setGameRecordLivesResult()
            .addResult(roomInfo.zipResult)
            .sendToDB(1);
        this.gold = res.gold;
        this.profit = res.playerRealWin;//扣的手续费
    }

    /**对战类 特有， */
    async only_update_game(roomInfo: cpRoom) {
        await this.gameRecordService.Later_updateRecord(roomInfo.record_history);
    }
}
