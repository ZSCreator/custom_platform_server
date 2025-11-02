'use strict';
import { PlayerInfo } from '../../../common/pojo/entity/PlayerInfo';
import PlayerManagerDao from "../../../common/dao/daoManager/Player.manager";
import utils = require('../../../utils/index');
import JsonMgr = require('../../../../config/data/JsonMgr');
import GoldenFlowerConst = require('./GoldenFlowerConst');
import JsonConfig = require('../../../pojo/JsonConfig');
import * as GoldenFlower_logic from './GoldenFlower_logic';
import MessageService = require('../../../services/MessageService');
import jhRoom from './jhRoom'
import createPlayerRecordService, { RecordGeneralManager } from '../../../common/dao/RecordGeneralManager';
/**一个玩家 */
export default class jhPlayer extends PlayerInfo {
    seat: number;
    status: 'NONE' | 'WAIT' | 'GAME' | 'READY' = 'NONE';
    /**操作状态 */
    state: "PS_NONE" | "PS_OPER" = "PS_NONE"
    /**手牌 */
    cards: number[] = null;
    /**牌型 */
    cardType: number = 0;
    /**手牌状态 0.正常 1.看牌 2.弃牌 3.比牌失败 */
    holdStatus: number = 0;
    /**每局下注 */
    totalBet = 0;
    /**赢钱 */
    profit: number = 0;
    /**自动跟注 */
    auto_genzhu = false;
    /**防超时弃牌 */
    auto_no_Fold = true;
    /**是否结算 */
    is_settlement = false;
    gameRecordService: RecordGeneralManager;
    /**保留初始化金币 */
    initgold: number = 0;
    constructor(roomInfo: jhRoom, i: number, opts: any) {
        super(opts);
        this.seat = i;//座位号
        this.gold = opts.gold;//金币
        if (roomInfo.experience) {
            this.gold = 2000000;
        }
        this.initgold = this.gold;
    }

    /**包装机器人数据 */
    stripRobot() {
        return {
            cards: this.cards,
            cardType: this.cardType,
            uid: this.uid,
            isRobot: this.isRobot,
            gold: this.gold
        }
    }

    /**初始游戏信息 */
    initGame(roomInfo: jhRoom, cards: number[], cardType: number, betNum: number) {
        this.status = 'GAME';
        this.cards = cards;
        this.cards.sort((a, b) => {
            if (a % 13 === 0) return 0;
            if (b % 13 === 0) return 1;
            return b % 13 - a % 13;
        });
        this.cardType = cardType;
        this.holdStatus = 0;
        this.totalBet = betNum;
        this.gold -= betNum;
        roomInfo.record_history.oper.push({ uid: this.uid, oper_type: "lowBet", update_time: utils.cDate(), msg: betNum });
        this.initControlType();
    }

    /**返回手牌 */
    toHolds() {
        return this.cards && { uid: this.uid, cards: this.cards, type: this.cardType, isRobot: this.isRobot };
    }

    /**结算信息 */
    wrapSettlement() {
        return {
            uid: this.uid,
            seat: this.seat,
            totalBet: this.totalBet,
            profit: this.profit,
            gold: this.gold,
            holds: this.toHolds(),
        };
    }

    /**第一次发牌的数据 */
    wrapGame() {
        return {
            seat: this.seat,
            uid: this.uid,
            headurl: this.headurl,
            nickname: this.nickname,
            gold: this.gold,
            totalBet: this.totalBet,
            holds: null,
            holdStatus: this.holdStatus
        };
    }

    strip() {
        return {
            seat: this.seat,
            uid: this.uid,
            headurl: this.headurl,
            nickname: encodeURI(this.nickname),
            gold: this.gold,
            status: this.status,
            holdStatus: this.holdStatus,
            totalBet: this.totalBet,
            isRobot: this.isRobot,
            ip: this.ip,
        };
    }

    /**实况记录 */
    Record_strip() {
        return {
            uid: this.uid,
            isRobot: this.isRobot,
            seat: this.seat,
            nickname: this.nickname,
            headurl: this.headurl,
            gold: this.gold,
            totalBet: this.totalBet,
            hold: this.cards,
            cardType: this.cardType,
            holdStatus: this.holdStatus,
            profit: this.profit,
        }
    }
    /**掉线的时候获取信息 */
    kickStrip() {
        return {
            uid: this.uid,
            seat: this.seat
        };
    }

    /**结算金币 */
    async settlement(roomInfo: jhRoom) {
        roomInfo.record_history.max_uid = roomInfo.max_uid;
        this.gameRecordService = createPlayerRecordService();
        const data = this.gameRecordService
            .setPlayerBaseInfo(this.uid, false, this.isRobot, this.initgold)
            .setGameInfo(roomInfo.nid, roomInfo.sceneId, roomInfo.roomId)
            .setGameRoundInfo(roomInfo.roundId, roomInfo.realPlayersNumber, 0)
            .addResult(roomInfo.zipResult)
            .setControlType(this.controlType)
            .setGameRecordInfo(Math.abs(this.totalBet), Math.abs(this.totalBet), this.profit - this.totalBet, false)
            .setGameRecordLivesResult(roomInfo.record_history);
        let res = await data.sendToDB(1);
        this.is_settlement = true;

        this.gold = res.gold;
        this.initgold = this.gold;
        this.profit = res.playerRealWin;
    }

    /**对战类 特有， */
    async only_update_game(roomInfo: jhRoom) {
        if (!roomInfo.experience) {
            await this.gameRecordService.Later_updateRecord(roomInfo.record_history);
        }
    }

    /**玩家游戏内充值数据包装 */
    rechargeStrip() {
        return {
            uid: this.uid,
            seat: this.seat,
            gold: this.gold,
        }
    }

    handler_fold(roomInfo: jhRoom) {
        let flage = false;
        if (roomInfo.curr_doing_seat == this.seat && this.status == "GAME") {
            flage = true;
        }
        this.status = 'WAIT';
        this.state = "PS_NONE";
        this.settlement(roomInfo);
        this.holdStatus = 2;// 标记弃牌
        roomInfo.record_history.oper.push({ uid: this.uid, oper_type: "fold", update_time: utils.cDate(), msg: "" });
        // 如果是庄要让给上一个玩家
        (roomInfo.zhuang_seat === this.seat) && roomInfo.resetZhuang();
        // 通知
        for (const pl of roomInfo._players) {
            const member = pl && roomInfo.channel.getMember(pl.uid);
            if (!member) continue;
            const opts = { type: 'fold', seat: this.seat };
            if (pl.uid == this.uid) opts["cards"] = this.cards;
            MessageService.pushMessageByUids('ZJH_onOpts', opts, member);
        }
        /**改你操作且没有操作才检查 */
        const list = roomInfo._players.filter(pl => pl && pl.status == 'GAME');
        if (flage || list.length == 1) {
            roomInfo.checkHasNextPlayer(this.seat);
        }

    }

    /**
    * 看牌
    * @param player
    */
    handler_kanpai(roomInfo: jhRoom) {
        roomInfo.record_history.oper.push({ uid: this.uid, oper_type: "kanpai", update_time: utils.cDate(), msg: "" });
        roomInfo.channelIsPlayer('ZJH_onOpts', {
            type: 'kanpai',
            seat: this.seat,
            fahuaTime: this.seat === roomInfo.curr_doing_seat ? roomInfo.handler_pass() : 0
        });
    }
    /**
     * 跟注
     * @param player
     * @param betNum
    */
    handler_cingl(roomInfo: jhRoom, betNum: number) {
        // 先关闭定时
        clearTimeout(roomInfo.Oper_timeout);
        this.state = "PS_NONE";
        this.totalBet += betNum;
        this.gold -= betNum;
        roomInfo.addSumBet(this, betNum, "cingl");
        roomInfo.record_history.oper.push({ uid: this.uid, oper_type: "cingl", update_time: utils.cDate(), msg: betNum });
        // 通知
        roomInfo.channelIsPlayer('ZJH_onOpts', {
            type: 'cingl',
            seat: this.seat,
            gold: this.gold,
            betNum: betNum, // 下注金额
            totalBet: this.totalBet, // 当前已经下注金额
            sumBet: roomInfo.currSumBet
        });
        roomInfo.checkHasNextPlayer(this.seat);
    }
    /**
    * 加注
    * @param player
    * @param betNum 看牌会翻倍的
    * @param num 不能翻倍的
    */
    handler_filling(roomInfo: jhRoom, betNum: number, num: number) {
        // 先关闭定时
        clearTimeout(roomInfo.Oper_timeout);
        this.state = "PS_NONE";
        this.totalBet += betNum;
        this.gold -= betNum;
        // 提升下注额度
        roomInfo.betNum = num;
        roomInfo.addSumBet(this, betNum, "filling");
        roomInfo.record_history.oper.push({ uid: this.uid, oper_type: "filling", update_time: utils.cDate(), msg: betNum });
        // 通知
        roomInfo.channelIsPlayer('ZJH_onOpts', {
            type: "filling",
            seat: this.seat,
            gold: this.gold,
            betNum: betNum, // 下注金额
            totalBet: this.totalBet, // 当前已经下注金额
            sumBet: roomInfo.currSumBet
        });
        roomInfo.checkHasNextPlayer(this.seat);
    }

    /**孤注一掷 */
    async handler_Allfighting(roomInfo: jhRoom) {
        clearTimeout(roomInfo.Oper_timeout);
        this.state = "PS_NONE";
        let curr_bet = this.gold;
        this.totalBet += curr_bet;
        this.gold -= curr_bet;
        roomInfo.addSumBet(this, curr_bet, "allin");
        roomInfo.record_history.oper.push({ uid: this.uid, oper_type: "allin", update_time: utils.cDate(), msg: curr_bet });
        let flag = true;
        const gamePlayers = roomInfo._players.filter(pl => pl && pl.status == 'GAME');
        for (const pl of gamePlayers) {
            if (pl && pl.uid == this.uid)
                continue;
            let temp = GoldenFlower_logic.bipaiSole(this, pl);
            if (temp <= 0) {
                flag = false;
            }
        }
        roomInfo.channelIsPlayer('ZJH_onOpts', {
            type: 'allin',
            seat: this.seat,
            gold: this.gold,
            betNum: curr_bet,
            totalBet: this.totalBet,
            sumBet: roomInfo.currSumBet,
            iswin: flag,// 是否胜利
            // other: accept_pl.seat,// 另外一个人
        });
        if (!flag) {
            // 先将失败者 弃牌
            this.status = 'WAIT';
            this.holdStatus = 3;// 标记比牌失败
            // 如果是庄要让给上一个玩家
            (roomInfo.zhuang_seat == this.seat) && roomInfo.resetZhuang();
            //添加实况记录
            this.settlement(roomInfo);
        }
        /**获胜 返回金币 */
        if (flag) {
            for (const pl of gamePlayers) {
                if (pl && pl.uid == this.uid)
                    continue;
                let diff = pl.totalBet - this.totalBet;
                if (diff > 0) {
                    pl.totalBet -= diff;
                    // roomInfo.currSumBet -= diff;
                    roomInfo.addSumBet(pl, -diff, "allin");
                }
                pl.status = 'WAIT';
                pl.holdStatus = 3;// 标记比牌失败
                //添加实况记录
                pl.settlement(roomInfo);
            }
        }
        // 延迟动画时间 然后继续
        await utils.delay(1500);
        roomInfo.checkHasNextPlayer(this.seat);
        return flag;
    }
}
