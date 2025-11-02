import { PlayerInfo } from '../../../common/pojo/entity/PlayerInfo';
import utils = require('../../../utils/index');
import createPlayerRecordService from '../../../common/dao/RecordGeneralManager';
import qznn_logic = require("./qznn_logic");
import qznnRoom from "./qznnRoom";
/**
 * 抢庄牛牛 玩家
 */
export default class qznnPlayer extends PlayerInfo {
    seat: number;
    /**WAIT.等待 READY.准备 GAME.游戏中 */
    status: 'NONE' | 'WAIT' | 'READY' | 'GAME' = 'NONE';
    cards: number[] = [];
    /**牌型 count 0表示无牛 cows 3个满足10的*/
    cardType: { count: qznn_logic.CardsType, cows: number[] };
    /**下注的分数 */
    betNum: number;
    /**可以推注的分数 */
    pushbet: number;
    /**是否亮牌 */
    isLiangpai: boolean;
    isAgreeDisband: number;
    /**抢庄倍数 */
    robmul: number;
    foldState: number;
    /**是否下注 */
    isBet: number;
    /**不够赔付 不够赢取 后 最终 输赢 */
    profit: number = 0;
    /**保留初始化金币 */
    initgold: number = 0;
    constructor(i: number, opts: any) {
        super(opts);
        this.seat = i;
        this.cardType = null;// 牌型 0表示无牛
        this.betNum = 0;// 下注的分数
        this.pushbet = 0;// 可以推注的分数
        this.gold = opts.gold;//金币
        this.isLiangpai = false;// 是否亮牌
        this.isAgreeDisband = 0;// 是否同意解散房间 0.等待 1.同意 2.拒绝
        this.robmul = -1;// 抢庄倍数
        this.foldState = -1;// 弃牌状态 0.弃牌 1.不弃牌
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
        this.foldState = -1;
        this.isBet = 0;//是否下注
        this.profit = 0;
        this.initControlType();
    }

    /**
     * 设置牌和牌型
     */
    setCards_1(cards: number[]) {
        this.cards = cards.map(c => c);
    }
    setCards_2(cards: number[], cardType: any) {
        this.cards = cards.map(c => c);
        this.cardType = cardType;
    }

    strip() {
        return {
            uid: this.uid,
            headurl: this.headurl,
            nickname: this.nickname,
            gold: utils.sum(this.gold),
            seat: this.seat,
            status: this.status,
            online: this.onLine,
            profit: this.profit,
            cards: this.cards,// 只发前面四张牌
            cardType: this.cardType,
            betNum: this.betNum,
            isLiangpai: this.isLiangpai,
            robmul: this.robmul,
            foldState: this.foldState,
            isAgreeDisband: this.isAgreeDisband,
            pushbet: this.pushbet,
            isBet: this.isBet
        };
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
            pushbet: this.pushbet,
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
    toResult(lowBet: number) {
        return {
            uid: this.uid,
            cards: this.cards,
            seat: this.seat,
            cardType: this.cardType,
            gold: this.gold,
            profit: this.profit,
            betNum: this.betNum * lowBet
        };
    }

    kickStrip() {
        return {
            uid: this.uid,
            seat: this.seat,
            status: this.status
        };
    }

    async updateGold(roomInfo: qznnRoom) {
        let result = {
            list: roomInfo._cur_players.map(c => c.toResult(roomInfo.lowBet)),
            roomInfo: {
                zhuangInfo: roomInfo.zhuangInfo,
                lowBet: roomInfo.lowBet
            }
        };
        const isZhuang = roomInfo.zhuangInfo.uid == this.uid;
        const res = await createPlayerRecordService()
            .setPlayerBaseInfo(this.uid, false, this.isRobot, this.initgold)
            .setGameInfo(roomInfo.nid, roomInfo.sceneId, roomInfo.roomId)
            .setGameRoundInfo(roomInfo.roundId, roomInfo.realPlayersNumber, 0)
            .setControlType(this.controlType)
            .setGameRecordInfo(Math.abs(this.profit), Math.abs(this.profit), this.profit, isZhuang)
            .setGameRecordLivesResult(result)
            .sendToDB(1);
        this.profit = res.playerRealWin;
        this.gold = res.gold;
        this.initgold = this.gold;
    }
    //玩家游戏内充值数据包装
    rechargeStrip() {
        return {
            uid: this.uid,
            seat: this.seat,
            gold: utils.sum(this.gold)
        }
    }
    /**抢庄 操作 */
    action_robzhuangOpt(roomInfo: qznnRoom, mul: number) {
        this.robmul = mul;
        if (mul > 0)
            roomInfo.robzhuangs.push({ uid: this.uid, mul: mul });
        // 通知
        roomInfo.channelIsPlayer('qz_onOpts', {
            type: 'robzhuang',
            uid: this.uid,
            seat: this.seat,
            robmul: mul,
            list: roomInfo._cur_players.map(pl => pl.toRobzhuangData())
        });
        // 检查是否全部都选择了 那么直接进行下一阶段
        if (roomInfo._cur_players.every(c => c.robmul >= 0)) {
            roomInfo.handler_readybet();
        }
    }
    /**下注操作 */
    action_betOpt(roomInfo: qznnRoom, betNum: number) {
        this.betNum = betNum;
        this.isBet = betNum;
        // 检查是否全部都选择了 那么直接进行下一阶段
        roomInfo.channelIsPlayer('qz_onOpts', {
            type: 'bet',
            uid: this.uid,
            seat: this.seat,
            betNum: betNum,
            lowBet: roomInfo.lowBet
        });

        if (roomInfo._cur_players.every(m => m.betNum !== 0 || m.uid == roomInfo.zhuangInfo.uid)) {
            roomInfo.handler_look();
        }
    }

    /**亮牌操作 */
    action_liangpaiOpt(roomInfo: qznnRoom) {
        this.isLiangpai = true;
        const cardType = qznn_logic.getCardType(this.cards);
        const opts = {
            type: 'pinpai',
            uid: this.uid,
            seat: this.seat,
            cardType
        }
        roomInfo.channelIsPlayer('qz_onOpts', opts);

        // 是否不是所有人都亮牌了
        if (roomInfo._cur_players.every(m => m.isLiangpai)) {
            roomInfo.handler_settlement();
        }
    }
}

