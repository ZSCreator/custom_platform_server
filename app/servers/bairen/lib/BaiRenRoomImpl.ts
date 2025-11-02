import { BaiRenPlayerImpl, BaiRenPlayerImpl as Player } from './BaiRenPlayerImpl';
import { SystemRoom } from '../../../common/pojo/entity/SystemRoom';
import ControlImpl from "./ControlImpl";
import * as langsrv from '../../../services/common/langsrv';
import { CommonControlState } from "../../../domain/CommonControl/config/commonConst";
import { IZhuangResult } from './interface/IZhuangResult';
import { pinus } from 'pinus';
import { PersonalControlPlayer } from "../../../services/newControl";
import { ControlKinds, ControlState } from "../../../services/newControl/constants";
import { buildRecordResult } from "./util/roomUtil";
import * as BRNN_Logic from './BRNN_Logic';
import createPlayerRecordService from '../../../common/dao/RecordGeneralManager';
import { RoleEnum } from "../../../common/constant/player/RoleEnum";
import utils = require('../../../utils');
import bairenConst = require('./constant/bairenConst');
import MessageService = require('../../../services/MessageService');
import JsonConfig = require('../../../pojo/JsonConfig');
import roomManager, { BairenRoomManager } from '../lib/BairenRoomManager';
import { GetOnePl } from '../../../services/robotService/overallController/robotCommonOp';
/**下注倒计时（发牌) */
const LICENSING_COUNTDOWN = 4;
/**下注倒计时（下注） */
const BET_COUNTDOWN = 15;
/**比牌倒计时 （比牌动画，展示结果，等待） */
const BIPAI_COUNTDOWN = 12;

/**
 * 欢乐牛牛 - 游戏房间
 */
export class BaiRenRoomImpl extends SystemRoom<Player> {
    /**上庄条件 */
    upZhuangCond: number;
    entryCond: number;
    lowBet: number;
    tallBet: number;
    ChipList: number[];
    /**庄闲最大赔付倍数 */
    compensate: number;
    /**状态 BETTING.下注阶段 INBIPAI.比牌结算阶段 INBIPAI.结算中 */
    status: 'NONE' | 'Licensing' | 'BETTING' | 'INBIPAI' = 'NONE';
    /**申请庄列表 */
    zj_queues: Player[] = [];
    /**庄家信息 */
    zhuangInfo: {
        uid: string;
        /**-1表示无限 */
        hasRound: number;
        /**庄家累计收益 */
        money: number;
    };
    /**庄家开奖结果 */
    zhuangResult: IZhuangResult;
    /**下注区域相关信息 天地玄黄 */
    lotterys: bairenConst.IBaiRenRegions[] = [];
    /**记录最后一次的倒计时 时间 */
    lastCountdownTime: number = 0;
    /**押注情况 */
    situations: { area: number, betList: { uid: string, bet: number, updatetime: number }[], totalBet: 0 }[] = [];
    /**申请下庄uid 只有庄家才可以申请 */
    xiaZhuangUid = '';
    /**牌堆 52张 */
    pais: number[] = [];
    countdown: number;
    runInterval: NodeJS.Timer = null;
    allPais: any[] = [];
    players: Player[] = [];
    controlLogic: ControlImpl;
    // consumeTotal: number;
    backendServerId: string;

    startTime: number;
    endTime: number;
    zipResult: string = '';
    bairenHistory: any[];

    /** 闲押注区域备份 */
    areasBackup: any = null;
    /** 扑克备份 */
    cardsBackup: any = null;
    /** 庄拍备份 */
    bankerBackup: any = null;

    killAreas: Set<number> = new Set();
    private roomManager: BairenRoomManager;

    constructor(opts: any) {
        super(opts)
        this.roomManager = roomManager;
        this.backendServerId = pinus.app.getServerId();
        this.upZhuangCond = opts.ShangzhuangMinNum;// 上庄条件
        this.entryCond = opts.entryCond;
        this.lowBet = opts.lowBet;
        this.ChipList = opts.ChipList;
        this.tallBet = opts.tallBet * bairenConst.XIAN_HONG;
        this.compensate = opts.compensate;//
        this.bairenHistory = opts.bairenHistory || [];
        this.zhuangInfo = {// 庄家信息
            uid: null,
            hasRound: -1, // -1表示无限
            money: 0//庄家累计收益
        };
        this.zhuangResult = {// 当前庄家结果
            cards: null, // 牌
            cardType: 0, // 牌型
            profit: 0,
            isniu: false,
            cardNum: []
        };
        this.maxCount = JsonConfig.get_games(opts.nid).roomUserLimit;//房间运行最多坐多少人
        this.controlLogic = new ControlImpl({ room: this });
        this.ramodHistory();
        this.Initialization();
        let AddCount = 0;
        do {
            let pl = GetOnePl();
            pl.gold = utils.random(this.upZhuangCond * 3, this.upZhuangCond * 4);
            this.addPlayerInRoom(pl);
            let ply = this.players[AddCount];
            this.zj_queues.push(ply);
            AddCount++;
            ply.updatetime += AddCount * 2 * 60;
        } while (AddCount < 3);
    }

    /**初始化房间信息 */
    async Initialization() {
        this.players.forEach(pl => pl.initGame(this));
        await this.br_kickNoOnline();
        this.situations = [
            { area: 0, betList: [], totalBet: 0 },
            { area: 1, betList: [], totalBet: 0 },
            { area: 2, betList: [], totalBet: 0 },
            { area: 3, betList: [], totalBet: 0 },
        ];
        this.lotterys = [
            { area: 0, cards: null, cardType: 0, multiple: 0, isWin: false, isniu: false, cardNum: [] },
            { area: 1, cards: null, cardType: 0, multiple: 0, isWin: false, isniu: false, cardNum: [] },
            { area: 2, cards: null, cardType: 0, multiple: 0, isWin: false, isniu: false, cardNum: [] },
            { area: 3, cards: null, cardType: 0, multiple: 0, isWin: false, isniu: false, cardNum: [] },
        ];

        this.areasBackup = null;
        this.bankerBackup = null;
        this.cardsBackup = null;
        this.killAreas.clear();

        this.zhuangResult = {// 当前庄家结果
            cards: null, // 牌
            cardType: 0, // 牌型
            profit: 0,
            isniu: false,
            cardNum: []
        };
        this.pais = BRNN_Logic.shuffle();
        this.allPais = [];

        // 初始化回合id
        this.updateRoundId();

        // 更新真实玩家数量
        this.updateRealPlayersNumber();
        this.startTime = Date.now();
        this.zipResult = '';
    }
    close() {
        this.sendRoomCloseMessage();
        // this.roomManager = null;
        clearInterval(this.runInterval);
        this.players = [];
    }
    ramodHistory() {
        let numberOfTimes = 100;
        do {
            let opts = {
                sceneId: this.sceneId,
                roomId: this.roomId,
                res: [],
            }
            for (let index = 0; index < 4; index++) {
                let random = utils.random(1, 10);
                opts.res.push(random % 2 ? { isWin: true } : { isWin: false });
            }
            this.bairenHistory.push(opts);
            numberOfTimes--;
        } while (numberOfTimes > 0);
    }

    // 添加一个玩家
    addPlayerInRoom(dbplayer: any) {
        let currPlayer = this.getPlayer(dbplayer.uid);
        if (currPlayer) {
            currPlayer.sid = dbplayer.sid;
            this.offLineRecover(currPlayer);
            return true;
        }

        if (this.isFull()) return false;

        this.players.push(new Player(dbplayer));
        // 添加到消息通道
        this.addMessage(dbplayer);

        // 更新真实玩家数量
        this.updateRealPlayersNumber();
        return true;

    }

    /**有玩家离开 */
    leave(playerInfo: Player, isOffLine: boolean) {
        //踢出消息通道
        this.kickOutMessage(playerInfo.uid);
        // let player = this.getPlayer(playerInfo.uid);
        utils.remove(this.zj_queues, 'uid', playerInfo.uid);

        // 如果是押注阶段离开 就放入离线列表 等待结算
        if (isOffLine) {
            playerInfo.onLine = false;
            return;
        }
        utils.remove(this.players, 'uid', playerInfo.uid);

        // 移除玩家在房间房间器中的位置
        this.roomManager.removePlayerSeat(playerInfo.uid);
        // 通知其他玩家有人退出
        this.playersChange();

        // 更新真实玩家数量
        this.updateRealPlayersNumber();
    }

    playersChange(playerInfo?: BaiRenPlayerImpl) {
        let displayPlayers = this.rankingLists();
        const opts = {
            list: displayPlayers.slice(0, 6),
            playerNum: displayPlayers.length,
        };
        if (playerInfo) {
            const member = this.channel.getMember(playerInfo.uid);
            member && MessageService.pushMessageByUids(`brnn_playersChange`, opts, member);
            return;
        }
        this.channelIsPlayer(`brnn_playersChange`, opts);
    }

    /**获取当前状态的倒计时 时间 */
    getCountdownTime() {
        const time = (Date.now() - this.lastCountdownTime) / 1000;
        if (this.status == "Licensing") {
            return Math.max(LICENSING_COUNTDOWN - time, 0.5);
        }
        if (this.status == 'BETTING')
            return Math.max(BET_COUNTDOWN - time, 0.5);
        if (this.status == 'INBIPAI')
            return Math.max(BIPAI_COUNTDOWN - time, 0.5);
        return 0;
    }

    /**运行游戏 */
    run() {
        this.countdown = 0;
        clearInterval(this.runInterval);
        this.runInterval = setInterval(() => this.update(), 1000);
    }

    // 一秒执行一次
    update() {
        --this.countdown;
        if (this.countdown > 0) {
            return;
        }
        do {
            if (this.status == "NONE") { this.status = "Licensing"; break; };
            if (this.status == "Licensing") { this.status = "BETTING"; break; };
            if (this.status == "BETTING") { this.status = "INBIPAI"; break; };
            if (this.status == "INBIPAI") { this.status = "Licensing"; break; };
        } while (true);

        this.lastCountdownTime = Date.now();
        switch (this.status) {
            case "Licensing":
                this.countdown = LICENSING_COUNTDOWN;
                this.startDeal();
                break;
            case 'BETTING':
                this.countdown = BET_COUNTDOWN;
                this.startBet();
                break;
            case "INBIPAI":
                this.countdown = BIPAI_COUNTDOWN;
                this.Settlement();
                break;
        }
    }

    async startDeal() {
        // 初始化数据
        await this.Initialization();
        await this.check_zjList();
        //发牌 - 闲(四个位置)
        this.lotterys.map(m => {
            m.cards = BRNN_Logic.getCardNum(this.pais, 2);
            m.isniu = BRNN_Logic.getCardTypeNew_(m.cards);
        });

        this.zhuangResult.cards = BRNN_Logic.getCardNum(this.pais, 2);
        this.zhuangResult.isniu = BRNN_Logic.getCardTypeNew_(this.zhuangResult.cards);

        // 深拷贝玩家押注区域以及
        this.areasBackup = JSON.parse(JSON.stringify(this.lotterys));
        this.cardsBackup = JSON.parse(JSON.stringify(this.pais));
        this.bankerBackup = JSON.parse(JSON.stringify(this.zhuangResult));


        const opts = {
            status: this.status,
            roundId: this.roundId,
            countdownTime: this.getCountdownTime(),
            data: this.toBetBack()
        }
        for (const pl of this.players) {
            const member = this.channel.getMember(pl.uid);
            opts['isRenew'] = pl.isCanRenew();
            member && MessageService.pushMessageByUids('br_Deal', opts, member);
        }
    }

    // 开始下注
    async startBet() {
        {
            const opts = {
                status: this.status,
                countdownTime: this.getCountdownTime(),
            }
            this.channelIsPlayer('br_start', opts);
        }

        let opts = {
            nid: this.nid,
            roomId: this.roomId,
            sceneId: this.sceneId,
            status: this.status,
            downTime: this.getCountdownTime()
        };
        this.roomManager.pushRoomStateMessage(this.roomId, opts);
    }
    /**比牌 结算 */
    async Settlement() {

        await this.dealCards();
        // /庄家和闲家比牌
        this.zhuangResult.profit = this.casinoWar(this.zhuangResult);
        this.endTime = Date.now();
        this.zipResult = buildRecordResult(this);
        this.settlementBairenRoom(this.players);

        // const { system_room, room_lock } = await RoomManager.getOneLockedRoomFromCluster(pinus.app.getServerId(), this.nid, this.roomId);
        let opts = {
            sceneId: this.sceneId,
            roomId: this.roomId,
            res: this.lotterys.map(m => { return { isWin: m.isWin } }),
        }


        this.bairenHistory.push(opts);
        if (this.bairenHistory.length > 20) this.bairenHistory.shift();
        // system_room['bairenHistory'] = this.bairenHistory;
        // await RoomManager.updateOneRoomFromCluster(pinus.app.getServerId(), system_room, ['bairenHistory', "consumeTotal", "profitPool"], room_lock);

        // 结账 - 在线的
        for (const pl of this.players) {
            await pl.updateGold(this);
        }

        let opts2 = {
            nid: this.nid,
            roomId: this.roomId,
            sceneId: this.sceneId,
            status: this.status,
            historyData: this.toResultBack()
        }
        this.roomManager.pushRoomStateMessage(this.roomId, opts2);
        this.players.forEach(pl => {
            const member = this.channel.getMember(pl.uid);
            let opts: bairenConst.Ibr_over = {};
            if (pl.isRobot !== 2) {
                opts = {
                    status: this.status,
                    countdownTime: this.getCountdownTime(),
                    data: this.toResultBack()
                }
            }
            MessageService.pushMessageByUids('br_over', opts, member);
        });
    }

    /**当前庄家相关操作 */
    async check_zjList() {
        do {
            if (this.zhuangInfo.uid) {
                this.zhuangInfo.hasRound--;
                const zj_pl = this.getPlayer(this.zhuangInfo.uid);
                if (zj_pl && zj_pl.gold < this.upZhuangCond) {
                    const member = this.channel.getMember(zj_pl.uid);
                    member && MessageService.pushMessageByUids('br_onKickZhuang', { msg: langsrv.getlanguage(zj_pl.language, langsrv.Net_Message.id_1218) }, member);
                    this.zhuangInfo.uid = null;
                }
                // 扣除庄家回合
                if (!zj_pl || this.zhuangInfo.hasRound <= 0) {
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
                            .sendToDB(2);
                        zj_pl.gold = res.gold;
                    }
                }
                if (this.zhuangInfo.uid) {
                    break;
                }
            }
            if (this.zhuangInfo.uid == null) {
                let queue_one = this.zj_queues.shift() || null;
                if (!queue_one) {
                    break;
                }
                let zj_pl = queue_one ? this.getPlayer(queue_one.uid) : null;
                if (!zj_pl || (zj_pl && zj_pl.onLine == false)) {
                    continue;
                }
                if (zj_pl.gold < this.upZhuangCond) {
                    const member = this.channel.getMember(zj_pl.uid);
                    member && MessageService.pushMessageByUids('br_onKickZhuang', { msg: langsrv.getlanguage(zj_pl.language, langsrv.Net_Message.id_1219) }, member);
                    continue;
                }
                //初始化庄家信息
                this.zhuangInfo.uid = zj_pl.uid;
                this.zhuangInfo.hasRound = zj_pl ? bairenConst.ZHUANG_NUM : -1;
                this.zhuangInfo.money = 0;
                break;
            }
        } while (true);
        this.noticeZhuangInfo();
    }




    /**庄闲比牌 isRobot 为true 机器人不参加结算，为false 反之
     * 返回庄家利润 profit
     */
    casinoWar(zhuangResult: IZhuangResult) {
        //计算赔率
        const zhuangMultiple = this.conversionMultiple(zhuangResult.cardType);
        for (const lottery of this.lotterys) {
            lottery.isWin = BRNN_Logic.bipaiSole(lottery, zhuangResult);
            const real_pl_totalbet = this.players.filter(pl => pl && pl.isRobot == 0).reduce((total, v) => { return total + v.betList[lottery.area].bet }, 0);
            const robo_pl_totalbet = this.players.filter(pl => pl && pl.isRobot == 2).reduce((total, v) => { return total + v.betList[lottery.area].bet }, 0);
            //如果闲赢
            if (lottery.isWin) {
                lottery.multiple = this.conversionMultiple(lottery.cardType);
                zhuangResult.profit -= lottery.multiple * (real_pl_totalbet + robo_pl_totalbet);
            } else {//如果庄赢
                lottery.multiple = zhuangMultiple;
                zhuangResult.profit += zhuangMultiple * (real_pl_totalbet + robo_pl_totalbet);
            }
        };
        return zhuangResult.profit;
    }

    /**庄闲比牌 isRobot 为true 机器人不参加结算，为false 反之真人补参与结算 */
    casinoWarTwo(zhuangResult: IZhuangResult, isRobot: boolean) {
        //计算赔率
        const zhuangMultiple = this.conversionMultiple(zhuangResult.cardType);
        // 成功结果
        let success: boolean = true;

        this.lotterys.forEach((lottery, index) => {
            lottery.isWin = BRNN_Logic.bipaiSole(lottery, zhuangResult);
            const playerTotalBet = this.players.filter(pl => pl && pl.isRobot == RoleEnum.REAL_PLAYER).reduce((total, v) => { return total + v.betList[lottery.area].bet }, 0);
            const robotTotalBet = this.players.filter(pl => pl && pl.isRobot == RoleEnum.ROBOT).reduce((total, v) => { return total + v.betList[lottery.area].bet }, 0);

            if (lottery.isWin && this.killAreas.has(index)) {
                success = false;
                return;
            }

            // 如果被标记则不计算输赢
            if (this.killAreas.has(index)) {
                return
            }

            //如果闲赢
            if (lottery.isWin) {
                lottery.multiple = this.conversionMultiple(lottery.cardType);
                if (isRobot) {
                    zhuangResult.profit -= lottery.multiple * playerTotalBet;
                } else {
                    zhuangResult.profit -= lottery.multiple * robotTotalBet;
                }

            } else {//如果庄赢
                lottery.multiple = zhuangMultiple;
                if (isRobot) {
                    zhuangResult.profit += zhuangMultiple * playerTotalBet;
                } else {
                    zhuangResult.profit += zhuangMultiple * robotTotalBet;
                }
            }
        })
        return { profit: zhuangResult.profit, success };
    }

    /**构造庄信息 */
    simulate(parameter: number[]) {
        let cards = parameter.slice().sort((j, k) => k % 13 - j % 13);
        let zhuangResultTemp: IZhuangResult = {
            cards: cards,
            cardType: BRNN_Logic.getCardType(cards.slice()),
            profit: 0,
            isniu: false,
            cardNum: null
        }
        return zhuangResultTemp;
    }



    /**结算 */
    settlementBairenRoom(list: Player[]) {
        for (const pl of list) {
            if (pl.uid === this.zhuangInfo.uid) {
                pl.profit = this.zhuangResult.profit;
            } else {
                pl.settlementBairenPlayer(this.lotterys);
            }
        }
    }

    /**通知庄家信息 */
    noticeZhuangInfo(playerInfo?: BaiRenPlayerImpl) {
        const zhuang = this.getPlayer(this.zhuangInfo.uid);
        const opts = {
            zhuangInfo: zhuang && zhuang.strip(this.zhuangInfo.hasRound),//当前庄家信息
            zj_queues: this.zj_queues.map(pl => {
                return {
                    uid: pl.uid,
                    headurl: pl.headurl,
                    nickname: pl.nickname,
                    gold: pl.gold,
                    isRobot: pl.isRobot
                }
            }),//上庄列表
            applyZhuangsNum: this.zj_queues.length
        }
        if (playerInfo) {
            const member = this.channel.getMember(playerInfo.uid);
            member && MessageService.pushMessageByUids(`br_onUpdateZhuangInfo`, opts, member);
            return
        }
        this.channelIsPlayer('br_onUpdateZhuangInfo', opts);
    }

    // 申请上庄
    applyUpzhuang(playerInfo: BaiRenPlayerImpl) {
        this.zj_queues.push(playerInfo);
        // 通知嘛
        this.noticeZhuangInfo();
    }

    /**退出上庄列表 */
    exitUpzhuanglist(uid: string) {
        utils.remove(this.zj_queues, 'uid', uid);
        // 通知嘛
        this.noticeZhuangInfo();
    }

    /**算出倍数 */
    conversionMultiple(type: number) {
        let mul: number;
        if (this.sceneId == 0) {//五倍场f
            if (type < 7) {
                mul = 1;
            }
            if (type >= 7 && type <= 9) {
                mul = 2;
            }
            if (type == 10) {
                mul = 3;
            }
            if (type >= 11 && type <= 12) {
                mul = 4;
            }
            if (type == 13) {
                mul = 5;
            }
        } else {//十倍场
            //最高十倍
            mul = type >= this.compensate ? this.compensate : (type || 1);
        }

        return mul;
    }

    // 是否超出庄家上限
    isBeyondZhuangLimit(betList: { bet: number, area: number }[]) {
        if (!this.zhuangInfo.uid) {
            return false;
        }

        let sum = betList.reduce((total, Value) => { return total + Value.bet }, 0);
        let TempSum = this.situations.reduce((total, Value) => { return total + Value.totalBet }, 0);
        const zhuang = this.getPlayer(this.zhuangInfo.uid);
        return zhuang && zhuang.gold < (TempSum + sum) * this.compensate;
    }


    // 返回开始下注信息
    toBetBack() {
        const zhuang = this.getPlayer(this.zhuangInfo.uid);
        return {
            zhuangResult: { cards: this.zhuangResult.cards, isniu: this.zhuangResult.isniu },
            zhuangInfo: zhuang && zhuang.strip(this.zhuangInfo.hasRound),
            applyZhuangs: this.zj_queues.map(pl => {
                return {
                    uid: pl.uid,
                    headurl: pl.headurl,
                    nickname: pl.nickname,
                    gold: pl.gold,
                    isRobot: pl.isRobot
                }
            }),// 上庄列表
            regions: this.lotterys.map(m => {
                return {
                    cards: m.cards,
                    isniu: m.isniu
                }
            }),
            applyZhuangsNum: this.zj_queues.length,
            robotNum: this.zj_queues.filter(m => m && m.isRobot == 2).length
        }
    }

    // 返回结果信息
    toResultBack() {
        const zhuang = this.getPlayer(this.zhuangInfo.uid);
        let res = zhuang ? { uid: zhuang.uid, gold: zhuang.gold } : { uid: null, gold: null }
        let stripPlayers = this.players.map(pl => {
            if (pl) {
                return {
                    uid: pl.uid,
                    nickname: pl.nickname,
                    headurl: pl.headurl,
                    gold: pl.gold,
                    winRound: pl.winRound,
                    bet: pl.bet,
                    bets: pl.betList,
                    profit: pl.profit,
                    totalBet: pl.bet,
                    totalProfit: utils.sum(pl.totalProfit),
                }
            }
        });
        let opts = {
            zhuangResult: this.zhuangResult,
            regions: this.lotterys,
            situations: this.situations,
            bairenHistory: this.bairenHistory,
            zhuangInfo: res,
            players: stripPlayers,
            countdownTime: this.getCountdownTime()
        }
        return opts;
    }

    strip() {
        return {
            roomId: this.roomId,
            lowBet: this.lowBet,
            upZhuangCond: this.upZhuangCond,
            status: this.status,
            countdownTime: this.getCountdownTime(),
            regions: this.lotterys,
            bairenHistory: this.bairenHistory,
            zhuangResult: this.zhuangResult,
            situations: this.situations
        };
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
                    bet: pl.bet,
                    bets: pl.betList,
                    profit: pl.profit,
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


    /**断线重连获取数据 */
    getOffLineData(currPlayer: Player) {
        let opts: bairenConst.Ibr_over = {
            status: this.status,
            countdownTime: this.getCountdownTime(),
            data: this.toResultBack()
        }
        return opts;
    }


    //跑马灯
    addNote(playerInfo: BaiRenPlayerImpl) {
        if (playerInfo.profit >= 100000) {
            const zname = JsonConfig.get_games(this.nid).zname;
            //播放跑马灯
            MessageService.sendBigWinNotice(this.nid, playerInfo.nickname, playerInfo.profit, playerInfo.isRobot, playerInfo.headurl);
        }
    }


    /**
     * 获取调控结果
     */
    async controlDealCards(sceneControlState: ControlState, isPlatformControl: boolean) {
        if (sceneControlState === ControlState.NONE) {
            return this.randomDeal();
        }

        const type = isPlatformControl ? ControlKinds.PLATFORM : ControlKinds.SCENE;
        this.players.forEach(p => p.bet > 0 && p.setControlType(type));
        // 判断庄是否是真人, 如果是真人当庄则当系统赢得时候 庄家必输
        const banker = this.getPlayer(this.zhuangInfo.uid);
        const bankerIsRealMan: boolean = !!banker && banker.isRobot === RoleEnum.REAL_PLAYER;

        // 如果是真人玩家当庄, 获取机器人的押注
        const playerBet = this.getPlayerBetNum(bankerIsRealMan ? 0 : 2);

        for (let i = 0; i < 100; i++) {
            const { profit } = this.randomDeal();

            if (bankerIsRealMan) {
                if (sceneControlState === ControlState.SYSTEM_WIN && profit <= 0) {
                    break;
                } else if (sceneControlState === ControlState.PLAYER_WIN && profit >= 0) {
                    break;
                }
            } else {
                if (sceneControlState === ControlState.SYSTEM_WIN && profit >= playerBet) {
                    break;
                } else if (sceneControlState === ControlState.PLAYER_WIN && profit <= playerBet) {
                    break;
                }
            }
        }
    }

    /**
     * 发牌
     */
    async dealCards() {
        await this.controlLogic.runControl();
    }

    /**踢掉离线玩家 */
    async br_kickNoOnline() {
        const players = this.players.filter(p => p.uid !== this.zhuangInfo.uid);
        const offlinePlayers = await this.kickOfflinePlayerAndWarnTimeoutPlayer(players,
            5, 3);

        offlinePlayers.forEach(p => {
            this.leave(p, false);

            // 不在线则从租户列表中删除 如果在线则是踢到选场则不进行删除
            if (!p.onLine) {
                // 删除玩家
                this.roomManager.removePlayer(p);
            } else {
                this.roomManager.playerAddToChannel(p);
            }
            this.roomManager.removePlayerSeat(p.uid);
        });
    }

    /**
     * 庄家发牌
     * @param lastResult
     */
    bankerDealCards(lastResult: number[]) {
        this.zhuangResult.cards = this.zhuangResult.cards.concat(lastResult);
        this.zhuangResult.cardType = BRNN_Logic.getCardType(this.zhuangResult.cards.slice());
        this.zhuangResult.cardNum = BRNN_Logic.getNiuNum(this.zhuangResult.cards);
        this.zhuangResult.profit = 0;
    }

    /**
     * 获取玩家押注
     * @param isRobot 默认过滤掉机器人
     */
    getPlayerBetNum(isRobot = 2) {
        let bet = 0;


        // 如果isRobot为4则不进行过滤
        if (isRobot === 4) {
            this.players.forEach(player => bet += player.filterBetNum(this.killAreas));
        } else {
            // 过滤掉必杀区域的押注
            this.players.filter(player => player.isRobot !== isRobot).forEach(player => bet += player.filterBetNum(this.killAreas));
        }

        return bet;
    }

    /**
     * 判断庄是否是真实玩家
     */
    bankerIsRealMan(): boolean {
        const banker = this.getPlayer(this.zhuangInfo.uid);
        return !!banker && banker.isRobot === 0;
    }

    /**
     * 必杀区域
     * @param areas
     */
    markKillArea(areas: CommonControlState[]): void {
        areas.forEach((area, index) => {
            if (area === CommonControlState.LOSS) {
                this.killAreas.add(index);
            }
        });
    }

    /**
     * 个控发牌
     */
    personalDealCards(state: CommonControlState) {

        // 随机100次如果没有开出则直接使用最后的一组结果
        for (let i = 0; i < 100; i++) {
            this.randomDeal();
            const bankerInfo = this.simulate(this.zhuangResult.cards);
            const bankerProfit: number = this.calculationControlPlayerProfit({ bankerInfo, state });

            if (state === CommonControlState.WIN && bankerProfit < 0 ||
                state === CommonControlState.LOSS && bankerProfit > 0) {
                break;
            }
        }
    }

    /**
     * 计算个控情况下庄家收益
     */
    calculationControlPlayerProfit(params: { bankerInfo: any, state: CommonControlState }): number {
        // 计算赔率
        const bankerMultiple: number = this.conversionMultiple(params.bankerInfo.cardType);
        // 获取被调控的玩家
        const controlPlayers: Player[] = this.players.filter(player => player.controlState === params.state);
        // 获取被调控玩家押注统计 对应天地玄黄
        const betInfo: number[] = this.statisticsPlayerBetInfo({ players: controlPlayers });
        // 庄收益
        let bankerProfit = 0;

        this.lotterys.forEach((areaInfo, index) => {
            // 判断是否获胜
            areaInfo.isWin = BRNN_Logic.bipaiSole(areaInfo, params.bankerInfo);

            // 如果闲赢
            if (areaInfo.isWin) {
                areaInfo.multiple = this.conversionMultiple(areaInfo.cardType);
                bankerProfit -= areaInfo.multiple * betInfo[index];
            } else {
                areaInfo.multiple = bankerMultiple;
                bankerProfit += areaInfo.multiple * betInfo[index];
            }
        });

        return bankerProfit;
    }

    /**
     * 统计玩家押注详情
     * @param params
     */
    statisticsPlayerBetInfo(params: { players: Player[] }): number[] {
        let betInfo: number[] = [0, 0, 0, 0];

        params.players.forEach(p => {
            p.betList.forEach((num, index) => betInfo[index] += num.bet);
        });

        return betInfo;
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
     * 随机给闲家发牌
     */
    randomDealCardsArea() {
        // 发牌 - 闲( )
        this.lotterys.map(area => {
            let cards3 = BRNN_Logic.getCardNum(this.pais, 3);
            area.cards.push(...cards3);
            area.cardType = BRNN_Logic.getCardType(area.cards.slice());
            area.cardNum = BRNN_Logic.getNiuNum(area.cards);
        });
    }


    /**
     * 回滚庄闲的牌
     */
    rollbackInitState() {
        this.lotterys = JSON.parse(JSON.stringify(this.areasBackup));
        this.pais = JSON.parse(JSON.stringify(this.cardsBackup));
        this.zhuangResult = JSON.parse(JSON.stringify(this.bankerBackup));
    }

    /**
     * 庄随机发牌
     */
    randomDealBankerCards() {
        this.bankerDealCards(BRNN_Logic.getCardNum(this.pais, 3));
    }

    /**
     * 随机给庄闲发牌
     */
    randomDeal() {
        this.rollbackInitState();
        this.randomDealCardsArea();
        this.randomDealBankerCards();

        // 预结算
        const banker = this.simulate(this.zhuangResult.cards);
        // 判断是否是玩家当庄，如果是玩家当庄过滤掉真人玩家结果 反之过滤掉真人玩家的
        const { success, profit } = this.casinoWarTwo(banker, !this.bankerIsRealMan());

        // 查看是否包含了必杀区域 有则重新发牌
        if (!success) {
            return this.randomDeal();
        }

        return { success, profit }
    }

    calculateBankerWin() {

    }
}