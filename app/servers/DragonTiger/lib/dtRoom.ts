import DragonTigerConst = require('./DragonTigerConst');
import utils = require('../../../utils/index');
import msgService = require('../../../services/MessageService');
import JsonConfig = require('../../../pojo/JsonConfig');
import MessageService = require('../../../services/MessageService');
import { SystemRoom } from '../../../common/pojo/entity/SystemRoom';
import { getLogger } from 'pinus-logger';
import ControlImpl from "./ControlImpl";
import * as langsrv from '../../../services/common/langsrv';
import { CommonControlState } from "../../../domain/CommonControl/config/commonConst";
import { pinus } from 'pinus';
import { PersonalControlPlayer } from "../../../services/newControl/interfaces/simple";
import { ControlKinds, ControlState } from "../../../services/newControl/constants";
import { buildRecordResult, getPersonalControlResult, getWinORLossResult, randomLottery, getRandomLotteryResult } from './util/lotteryUtil';
import { RoleEnum } from "../../../common/constant/player/RoleEnum";
import dtplayer from './dtPlayer';
import createPlayerRecordService from '../../../common/dao/RecordGeneralManager';
import RoomManager from '../../../common/dao/daoManager/Room.manager';
import roomManager, { DragonTigerRoomMangerImpl } from '../lib/DragonTigerRoomMangerImpl';
import { GetOnePl } from '../../../services/robotService/overallController/robotCommonOp';


const LoggerInfo = getLogger('server_out', __filename);


/**
 * 龙虎斗房间类
 * @property startTime 回合开始时间
 * @property endTime 回合结束时间
 * @property zipResult 压缩结果
 * @property realPlayerTotalBet 真人玩家回合总押注
 */
export default class dtRoom extends SystemRoom<dtplayer> {
    /**当前房间状态时间 */
    stateTime: number = 0;
    /**回合总押注 */
    allBetNum: number = 0;
    DragonTigerHistory: string[][];
    /**牌的数量 */
    cards: number = 0;
    /**开奖结果 */
    result: { d?: number, t?: number };
    //庄 详情
    BankSettleDetails: { [area: string]: { bet: number, win: number } };
    /**赢的区域 */
    winArea: string[];
    /**区域玩家押注情况 */
    situations: { [area: string]: { arr?: { uid: string, bet: number }[], allBet?: 0 } } = {};
    zname: string;
    /**上庄条件 */
    upZhuangCond = DragonTigerConst.bankerGoldLimit[this.sceneId];
    bankerQueue: dtplayer[];
    /**庄,默认为空 为空就为系统做庄 */
    banker: dtplayer = null;

    roomStatus: 'NONE' | 'LICENS' | 'BETTING' | 'OPENAWARD' | 'SETTLEING' = 'NONE';
    /**房间内的玩家列表 */
    players: dtplayer[] = [];
    controlLogic: ControlImpl;
    killAreas: Set<string>;
    lotteryDetailed: { d?: number, t?: number }[];
    backendServerId: string;
    startTime: number;
    endTime: number;
    zipResult: string = '';
    realPlayerTotalBet: number = 0;
    /**最低下注要求 */
    lowBet: number;
    capBet: number;
    betUpperLimit: number;
    stop: boolean;
    ChipList: number[];
    constructor(opts) {
        super(opts);
        this.ChipList = opts.ChipList;
        this.backendServerId = pinus.app.getServerId();                                                           // 房间内的玩家列表
        this.channel = opts.channel;                                                      // 房间通道
        // this.channelBet = opts.channelBet;
        this.lowBet = opts.lowBet;
        this.capBet = opts.capBet;
        this.betUpperLimit = this.capBet;
        this.DragonTigerHistory = opts.DragonTigerHistory || [];                                                               // 开奖记录
        this.lotteryDetailed = opts.lotteryDetailed || [];                                                              // 牌的数量
        this.result = {};                                                                 // 开奖结果
        this.winArea = [];                                                                // 赢的区域
        this.situations = {};                                                         // 区域玩家押注情况
        this.zname = JsonConfig.get_games(this.nid).zname;// 游戏名称
        this.bankerQueue = [];                                                            // 上庄队列
        this.killAreas = new Set();                                                       // 必杀区域
        this.controlLogic = new ControlImpl({ room: this });                         // 调控逻辑
        this.ramodHistory();
        let AddCount = 0;
        do {
            let pl = GetOnePl();
            pl.gold = utils.random(this.upZhuangCond, this.upZhuangCond * 2);
            this.addPlayerInRoom(pl);
            let ply = this.players[AddCount];
            this.bankerQueue.push(ply);
            AddCount++;
            ply.updatetime += AddCount * 2 * 60;
        } while (AddCount < 3);
    }

    /*-------------------------------------- 房间工具方法部分 ----------------------------------------- */

    /**初始化房间数据 */
    async initRoom() {
        this.allBetNum = 0;
        // 初始化玩家押注
        this.players.forEach(pl => pl.roundPlayerInit(this));
        this.situations = {};
        this.result = {};
        this.winArea = [];
        this.killAreas.clear();
        if (this.cards <= 0) this.cards = DragonTigerConst.cardsLength;      // 当牌的数量小于等于0

        // 踢人
        await this.br_kickNoOnline();

        // 更新真实玩家数量
        this.updateRealPlayersNumber();

        // 初始化回合id
        this.updateRoundId();
        this.startTime = Date.now();
        this.zipResult = '';

        this.realPlayerTotalBet = 0;

        return true;
    }
    run() {
        this.stop = false;
        this.runRoom();
    }
    close() {
        this.stop = true;
        this.sendRoomCloseMessage();
        this.players = [];
    }

    ramodHistory() {
        let numberOfTimes = 20;
        do {
            let result = getRandomLotteryResult([], new Set());
            // let winArea = result.winArea.filter(area => DragonTigerConst.ordinaryArea.includes(area));
            this.DragonTigerHistory.length >= DragonTigerConst.MAX_History_LENGTH && this.DragonTigerHistory.splice(0, 1);
            this.DragonTigerHistory.push(result.winArea);
            numberOfTimes--;
        } while (numberOfTimes > 0);
    }

    /**当前庄家相关操作 */
    async check_zjList() {
        do {
            if (this.banker) {
                this.banker.bankerCount--;
                if (this.banker.gold < this.upZhuangCond) {
                    const member = this.channel.getMember(this.banker.uid);
                    member && MessageService.pushMessageByUids(DragonTigerConst.route.dt_msg, { msg: langsrv.getlanguage(this.banker.language, langsrv.Net_Message.id_1218) }, member);
                    this.banker.clearBanker();
                    this.banker = null;
                }
                if (this.banker && this.banker.bankerCount <= 0) {
                    this.banker.clearBanker();
                    this.banker = null;
                }
                if (this.banker && this.banker.quitBanker) {
                    if (this.banker.bankerProfit > 0) {
                        let profit = -this.banker.bankerProfit * 0.4;
                        const res = await createPlayerRecordService()
                            .setPlayerBaseInfo(this.banker.uid, false, this.banker.isRobot, this.banker.gold)
                            .setGameInfo(this.nid, this.sceneId, this.roomId)
                            .setGameRecordInfo(0, 0, profit, false)
                            .addResult(this.zipResult)
                            .sendToDB(2);
                        this.banker.gold = res.gold;
                    }
                    this.banker.clearBanker();
                    this.banker = null;
                }
                if (this.banker) {
                    break;
                }
            }
            // 如果没人坐庄 且上庄列表有人去上庄队列的第一个玩家当庄
            if (this.banker == null) {
                this.banker = this.bankerQueue.shift();
                if (!this.banker) {
                    break;
                }
                if (this.banker.onLine == false) {
                    continue;
                }
                if (this.banker.gold < this.upZhuangCond) {
                    const member = this.channel.getMember(this.banker.uid);
                    member && MessageService.pushMessageByUids(DragonTigerConst.route.dt_msg, { msg: langsrv.getlanguage(this.banker.language, langsrv.Net_Message.id_1219) }, member);
                    continue;
                }
                this.banker.setBanker();
                break;
            }
        } while (true);
        this.noticeZhuangInfo();
    }

    /**推送一次庄家信息 */
    noticeZhuangInfo(playerInfo?: dtplayer) {
        const opts = {
            banker: this.banker ? this.banker.bankerStrip() : this.banker,
            bankerQueue: this.bankerQueue.map(pl => {
                return {
                    uid: pl.uid,
                    headurl: pl.headurl,
                    nickname: pl.nickname,
                    gold: pl.gold,
                    isRobot: pl.isRobot
                }
            }),//上庄列表
            bankerQueueLength: this.bankerQueue.length
        }
        if (playerInfo) {
            const member = this.channel.getMember(playerInfo.uid);
            member && MessageService.pushMessageByUids(DragonTigerConst.route.dt_zj_info, opts, member);
            return;
        }
        this.channelIsPlayer(DragonTigerConst.route.dt_zj_info, opts);
    }

    /**添加玩家 */
    addPlayerInRoom(player) {
        const roomPlayer = this.getPlayer(player.uid);

        if (!!roomPlayer) {
            roomPlayer.upOnlineTrue();
        } else {
            if (this.isFull()) {
                return false;
            }
            this.players.push(new dtplayer(player, this));
            let displayPlayers = this.rankingLists();
            const opts = {
                displayPlayers: displayPlayers.slice(0, 6),
                displayPlayers_num: displayPlayers.length,
            };
            this.channelIsPlayer(DragonTigerConst.route.plChange, opts);
        }
        this.addMessage(player);

        // 更新真实玩家数量
        this.updateRealPlayersNumber();

        return true;
    }

    /**
     * 玩家离开
     * @param leavePlayer 
     * @param drops true 离线
     */
    leave(playerInfo: dtplayer, drops = false) {
        this.kickOutMessage(playerInfo.uid);
        // this.quitBankerQueue(playerInfo.uid);
        utils.remove(this.bankerQueue, 'uid', playerInfo.uid);
        if (drops) {
            playerInfo.onLine = false;
        } else {
            utils.remove(this.players, 'uid', playerInfo.uid);
            this.playersChange();
        }
        // 更新真实玩家数量
        this.updateRealPlayersNumber();
    }

    playersChange(playerInfo?: dtplayer) {
        let displayPlayers = this.rankingLists();
        const opts = {
            displayPlayers: displayPlayers.slice(0, 6),
            displayPlayers_num: displayPlayers.length,
        };
        if (playerInfo) {
            const member = this.channel.getMember(playerInfo.uid);
            member && MessageService.pushMessageByUids(DragonTigerConst.route.plChange, opts, member);
            return;
        }
        this.channelIsPlayer(DragonTigerConst.route.plChange, opts);
    }

    /**从玩家列表中获取玩家 */
    getPlayer(uid: string) {
        return this.players.find(player => player.uid === uid);
    }

    /**踢掉离线的玩家 */
    async br_kickNoOnline() {
        const players = this.banker ? this.players.filter(p => p.uid !== this.banker.uid) : this.players;
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

    /**记录结果 */
    recordResult(winArea: string[]) {
        const betArea = {};
        DragonTigerConst.area.forEach(area => betArea[area] = 0);
        this.DragonTigerHistory.length >= DragonTigerConst.MAX_History_LENGTH && this.DragonTigerHistory.splice(0, 1);
        this.DragonTigerHistory.push(winArea);
        const comput = this.DragonTigerHistory.slice(1);

        comput.forEach(result => {
            result.forEach(area => betArea[area] += 1);
        });

        this.lotteryDetailed.push(this.result);

        // 如果超过限制
        if (this.lotteryDetailed.length > 20) {
            this.lotteryDetailed.splice(0, 1);
        }
    }

    /**获取历史记录 */
    getRecord() {
        return this.DragonTigerHistory;
    }

    /**只返回指定数据 */
    getPlayers() {
        return this.players.sort((x, y) => y.gold - x.gold).map(player => player.strip());
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

    /**查看玩家列表是否已满 */
    isFull() {
        return this.players.length >= DragonTigerConst.mostNumberPlayer;
    }

    /**限红检测 */
    ceiling(uid: string, RecordBets: { area: string, bet: number }[]) {
        const playerAreaBets = this.situations;

        for (let RecordBet of RecordBets) {
            if (!playerAreaBets[RecordBet.area]) continue;

            if (RecordBet.area === DragonTigerConst.draw) {
                if (RecordBet.bet > (this.betUpperLimit - playerAreaBets[RecordBet.area].allBet)) {
                    return DragonTigerConst.LimitRed.total;
                }
            } else {
                // 找出对应的下注区域  先检测区域总押注对押是否超过限红
                const mappArea = DragonTigerConst.mapping[RecordBet.area];
                const betAreaBet = playerAreaBets[RecordBet.area].allBet;
                const mappAreaBet = !playerAreaBets[mappArea] ? 0 : playerAreaBets[mappArea].allBet;
                const difference = this.betUpperLimit - (betAreaBet - mappAreaBet);

                if (RecordBet.bet > difference) return DragonTigerConst.LimitRed.total;

                // 检测个人限红押注 不能超过单项个人限红 不能超过对立区域差值不能超过限红
                const findBet = playerAreaBets[RecordBet.area].arr.find(m => m.uid === uid);
                const myBetArea = findBet ? findBet.bet : 0;

                if (this.betUpperLimit - myBetArea < RecordBet.bet) return DragonTigerConst.LimitRed.personal;

                const findMappBet = playerAreaBets[mappArea] && playerAreaBets[mappArea].arr.find(m => m.uid === uid);
                const myMappArea = findMappBet ? findMappBet.bet : 0;
                const difference1 = this.betUpperLimit - (myBetArea - myMappArea);

                if (RecordBet.bet > difference1) return DragonTigerConst.LimitRed.personal;
            }
        }

        return false;
    }

    /**计算需最大需赔付多少金币 */
    private computCompensateGold(areaCompensate: { [area: string]: number }) {
        let gold = 0;

        const keys = Object.keys(areaCompensate).filter(area => area !== 'f');

        // 先算出和值赔付多少 根据规则开和的规则退还龙虎押注 等计算龙虎的时候比较两边谁赔付多就取哪边
        let draw_bet = areaCompensate['f'] ? areaCompensate['f'] : 0;
        const drawGold = draw_bet * DragonTigerConst.odds['f'];

        // 已经比较过的区域
        const useArea: string[] = [];

        for (const area of keys) {
            if (useArea.includes(area)) {
                continue;
            }

            if (DragonTigerConst.notValidBetArea.includes(area)) {
                gold += areaCompensate[area];
                continue;
            }

            // 找出对应的区域
            const mappArea = DragonTigerConst.mapping[area];
            let curr_total = areaCompensate[area];
            let other_total = areaCompensate[mappArea];
            const compensate = (Math.max(curr_total, other_total) - Math.min(curr_total, other_total)) * DragonTigerConst.odds[area];

            // 如果区域 龙虎 跟和值比大小
            if (area === DragonTigerConst.ordinaryArea[0] || area === DragonTigerConst.ordinaryArea[1]) {
                gold += Math.max(compensate, drawGold);
            } else {
                gold += compensate
            }

            useArea.push(mappArea);
        }
        if (typeof gold != "number") {
            console.warn(`00000000000000`)
        }
        return gold;
    }

    /**检查玩家押注是否超过庄家赔付 */
    playerIsBankerBetLimit(RecordBets: { area: string, bet: number }[]) {
        if (!this.playerIsBanker()) {
            return false;
        }

        const areaCompensate: { [area: string]: number } = {};
        DragonTigerConst.area.forEach(_area => {
            areaCompensate[_area] = this.situations[_area] ? this.situations[_area].allBet : 0;
        });

        for (let RecordBet of RecordBets) {
            areaCompensate[RecordBet.area] += RecordBet.bet;
            let compensateGold = this.computCompensateGold(areaCompensate);
            if (this.banker.gold < compensateGold) {
                return true;
            }
        }

        return false;
    }

    /**玩家下注 */
    async playerBet(uid: string, RecordBets: { area: string, bet: number }[]) {
        const playerInfo = this.getPlayer(uid);
        for (let RecordBet of RecordBets) {
            // 由于玩家自己已经记录了押注情况，如需获取押注情况，可只保留房间区域总押注this.playerAreaBets[area] = 0;
            // 获取玩家的细分押注情况时可直接遍历整个玩家列表
            // gold -= bets[area];
            playerInfo.betHistory(RecordBet.area, RecordBet.bet);

            if (!this.situations[RecordBet.area]) {
                this.situations[RecordBet.area] = { arr: [], allBet: 0 };
            }

            const areaSitu = this.situations[RecordBet.area];
            const judge = areaSitu.arr.findIndex(areaBet => areaBet.uid === uid);

            judge === -1 ? areaSitu.arr.push({ uid, bet: RecordBet.bet }) :
                (areaSitu.arr[judge].bet += RecordBet.bet);

            areaSitu.allBet += RecordBet.bet;

            // 记录日志
            // player.isRobot !== 2 && LoggerInfo.info(`${playerInfo}|${bets[area]}|${area}|${player.isRobot}`);
        }

        if (playerInfo.isRobot === RoleEnum.REAL_PLAYER) {
            this.realPlayerTotalBet += RecordBets.reduce((total, value) => {
                return total + value.bet;
            }, 0);
        }
        const opts = { uid, RecordBets, gold: playerInfo.gold - playerInfo.bet, playersInfo: this.rankingLists().slice(0, 6) }
        this.channelIsPlayer(DragonTigerConst.route.OtherBet, opts);
    }

    /**获取当前房间信息 */
    getRoomInfo() {
        // const situation = {};
        const countdown = Math.floor((DragonTigerConst.statusTimer[this.roomStatus] - (Date.now() - this.stateTime))
            / 1000);

        // for (let area in this.situations) {
        //     situation[area] = this.situations[area].allBet;
        // }

        return { countdown }
    }

    /**获取上庄列表 */
    getBankerQueue() {
        return this.bankerQueue.map(player => player.bankerStrip());
    }

    /**检查是否是玩家坐庄 */
    private playerIsBanker() {
        return !!this.banker;
    }

    /**检查玩家是否是庄 */
    checkPlayerIsBanker(uid: string) {
        return this.banker && this.banker.uid == uid;
    }

    /**检查是否在上庄列表中 */
    checkPlayerInBankerQueue(uid: string) {
        return !!(this.bankerQueue.find(pl => pl.uid == uid));
    }

    /**加入上庄队列 */
    joinBankerQueue(uid: string) {
        const currPlayer = this.getPlayer(uid);
        // 通知当前上庄人数
        if (!!currPlayer) {
            this.bankerQueue.push(currPlayer);
            this.noticeZhuangInfo();
        }
    }

    /**退出上庄队列 */
    quitBankerQueue(uid: string) {
        const judge = this.checkPlayerInBankerQueue(uid);

        if (judge) {
            utils.remove(this.bankerQueue, 'uid', uid);
            this.noticeZhuangInfo();
        }
    }

    /**下庄 */
    descendBanker(uid: string) {
        // if (this.checkPlayerIsBanker(uid)) {
        // 如果当庄回合数小于最小当庄数,视为强制下庄
        if (this.banker.bankerCount <= DragonTigerConst.bankerRoundLimit) {
            this.banker.quitBanker = true;
        }
        // }
    }

    /**计算玩家有效押注 */
    calculateValidBet(currPlayer: dtplayer, winArea: string[]) {
        // const keys = Object.keys(currPlayer.bets), 
        let calculateArr = [], betAreas = currPlayer.bets;
        let betNumber = 0;

        for (const area in betAreas) {
            // 不参与对押限制的区域跳过
            if (DragonTigerConst.notValidBetArea.includes(area)) {
                betNumber += betAreas[area].bet;
                continue;
            }

            const mappingArea = DragonTigerConst.mapping[area];

            // 已经计算的过的跳过 和值跳过
            if (calculateArr.includes(mappingArea))
                continue;

            const areaBet = betAreas[area].bet;
            const mappingAreaBet = !!betAreas[mappingArea] ? betAreas[mappingArea].bet : 0;

            betNumber += (Math.max(areaBet, mappingAreaBet) - Math.min(areaBet, mappingAreaBet));
            calculateArr.push(area);
        }
        currPlayer.validBetCount(betNumber);
    }

    /**
     * 庄是否是真实玩家
     */
    bankerIsRealMan(): boolean {
        return !!this.banker && this.banker.isRobot === 0;
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
     * 获取对应调控玩家的押注
     * @param params
     */
    getControlPlayersBet(params: { state: CommonControlState }): number {
        let bet: number = 0;
        this.players.forEach(p => {
            if (p.controlState === params.state) {
                bet += p.bet;
            }
        });
        return bet;
    }

    /**
     * 个控发牌
     */
    personalDealCards(params: { state: CommonControlState }) {
        // 玩家押注详情
        const bet = this.getControlPlayersBet(params);

        // 是谁当庄
        const statisticType = !!this.banker && this.banker.isRobot === 0 ? RoleEnum.ROBOT : RoleEnum.REAL_PLAYER;

        // 获取结果
        return getPersonalControlResult(this.players, bet, params.state, this.killAreas, statisticType);
    }

    /**
     * 获取总押注,
     */
    getPlayersTotalBet(params: { filterType: 0 | 2 | 4 }) {
        let bet = 0;

        // 如果是4 则不过滤
        if (params.filterType === 4) {
            this.players.forEach(p => bet += p.filterBetNum({ areas: this.killAreas }));
        } else {
            this.players.forEach(p => {
                if (p.isRobot === params.filterType) {
                    bet += p.filterBetNum({ areas: this.killAreas })
                }
            });
        }
        return bet;
    }

    /**
     * 庄调控发牌
     * @param params
     * @param params.bankerWin 如果为true 表示开一个庄赢的结果出来  如果false 表示开一个庄输的结果出来
     */
    controlDealCardsBanker(params: { bankerWin: boolean }) {
        // 获取玩家押注的区域 过滤掉被必杀的区域
        const bet = this.getPlayersTotalBet({ filterType: 4 });

        // 获取庄家得牌 如果是庄家获胜则代表系统输 所以结果取反
        return getWinORLossResult(this.players, 4, bet, this.killAreas, !params.bankerWin);
    }

    /**
     * 获取调控结果
     */
    sceneControlResult(sceneControlState: ControlState, isPlatformControl) {
        // 如果房间里面没真人、或者是不调控状态 或者玩家不是真人玩家当庄 总押注为0
        if (this.realPlayersNumber === 0
            || sceneControlState === ControlState.NONE
            || (!this.bankerIsRealMan() && this.realPlayerTotalBet === 0)) {
            return randomLottery(this.players, this.killAreas);
        }

        const type = isPlatformControl ? ControlKinds.PLATFORM : ControlKinds.SCENE;
        this.players.forEach(p => p.setControlType(type));

        // 是谁当庄
        const filterType = !!this.banker && this.banker.isRobot === 0 ? 2 : 0;
        // 获取玩家押注的区域 过滤掉被必杀的区域
        const bet = this.getPlayersTotalBet({ filterType });

        return getWinORLossResult(this.players,
            filterType, bet, this.killAreas, sceneControlState === ControlState.SYSTEM_WIN);
    }


    /*-------------------------------------- 房间运行逻辑部分 ----------------------------------------- */

    // 运行房间
    async runRoom() {
        // 这儿会做一个判断，判断游戏是否关闭如果关闭不开始下一把，也不开启定时器
        await this.initRoom();
        if (this.stop == true) {
            this.roomStatus = 'NONE';
            return null;
        }
        await this.check_zjList();
        this.roomStatus = 'LICENS';
        this.stateTime = Date.now();
        this.cards -= 2;

        // 推送房间开始的消息 把庄家告诉前端
        for (const pl of this.players) {
            const member = this.channel.getMember(pl.uid);
            const opts = {
                roundId: this.roundId,
                cards: this.cards,
                gold: pl.gold
            }
            member && MessageService.pushMessageByUids(DragonTigerConst.route.Start, opts, member);
        }
        this.playersChange();

        setTimeout(async () => {
            await this.startBet();
        }, DragonTigerConst.statusTimer.LICENS);
    }

    // 开始下注
    async startBet() {
        this.roomStatus = 'BETTING';
        this.stateTime = Date.now();

        roomManager.pushRoomStateMessage(this.roomId, {
            nid: this.nid,
            sceneId: this.sceneId,
            roomId: this.roomId,
            countDown: this.getRoomInfo().countdown,
            status: this.roomStatus,
            historyData: this.getRecord()
        });

        this.channelIsPlayer(DragonTigerConst.route.StartBet,
            { countdown: DragonTigerConst.statusTimer.BETTING / 1000 });

        setTimeout(async () => {
            await this.openAward();
        }, DragonTigerConst.statusTimer.BETTING);
    }

    /**开奖 */
    async openAward() {
        this.roomStatus = 'OPENAWARD';
        this.stateTime = Date.now();

        // 运行调控逻辑
        const result = await this.controlLogic.runControl();
        this.result = result.lotteryResults;
        this.BankSettleDetails = result.BankSettleDetails;
        // 规则修改所有场都不显示 2019.10.14
        this.winArea = result.winArea;
        if (this.sceneId == 0) {
            this.winArea = result.winArea.filter(area => DragonTigerConst.ordinaryArea.includes(area));
        }
        // 构建压缩结果
        this.zipResult = buildRecordResult(this.result, this.winArea);

        this.allBetNum = result.allBet;
        const totalProfit = result.totalProfit;

        // 记录开奖记录  保存并更新游戏记录
        this.recordResult(this.winArea);

        await RoomManager.updateOneRoom({ serverId: this.serverId, roomId: this.roomId, history: this.DragonTigerHistory }, ['history']);

        // 记录开奖日志
        // LoggerInfo.info(`lotteryResult|${GameNidEnum.DragonTiger}|${system_room.roomId}|${JSON.stringify(this.result)}`);

        // 通知前端开奖
        const opts = {
            result: this.result,
            winArea: this.winArea,
            countdown: DragonTigerConst.statusTimer.OPENAWARD / 1000,
        }
        this.channelIsPlayer(DragonTigerConst.route.Lottery, opts);

        setTimeout(async () => {
            await this.processing(this.winArea, totalProfit);
        }, DragonTigerConst.statusTimer.OPENAWARD);
    }

    /**结算 */
    async processing(winArea: string[], totalProfit: number) {
        this.roomStatus = 'SETTLEING';
        this.stateTime = Date.now();
        this.endTime = Date.now();

        for (const pl of this.players) {
            if (pl.bet == 0)
                continue;
            this.calculateValidBet(pl, winArea);
            await pl.addGold(this, winArea);

            // 跑马灯
            if (pl.profit > DragonTigerConst.scrolling) {
                await msgService.sendBigWinNotice(this.nid, pl.nickname, pl.profit, pl.isRobot, pl.headurl);
            }
        }
        // 结算庄家
        if (this.banker) {
            this.banker.profit = this.allBetNum - totalProfit;
            this.banker.validBet = Math.abs(this.banker.profit);
            this.banker.bet = 0;
            await this.banker.addGold(this, winArea);
        }


        // 给未在线的玩家添加一个离线回合记录
        this.players.forEach(pl => (!pl.onLine) && pl.addOffLineCount());

        // 通知结算
        let opts = {
            countdown: DragonTigerConst.statusTimer.SETTLEING / 1000,
            winArea,
            sceneId: this.sceneId,
            banker: this.banker ? this.banker.strip() : { profit: this.allBetNum - totalProfit },
            players: this.players.filter(pl => pl.bet > 0 || (this.banker && this.banker.uid == pl.uid)).map((pl) => {
                // for (const area in pl.bets) {
                //     if (pl.bets[area].profit > 0) {
                //         pl.profit += pl.bets[area].bet;
                //         pl.bets[area].profit += pl.bets[area].bet;
                //     }
                // }
                return {
                    uid: pl.uid,
                    gold: pl.gold,
                    profit: pl.profit,
                    bets: pl.bets
                };
            })
        }
        this.channelIsPlayer(DragonTigerConst.route.Settle, opts);

        roomManager.pushRoomStateMessage(this.roomId, {
            nid: this.nid,
            sceneId: this.sceneId,
            roomId: this.roomId,
            status: this.roomStatus,
            countDown: this.getRoomInfo().countdown,
            historyData: this.getRecord()
        });

        setTimeout(async () => {
            await this.runRoom();
        }, DragonTigerConst.statusTimer.SETTLEING);
    }
}



