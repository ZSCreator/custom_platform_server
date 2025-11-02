'use strict'
import { getLogger } from 'pinus-logger';
import ttzPlayer from './ttzPlayer';
import { SystemRoom } from '../../../common/pojo/entity/SystemRoom';
import { PersonalControlPlayer } from "../../../services/newControl";
import { CommonControlState } from "../../../domain/CommonControl/config/commonConst";
import { ControlKinds, ControlState } from "../../../services/newControl/constants";
import { controlLottery, settle_zhuang } from "./ttzlogic";
import { RoleEnum } from "../../../common/constant/player/RoleEnum";
import * as langsrv from '../../../services/common/langsrv';
import ControlImpl from "./control";
import { buildRecordResult } from "./util/recordUtil";
import createPlayerRecordService from '../../../common/dao/RecordGeneralManager';
import MessageService = require('../../../services/MessageService');
import ttzConst = require('./ttzConst');
import utils = require('../../../utils/index');
import ttzlogic = require('./ttzlogic');
import roomManager, { TtzRoomManager } from '../lib/ttzRoomMgr';
import { GetOnePl } from '../../../services/robotService/overallController/robotCommonOp';

const log_logger = getLogger('server_out', __filename);


/**发牌中 */
const LOTTERY_COUNTDOWN = 5;
/**结算倒计时 */
const SETTLE_COUNTDOWN = 10;

/**
 * @property startTime 回合开始时间
 * @property endTime 回合结束时间
 * @property zipResult 压缩结果
 */
export default class ttzRoom extends SystemRoom<ttzPlayer> {
    /**最低下注要求 */
    lowBet: number;
    /**封顶 */
    // capBet: number;
    allinMaxNum: number;
    /**上庄条件 */
    upZhuangCond: number;
    ChipList: number[];
    /**room回合总押注 */
    totalBet: number = 0;
    /**押注情况 */
    situations: { area: string, betList: { uid: string, bet: number, updatetime: number }[], totalBet: 0 }[] = [];
    _numbers: number[] = [];
    /**开奖结果 */
    lotterys: {
        area: string,
        iswin: boolean,
        result: number[],
        /**豹子>二八杠>点数牌 */
        type: 2 | 1 | 0,
        /**白板>九筒>八筒>七筒>六筒>五筒>四筒>三筒>二筒>一筒 */
        Points: number
    }[] = [];
    /**发牌中 下注中 开奖中 */
    status: 'NONE' | 'Licensing' | 'BETTING' | 'OPENAWARD' = "NONE";

    /**上庄排队列表 */
    zj_queues: ttzPlayer[] = [];

    startTime: number;
    endTime: number;
    zipResult: string = '';

    /**庄家信息 */
    zhuangInfo: {
        uid: string;
        /**-1表示无限 */
        hasRound: number;
        /**庄家累计收益 */
        money: number;
    };

    timerInterval: NodeJS.Timer = null;

    players: ttzPlayer[] = [];
    /**各种倒计时 */
    countdown: number = 0;
    /**申请下庄 */
    xiaZhuangUid: string = null;
    ttzHistory: any[];
    killAreas: Set<string> = new Set();
    control: ControlImpl;

    constructor(opts: any) {
        super(opts);
        this.lowBet = opts.lowBet;
        this.ChipList = opts.ChipList;
        this.allinMaxNum = opts.allinMaxNum || 0;
        this.upZhuangCond = opts.upZhuangCond || 200000;
        this.ttzHistory = opts.ttzHistory || [];
        this.zhuangInfo = {// 庄家信息
            uid: null,
            hasRound: -1, // -1表示无限
            money: 0//庄家累计收益
        };
        this.ramodHistory();
        this.control = new ControlImpl({ room: this });
        let AddCount = 0;
        do {
            let pl = GetOnePl();
            pl.gold = utils.random(this.upZhuangCond, this.upZhuangCond * 2);
            this.addPlayerInRoom(pl);
            let ply = this.players[AddCount];
            this.zj_queues.push(ply);
            AddCount++;
            ply.updatetime += AddCount * 2 * 60;
        } while (AddCount < 3);
    }
    close() {
        clearInterval(this.timerInterval);
        this.sendRoomCloseMessage();
        this.players = []
    }
    ramodHistory() {
        let numberOfTimes = 20;
        do {
            let lotterys = [
                { area: `center`, iswin: true, result: [], type: 0, Points: 0 },
                { area: `east`, iswin: false, result: [], type: 0, Points: 0 },
                { area: `north`, iswin: false, result: [], type: 0, Points: 0 },
                { area: `west`, iswin: false, result: [], type: 0, Points: 0 },
                { area: `south`, iswin: false, result: [], type: 0, Points: 0 }
            ]
            for (const iterator of lotterys) {
                iterator.iswin = false;
                let randomIndex = utils.random(0, 1);
                if (randomIndex == 0) {
                    iterator.iswin = true;
                }
            }
            let opts = {
                nid: this.nid,
                sceneId: this.sceneId,
                roomId: this.roomId,
                res: lotterys.filter(m => m.area != "center").map(m => { return { area: m.area, isWin: m.iswin } }),
            }
            this.ttzHistory.push(opts);
            numberOfTimes--;
        } while (numberOfTimes > 0);
    }

    /**初始化房间 */
    async Initialization() {
        this.totalBet = 0;
        this.players.forEach(pl => pl && pl.playerInit(this));
        await this.br_kickNoOnline();
        this.situations = [];
        this._numbers = [];
        this.lotterys = [
            { area: `center`, iswin: true, result: [], type: 0, Points: 0 },
            { area: `east`, iswin: false, result: [], type: 0, Points: 0 },
            { area: `north`, iswin: false, result: [], type: 0, Points: 0 },
            { area: `west`, iswin: false, result: [], type: 0, Points: 0 },
            { area: `south`, iswin: false, result: [], type: 0, Points: 0 }
        ]
        // 初始化回合id
        this.updateRoundId();

        // 必杀区域清零
        this.killAreas.clear();
        return true;
    }

    /**推送一次庄家信息 */
    noticeZhuangInfo() {
        const zhuang = this.getPlayer(this.zhuangInfo.uid);
        const opts = {
            zhuangInfo: zhuang && zhuang.strip(this.zhuangInfo.hasRound),//当前庄家信息
            applyZhuangs: this.zj_queues.map(pl => {
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
        this.channelIsPlayer("bairenTTZ_zj_info", opts);
    }
    /**当前庄家相关操作 */
    async check_zjList() {
        do {
            if (this.zhuangInfo.uid) {
                this.zhuangInfo.hasRound--;
                const zj_pl = this.getPlayer(this.zhuangInfo.uid);
                if (zj_pl && zj_pl.gold < this.upZhuangCond) {
                    const member = this.channel.getMember(zj_pl.uid);
                    member && MessageService.pushMessageByUids('ttz_onKickZhuang', { msg: langsrv.getlanguage(zj_pl.language, langsrv.Net_Message.id_1218) }, member);
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
                    member && MessageService.pushMessageByUids('ttz_onKickZhuang', { msg: langsrv.getlanguage(zj_pl.language, langsrv.Net_Message.id_1219) }, member);
                    continue;
                }
                //初始化庄家信息
                this.zhuangInfo.uid = zj_pl.uid;
                this.zhuangInfo.hasRound = zj_pl ? ttzConst.ZHUANG_NUM : -1;
                this.zhuangInfo.money = 0;
                // 通知嘛
                break;
            }
        } while (true);
        this.noticeZhuangInfo();
    }

    /**添加一个玩家 */
    addPlayerInRoom(dbplayer) {
        const currPlayer = this.getPlayer(dbplayer.uid);
        if (currPlayer) {            // 说明是离线玩家
            currPlayer.gold = dbplayer.gold;
            currPlayer.onLine = true;
            this.addMessage(currPlayer);
            return true;
        }
        try {
            this.addMessage(dbplayer)
            this.players.push(new ttzPlayer(dbplayer));
            return true;
        } catch (error) {
            log_logger.log("addPlayer=", dbplayer);
            return false;
        }

    }

    /**玩家离开 或者 掉线
     * droORclo true 掉线
     */
    leave(playerInfo: ttzPlayer, droORclo = false) {
        this.kickOutMessage(playerInfo.uid);
        // 如果玩家是强行离开或者掉线
        if (droORclo == true) {
            playerInfo.onLine = false;
            return;
        }
        utils.remove(this.players, 'uid', playerInfo.uid);
        let index = this.zj_queues.findIndex(m => m.uid == playerInfo.uid);
        if (index !== 0 && index !== -1) {//在庄家列表 且不是庄家
            this.zj_queues.splice(index, 1);
        }
        this.playersChange();
    }
    /**推送玩家改变信息 */
    playersChange() {
        const opts = {
            playerNum: this.players.length,
            rankingList: this.rankingLists().slice(0, 6),
        }
        this.channelIsPlayer('bairenTTZ_playersChange', opts);
    }

    /**
     * 判断庄是否是真实玩家
     */
    bankerIsRealMan(): boolean {
        const banker = this.getPlayer(this.zhuangInfo.uid);
        return !!banker && banker.isRobot === 0;
    }

    rankingLists() {
        let stripPlayers = this.players.map(pl => {
            if (pl) {
                return {
                    uid: pl.uid,
                    nickname: pl.nickname,
                    headurl: pl.headurl,
                    gold: pl.gold,
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

    /**运行房间 */
    async runRoom() {
        try {
            await this.Initialization();// 初始化房间
            await this.check_zjList();
            this._numbers = ttzlogic.shuffle_cards();
            this.countdown = LOTTERY_COUNTDOWN;
            this.startTime = Date.now();
            for (const lottery of this.lotterys) {
                lottery.result.push(this._numbers.shift());
            }
            // 给前端推送房间开始消息

            for (const pl of this.players) {
                const member = this.channel.getMember(pl.uid);
                const opts: ttzConst.ITTZ_Start = {
                    countdown: this.countdown,
                    lotterys: this.lotterys,
                    isRenew: pl.isCanRenew(),
                    roundId: this.roundId,
                    robotNum: this.zj_queues.filter(pl => pl.isRobot == 2).length,
                    gold: pl.gold
                }
                member && MessageService.pushMessageByUids('TTZ_Start', opts, member);
            }
            this.playersChange();
            this.status = `Licensing`;
            clearInterval(this.timerInterval);
            this.timerInterval = setInterval(async () => {
                this.countdown -= 1;
                if (this.countdown <= 0) {
                    clearInterval(this.timerInterval);
                    this.startBetting();
                }
            }, 1000);

        } catch (err) {
            log_logger.error(`ttz开始运行房间报错 错误信息 ==> ${err}`);
            this.status = "NONE";
            return;
        }
    }

    /**下注中betting */
    startBetting() {
        this.status = "BETTING";
        clearInterval(this.timerInterval);
        this.countdown = 15;
        this.channelIsPlayer("TTZ_BETTING", { countdown: this.countdown });
        let opts = {
            nid: this.nid,
            roomId: this.roomId,
            sceneId: this.sceneId,
            status: this.status,
            downTime: this.countdown
        };
        roomManager.pushRoomStateMessage(this.roomId, opts);

        this.timerInterval = setInterval(() => {
            this.countdown -= 1;
            if (this.countdown <= 0) {
                clearInterval(this.timerInterval);
                this.openAward();
            }
        }, 1000);
    }

    async openAward() {
        try {
            this.status = "OPENAWARD";
            this.endTime = Date.now();
            log_logger.info(`OPENAWARD|${this.roomId}`);

            // 获取调控结果
            let { winArea } = await this.control.result();
            // 构造压缩结果
            this.zipResult = buildRecordResult(this.lotterys);
            await this.onSettlement();
            /**如果有庄家，把庄家加到推送列表 */
            let list = this.players.filter(pl => pl.bet > 0);
            if (this.zhuangInfo.uid) {
                list.push(this.getPlayer(this.zhuangInfo.uid));
            }
            let opts = {
                lotterys: this.lotterys,
                winArea,
                userWin: list.map(pl => {
                    return {
                        uid: pl.uid,
                        gold: pl.gold,
                        bets: pl.betList,
                        profit: pl.profit,
                        bet: pl.bet
                    }
                }),
                countdown: SETTLE_COUNTDOWN
            }
            this.channelIsPlayer("TTZ_Lottery", opts);
            {
                // const { system_room, room_lock } = await RoomManager.getOneLockedRoomFromCluster(pinus.app.getServerId(), this.nid, this.roomId);
                let opts = {
                    nid: this.nid,
                    sceneId: this.sceneId,
                    roomId: this.roomId,
                    res: this.lotterys.filter(m => m.area != "center").map(m => { return { area: m.area, isWin: m.iswin } }),
                }
                this.ttzHistory.push(opts);
                if (this.ttzHistory.length > 20) this.ttzHistory.shift();
                // system_room['ttzHistory'] = this.ttzHistory;
                // await RoomManager.updateOneRoomFromCluster(pinus.app.getServerId(), system_room, ['ttzHistory'], room_lock);

                roomManager.pushRoomStateMessage(this.roomId, {
                    nid: this.nid,
                    sceneId: this.sceneId,
                    roomId: this.roomId,
                    status: this.status,
                    historyData: this.ttzHistory
                });
            }

            // 结算时间
            this.countdown = SETTLE_COUNTDOWN;
            clearInterval(this.timerInterval);
            this.timerInterval = setInterval(() => {
                this.countdown -= 1;
                if (this.countdown === 0) {
                    clearInterval(this.timerInterval);
                    this.runRoom();
                }
            }, 1000);
        } catch (e) {
            log_logger.error(e);
            return;
        }
    }

    /**结算 纯金币操作 */
    async onSettlement() {
        let zj_profit = 0;
        for (const pl of this.players) {
            if (pl && pl.bet) {
                await pl.addGold(this);
                zj_profit += pl.profit > 0 ? -pl.profit : Math.abs(pl.profit);
            }
        }
        if (this.zhuangInfo.uid) {
            let zj_pl = this.getPlayer(this.zhuangInfo.uid);
            zj_pl.bet = Math.abs(zj_profit);
            zj_pl.profit = zj_profit;
            this.zhuangInfo.money += zj_profit;
            await zj_pl.addGold(this);
        }
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


    /**
     * 个人调控开奖
     * @param controlPlayers 被个人调控开奖的玩家
     * @param state win 玩家赢 loss玩家输
     */
    personalControlLottery(controlPlayers: PersonalControlPlayer[], state: CommonControlState) {
        let areas: string[];

        controlPlayers.forEach(p => this.getPlayer(p.uid).setControlType(ControlKinds.PERSONAL));

        for (let i = 0; i < 100; i++) {
            // 随机开奖
            const { winArea } = this.randomLottery();
            areas = winArea;

            // 计算收益
            const win = this.statisticalControlPlayersProfit(controlPlayers);

            // 如果是玩家赢 收益大于0即可
            if (state === CommonControlState.WIN && win > 0) {
                break;
            }

            // 如果是玩家赢 收益小于0即可
            if (state === CommonControlState.LOSS && win < 0) {
                break;
            }
        }

        return { winArea: areas };
    }

    /**
     * 统计调控玩家盈利
     * @param controlPlayer
     */
    private statisticalControlPlayersProfit(controlPlayer: PersonalControlPlayer[]): number {
        let totalProfit = 0;

        controlPlayer.forEach(p => {
            const player = this.getPlayer(p.uid);
            totalProfit += player.profit;
        });

        return totalProfit;
    }

    /**
     * 随机开奖
     */
    randomLottery() {
        // 开始之前要保证当重复调用的问题
        for (const lottery of this.lotterys) {
            lottery.result = [lottery.result[0]];
        }

        return settle_zhuang(this, this.players);
    }

    /**
     * 场控发牌
     * @param sceneControlState SYSTEM_WIN 系统赢 PLAYER_WIN 玩家赢
     * @param isPlatformControl
     */
    sceneControlLottery(sceneControlState: ControlState, isPlatformControl) {
        // 如果不调控则随机开奖 且必杀区域为0 随机开开奖
        if (sceneControlState === ControlState.NONE && this.killAreas.size === 0) {
            return this.randomLottery();
        }

        const type = isPlatformControl ? ControlKinds.PLATFORM : ControlKinds.SCENE;
        this.players.forEach(p => p.setControlType(type));


        // 如果是真人玩家当庄则机器人的收益 系统或者机器人当庄统计真人玩家收益
        const statisticalType = this.bankerIsRealMan() ? RoleEnum.ROBOT : RoleEnum.REAL_PLAYER;
        let areas;

        for (let i = 0; i < 100; i++) {
            this.randomLottery();
            // 统计真人玩家的收益
            let { win, winArea } = controlLottery(this, this.players, statisticalType);
            areas = winArea;

            // 如果有必杀区域 则win要重新计算 必杀区域不参与
            if (this.killAreas.size) {
                // 如果包含了必杀区域则跳过
                if (winArea.find(area => this.killAreas.has(area))) {
                    continue;
                } else if (sceneControlState === ControlState.NONE) {
                    // 如果开奖结果不包含必杀区域且不调控状态 则直接开奖
                    break;
                }
            }

            // 如果庄是真人
            if (this.bankerIsRealMan()) {
                // 判断为系统赢 则机器人的收益大于零即可
                if (sceneControlState === ControlState.SYSTEM_WIN && win >= 0) {
                    break;
                }

                // 判断为系统输 则机器人的收益大于小于零即可
                if (sceneControlState === ControlState.PLAYER_WIN && win <= 0) {
                    break;
                }

            } else {
                // 如果庄不是真人
                // 判断为系统赢 则机器人的收益小于零即可
                if (sceneControlState === ControlState.SYSTEM_WIN && win <= 0) {
                    break;
                }

                // 判断为系统输 则机器人的收益大于大于零即可
                if (sceneControlState === ControlState.PLAYER_WIN && win >= 0) {
                    break;
                }
            }
        }

        return { winArea: areas };
    }

    /**
     * 庄调控开奖 该方法只有在真人玩家上庄的时候才会调用
     * @param bankerWin 庄家是否获胜
     */
    bankerControlLottery(bankerWin: boolean) {
        let areas;

        for (let i = 0; i < 100; i++) {
            this.randomLottery();

            // 统计机器人的收益
            const { win, winArea } = controlLottery(this, this.players, RoleEnum.ROBOT);
            areas = winArea;

            // 如果庄赢 只要机器人的总收益小于零即可
            if (bankerWin && win < 0) {
                break;
            }

            // 如果庄输 只要机器人的总收益大于零即可
            if (!bankerWin && win > 0) {
                break;
            }
        }

        return { winArea: areas };
    }


    /**
     * 标记必杀区域
     * @param killAreas 必杀区域
     */
    markKillArea(killAreas: string[]): void {
        killAreas.forEach(area => this.killAreas.add(area));
    }
}

