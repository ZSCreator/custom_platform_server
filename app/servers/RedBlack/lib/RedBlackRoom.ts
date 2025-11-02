import RedBlackPlayerImpl from './RedBlackPlayerImpl';
import { SystemRoom } from '../../../common/pojo/entity/SystemRoom';
import { getLogger } from 'pinus-logger';
import ControlImpl from "./ControlImpl";
import { CommonControlState } from "../../../domain/CommonControl/config/commonConst";
import { GameNidEnum } from '../../../common/constant/game/GameNidEnum';
import { PersonalControlPlayer } from "../../../services/newControl";
import { ControlKinds, ControlState } from "../../../services/newControl/constants";
import { RoleEnum } from "../../../common/constant/player/RoleEnum";
import { buildRecordResult } from "./util/lotteryUtil";
import RedBlackService = require('./util/lotteryUtil');
import utils = require('../../../utils/index');
import RedBlackConst = require('./RedBlackConst');
import msgService = require('../../../services/MessageService');
import JsonConfig = require('../../../pojo/JsonConfig');
import roomManager, { RedBlackRoomManger } from '../lib/RedBlackMgr';

const LoggerInfo = getLogger('server_out', __filename);

/**
 * 红黑大战房间类
 * @property startTime 回合开始时间
 * @property endTime 回合结束时间
 * @property zipResult 压缩结果
 * @property realPlayerTotalBet 真人瓦纳基回合总押注
 */
export default class Room extends SystemRoom<RedBlackPlayerImpl> {
    stateTime: number;
    allBetNum: number;
    RedBlackHistory: { win: string, luck: any }[];
    playerAreaBets: { [key: string]: { arr: any, allBet: number } };
    zname: string;
    bankerQueue: RedBlackPlayerImpl[];
    banker: RedBlackPlayerImpl;
    // displayPlayers: { bigWinner: any; rich: any; betMostPlayers: any[]; length: number; };
    roomStatus: 'NONE' | 'LICENS' | 'BETTING' | 'OPENAWARD' | 'SETTLEING' = 'NONE';
    players: RedBlackPlayerImpl[];
    killAreas: Set<string>;
    controlLogic: ControlImpl;

    startTime: number;
    endTime: number;
    zipResult: string = '';

    realPlayerTotalBet = 0;
    lowBet: number;
    capBet: number;
    betUpperLimit: number;
    experience = false;
    stop: boolean;
    timer: NodeJS.Timer;
    ChipList: number[];
    constructor(opts: any) {
        super(opts);

        this.players = [];                                                                  // 房间内的玩家列表
        this.channel = opts.channel;                                                        // 房间通道
        this.ChipList = opts.ChipList;                                                  // 房间下注专用通道，只通知真实玩家

        this.lowBet = opts.lowBet;
        this.capBet = opts.capBet;
        this.betUpperLimit = this.capBet
        this.stateTime = 0;                                                                 // 当前状态时间
        this.allBetNum = 0;                                                                 // 回合总押注
        this.RedBlackHistory = opts.RedBlackHistory || [];                                                                 // 开奖记录
        this.playerAreaBets = {};                                                           // 区域玩家押注情况
        this.zname = JsonConfig.get_games(this.nid).zname;  // 游戏名称
        this.bankerQueue = [];                                                              // 上庄队列
        this.banker = null;                                                                 // 庄,默认为空 为空就为系统做庄
        this.killAreas = new Set();
        this.controlLogic = new ControlImpl({ room: this });

        // this.experience = this.sceneId == 0 ? true : false;
        this.roomStatus = 'NONE';
        this.ramodHistory();
    }
    run() {
        this.stop = false;
        this.runRoom();
    }
    close() {
        clearInterval(this.timer);
        this.controlLogic = null;
        this.bankerQueue.length = 0;
    }
    ramodHistory() {
        let numberOfTimes = RedBlackConst.MAX_HISTORY_LENGTH;
        do {
            const { results: result, winArea, allBetNum, totalRebate } = this.randomLottery();
            this.recordResult(winArea);
            numberOfTimes--;
        } while (numberOfTimes > 0);
    }

    /*-------------------------------------- 房间工具方法部分 ----------------------------------------- */

    // 初始化房间数据
    initRoom() {
        // 上庄队列过滤掉钱不够的人、掉线的人
        this.bankerQueue = this.bankerQueue.filter(player => {
            return player.gold >= RedBlackConst.bankerGoldLimit[this.sceneId] && player.onLine
        });
        // 庄家处理
        this.bankerDeal();
        // 如果没人坐庄 且上庄列表有人去上庄队列的第一个玩家当庄
        if (!this.banker && (this.bankerQueue.length > 0)) {
            this.banker = this.bankerQueue.shift();
            this.banker.setBanker();
        }
        this.allBetNum = 0;
        this.killAreas.clear();
        this.players.map(player => player.roundPlayerInit());
        this.playerAreaBets = {};

        // 更新真实玩家数量
        this.updateRealPlayersNumber();

        // 初始化回合id
        this.updateRoundId();
        this.startTime = Date.now();
        this.zipResult = '';

        this.realPlayerTotalBet = 0;

        return true;
    }

    // 做庄处理
    bankerDeal() {
        // 如果有人坐庄
        if (this.banker) {
            // 如果金币不足或者坐庄次数等于三次下庄 强制下庄 把他踢下庄 否则坐庄次数加一
            if (this.banker.gold < RedBlackConst.bankerGoldLimit[this.sceneId] ||
                this.banker.bankerCount >= RedBlackConst.bankerRoundLimit ||
                this.banker.quitBanker) {

                this.banker.clearBanker();
                this.banker = null;
            } else {
                this.banker.bankerCount += 1;
            }
        }
    }

    // 添加玩家
    addPlayerInRoom(dbplayer) {
        const roomPlayer = this.getPlayer(dbplayer.uid);
        // 如果在玩家列表里面代表离线玩家
        if (!!roomPlayer) {
            roomPlayer.upOnlineTrue();
        } else {
            const roomPlayer = new RedBlackPlayerImpl(dbplayer, this);
            this.players.push(roomPlayer);
            let displayPlayers = this.rankingLists();
            const opts = {
                displayPlayers: displayPlayers.slice(0, 6),
                displayPlayers_num: displayPlayers.length,
            };
            this.channelIsPlayer(RedBlackConst.route.ListChange, opts);
        }
        this.addMessage(dbplayer);
        // 更新真实玩家数量
        this.updateRealPlayersNumber();
        return true;
    }


    /**玩家离开, drops判断玩家是否强行离开, 默认为false */
    leave(playerInfo: RedBlackPlayerImpl, drops = false) {
        this.kickOutMessage(playerInfo.uid);
        if (drops) {
            playerInfo.onLine = false;
        } else {
            utils.remove(this.players, 'uid', playerInfo.uid);

            let displayPlayers = this.rankingLists();
            const opts = {
                displayPlayers: displayPlayers.slice(0, 6),
                displayPlayers_num: displayPlayers.length,
            };
            this.channelIsPlayer(RedBlackConst.route.ListChange, opts);
        }
        // 更新真实玩家数量
        this.updateRealPlayersNumber();
    }

    // 查看玩家列表是否已满 
    isFull() {
        return this.players.length >= RedBlackConst.MAXCOUNT;
    }

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


    /**踢掉离线的玩家 */
    async br_kickNoOnline() {
        const offlinePlayers = await this.kickOfflinePlayerAndWarnTimeoutPlayer(this.players,
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

    /**记录开奖结果 */
    recordResult(result) {
        // 如果记录长度超过限制则裁掉第一条记录
        if (this.RedBlackHistory.length >= RedBlackConst.MAX_HISTORY_LENGTH) this.RedBlackHistory.shift();
        this.RedBlackHistory.push(result);
    }

    /**获取玩家区域押注情况 */
    getPlayerAreaBets() {
        const obs: { [uid: string]: { [area: string]: number } } = {};
        const areaSituation = this.playerAreaBets;

        for (let area in areaSituation) {
            areaSituation[area].arr.forEach(playerBet => {
                if (!obs[playerBet.uid]) obs[playerBet.uid] = {};
                obs[playerBet.uid][area] = playerBet.bet;
            });
        }

        return obs;
    }

    // 对历史记录红黑双方赢的次数进行计数
    async getRecords() {
        let redCount = 0, blackCount = 0;
        for (let i = 0, len = this.RedBlackHistory.length; i < len; i++) {
            if (this.RedBlackHistory[i].win === RedBlackConst.area.red) {
                redCount += 1;
            } else {
                blackCount += 1;
            }
        }
        return { red: redCount, black: blackCount };
    }

    // 押注限红检测
    isLimit(bets, uid: string) {
        const playerAreaBets = this.playerAreaBets;

        for (let area in bets) {
            if (!playerAreaBets[area]) continue;

            if (area === RedBlackConst.betArea.luck) {
                const judge = playerAreaBets.luck && playerAreaBets.luck.arr.find(areaInfo => areaInfo.uid === uid);
                if (!!judge && (judge.bet + bets[area] > (this.betUpperLimit / 5))) {
                    return RedBlackConst.LimitRed.personal;
                }
            } else {
                // 找出对应的下注区域  先检测区域总押注对押是否超过限红
                const mappArea = RedBlackConst.mapping[area];
                const betAreaBet = playerAreaBets[area].allBet;
                const mappAreaBet = !playerAreaBets[mappArea] ? 0 : playerAreaBets[mappArea].allBet;
                const difference = this.betUpperLimit - (betAreaBet - mappAreaBet);

                if (bets[area] > difference) return RedBlackConst.LimitRed.total;

                // 检测个人限红押注 不能超过单项个人限红 不能超过对立区域差值不能超过限红
                const findBet = playerAreaBets[area].arr.find(m => m.uid === uid);
                const myBetArea = findBet ? findBet.bet : 0;

                if (this.betUpperLimit - myBetArea < bets[area]) return RedBlackConst.LimitRed.personal;

                const findMappBet = playerAreaBets[mappArea] && playerAreaBets[mappArea].arr.find(m => m.uid === uid);
                const myMappArea = findMappBet ? findMappBet.bet : 0;
                const difference1 = this.betUpperLimit - (myBetArea - myMappArea);

                if (bets[area] > difference1) return RedBlackConst.LimitRed.personal;
            }
        }

        return false;
    }

    // 计算需最大需赔付多少金币
    computCompensateGold(areaCompensate) {
        // 先算出幸运一击最多赔多少 最大赔率为豹子的赔率
        const maxLuckCompensate = areaCompensate[RedBlackConst.betArea.luck] * RedBlackConst.odds2['18'];

        const red = areaCompensate[RedBlackConst.betArea.red], black = areaCompensate[RedBlackConst.betArea.black];
        const compensate = (Math.max(red, black) - Math.min(red, black)) * RedBlackConst.odds2.red;

        return maxLuckCompensate + compensate;
    }

    // 检查玩家押注是否超过庄家赔付
    playerIsBankerBetLimit(bets) {
        if (!this.playerIsBanker()) {
            return false;
        }

        const areaCompensate = {};
        RedBlackConst.areas.forEach(_area => {
            areaCompensate[_area] = this.playerAreaBets[_area] ? this.playerAreaBets[_area].allBet : 0;
        });

        for (let area in bets) {
            areaCompensate[area] += bets[area];
            let compensateGold = this.computCompensateGold(areaCompensate);
            if (this.banker.gold < compensateGold) {
                return true;
            }
        }

        return false;
    }

    /**玩家下注 */
    async playerBet(uid: string, bets: { [key: string]: number }) {
        const playerInfo = `bet|${GameNidEnum.RedBlack}|${this.roomId}|${uid}`;
        const currPlayer = this.getPlayer(uid);
        for (let area in bets) {
            // 由于玩家自己已经记录了押注情况，如需获取押注情况，可只保留房间区域总押注this.playerAreaBets[area] = 0;
            // 获取玩家的细分押注情况时可直接遍历整个玩家列表 写代码之出没用这种写法
            currPlayer.betHistory(area, bets[area]);

            if (!this.playerAreaBets[area]) {
                this.playerAreaBets[area] = { arr: [], allBet: 0 };
            }

            const areaSitu = this.playerAreaBets[area];
            const judge = areaSitu.arr.findIndex(areaInfo => areaInfo.uid === uid);

            judge === -1 ? areaSitu.arr.push({ uid, bet: bets[area] }) :
                (areaSitu.arr[judge].bet += bets[area]);

            areaSitu.allBet += bets[area];

            // 记录日志
            currPlayer.isRobot !== 2 && LoggerInfo.info(`${playerInfo}|${bets[area]}|${area}|${currPlayer.isRobot}`);
        }

        if (currPlayer.isRobot === RoleEnum.REAL_PLAYER) {
            this.realPlayerTotalBet += utils.sum(bets);
        }

        this.channelIsPlayer(RedBlackConst.route.NoTiceBet,
            { uid, bets, desktopPlayers: this.rankingLists().slice(0, 6) });
    }

    // 获取房间倒计时
    getCountdown() {
        return Math.floor((RedBlackConst.statusTime[this.roomStatus] - (Date.now() - this.stateTime)) / 1000);
    }

    /**计算玩家有效押注 */
    calculateValidBet(player: RedBlackPlayerImpl) {
        const
            keys = Object.keys(player.betAreas), calculateArr = [], betAreas = player.betAreas;
        let count = 0;

        for (let i = 0, len = keys.length; i < len; i++) {
            const area = keys[i];

            // 幸运值跳过
            if (area === RedBlackConst.area.draw) {
                count += betAreas[area];
                continue;
            }

            const mappingArea = RedBlackConst.mapping[area];

            // 已经计算的过的跳过 和值跳过
            if (calculateArr.includes(mappingArea))
                continue;


            const
                areaBet = betAreas[area],
                mappingAreaBet = !!betAreas[mappingArea] ? betAreas[mappingArea] : 0;

            count += (Math.max(areaBet, mappingAreaBet) - Math.min(areaBet, mappingAreaBet));
            calculateArr.push(area);
        }

        player.validBetCount(count);
    }

    // 获取上庄列表
    getBankerQueue() {
        return this.bankerQueue.map(player => player.bankerStrip());
    }

    // 检查玩家是否是庄
    checkPlayerIsBanker(uid: string) {
        return this.banker && this.banker.uid === uid;
    }

    // 检查是否是玩家坐庄
    playerIsBanker() {
        return !!this.banker;
    }

    // 检查是否在上庄列表中
    checkPlayerInBankerQueue(uid: string) {
        return !!(this.bankerQueue.find(player => player.uid === uid));
    }

    // 加入上庄队列
    joinBankerQueue(uid: string) {
        const player = this.getPlayer(uid);
        // 通知当前上庄人数
        if (!!player) {
            this.bankerQueue.push(player);
            this.channelIsPlayer(RedBlackConst.route.queueLength, {
                length: this.bankerQueue.length,
            });
        }
    }

    // 下庄
    descendBanker(uid: string) {
        if (this.checkPlayerIsBanker(uid)) {
            // 如果当庄回合数小于最小当庄数,视为强制下庄
            if (this.banker.bankerCount < RedBlackConst.bankerRoundLimit) {
                this.banker.quitBanker = true;
            }
        }
    }

    // 退出上庄队列
    quitBankerQueue(uid: string) {
        const judge = this.checkPlayerInBankerQueue(uid);

        if (judge) {
            utils.remove(this.bankerQueue, 'uid', uid);
            // this.bankerQueue.remove('uid', uid);
            this.channelIsPlayer(RedBlackConst.route.queueLength, {
                length: this.bankerQueue.length,
            });
        }
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
        // const betDetail = this.getPlayerAreaBets();
        const bet = this.getControlPlayersBet(params);
        // 获取结果
        return RedBlackService.getPersonalControlResult(this.players, bet, params.state, this.killAreas, RoleEnum.REAL_PLAYER);
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
     * 随机开奖
     */
    randomLottery() {
        return RedBlackService.randomLottery(this.players, this.killAreas);
    }

    /**
     * 获取调控结果
     */
    sceneControlResult(sceneControlState: ControlState, isPlatformControl: boolean) {
        // 如果房间里面没真人下注 或者不控制就随机发牌
        if (this.realPlayerTotalBet === 0 || sceneControlState === ControlState.NONE) {
            return RedBlackService.randomLottery(this.players, this.killAreas);
        }


        const type = isPlatformControl ? ControlKinds.PLATFORM : ControlKinds.SCENE;
        this.players.forEach(p => p.setControlType(type));

        // 是谁当庄
        const filterType = !!this.banker && this.banker.isRobot === 0 ? 2 : 0;
        // 玩家押注详情
        // const betDetail = this.getPlayerAreaBets();

        // 获取玩家押注的区域 过滤掉被必杀的区域
        const bet = this.getPlayersTotalBet({ filterType });

        return RedBlackService.getWinORLossResult(this.players,
            filterType, bet, this.killAreas, sceneControlState === ControlState.SYSTEM_WIN);
    }
    /*-------------------------------------- 房间运行逻辑部分 -----------------------------------------*/

    // 开始 初始化房间
    async runRoom() {
        // 这儿会做一个判断，判断游戏是否关闭如果关闭不开始下一把，也不开启定时器
        this.initRoom();

        this.roomStatus = 'LICENS';
        this.stateTime = Date.now();
        await this.br_kickNoOnline();
        // 给前端推送房间开始消息
        this.channelIsPlayer(RedBlackConst.route.Start, {
            countdown: RedBlackConst.statusTime.LICENS,
            desktopPlayers: this.rankingLists().slice(0, 6),
            banker: this.banker ? this.banker.bankerStrip() : this.banker,
            bankerQueueLength: this.bankerQueue.length,
            roundId: this.roundId,
        });

        // 设置多少时间进入下一状态
        this.timer = setTimeout(async () => {
            await this.startBet();
        }, RedBlackConst.statusTime.LICENS);
    }

    // 进入下注状态
    async startBet() {
        this.roomStatus = 'BETTING';
        this.stateTime = Date.now();

        // 通知客户端进入开始下注
        this.channelIsPlayer(RedBlackConst.route.StartBet, {
            countdown: RedBlackConst.statusTime.BETTING / 1000
        });

        roomManager.pushRoomStateMessage(this.roomId, {
            nid: this.nid,
            sceneId: this.sceneId,
            roomId: this.roomId,
            countDown: this.getCountdown(),
            status: this.roomStatus,
            historyData: this.RedBlackHistory.slice(-20)
        });

        this.timer = setTimeout(async () => {
            await this.openAward();
        }, RedBlackConst.statusTime.BETTING);
    }

    // 开奖
    async openAward() {
        this.roomStatus = 'OPENAWARD';
        this.stateTime = Date.now();

        // 运行调控逻辑
        const { results: result, winArea, allBetNum, totalRebate } =
            await this.controlLogic.runControl();

        this.zipResult = buildRecordResult(result, winArea);

        this.allBetNum = allBetNum;

        // 记录结果
        this.recordResult(winArea);
        // const { system_room, room_lock } = await RoomManager.getOneLockedRoomFromCluster(pinus.app.getServerId(), this.nid, this.roomId);
        //
        // // 把历史记录存入房间
        // system_room['RedBlackHistory'] = this.RedBlackHistory;
        // await RoomManager.updateOneRoomFromCluster(pinus.app.getServerId(), system_room, ['RedBlackHistory'], room_lock);

        // 记录开奖日志
        // const strResult = JSON.stringify(result);
        // LoggerInfo.info(`lotteryResult|${GameNidEnum.RedBlack}|${strResult}`);

        // 通知前端开奖
        this.channelIsPlayer(RedBlackConst.route.Lottery, {
            result,
            winArea,
            // userWin,
            countdown: RedBlackConst.statusTime.OPENAWARD / 1000,
        });

        this.timer = setTimeout(async () => {
            await this.processing(totalRebate, result, winArea);
        }, RedBlackConst.statusTime.OPENAWARD);
    }

    /**结算 */
    async processing(totalProfit, result, winArea) {
        this.roomStatus = 'SETTLEING';
        this.stateTime = Date.now();
        this.endTime = Date.now();
        const roomInfo = `settleMent|${GameNidEnum.RedBlack}|${this.roomId}`;
        const settlement_info = { result, winArea };

        // 赢家加钱并记录日志
        for (const pl of this.players) {
            if (pl.bet == 0) {
                continue;
            }
            this.calculateValidBet(pl);
            await pl.addGold(this, winArea, settlement_info);
            // 跑马灯
            if (pl.profit > RedBlackConst.scrolling) {
                await msgService.sendBigWinNotice(this.nid, pl.nickname, pl.profit, pl.isRobot, pl.headurl);
            }

            // 记录结算日志
            const logInfo = `${roomInfo}|${pl.uid}|${pl.profit}|${pl.gold}`;
            pl.isRobot !== 2 && LoggerInfo.info(`${logInfo}|${pl.isRobot}`);
        }


        roomManager.pushRoomStateMessage(this.roomId, {
            nid: this.nid,
            sceneId: this.sceneId,
            roomId: this.roomId,
            countDown: this.getCountdown(),
            status: this.roomStatus,
            historyData: this.RedBlackHistory.slice(-20)
        });

        // 通知N秒后开始下一局
        let opts = {
            countdown: RedBlackConst.statusTime.SETTLEING / 1000,
            userWin: this.players.filter(pl => pl.bet > 0).map(pl => {
                if (pl.bet) {
                    return {
                        uid: pl.uid,
                        nickname: pl.nickname,
                        headurl: pl.headurl,
                        profit: pl.profit,
                        bets: pl.bets,
                        gold: pl.gold
                    }
                }
            }),
            banker: this.banker ? this.banker.strip() : null,
        }
        // console.warn(JSON.stringify(opts));
        this.channelIsPlayer(RedBlackConst.route.Settle, opts);

        this.timer = setTimeout(async () => {
            await this.runRoom();
        }, RedBlackConst.statusTime.SETTLEING);
    }
}
