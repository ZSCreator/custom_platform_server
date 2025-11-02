import * as utils from '../../../utils/index';
import { random } from '../../../utils/index';
import { SystemRoom } from '../../../common/pojo/entity/SystemRoom';
import * as wrjh_logic from './wrjh_logic';
import { getLogger } from 'pinus-logger';
import wrjhPlayer from './wrjhPlayer';
import {
    BetArea,
    Ioffline,
    Iwr_onBeting,
    Iwr_onExit,
    Iwr_onUpdateZhuangInfo,
    IzhuangResult
} from './interface/wrjh_interface';
import { CommonControlState } from "../../../domain/CommonControl/config/commonConst";
import { PersonalControlPlayer } from "../../../services/newControl";
import { ControlKinds, ControlState } from "../../../services/newControl/constants";

import * as langsrv from '../../../services/common/langsrv';
import Control from './control';
import { buildRecordResult } from "./util/roomUtil";
import createPlayerRecordService from '../../../common/dao/RecordGeneralManager';
import WanRenJHConst = require('../../../consts/WanRenJHConst');
import MessageService = require('../../../services/MessageService');
import JsonConfig = require('../../../pojo/JsonConfig');
import { RoleEnum } from '../../../common/constant/player/RoleEnum';
import roomManager, { WJRoomManger } from '../lib/WanrenMgr';
import { GetOnePl } from '../../../services/robotService/overallController/robotCommonOp';


const Logger = getLogger('server_out', __filename);
/**下注倒计时（发牌，下注） */
const BET_COUNTDOWN = 19;
/**比牌倒计时 （比牌动画，展示结果，等待） */
const BIPAI_COUNTDOWN = 15;


/**
 * 万人金花 - 游戏房间
 * @property startTime 回合开始时间
 * @property endTime 回合结束时间
 * @property zipResult 结果压缩
 */
export default class wrjhRoom extends SystemRoom<wrjhPlayer> {
    upZhuangCond: number;
    entryCond: number;
    /*最低下注要求 */
    lowBet: number;
    compensate: number;
    tallBet: number;
    /**状态 BETTING.下注阶段 INBIPAI.比牌结算阶段 INSETTLE.结算中; */
    status: 'NONE' | 'BETTING' | 'INBIPAI' | 'INSETTLE' = 'NONE';
    /**申请庄列表 */
    applyZhuangs: wrjhPlayer[] = [];
    /**庄家信息 */
    zhuangInfo: {
        uid: string;
        /**-1表示无限 */
        hasRound: number;
        /**庄家累计收益 */
        money: number;
    };
    zhuangResult: IzhuangResult;
    /**风林火山 4个区域 */
    regions: BetArea[];
    /**押注情况 */
    situations: { area: number, betList: { uid: string, bet: number, updatetime: number }[], totalBet: 0 }[] = [];
    /**记录最后一次的倒计时 时间 */
    lastCountdownTime: number = 0;

    /**单局总押注 */
    allBets: number = 0;
    maxCount: number;
    allGains: any[] = [];
    xiaZhuangUid = '';

    countdown: number;
    pais: number[];
    runInterval: NodeJS.Timer;
    players: wrjhPlayer[] = [];
    bairenHistory: any[];
    /** 调控逻辑 */
    control: Control;

    startTime: number;
    endTime: number;
    zipResult: string = '';

    /** 庄家牌备份 */
    bankerCardsBackup: number[] = null;
    /** 闲家牌备份 */
    playersCardsBackup: number[][] = null;
    /** 扑克备份 */
    cardsBackup: number[] = null;
    ChipList: number[];

    constructor(opts) {
        super(opts)
        this.bairenHistory = opts.bairenHistory || [];
        this.upZhuangCond = opts.ShangzhuangMinNum || 0;// 上庄条件
        this.entryCond = opts.entryCond || 0;
        this.lowBet = opts.lowBet;
        this.ChipList = opts.ChipList;
        this.tallBet = opts.tallBet * WanRenJHConst.XIAN_HONG;
        this.compensate = opts.compensate;//庄闲最大赔付倍数
        this.zhuangInfo = {// 庄家信息
            uid: null,
            hasRound: -1, // -1表示无限
            money: 0//庄家累计收益
        };
        this.zhuangResult = {// 当前庄家结果
            cards: [], // 五张牌
            cardType: 0, // 牌型 牌的类型
            profit: 0,
            cardNum: []//牌 最大三张
        };

        /**风林火山 4个区域 */
        this.regions = [];
        for (let index = 0; index < 4; index++) {
            let region = {
                sumBet: 0,
                sumBetRobot: 0,
                cards: [],
                cardType: 0,
                multiple: 1,
                isWin: false,
                historys: [],
                uids: [],
                cardNum: [],
                areaControlState: CommonControlState.RANDOM
            };
            this.regions.push(region);
        }
        this.pais = wrjh_logic.shuffle();
        this.ramodHistory();
        let AddCount = 0;
        do {
            let pl = GetOnePl();
            pl.gold = utils.random(this.upZhuangCond * 3, this.upZhuangCond * 4);
            this.addPlayerInRoom(pl);
            let ply = this.players[AddCount];
            this.applyZhuangs.push(ply);
            AddCount++;
            ply.updatetime += AddCount * 2 * 60;
        } while (AddCount < 3);
    }

    close() {
        clearInterval(this.runInterval);
        this.sendRoomCloseMessage();
        this.players = [];
    }
    ramodHistory() {
        let numberOfTimes = 20;
        do {
            // let random = utils.random(0, 1);
            let opts = {
                sceneId: this.sceneId,
                roomId: this.roomId,
                res: this.regions.map(m => { return { isWin: utils.random(0, 1) == 0 ? true : false } }),
            }
            // 记录历史纪录
            opts.res.forEach((m, index) => {
                let mm = this.regions[index];
                (mm.historys.length >= 10) && mm.historys.shift();
                mm.historys.push(m.isWin);
            });
            this.bairenHistory.push(opts);
            numberOfTimes--;
        } while (numberOfTimes > 0);
    }
    /**初始化房间信息 */
    async Initialization() {
        for (const pl of this.players) {
            pl.initGame(this);
        }
        await this.br_kickNoOnline();

        this.regions.forEach(m => {
            m.sumBet = 0;
            m.sumBetRobot = 0;
            m.cards = null;
            m.cardType = 0;
            m.multiple = 0;
            m.isWin = false;
            // m.uids = [];
            m.cardNum = [];
            m.areaControlState = CommonControlState.RANDOM
        });

        this.bankerCardsBackup = null;
        this.playersCardsBackup = null;
        this.cardsBackup = null;

        this.zhuangResult = {// 当前庄家结果
            cards: [], // 牌
            cardType: 0, // 牌型
            profit: 0,
            cardNum: []
        };
        this.situations = [];
        this.allBets = 0;
        this.allGains = [];

        this.pais = wrjh_logic.shuffle();
        this.control = new Control({ room: this });

        this.startTime = Date.now();
        this.zipResult = '';
        this.updateRealPlayersNumber();
        this.updateRoundId();
    }


    /**添加一个玩家 */
    addPlayerInRoom(dbplayer) {
        let playerInfo = this.getPlayer(dbplayer.uid);
        if (playerInfo) {
            playerInfo.sid = dbplayer.sid;
            this.offLineRecover(playerInfo);
            return true;
        }
        if (this.isFull()) return false;
        this.players.push(new wrjhPlayer(dbplayer));
        this.addMessage(dbplayer);

        this.updateRealPlayersNumber();
        this.playersChange();
        return true;
    }

    /**
     * 有玩家离开
     * @param uid 
     * @param isOffLine true离线
     */
    leave(playerInfo: wrjhPlayer, isOffLine: boolean) {
        //踢出消息通道
        this.kickOutMessage(playerInfo.uid);
        utils.remove(this.applyZhuangs, 'uid', playerInfo.uid);
        // 如果是押注阶段离开 就放入离线列表 等待结算
        if (isOffLine) {
            playerInfo.onLine = false;
            return;
        }
        utils.remove(this.players, 'uid', playerInfo.uid);
        // 通知其他玩家有人退出
        const opts: Iwr_onExit = {
            roomId: this.roomId,
            uid: playerInfo.uid,
        }
        this.channelIsPlayer('wr_onExit', opts);

        this.updateRealPlayersNumber();
    }

    playersChange(playerInfo?: wrjhPlayer) {
        let displayPlayers = this.rankingLists();
        const opts = {
            list: displayPlayers.slice(0, 6),
            playerNum: displayPlayers.length,
        };
        if (playerInfo) {
            const member = this.channel.getMember(playerInfo.uid);
            member && MessageService.pushMessageByUids(`wrjh_playersChange`, opts, member);
            return;
        }
        this.channelIsPlayer(`wrjh_playersChange`, opts);
    }

    /**获取当前状态的倒计时 时间 */
    getCountdownTime() {
        if (this.status === 'INSETTLE')
            return (BIPAI_COUNTDOWN + 1);
        const time = (Date.now() - this.lastCountdownTime) / 1000;
        if (this.status === 'BETTING')
            return Math.max(BET_COUNTDOWN - time, 0.5);
        if (this.status === 'INBIPAI')
            return Math.max(BIPAI_COUNTDOWN - time, 0.5);
        return 0;
    }


    /**运行游戏 */
    async runRoom() {
        this.lastCountdownTime = Date.now();
        this.countdown = BET_COUNTDOWN;
        this.status = 'BETTING';
        this.startBet();
        clearInterval(this.runInterval);
        this.runInterval = setInterval(() => this.update(), 1000);
    }

    /**一秒执行一次 */
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
                this.countdown = BIPAI_COUNTDOWN;
                this.status = 'INSETTLE';
                this.Settlement();
                break;
            case 'INBIPAI':// 结算完毕后 可开始下一轮
                this.countdown = BET_COUNTDOWN;
                this.status = 'BETTING';
                this.startBet();
                break;
        }
    }

    /**
     * 从排队里面获取几张牌
     * @param num
     */
    getCards(num: number): number[] {
        let cards = [];

        for (let i = 0; i < num; i++) {
            const index = random(0, this.pais.length - 1);
            cards.push(this.pais[index]);
            this.pais.splice(index, 1);
        }

        return cards;
    }

    /**开始下注 */
    async startBet() {
        // 初始化数据
        await this.Initialization();
        await this.check_zjList();

        //发牌 - 闲(四个位置) 备份闲家的牌
        this.playersCardsBackup = this.regions.map(m => {
            m.cards = this.getCards(2);
            return JSON.parse(JSON.stringify(m.cards));
        });
        this.zhuangResult.cards = this.getCards(2);

        // 备份庄的牌
        this.bankerCardsBackup = JSON.parse(JSON.stringify(this.zhuangResult.cards));
        this.cardsBackup = JSON.parse(JSON.stringify(this.pais));

        roomManager.pushRoomStateMessage(this.roomId, {
            nid: this.nid,
            roomId: this.roomId,
            sceneId: this.sceneId,
            status: this.status,
            downTime: this.getCountdownTime()
        });
        for (const pl of this.players) {
            const member = this.channel.getMember(pl.uid);
            const opts = { status: this.status, roundId: this.roundId, downTime: this.getCountdownTime(), isRenew: pl.isCanRenew(this) };
            member && MessageService.pushMessageByUids('wr_start', opts, member);
        }
    }

    /**比牌 结算 */
    async Settlement() {
        // try {
        // 获取调控结果
        await this.control.run_result();

        let result = wrjh_logic.getMaxCardtype(this.zhuangResult.cards.slice(), []);
        this.zhuangResult.cardType = result.cardType;
        this.zhuangResult.cardNum = result.cards;
        this.zhuangResult.profit = 0;

        // /庄家和闲家比牌
        this.casinoWar(this.zhuangResult, false);

        // 记录历史纪录
        this.regions.forEach(m => {
            (m.historys.length >= 10) && m.historys.shift();
            m.historys.push(m.isWin);
        });

        this.endTime = Date.now();

        this.zipResult = buildRecordResult(this.regions, this.zhuangResult);

        this.settlementBairenRoom(this.players);

        let opts = {
            sceneId: this.sceneId,
            roomId: this.roomId,
            res: this.regions.map(m => { return { isWin: m.isWin } }),
        }


        this.bairenHistory.push(opts);
        if (this.bairenHistory.length > 20) this.bairenHistory.shift();
        // 结账 - 在线的
        for (const pl of this.players) {
            (pl.bet > 0 ||
                (pl.uid == this.zhuangInfo.uid && this.allBets > 0)) && await pl.updateGold(this);
        }
        this.status = 'INBIPAI';


        let opts2 = {
            nid: this.nid,
            roomId: this.roomId,
            sceneId: this.sceneId,
            status: this.status,
            historyData: this.toResultBack()
        }
        roomManager.pushRoomStateMessage(this.roomId, opts2,);
        this.channelIsPlayer("wr_onSettlement", this.players.map(c => {
            return {
                uid: c.uid,
                gold: c.gold,
            }
        }));
    }

    /**当前庄家相关操作 */
    async check_zjList() {
        do {
            if (this.zhuangInfo.uid) {
                this.zhuangInfo.hasRound--;
                const zj_pl = this.getPlayer(this.zhuangInfo.uid);
                if (zj_pl && zj_pl.gold < this.upZhuangCond) {
                    const member = this.channel.getMember(zj_pl.uid);
                    member && MessageService.pushMessageByUids('wr_onKickZhuang', { uid: zj_pl.uid, gold: zj_pl.gold, msg: langsrv.getlanguage(zj_pl.language, langsrv.Net_Message.id_1218) }, member);
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
                        // 添加游戏记录以及更新玩家金币
                        const res = await createPlayerRecordService()
                            .setPlayerBaseInfo(zj_pl.uid, false, zj_pl.isRobot, zj_pl.gold)
                            .setGameInfo(this.nid, this.sceneId, this.roomId)
                            .setGameRecordInfo(0, 0, profit)
                            .addResult(this.zipResult)
                            .sendToDB(2);

                        zj_pl.gold = res.gold;
                        const member = this.channel.getMember(zj_pl.uid);
                        member && MessageService.pushMessageByUids('wr_onKickZhuang',
                            { uid: zj_pl.uid, gold: zj_pl.gold, msg: langsrv.getlanguage(zj_pl.language, langsrv.Net_Message.id_1221) }, member);
                    }
                }
                if (this.zhuangInfo.uid) {
                    break;
                }
            }
            if (this.zhuangInfo.uid == null) {
                let queue_one = this.applyZhuangs.shift() || null;
                if (!queue_one) {
                    break;
                }
                let zj_pl = queue_one ? this.getPlayer(queue_one.uid) : null;
                if (!zj_pl || (zj_pl && zj_pl.onLine == false)) {
                    continue;
                }
                if (zj_pl.gold < this.upZhuangCond) {
                    const member = this.channel.getMember(zj_pl.uid);
                    member && MessageService.pushMessageByUids('wr_onKickZhuang', { uid: zj_pl.uid, gold: zj_pl.gold, msg: langsrv.getlanguage(zj_pl.language, langsrv.Net_Message.id_1219) }, member);
                    continue;
                }
                //初始化庄家信息
                this.zhuangInfo.uid = zj_pl.uid;
                this.zhuangInfo.hasRound = zj_pl ? WanRenJHConst.ZHUANG_NUM : -1;
                this.zhuangInfo.money = 0;
                break;
            }
        } while (true);
        // 通知嘛
        this.noticeZhuangInfo();
    }


    /**庄闲比牌 isRobot 为true 机器人不参加结算，为false 反之 */
    casinoWar(zhuangResult: IzhuangResult, isRobot: boolean) {
        // 计算赔率
        let bankerLossAmount = 0;
        const zhuangMultiple = this.conversionMultiple(zhuangResult.cardType);
        this.regions.forEach((m, i) => {
            m.isWin = wrjh_logic.bipaiSoleEx([{ cards: m.cardNum, cardType: m.cardType },
            { cards: zhuangResult.cardNum, cardType: zhuangResult.cardType }]);

            //如果闲赢
            if (m.isWin) {
                m.multiple = this.conversionMultiple(m.cardType);
                if (isRobot) {
                    zhuangResult.profit -= m.multiple * (m.sumBet - m.sumBetRobot);
                } else {
                    zhuangResult.profit -= m.multiple * m.sumBet;
                }
            } else {//如果庄赢
                m.multiple = zhuangMultiple;
                if (isRobot) {
                    zhuangResult.profit += zhuangMultiple * (m.sumBet - m.sumBetRobot);
                } else {
                    zhuangResult.profit += zhuangMultiple * m.sumBet;
                }
            }
        });
        return { profit: zhuangResult.profit };
    }

    /**庄闲比牌 isRobot 为true 机器人不参加结算，为false 反之真人不参与结算 */
    casinoWarTwo(zhuangResult: IzhuangResult, isRobot: boolean) {
        // 计算赔率
        let bankerLossAmount = 0;
        const zhuangMultiple = this.conversionMultiple(zhuangResult.cardType);
        this.regions.forEach((m, i) => {
            m.isWin = wrjh_logic.bipaiSoleEx([{ cards: m.cardNum, cardType: m.cardType },
            { cards: zhuangResult.cardNum, cardType: zhuangResult.cardType }]);

            //如果闲赢
            if (m.isWin) {
                m.multiple = this.conversionMultiple(m.cardType);

                if (isRobot) {
                    zhuangResult.profit -= m.multiple * (m.sumBet - m.sumBetRobot);
                } else {
                    zhuangResult.profit -= m.multiple * m.sumBetRobot;
                }
            } else {//如果庄赢
                m.multiple = zhuangMultiple;
                if (isRobot) {
                    zhuangResult.profit += zhuangMultiple * (m.sumBet - m.sumBetRobot);
                } else {
                    zhuangResult.profit += zhuangMultiple * m.sumBetRobot;
                }
            }
        });
        return { profit: zhuangResult.profit };
    }

    /**
     * 根据调控状态计算庄家结果
     * @param controlPlayers 调控玩家
     */
    calculationBankerGain(controlPlayers: PersonalControlPlayer[]) {
        const result = wrjh_logic.getMaxCardtype(this.zhuangResult.cards.slice(), []).cards;

        let cardType = wrjh_logic.getCardType(result);
        const multiple = this.conversionMultiple(cardType);
        // 查找被标记的调控玩家
        const players = controlPlayers.map(controlPlayer => this.players.find(p => p.uid === controlPlayer.uid));
        let gain = 0;


        this.regions.forEach((betArea, i) => {
            betArea.isWin = wrjh_logic.bipaiSoleEx([{ cards: betArea.cardNum, cardType: betArea.cardType },
            { cards: result, cardType: cardType }]);

            betArea.multiple = betArea.isWin ? this.conversionMultiple(betArea.cardType) : multiple;

            players.forEach(p => {
                if (betArea.isWin) {
                    gain -= p.bets[i].bet * betArea.multiple;
                } else {
                    gain += p.bets[i].bet * betArea.multiple;
                }
            });
        });

        return gain;
    }

    /**构造庄信息 */
    simulate(parameter) {
        let cards = parameter.slice().sort((j, k) => k % 13 - j % 13);
        let result = wrjh_logic.getMaxCardtype(cards.slice(), []);
        let zhuangResultTemp: IzhuangResult = {
            cards: [],
            cardNum: result.cards,
            cardType: result.cardType,
            profit: 0
        }
        return zhuangResultTemp;
    }

    /**玩家投注 */
    onBeting(playerInfo: wrjhPlayer, area: number, betNum: number) {
        playerInfo.isBet = true;// 记录是否下过注(续押注不算)
        //记录下注数据
        this.bairenBet(playerInfo, area, betNum);

        const bets = [0, 0, 0, 0];
        bets[area] = betNum;
        this.wr_onBeting(playerInfo, bets);
    }

    bairenBet(playerInfo: wrjhPlayer, area: number, num: number) {
        playerInfo.bets[area].bet += num;
        playerInfo.bet += num;
        playerInfo.addUpBet += num;//记录玩家在房间里的累计押注

        if (playerInfo.isRobot === 2) {
            this.regions[area].sumBetRobot += num
        }

        this.allBets += num;
        this.regions[area].sumBet += num;

        let situation = this.situations.find(m => m.area == area);
        if (!situation) {
            this.situations.push({ area: area, betList: [], totalBet: 0 });
            situation = this.situations.find(m => m.area == area);
        }
        situation.betList.push({
            uid: playerInfo.uid,
            bet: num,
            updatetime: new Date().getTime() / 1000
        });
        situation.totalBet += num;
    }

    /**下注推送 */
    wr_onBeting(currPlayer: wrjhPlayer, bets: number[]) {
        const opts: Iwr_onBeting = {
            roomId: this.roomId,
            uid: currPlayer.uid,
            betNums: bets, // 下注金额
            curBetNums: currPlayer.bets, // 当前已经下注金额
            sumBets: this.regions.map(m => m.sumBet),
            list: this.rankingLists().slice(0, 6)
        }
        this.channelIsPlayer('wr_onBeting', opts);
    }

    /**玩家继押 */
    onGoonBet(currPlayer: wrjhPlayer) {
        currPlayer.lastBets.forEach((m, i) => {
            this.bairenBet(currPlayer, m.area, m.betNum);
        });

        currPlayer.bets.forEach((bet, index) => {
            const bets = [0, 0, 0, 0];
            bets[index] = bet.bet;
            this.wr_onBeting(currPlayer, bets);
        });
    }

    /**结算 */
    settlementBairenRoom(list: wrjhPlayer[]) {
        for (const pl of list) {
            if (pl.uid === this.zhuangInfo.uid) {
                pl.bet = Math.abs(this.zhuangResult.profit);
                pl.profit = this.zhuangResult.profit;
            } else {
                pl.settlementBairenPlayer(this);
            }

            // 记录上次盈利
            pl.lastProfit = pl.profit;
        }
    }

    /**通知庄家信息 */
    noticeZhuangInfo(playerInfo?: wrjhPlayer) {
        const zhuang = this.getPlayer(this.zhuangInfo.uid);
        const opts: Iwr_onUpdateZhuangInfo = {
            roomId: this.roomId,
            zhuangInfo: zhuang && zhuang.strip(this.zhuangInfo.hasRound),
            applyZhuangs: this.applyZhuangs.map(pl => {
                return {
                    uid: pl.uid,
                    headurl: pl.headurl,
                    nickname: pl.nickname,
                    bet: pl.bet,
                    gold: pl.gold,
                    robot: pl.isRobot,
                }
            }),
        }
        if (playerInfo) {
            const member = this.channel.getMember(playerInfo.uid);
            member && MessageService.pushMessageByUids(`wr_onUpdateZhuangInfo`, opts, member);
            return
        }
        this.channelIsPlayer('wr_onUpdateZhuangInfo', opts);
    }

    /**申请上庄 */
    applyUpzhuang(uid: string) {
        let player = this.getPlayer(uid)
        this.applyZhuangs.push(player);
        // 通知嘛
        this.noticeZhuangInfo();


    }

    /**踢掉离线玩家 */
    async br_kickNoOnline() {
        const players = this.players.filter(p => p.uid !== this.zhuangInfo.uid);
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

    /**退出上庄列表 */
    exitUpzhuanglist(uid: string) {
        utils.remove(this.applyZhuangs, 'uid', uid);
        // 通知嘛
        this.noticeZhuangInfo();
    }

    /**算出倍数 */
    conversionMultiple(type: number): number {
        // 五倍场
        const fiveScene = { '0': 1, '1': 1, '2': 2, '3': 3, '4': 4, '5': 5 };
        // 十倍场
        const tenScene = { '0': 1, '1': 2, '2': 3, '3': 5, '4': 8, '5': 10 };
        return this.compensate == 5 ? fiveScene[type] : tenScene[type];
    }

    /**是否超出庄家上限 */
    isBeyondZhuangLimit(bets: { area: number, betNum: number }[]) {
        if (!this.zhuangInfo.uid) {
            return false;
        }
        let totalBet = 0;
        for (const region of this.regions) {
            totalBet += region.sumBet;
        }
        for (const iterator of bets) {
            totalBet += iterator.betNum;
        }

        const zhuang = this.getPlayer(this.zhuangInfo.uid);
        return zhuang && zhuang.gold < totalBet * this.compensate;

    }


    /**返回开始下注信息 */
    toBetBack() {
        const zhuang = this.getPlayer(this.zhuangInfo.uid);
        return {
            zhuangResult: { cards: this.zhuangResult.cards },
            zhuangInfo: zhuang && zhuang.strip(this.zhuangInfo.hasRound),
            applyZhuangs: this.applyZhuangs.map(pl => {
                return {
                    uid: pl.uid,
                    headurl: pl.headurl,
                    nickname: pl.nickname,
                    bet: pl.bet,
                    gold: pl.gold,
                    robot: pl.isRobot,
                }
            }),
            regions: this.regions.map(m => {
                return {
                    cards: m.cards,
                    //isniu: m.isniu
                }
            }),
            robotNum: this.applyZhuangs.filter(pl => pl.isRobot === 2).length,
        }
    }

    /**返回结果信息 */
    toResultBack() {
        const zj_pl = this.getPlayer(this.zhuangInfo.uid);
        let res = zj_pl ? { uid: zj_pl.uid, gold: zj_pl.gold } : { uid: null, gold: null };
        let stripPlayers = this.players.map(pl => {
            if (pl) {
                return {
                    uid: pl.uid,
                    nickname: pl.nickname,
                    headurl: pl.headurl,
                    gold: pl.gold,
                    bet: pl.bet,
                    bets: pl.bets,
                    profit: pl.profit,
                    winRound: pl.winRound,
                    totalBet: pl.bet,
                    totalProfit: utils.sum(pl.totalProfit),
                }
            }
        });
        const opts: Ioffline = {
            zhuangResult: this.zhuangResult,
            regions: this.regions,
            bairenHistory: this.bairenHistory,
            zhuangInfo: res,
            players: stripPlayers,
            countdownTime: this.getCountdownTime()
        }
        return opts;
    }

    strip() {
        const zhuang = this.getPlayer(this.zhuangInfo.uid);
        return {
            roomId: this.roomId,
            lowBet: this.lowBet,
            compensate: this.compensate,
            upZhuangCond: this.upZhuangCond,
            status: this.status === 'INSETTLE' ? 'INBIPAI' : this.status,
            countdownTime: this.getCountdownTime(),
            regions: this.regions,
            zhuangResult: this.zhuangResult
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


    allBet() {
        let allBetNum = 0;
        this.players.forEach(m => {
            allBetNum += m.bet;
        });
        return allBetNum;
    }

    /**添加跑马灯集合 */
    addResult(currPlayer: wrjhPlayer, num: number) {
        const minLowBet = 100000;
        if (num >= minLowBet) {
            //播放跑马灯
            MessageService.sendBigWinNotice(this.nid, currPlayer.nickname, num, currPlayer.isRobot, currPlayer.headurl);
        }
    }

    /**
     * 判断庄家收益是否为正 如果是玩家当庄则过滤掉真人玩家的结果  机器人当庄则过滤掉真人玩家的开奖结果
     * @param bankerIsRealMan
     */
    isBankerWinGreaterPlayerBet(bankerIsRealMan: boolean) {
        const currCard = this.zhuangResult.cards.slice();
        return this.casinoWarTwo(this.simulate(currCard), !bankerIsRealMan).profit > 0;
    }

    bankerIsRealMan() {
        const banker = this.players.find(player => player.uid === this.zhuangInfo.uid);
        return !!banker && banker.isRobot === 0;
    }

    /**
     * 庄家收益是否大于需赔付的金币
     * @param isSystemWin
     */
    getWinORLossResultFunc(isSystemWin: boolean) {
        const banker = this.players.find(player => player.uid === this.zhuangInfo.uid);
        const bankerIsRealMan: boolean = !!this.zhuangInfo.uid && banker.isRobot === 0;

        for (let i = 0; i < 100; i++) {
            this.randomDeal();

            if (bankerIsRealMan) {
                if (isSystemWin && !this.isBankerWinGreaterPlayerBet(bankerIsRealMan)) {
                    break;
                } else if (!isSystemWin && this.isBankerWinGreaterPlayerBet(bankerIsRealMan)) {
                    break;
                }
            } else {
                if (isSystemWin && this.isBankerWinGreaterPlayerBet(bankerIsRealMan)) {
                    break;
                } else if (!isSystemWin && !this.isBankerWinGreaterPlayerBet(bankerIsRealMan)) {
                    break;
                }
            }
        }
    }

    /**
     * 标记必杀区域
     * @param areas
     */
    markKillArea(areas: CommonControlState[]): void {
        areas.forEach((state, index) => {
            if (state === CommonControlState.LOSS) {
                this.regions[index].areaControlState = state;
            }
        });
    }

    /**
     * 个控发牌
     * @param controlPlayers 调控玩家
     * @param state 调控状态
     */
    personalDealCards(controlPlayers: PersonalControlPlayer[], state: CommonControlState) {
        let res: number[];

        controlPlayers.forEach(p => this.getPlayer(p.uid).setControlType(ControlKinds.PERSONAL));

        for (let i = 0; i < 100; i++) {
            // 获取一个随机结果
            res = this.randomDeal();

            // 计算庄家收益
            const gain = this.calculationBankerGain(controlPlayers);


            // 如果玩家赢则 庄家收益小于零  玩家输则庄家收益大与零
            if ((state === CommonControlState.WIN && gain < 0) || (state === CommonControlState.LOSS && gain >= 0)) {
                break
            }
        }

        return res;
    }

    /**
     * 场控结果
     * @param state
     * @param isPlatformControl
     */
    sceneControlResult(state: ControlState, isPlatformControl) {
        if (state === ControlState.NONE) {
            return this.randomDeal();
        }

        const type = isPlatformControl ? ControlKinds.PLATFORM : ControlKinds.SCENE;
        this.players.forEach(p => p.setControlType(type));

        return this.getWinORLossResultFunc(state === ControlState.SYSTEM_WIN);
    }


    /**
     * 回滚到开始下注的初始状态
     */
    rollbackInitState() {
        this.regions.map((area, index) => {
            area.cards = JSON.parse(JSON.stringify(this.playersCardsBackup[index]));
        });

        this.zhuangResult.cards = JSON.parse(JSON.stringify(this.bankerCardsBackup));

        this.pais = JSON.parse(JSON.stringify(this.cardsBackup));
    }

    randomDealCardsArea() {
        this.regions.map(region => {
            region.cards = region.cards.concat(this.getCards(3));
            let result = wrjh_logic.getMaxCardtype(region.cards.slice(), []);
            if (result) {
                region.cardNum = result.cards;
                region.cardType = result.cardType;
            }
        });
    }

    randomDealBankerCards() {
        this.zhuangResult.cards = this.zhuangResult.cards.concat(this.getCards(3));
    }

    /**
     * 随机给庄闲发牌
     */
    randomDeal() {
        this.rollbackInitState();
        this.randomDealCardsArea();
        this.randomDealBankerCards();

        // 预结算
        let cardType = wrjh_logic.getCardType(this.zhuangResult.cards), out = true;
        this.regions.forEach((betArea, i) => {
            betArea.isWin = wrjh_logic.bipaiSoleEx([{ cards: betArea.cardNum, cardType: betArea.cardType },
            { cards: this.zhuangResult.cards, cardType: cardType }]);


            if (betArea.areaControlState === CommonControlState.LOSS && betArea.isWin) {
                out = false;
            }
        });

        if (!out) {
            return this.randomDeal();
        }

        return true;
    }
}



