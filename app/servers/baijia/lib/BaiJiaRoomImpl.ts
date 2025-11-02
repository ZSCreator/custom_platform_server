import { BaiJiaPlayerImpl } from './BaiJiaPlayerImpl';
import { SystemRoom } from '../../../common/pojo/entity/SystemRoom';
import { RoleEnum } from '../../../common/constant/player/RoleEnum';
import { CommonControlState } from "../../../domain/CommonControl/config/commonConst";
import ControlImpl from './ControlImpl';
import { pinus } from 'pinus';
import { PersonalControlPlayer } from "../../../services/newControl";
import { ControlKinds, ControlState } from "../../../services/newControl/constants";
import { buildRecordResult } from "./util/roomUtil";
import createPlayerRecordService from '../../../common/dao/RecordGeneralManager';
import baijia_logic = require('./baijia_logic');
import utils = require('../../../utils');
import baijiaConst = require('./baijiaConst');
import MessageService = require('../../../services/MessageService');
import JsonConfig = require('../../../pojo/JsonConfig');
import langsrv = require('../../../services/common/langsrv');
import roomManager, { BaijiaRoomManager } from '../lib/BaijiaRoomManagerImpl';
import { GetOnePl } from "../../../services/robotService/overallController/robotCommonOp";


/**下注倒计时（发牌，下注） */
let BET_COUNTDOWN = 15;
/**比牌倒计时 （比牌动画，展示结果，等待） */
let BIPAI_COUNTDOWN = 13;
/**洗牌时间 */
let SHUFFLE__COUNTDOWN = 3;

/**
 * 欢乐百人 - 游戏房间
 */
export default class BaiJiaRoomImpl extends SystemRoom<BaiJiaPlayerImpl> {
    entryCond: number;
    tallBet: number;
    ChipList: number[];
    /**最低下注要求 */
    lowBet: number;
    /**几幅牌 */
    pokerNum: number = 8;
    /**状态 BETTING.下注阶段 INBIPAI.比牌结算阶段 INSETTLE.结算中 */
    status: 'NONE' | 'BETTING' | 'INBIPAI' | 'INSETTLE' = 'NONE';
    /**使用3～8副，每副52张纸牌 */
    pais: number[];
    /**牌总数 张数 */
    allPoker: number;
    /**记录最后一次的倒计时 时间 */
    lastCountdownTime: number = 0;
    area_bet: { // 下注区域
        play: { mul: number; betUpperLimit: number; sumBet: number; }; // 闲
        draw: { mul: number; betUpperLimit: number; sumBet: number; }; // 和
        bank: { mul: number; betUpperLimit: number; sumBet: number; }; // 庄
        small: { mul: number; betUpperLimit: number; sumBet: number; }; // 小
        pair0: { mul: number; betUpperLimit: number; sumBet: number; }; // 闲对
        pair1: { mul: number; betUpperLimit: number; sumBet: number; }; // 庄对
        big: { mul: number; betUpperLimit: number; sumBet: number; }; // 大
    };
    regions: { cards: number[]; cardType: number; oldCardType: number; }[];
    /**开奖结果 */
    result: baijiaConst.KaiJiangReulst;

    baijiaHistory: { win_area: string }[] = [];
    /**历史纪录 */
    // historys2: {
    //     result: baijiaConst.KaiJiangReulst,
    //     play: { cards: number[], cardType: number },
    //     bank: { cards: number[], cardType: number }
    // }[] = [];

    /**额外倒计时 补第三张牌得时候需要 */
    additionalCountdown: number = 0;
    /**房间内玩家总投注 */
    allBets: number = 0;
    /**记录玩家投注 */
    betList: { uid: string, area: string, bet: number }[] = [];
    shuffle: boolean;
    /**多少局洗牌 */
    inningNum: number = 48;
    /**结算得时候++  inningNum 后重来*/
    bout: number = 0;
    // maxCount: any;
    /**申请上庄列表 */
    zj_List: BaiJiaPlayerImpl[] = [];
    /**上庄条件 */
    upZhuangCond: number;
    xiaZhuangUid: string;
    /**庄家信息 */
    zhuangInfo: { // 庄家信息
        uid: string;
        /**-1表示无限 */
        hasRound: number;
        /**庄家累计收益 */
        money: number;
        /**每局pin收益 */
        profit: number;
    };
    runInterval: NodeJS.Timer = null;
    countdown: number;
    players: BaiJiaPlayerImpl[] = [];
    // 必杀区域
    killAreas: Set<string>;
    // 调控逻辑
    controlLogic: ControlImpl;
    backendServerId: string;

    startTime: number;
    endTime: number;
    zipResult: string = '';
    /**欢乐百人和/对限红 */
    twainUpperLimit: number;
    /**欢乐百人大小/庄闲限红 */
    betUpperLimit: number;
    constructor(opts: any) {
        super(opts);
        this.backendServerId = pinus.app.getServerId();
        this.entryCond = opts.entryCond;
        this.tallBet = opts.tallBet * baijiaConst.BET_XIANZHI;
        this.twainUpperLimit = opts.twainUpperLimit;
        this.betUpperLimit = opts.betUpperLimit;
        this.ChipList = opts.ChipList;
        this.lowBet = opts.lowBet;
        this.pais = baijia_logic.getPai(this.pokerNum).slice(0, this.pokerNum * 52 - utils.random(30, 80));
        this.allPoker = this.pais.length; // 牌总数
        this.area_bet = {// 下注区域
            play: { mul: 1, betUpperLimit: this.betUpperLimit, sumBet: 0 }, // 闲
            draw: { mul: 8, betUpperLimit: this.twainUpperLimit, sumBet: 0 }, // 和
            bank: { mul: 1, betUpperLimit: this.betUpperLimit, sumBet: 0 }, // 庄
            small: { mul: 1.5, betUpperLimit: this.betUpperLimit, sumBet: 0 }, // 小
            pair0: { mul: 11, betUpperLimit: this.twainUpperLimit, sumBet: 0 }, // 闲对
            pair1: { mul: 11, betUpperLimit: this.twainUpperLimit, sumBet: 0 }, // 庄对
            big: { mul: 1.5, betUpperLimit: this.betUpperLimit, sumBet: 0 } // 大
        };
        this.regions = [
            { cards: null, cardType: 0, oldCardType: 0 }, // 庄
            { cards: null, cardType: 0, oldCardType: 0 }, // 闲
        ];
        this.result = null;// 结果
        this.baijiaHistory = opts.baijiaHistory || [];// 历史纪录

        this.shuffle = false;

        // this.maxCount = JsonConfig.get_games(this.nid).roomUserLimit;//房间运行最多坐多少人

        this.upZhuangCond = opts.ShangzhuangMinNum;// 上庄条件
        this.xiaZhuangUid = '';
        this.zhuangInfo = {// 庄家信息
            uid: null,
            hasRound: -1, // -1表示无限
            money: 0,//庄家累计收益
            profit: 0
        };
        this.killAreas = new Set();
        this.controlLogic = new ControlImpl({ room: this });
        this.ramodHistory();
        let AddCount = 0;
        do {
            let pl = GetOnePl();
            pl.gold = utils.random(this.upZhuangCond * 2, this.upZhuangCond * 3);
            this.addPlayerInRoom(pl);
            let ply = this.players[AddCount];

            this.zj_List.push(ply);
            AddCount++;
            ply.updatetime += AddCount * 2 * 60;
        } while (AddCount < 3);
    }

    close() {
        clearInterval(this.runInterval);
        this.sendRoomCloseMessage();
        this.players = [];
    }
    /**添加一个玩家 */
    addPlayerInRoom(dbplayer) {
        let currPlayer = this.getPlayer(dbplayer.uid);
        if (currPlayer) {
            currPlayer.sid = dbplayer.sid;
            this.offLineRecover(currPlayer);
            return true;
        }
        if (this.isFull()) return false;
        this.players.push(new BaiJiaPlayerImpl(dbplayer));
        // 添加到消息通道
        this.addMessage(dbplayer);

        // 更新真实玩家数量
        this.updateRealPlayersNumber();
        return true;
    }

    /**有玩家离开
     *@param isOffLine true 离线
     */
    leave(playerInfo: BaiJiaPlayerImpl, isOffLine: boolean) {
        //提出消息通道
        this.kickOutMessage(playerInfo.uid);
        if (this.zj_List.findIndex(pl => pl.uid == playerInfo.uid) !== -1) {
            this.exitUpzhuanglist(playerInfo.uid);
        }

        //玩家掉线离开
        if (isOffLine) {
            playerInfo.onLine = false;
            return;
        }
        utils.remove(this.players, 'uid', playerInfo.uid);

        // 更新真实玩家数量
        this.updateRealPlayersNumber();
        this.playerLeave();
    }

    /**玩家离开通知 */
    playerLeave() {
        const opts = {
            roomId: this.roomId,
            list: this.rankingLists().slice(0, 6),
            playerNum: this.players.length
        }
        this.channelIsPlayer('bj_onExit', opts);
    }

    /**获取当前状态的倒计时 时间 */
    getCountdownTime() {
        const time = Date.now() - this.lastCountdownTime;
        if (this.status === 'INSETTLE')
            return (BIPAI_COUNTDOWN + 1 + this.additionalCountdown + (this.shuffle ? SHUFFLE__COUNTDOWN : 0)) * 1000;
        if (this.status === 'BETTING')
            return Math.max((BET_COUNTDOWN) * 1000 - time, 500);
        if (this.status === 'INBIPAI')
            return Math.max((BIPAI_COUNTDOWN + this.additionalCountdown + (this.shuffle ? SHUFFLE__COUNTDOWN : 0)) * 1000 - time, 500);
        return 0;
    }



    /**运行游戏 */
    async run() {
        this.lastCountdownTime = Date.now();
        await this.Initialization();
        //开启定时器
        this.openTimer();
    }

    async Initialization() {
        this.players.forEach(pl => pl.initGame(this));
        await this.br_kickNoOnline();
        await this.check_zjList();// 初始化之后
        await this.initRoom();//初始化房间信息
    }

    /**当前庄家相关操作 */
    async check_zjList() {
        do {
            if (this.zhuangInfo.uid) {
                this.zhuangInfo.hasRound--;
                const zj_pl = this.getPlayer(this.zhuangInfo.uid);
                if (zj_pl && zj_pl.gold < this.upZhuangCond) {
                    const member = this.channel.getMember(zj_pl.uid);
                    member && MessageService.pushMessageByUids('bj_onKickZhuang', { msg: langsrv.getlanguage(zj_pl.language, langsrv.Net_Message.id_1218) }, member);
                    this.zhuangInfo.uid = null;
                }
                // 扣除庄家回合
                if (this.zhuangInfo.hasRound <= 0) {
                    this.zhuangInfo.uid = null;
                }
                /**提前下庄收入40% 手续费 */
                if (zj_pl && this.zhuangInfo.uid == this.xiaZhuangUid) {
                    this.xiaZhuangUid = '';
                    this.zhuangInfo.uid = null;
                    if (this.zhuangInfo.money > 0) {
                        let profit = -this.zhuangInfo.money * 0.4;
                        const res = await createPlayerRecordService()
                            .setPlayerBaseInfo(zj_pl.uid, false, zj_pl.isRobot, zj_pl.gold)
                            .setGameInfo(this.nid, this.sceneId, this.roomId)
                            .setGameRecordInfo(0, 0, profit, false)
                            .addResult(this.zipResult)
                            .sendToDB(2);
                        zj_pl.gold = res.gold;
                    }
                }
                if (this.zhuangInfo.uid) {
                    this.noticeZhuangInfo();
                    return;
                }
            }
            if (this.zhuangInfo.uid == null) {
                let queue_one = this.zj_List.shift() || null;
                if (!queue_one) {
                    break;
                }
                let zj_pl = queue_one ? this.getPlayer(queue_one.uid) : null;
                if (!zj_pl || (zj_pl && zj_pl.onLine == false)) {
                    continue;
                }
                if (zj_pl.gold < this.upZhuangCond) {
                    const member = this.channel.getMember(zj_pl.uid);
                    member && MessageService.pushMessageByUids('bj_onKickZhuang',
                        { msg: langsrv.getlanguage(zj_pl.language, langsrv.Net_Message.id_1219) }, member);
                    continue;
                }
                //初始化庄家信息
                this.zhuangInfo.uid = zj_pl.uid;
                this.zhuangInfo.hasRound = zj_pl ? baijiaConst.ZHUANG_NUM : -1;
                this.zhuangInfo.money = 0;
                // 通知嘛
                this.noticeZhuangInfo();
                return;
            }
        } while (true);
    }

    //开始倒计时
    openTimer() {
        clearInterval(this.runInterval);
        this.runInterval = setInterval(() => this.update(), 1000);
        // console.log('百家', this.roomId + ' 房间开始');
    }

    //检测牌是不是够，不够通知前端加牌
    addPoker() {
        if (this.bout == this.inningNum) {
            this.baijiaHistory = [];
            this.pais = baijia_logic.getPai(this.pokerNum);
            this.shuffle = true;
            this.cuttingPoker();
            this.bout = 0;
        }
    }

    /**切牌 */
    cuttingPoker() {
        let index = this.pais.length - utils.random(30, 80);
        this.pais = this.pais.slice(0, index);
        this.allPoker = this.pais.length;//牌总数
    }

    // 一秒执行一次
    update() {
        if (this.status === 'INSETTLE')
            return;
        --this.countdown;
        if (this.countdown > 0) {
            return;
        }
        this.lastCountdownTime = Date.now();
        switch (this.status) {
            case 'BETTING':// 如果是下注阶段 就开始结算
                this.status = 'INSETTLE';
                this.Settlement();
                break;
            case 'INBIPAI':// 如果是比牌阶段 就开始等待
                this.Initialization();
                break;
        }
    }

    /**初始化 */
    async initRoom() {
        this.countdown = BET_COUNTDOWN;
        this.channelIsPlayer('bj_bet', { roundId: this.roundId, countdown: this.countdown });
        this.shuffle = false;
        this.addPoker();//检测是不是需要洗牌
        this.status = 'BETTING';
        roomManager.pushRoomStateMessage(this.roomId, {
            nid: this.nid,
            roomId: this.roomId,
            sceneId: this.sceneId,
            countDown: this.countdown,
            status: this.status,
            historyData: this.toResultBack()
        });
        this.allBets = 0;
        this.betList = [];
        this.regions.forEach(m => {
            m.cards = null;
            m.cardType = 0;
        });
        for (let key in this.area_bet) {
            this.area_bet[key].sumBet = 0;
        }
        //重置每局庄的收益
        this.zhuangInfo.profit = 0;
        this.killAreas.clear();

        // 初始化回合id
        this.updateRoundId();

        // 更新真实玩家数量
        this.updateRealPlayersNumber();
        this.startTime = Date.now();
        this.zipResult = '';
    }

    // 比牌 结算
    async Settlement() {
        this.bout++;

        const { cards0, cards1 } = await this.controlLogic.runControl();

        // 发牌 - 闲
        this.regions[0].cards = cards0;
        let cardType0 = this.regions[0].oldCardType = baijia_logic.getCardTypeTo9(cards0);

        // 发牌 - 庄
        this.regions[1].cards = cards1;
        let cardType1 = this.regions[1].oldCardType = baijia_logic.getCardTypeTo9(cards1);

        // 检查 闲 是否补第三张牌
        this.additionalCountdown = 0;
        let bupai: number = -1;
        if (baijia_logic.canBupaiByPlay(cardType0, cardType1)) {
            bupai = this.seqDeal()[0];
            cards0.push(bupai);
            this.additionalCountdown += 1;
        }

        // 检查 庄 是否补第三张牌
        if (baijia_logic.canBupaiByBank(cardType0, cardType1, bupai)) {
            cards1.push(...this.seqDeal());
            this.additionalCountdown += 1;
        }

        // 设置倒计时 时间
        this.countdown = BIPAI_COUNTDOWN + this.additionalCountdown;

        // 获取结果
        cardType0 = this.regions[0].cardType = baijia_logic.getCardTypeTo9(cards0);
        cardType1 = this.regions[1].cardType = baijia_logic.getCardTypeTo9(cards1);
        this.result = baijia_logic.getResultTo9(cards0, cards1, cardType0, cardType1);

        // 压缩开奖结果
        this.zipResult = buildRecordResult(cards0, cards1, this.result);

        // try {
        //     //记录开奖结果日志(有玩家玩的情况下才记录)
        //     this.players.length && baijiaLogger.info(`开奖结果|${this.nid}|${this.roomId}|闲:${cards0}|庄:${cards1}`);
        // } catch (error) {
        //     console.error('欢乐百人开奖结果日志记录失败', error);
        // }
        // 结账 - 在线的加离线的
        let playerSumProfit = this.settlement(this.players);

        this.endTime = Date.now();

        const zhuangPlayer = this.getPlayer(this.zhuangInfo.uid);
        //如果是庄
        {
            let profit = - playerSumProfit;
            this.zhuangInfo.profit = profit;
            if (zhuangPlayer) {
                zhuangPlayer.profit = profit;
                zhuangPlayer.validBet = Math.abs(profit);
                zhuangPlayer.bet = Math.abs(profit);
            }
        }


        // 记录 历史纪录
        // this.recordHistorys2(this.result, cards0, cards1, cardType0, cardType1);
        // 记录 历史纪录
        this.recordHistorys(this.result);
        this.addByBaijia(playerSumProfit);

        // 执行加钱 - 在线的
        for (const pl of this.players) {
            await pl.updateGold(this);
        }

        this.channelIsPlayer(`hlbj_over`, { roomId: this.roomId });

        roomManager.pushRoomStateMessage(this.roomId, {
            nid: this.nid,
            roomId: this.roomId,
            sceneId: this.sceneId,
            countDown: this.countdown,
            status: `INBIPAI`,
            roundId: this.roundId,
            historyData: this.toResultBack()
        });
        this.status = 'INBIPAI';
    }


    /**计算当前盘面玩家预结算 */
    preSettlement(result: { cards0: number[], cards1: number[] }, controlState: CommonControlState = CommonControlState.RANDOM) {
        // 发牌 - 闲
        let cards0 = result.cards0.slice();
        let cardType0 = baijia_logic.getCardTypeTo9(cards0);

        // 发牌 - 庄
        let cards1 = result.cards1.slice();
        let cardType1 = baijia_logic.getCardTypeTo9(cards1);


        let bupai: number[] = [], bupai2: number[] = [];
        // 现价是否补牌
        if (baijia_logic.canBupaiByPlay(cardType0, cardType1)) {
            // 只获取一张
            bupai = this.seqDeal();
            cards0.push(...bupai);
        }

        // 检查 庄 是否补第三张牌
        if (baijia_logic.canBupaiByBank(cardType0, cardType1, bupai[0])) {
            bupai2 = this.seqDeal();
            cards1.push(...bupai2);
        }

        this.pais = [...bupai, ...bupai2].concat(this.pais);
        // 获取结果
        cardType0 = baijia_logic.getCardTypeTo9(cards0);
        cardType1 = baijia_logic.getCardTypeTo9(cards1);
        this.result = baijia_logic.getResultTo9(cards0, cards1, cardType0, cardType1);

        // 如果需要获取调控玩家
        let copyPlayers;
        if (controlState === CommonControlState.RANDOM) {
            // 获取玩家的当局收益情况 如果有人做庄且是真实玩家则获取的是机器人的收益情况
            copyPlayers = this.copyPlayers();
        } else {
            copyPlayers = this.copyControlPlayers(controlState);
        }

        // 结账 - 在线的加离线的
        return this.yuSettlement(copyPlayers);
    }

    /**
     * 如果有人做庄 且是真实玩家则获取的是机器人的收益情况
     */
    copyPlayers() {
        const filterProfitType = this.getBankerRobotType();

        return this.players.filter(m => m.isRobot !== filterProfitType).map(m => {
            const obj = {};
            for (let key in m) {
                obj[key] = m[key];
            }
            return obj;
        });
    }

    /**
     * 获取调控玩家
     * @param state
     */
    copyControlPlayers(state: CommonControlState) {
        return this.players.filter(p => p.controlState === state).map(p => {
            const obj = {};
            for (let key in p) {
                obj[key] = p[key];
            }

            return obj;
        });
    }

    /**获取count张牌 */
    deal(count = 1) {
        this.pais.sort((x, y) => Math.random() - 0.5);
        const ret: number[] = [];
        for (let i = 0; i < count; i++) {
            ret.push(this.pais.splice(utils.random(0, this.pais.length - 1), 1)[0]);
        }
        return ret;
    }

    /**
     * 顺序补牌
     */
    seqDeal() {
        const result: number[] = [];
        result.push(this.pais.shift());
        return result;
    }

    /**结算 */
    settlement(list: BaiJiaPlayerImpl[]) {
        let sum = 0;
        for (const pl of list) {
            pl.settlement(this.result);
            sum += pl.profit;
        }
        return sum;
    }

    /**预结算 */
    yuSettlement(list: any[]) {
        let sum = 0;
        for (const pl of list) {
            for (let key in this.result) {
                // 如果是必杀区域不计算收益
                if (this.killAreas.has(key)) continue;
                const v = pl.bets[key];
                if (this.result[key]) {
                    sum += Math.floor(v.bet * v.mul);
                } else {
                    sum -= v.bet;
                }
            }
            // 如果是和 把压得庄和闲退回
            if (this.result.draw) {
                sum += pl.bets.play.bet;
                sum += pl.bets.bank.bet;
            }
        }
        return sum;
    }

    // 记录 历史纪录
    recordHistorys(result: baijiaConst.KaiJiangReulst) {
        while (this.baijiaHistory.length >= 100) {
            this.baijiaHistory.shift();
        }
        // 第一个不能为和 否则引发前端bug
        while (this.baijiaHistory.length >= 1 && this.baijiaHistory[0].win_area === 'draw') {
            this.baijiaHistory.shift();
        }
        let value = '';
        if (result.play) {
            value = 'play';
        } else if (result.bank) {
            value = 'bank';
        } else if (result.draw) {
            value = 'draw';
        }
        if (value !== '') {
            if (result.pair0) {
                value += '-0';
            }
            if (result.pair1) {
                value += '-1';
            }
            this.baijiaHistory.push({ win_area: value });
        }
    }
    ramodHistory() {
        let numberOfTimes = utils.random(10, 30);
        this.bout = numberOfTimes;
        do {
            let randomIndex = utils.random(1, 100);
            let result: baijiaConst.KaiJiangReulst = {}
            if (randomIndex <= 45) {
                result.play = true;
            } else if (randomIndex <= 90) {
                result.bank = true;
            } else {
                result.draw = true;
            }
            this.deal(4);
            this.recordHistorys(result);
            numberOfTimes--;
        } while (numberOfTimes > 0);
    }
    /**历史纪录2 */
    // recordHistorys2(result: baijiaConst.KaiJiangReulst, cards0: number[], cards1: number[], cardType0: number, cardType1: number) {
    //     (this.historys2.length >= 10) && this.historys2.pop();
    //     this.historys2.unshift({
    //         result: result,
    //         play: { cards: cards0, cardType: cardType0 },
    //         bank: { cards: cards1, cardType: cardType1 },
    //     });
    // }


    /**下注 */
    onBeting(currPlayer: BaiJiaPlayerImpl, msg: { area: string, bet: number }) {
        this.baijiaBet(currPlayer, [msg]);
        this.bj_onBeting(currPlayer, [msg]);
    }

    /**下注 */
    baijiaBet(player: BaiJiaPlayerImpl, RecordBets: { area: string, bet: number }[]) {
        for (const RecordBet of RecordBets) {
            //玩家下注记录
            player.maxBet += RecordBet.bet;
            player.bet += RecordBet.bet;
            player.bets[RecordBet.area].bet += RecordBet.bet;
            //房间下注记录
            this.allBets += RecordBet.bet;
            this.betList.push({ uid: player.uid, area: RecordBet.area, bet: RecordBet.bet });
            this.area_bet[RecordBet.area].sumBet += RecordBet.bet;
        }
    }

    /**下注推送 */
    bj_onBeting(playerInfo: BaiJiaPlayerImpl, betNums: { area: string, bet: number }[]) {
        let RecordBets: { uid: string, area: string, bet: number }[] = [];
        for (const betNum of betNums) {
            RecordBets.push({ uid: playerInfo.uid, area: betNum.area, bet: betNum.bet });
        }
        let opts = {
            roomId: this.roomId,
            uid: playerInfo.uid,
            gold: playerInfo.gold - playerInfo.bet,
            RecordBets: RecordBets, // 下注金额
            curBetNums: playerInfo.bets, // 当前已经下注金额s
            area_bet: this.area_bet,
            list: this.rankingLists().slice(0, 6)
        }
        this.channelIsPlayer('bj_onBeting', opts);
    }

    /**需押 */
    onGoonBet(player: BaiJiaPlayerImpl) {
        // player.onGoonBetNum++;
        // for (let key in player.lastBets) {
        // const num = player.lastBets[key];
        this.baijiaBet(player, player.lastBets);
        // }
        this.bj_onBeting(player, player.lastBets);
    }


    /**返回开始下注信息 */
    toBetBack() {
        const zhuang = this.getPlayer(this.zhuangInfo.uid);
        return {
            paiCount: this.pais.length,
            zhuangInfo: zhuang && zhuang.strip(this.zhuangInfo.hasRound),
            applyZhuangs: this.zj_List.map(pl => pl.strip1())// 上庄列表
        };
    }

    /**返回结果信息 */
    toResultBack() {
        const zj_pl = this.getPlayer(this.zhuangInfo.uid);
        let res = zj_pl ? { uid: zj_pl.uid, gold: zj_pl.gold, profit: this.zhuangInfo.profit } : { uid: null, profit: this.zhuangInfo.profit };
        return {
            paiCount: this.pais.length,
            regions: this.regions,
            result: this.result,
            baijiaHistory: this.baijiaHistory,
            // historys2: this.historys2,
            players: this.players.filter(pl => pl.bet > 0).map(pl => pl.result()),
            isShuffle: this.shuffle,
            allPoker: this.allPoker,
            zhuangInfo: res
        }
    }

    strip() {
        const zhuang = this.getPlayer(this.zhuangInfo.uid);
        return {
            roomId: this.roomId,
            lowBet: this.lowBet,
            status: this.status === 'INSETTLE' ? 'INBIPAI' : this.status,
            countdownTime: this.getCountdownTime(),
            paiCount: this.pais.length,
            area_bet: this.area_bet,
            baijiaHistory: this.baijiaHistory,
            // historys2: this.historys2,
            allPoker: this.allPoker,
            zhuangInfo: zhuang && zhuang.strip(this.zhuangInfo.hasRound),
            applyZhuangs: this.zj_List.map(pl => pl.strip1()),// 上庄列表
        };
    }
    /**更新历史记录 */
    async addByBaijia(money: number) {
        // const { system_room, room_lock } = await RoomManager.getOneLockedRoomFromCluster(pinus.app.getServerId(), this.nid, this.roomId);

        // let changeArr = ['baijiaHistory'];

        // system_room['baijiaHistory'] = this.baijiaHistory;
        //跟新奖池
        // RoomManager.updateOneRoomFromCluster(pinus.app.getServerId(), system_room, changeArr, room_lock);
    }

    /**获取房间列表 会返回胜率 以及上局收益 只取50条 */
    rankingLists() {
        let stripPlayers = this.players.map(pl => {
            if (pl) {
                return {
                    uid: pl.uid,
                    nickname: pl.nickname,
                    headurl: pl.headurl,
                    gold: pl.gold - pl.bet,
                    winRound: pl.winRound,
                    totalBet: pl.bet,
                    totalProfit: utils.sum(pl.totalProfit),
                }
            }
        });
        stripPlayers.sort((pl1, pl2) => {
            return pl2.winRound - pl1.winRound;
        });
        let copy_player = stripPlayers.shift();
        stripPlayers.sort((pl1, pl2) => {
            return utils.sum(pl2.gold + pl2.totalBet) - utils.sum(pl1.gold + pl2.totalBet)
        });
        stripPlayers.unshift(copy_player);
        return stripPlayers;
    }

    //断线重连获取数据
    getOffLineData(player: BaiJiaPlayerImpl) {
        let data = { isOnLine: false, toResultBack: null };
        //当前正是这个玩家说话
        data.toResultBack = this.toResultBack();
        return data;
    }

    /**跑马灯 */
    addNote(playerInfo: BaiJiaPlayerImpl, profit: number) {
        if (playerInfo.profit >= 100000) {
            //播放跑马灯
            MessageService.sendBigWinNotice(this.nid, playerInfo.nickname, playerInfo.profit, playerInfo.isRobot, playerInfo.headurl);
        }
    }

    /**通知庄家信息 有变动及时 调用 */
    noticeZhuangInfo() {
        try {
            const zhuang = this.getPlayer(this.zhuangInfo.uid);
            const opts = {
                zhuangInfo: zhuang && zhuang.strip(this.zhuangInfo.hasRound),//当前庄家信息
                applyZhuangs: this.zj_List.map(pl => {
                    return {
                        uid: pl.uid,
                        headurl: pl.headurl,
                        nickname: pl.nickname,
                        gold: pl.gold,
                        isRobot: pl.isRobot
                    }
                }),//上庄列表
                applyZhuangsNum: this.zj_List.length
            }
            this.channelIsPlayer('bj_onUpdateZhuangInfo', opts);
        } catch (error) {
            console.warn(JSON.stringify(this.zj_List));
        }
    }

    /**
     * 申请上庄
     */
    applyUpzhuang(playerInfo: BaiJiaPlayerImpl) {
        this.zj_List.push(playerInfo);
        this.noticeZhuangInfo();
    }

    /**
     * 退出上庄列表
     */
    exitUpzhuanglist(uid: string) {
        utils.remove(this.zj_List, 'uid', uid);
        this.noticeZhuangInfo();
    }

    /**
     * 检查庄是否有足够的金币赔，该方法只针对平民场s
     * @returns {boolean}
     */
    checkZhangEnoughMoney(RecordBets: { area: string, bet: number }[]) {
        const zhuang = this.getPlayer(this.zhuangInfo.uid);
        let isEnough = true;
        if (zhuang) {
            isEnough = false;
            let area_bet = utils.clone(this.area_bet);
            for (const RecordBet of RecordBets) {
                area_bet[RecordBet.area].sumBet += RecordBet.bet;
            }

            /**庄对 闲对 计算区间 */
            let A = area_bet.pair0.sumBet * area_bet.pair0.mul + area_bet.pair1.sumBet * area_bet.pair1.mul;
            /**大小计算区间 */
            let B = Math.max(area_bet.big.sumBet, area_bet.small.sumBet) * area_bet.small.mul -
                Math.min(area_bet.big.sumBet, area_bet.small.sumBet);
            /**庄闲 区间 */
            let C = Math.max(
                area_bet.draw.sumBet * area_bet.draw.mul,
                area_bet.bank.sumBet - area_bet.play.sumBet,
                area_bet.play.sumBet - area_bet.bank.sumBet);
            if (zhuang.gold > (A + B + C)) {
                isEnough = true;
            }
        }
        return isEnough;
    }

    /**踢掉离线玩家 */
    async br_kickNoOnline() {
        const players = this.zhuangInfo ? this.players.filter(p => p.uid !== this.zhuangInfo.uid) : this.players;

        const offlinePlayers = await this.kickOfflinePlayerAndWarnTimeoutPlayer(players,
            5, 3);

        offlinePlayers.forEach(p => {
            this.leave(p, false)

            // 不在线则从租户列表中删除 如果在线则是踢到大厅则不进行删除
            if (!p.onLine) {
                // 删除玩家
                roomManager.removePlayer(p);
            } else {
                roomManager.playerAddToChannel(p);
            }

            // 移除玩家在房间房间器中的位置
            roomManager.removePlayerSeat(p.uid);
        });
    }

    /**
     * 计算玩家有效押注
     * @param player
     */
    calculateValidBet(player: BaiJiaPlayerImpl) {
        const zhuangPlayer = this.getPlayer(this.zhuangInfo.uid)
        if (zhuangPlayer && zhuangPlayer.uid == player.uid) {
            return;//庄家不能往下走
        }
        const keys = Object.keys(player.bets), calculateArr = [], betAreas = player.bets;
        let count = 0;

        for (let i = 0, len = keys.length; i < len; i++) {
            const area = keys[i];

            // 不参与对押的区域跳过
            if (!baijiaConst.validAreas.includes(area)) {
                count += betAreas[area].bet;
                continue;
            }

            const mappingArea = baijiaConst.mapping[area];

            // 已经计算的过的跳过 和值跳过
            if (calculateArr.includes(mappingArea))
                continue;

            const
                areaBet = betAreas[area].bet,
                mappingAreaBet = betAreas[mappingArea].bet;

            count += (Math.max(areaBet, mappingAreaBet) - Math.min(areaBet, mappingAreaBet));
            calculateArr.push(area);
        }

        player.validBetCount(count);
    }

    /**判断玩家是否是真实玩家 如果是则返回 则返回庄家的类型 其他情况返回机器人类型 */
    getBankerRobotType() {
        const player = this.getPlayer(this.zhuangInfo.uid);

        return !!player ? player.isRobot : 2;
    }

    /**
     * 获取玩家的押注
     * @param filterType 如果为默认值4则返回机器人和所有的玩家的
     */
    getPlayerAllBet(filterType = 4) {
        if (filterType === 4) {
            return this.allBets;
        }

        return this.players.reduce((total, p) => {
            if (p.isRobot !== filterType) {
                total += p.filterBetNum(this.killAreas);
            }
            return total;
        }, 0);
    }

    /**
     * 获取调控玩家的押注
     * @param state 调控玩家状态
     */
    getControlPlayerTotalBet(state: CommonControlState) {
        return this.players.reduce((total, p) => {
            if (p.controlState === state) {
                total += p.bet;
            }
            return total;
        }, 0);
    }


    /**
     * 获取随机结果
     */
    getRandomLotteryResult() {
        let card1 = this.deal(2);
        let card2 = this.deal(2);
        return { cards0: card1, cards1: card2 };
    }

    /**
     * 获取一个不是必杀区域的随机结果
     */
    getNotContainKillAreaResult() {
        let result: {
            cards0: number[];
            cards1: number[];
        };
        for (let i = 0; i < 100; i++) {
            result = this.getRandomLotteryResult();
            this.preSettlement(result);

            // 判断是否包含必杀区域
            if (Object.keys(this.result).find(key => this.result[key] && this.killAreas.has(key))) {
                this.pais.push(...result.cards0);
                this.pais.push(...result.cards1);
                continue;
            }

            break;
        }

        return result;
    }

    /**
     * 获取一个必赢或者必输的方法
     */
    getWinORLossResultFunc(isSystemWin: boolean) {
        let result, bankerType = this.getBankerRobotType(), playerBet = this.getPlayerAllBet(bankerType);
        for (let i = 0; i < 100; i++) {
            result = this.getRandomLotteryResult();
            const gain = this.preSettlement(result);


            // 判断是否包含必杀区域
            if (Object.keys(this.result).find(key => this.result[key] && this.killAreas.has(key))) {
                this.pais.push(...result.cards0);
                this.pais.push(...result.cards1);
                continue;
            }

            // 如果当庄的是玩家
            if (bankerType === 0) {
                if (isSystemWin && gain >= 0) {
                    break;
                }
                if (!isSystemWin && gain <= 0) {
                    break;
                }
            } else {
                if (isSystemWin && gain <= 0) {
                    break;
                }

                if (!isSystemWin && gain >= 0) {
                    break;
                }
            }

            this.pais.push(...result.cards0);
            this.pais.push(...result.cards1);
        }

        return result;
    }

    /**
     * 获取调控结果
     */
    async sceneControlResult(sceneControlState: ControlState, isPlatformControl: boolean) {
        if (this.players.every(player => player.isRobot === RoleEnum.ROBOT) || sceneControlState === ControlState.NONE) {
            return this.getNotContainKillAreaResult();
        }

        const type = isPlatformControl ? ControlKinds.PLATFORM : ControlKinds.SCENE;
        this.players.forEach(p => p.bet > 0 && p.setControlType(type));
        return this.getWinORLossResultFunc(sceneControlState === ControlState.SYSTEM_WIN);
    }

    /**
     * 庄是否是真实玩家
     */
    bankerIsRealMan(): boolean {
        const banker = this.getPlayer(this.zhuangInfo.uid);
        return !!banker && banker.isRobot === 0;
    }

    /**
     * 添加必杀区域
     * @param params
     */
    public addKillArea(params: { area: string }): void {
        this.killAreas.add(params.area);
    }

    /**
     * 标记玩家
     * @param params
     */
    setPlayersState(params: { players: PersonalControlPlayer[], state: CommonControlState }) {
        params.players.forEach(p => {
            const player = this.getPlayer(p.uid);
            player.setControlType(ControlKinds.PERSONAL);
            player.setControlState({ state: params.state });
        })
    }

    /**
     * 个控发牌
     */
    personalDealCards(params: { state: CommonControlState }) {
        let result: { cards0: number[], cards1: number[] };

        for (let i = 0; i < 100; i++) {
            result = this.getRandomLotteryResult();
            const gain = this.preSettlement(result, params.state);

            if (params.state === CommonControlState.LOSS && gain < 0) {
                break;
            }

            if (params.state === CommonControlState.WIN && gain > 0) {
                break;
            }

            // 如果不满足条件则把牌补回去
            this.pais.push(...result.cards0);
            this.pais.push(...result.cards1);
        }

        return result;
    }

    /**
     * 庄调控发牌
     * @param params
     * @param params.bankerWin 如果为true 表示开一个庄赢的结果出来  如果false 表示开一个庄输的结果出来
     */
    controlDealCardsBanker(params: { bankerWin: boolean }) {
        return this.getWinORLossResultFunc(!params.bankerWin);
    }
}