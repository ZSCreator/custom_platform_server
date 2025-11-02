import { PlayerInfo } from '../../../common/pojo/entity/PlayerInfo';
import *as  utils from '../../../utils/index';
import *as qzpj_logic from "./qzpj_logic";
import { fixNoRound } from "../../../utils/lottery/commonUtil";
import qzpjRoom from './qzpjRoom';
import createPlayerRecordService from '../../../common/dao/RecordGeneralManager';
import * as mailModule from '../../../modules/mailModule';
import { RoomState, route } from './qzpjConst';
/**
 * 抢庄牌九 玩家
 */
export default class qzpjPlayer extends PlayerInfo {
    seat: number;
    /**WAIT.等待 READY.准备 GAME.游戏中 */
    status: 'NONE' | 'WAIT' | 'READY' | 'GAME' = 'NONE';
    cards: number[] = [];
    /**牌型*/
    cardType: number;
    points: number;
    /**下注的分数 */
    betNum: number;
    bet_mul_List: number[] = [];
    /**是否亮牌 */
    isLiangpai: boolean;
    // isAgreeDisband: number;
    /**抢庄倍数 */
    robmul: number;
    // foldState: number;
    /**是否下注 */
    isBet: number;
    /**不够赔付 不够赢取 后 最终 输赢 */
    profit: number = 0;
    /**保留初始化金币 */
    initgold: number = 0;
    /**true 大于玩家，false小于玩家 */
    Rank = false;
    constructor(i: number, opts: any) {
        super(opts);
        this.seat = i;
        this.cardType = null;// 牌型 0表示无牛
        this.betNum = 0;// 下注的分数
        this.gold = opts.gold;//金币
        this.isLiangpai = false;// 是否亮牌
        this.robmul = -1;// 抢庄倍数
        this.isBet = 0;//是否下注
        this.initgold = this.gold;
    }

    /**初始 */
    initGame() {
        this.status = `WAIT`;
        this.cards = [];
        this.betNum = 0;
        this.isLiangpai = false;// 是否亮牌
        this.robmul = -1;
        this.bet_mul_List = [];
        this.points = 0;
        this.isBet = 0;//是否下注
        this.profit = 0;
        this.initControlType();
    }

    strip() {
        let opts = {
            uid: this.uid,
            headurl: this.headurl,
            nickname: this.nickname,
            gold: utils.sum(this.gold),
            seat: this.seat,
            status: this.status,
            profit: this.profit,
            cards: this.cards,// 只发前面四张牌
            cardType: this.cardType,
            betNum: this.betNum,
            isLiangpai: this.isLiangpai,
            robmul: this.robmul,
            points: this.points,
            isBet: this.isBet,
            bet_mul_List: this.bet_mul_List,
        };
        // if (roomInfo.status == RoomState.READYBET || roomInfo.status == RoomState.ROBZHUANG) {
        //     opts.cards = this.cards.slice(0, 4);
        //     delete opts.cardType;
        // }
        return opts;
    }

    /**明牌信息 */
    toMingPaiInfo(uid: string) {
        return {
            uid: this.uid,
            seat: this.seat,
            cards: uid == this.uid ? this.cards.slice(0, 4) : [],
            robmul: this.robmul
        };
    }

    // 抢庄信息
    toRobzhuangData() {
        return {
            uid: this.uid,
            seat: this.seat,
            robmul: this.robmul,
            gold: this.gold
        };
    }

    /**手牌信息 */
    toHoldsInfo() {
        return {
            uid: this.uid,
            cards: this.cards,// 只发前面四张牌
            seat: this.seat,// 只发前面四张牌
            cardType: this.cardType,
            betNum: this.betNum,
        };
    }

    // 结果
    toResult() {
        return {
            uid: this.uid,
            cards: this.cards,
            seat: this.seat,
            cardType: this.cardType,
            gold: this.gold,
            profit: this.profit,
            robmul: this.robmul,
            nickname: this.nickname,
            betNum: this.betNum,
            points: this.points
        };
    }

    kickStrip() {
        return {
            uid: this.uid,
            seat: this.seat,
            status: this.status
        };
    }

    //玩家游戏内充值数据包装
    rechargeStrip() {
        return {
            uid: this.uid,
            seat: this.seat,
            gold: utils.sum(this.gold)
        }
    }
    async updateGold(roomInfo: qzpjRoom) {
        try {
            let result = {
                list: roomInfo._cur_players.map(c => c.toResult()),
                roomInfo: {
                    zhuangInfo: roomInfo.zhuangInfo,
                    lowBet: roomInfo.lowBet,
                    // isControl: roomInfo.controlLogic.isControl,
                    max_uid: roomInfo.max_uid,
                }
            };
            if (this.profit < 0 && Math.abs(this.profit) > this.gold) {
                this.profit = -this.gold;
            }
            const isZhuang = roomInfo.zhuangInfo.uid == this.uid;
            const res = await createPlayerRecordService()
                .setPlayerBaseInfo(this.uid, false, this.isRobot, this.initgold)
                .setGameInfo(roomInfo.nid, roomInfo.sceneId, roomInfo.roomId)
                .setGameRoundInfo(roomInfo.roundId, roomInfo.realPlayersNumber, 0)
                .addResult(roomInfo.zipResult)
                .setControlType(this.controlType)
                .setGameRecordInfo(Math.abs(this.profit), Math.abs(this.profit), this.profit, isZhuang)
                .setGameRecordLivesResult(result)
                .sendToDB(1);
            this.profit = res.playerRealWin;
            this.gold = res.gold;
            this.initgold = this.gold;
            //给离线玩家发送结算邮件
            // !this.onLine && mailModule.changeGoldsByMail47({}, this);
        } catch (error) {
            roomInfo.Logger.error(`抢庄牌九结算${error}`);
        }
    }
    /**抢庄 操作 */
    handler_robBanker(roomInfo: qzpjRoom, mul: number) {
        this.robmul = mul;
        roomInfo.robzhuangs.push({ uid: this.uid, mul: mul, gold: this.gold });
        let opts = {
            uid: this.uid,
            seat: this.seat,
            robmul: mul,
            list: roomInfo._cur_players.map(pl => pl.toRobzhuangData())
        }
        roomInfo.channelIsPlayer(route.qzpj_robzhuang, opts);
        // 检查是否全部都选择了 那么直接进行下一阶段
        if (roomInfo.robzhuangs.length === roomInfo._cur_players.length) {
            roomInfo.handler_readybet();
        }
    }

    /**下注操作 */
    handler_bet(roomInfo: qzpjRoom, betNum: number) {
        this.betNum = betNum;
        this.isBet = betNum;
        let opts = {
            uid: this.uid,
            seat: this.seat,
            betNum: betNum,
            lowBet: roomInfo.lowBet
        }
        roomInfo.channelIsPlayer(route.qzpj_bet, opts);

        if (roomInfo._cur_players.every(m => m.betNum != 0 || m.uid === roomInfo.zhuangInfo.uid)) {
            roomInfo.handler_deal();
        }
    }
}

