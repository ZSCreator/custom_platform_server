'use strict'
import { getLogger } from 'pinus-logger';
import benzPlayer from './benzPlayer';
import { SystemRoom } from '../../../common/pojo/entity/SystemRoom';
import { PersonalControlPlayer } from "../../../services/newControl";
import ControlImpl from "./control";
import { buildRecordResult } from "./util/recordUtil";
import { BetAreas } from "./benzConst";
import { CommonControlState } from "../../../domain/CommonControl/config/commonConst";
import { ControlKinds, ControlState } from "../../../services/newControl/constants";
import { RoleEnum } from "../../../common/constant/player/RoleEnum";
import MessageService = require('../../../services/MessageService');
import benzConst = require('./benzConst');
import utils = require('../../../utils/index');
import benzlogic = require('./benzlogic');
import roomManager, { benzRoomManger } from '../lib/benzRoomMgr';
const log_logger = getLogger('server_out', __filename);


/**发牌中 */
const LOTTERY_COUNTDOWN = 5;
/**结算倒计时 */
const SETTLE_COUNTDOWN = 15;

/**
 * @property startTime 回合开始时间
 * @property endTime 回合结束时间
 * @property zipResult 压缩结果
 */
export default class benzRoom extends SystemRoom<benzPlayer> {
    /**最低下注要求 */
    lowBet: number;
    // capBet: number;
    /**room回合总押注 */
    totalBet: number = 0;
    ChipList: number[];
    /**押注情况 */
    situations: { area: string, betList: { uid: string, bet: number, updatetime: number }[], totalBet: 0 }[] = [];
    /**开奖结果 */
    lotterys: benzConst.BetAreas = null;
    /**发牌中 下注中 开奖中 */
    status: 'NONE' | 'Licensing' | 'BETTING' | 'OPENAWARD' = "NONE";
    startTime: number;
    endTime: number;
    zipResult: string = '';

    timerInterval: NodeJS.Timer = null;

    players: benzPlayer[] = [];
    /**各种倒计时 */
    countdown: number = 0;
    /**下标 */
    motorcade_ran = 0;
    record_historys: any[];
    control: ControlImpl;
    killAreas: Set<BetAreas> = new Set();

    constructor(opts: any) {
        super(opts);
        this.lowBet = opts.lowBet;
        // this.capBet = opts.capBet;
        this.record_historys = opts.record_historys || [];
        this.ChipList = opts.ChipList;
        this.control = new ControlImpl({ room: this });
        this.ramodHistory();
        this.lotterys = null;
    }

    /**初始化房间 */
    async Initialization() {
        this.totalBet = 0;
        this.players.forEach(pl => pl && pl.playerInit());
        await this.br_kickNoOnline();
        this.situations = [];
        this.lotterys = null;
        // 初始化回合id
        this.updateRoundId();

        // 必杀区域清零
        this.killAreas.clear();
        return true;
    }
    close() {
        clearInterval(this.timerInterval);
        this.sendRoomCloseMessage();
        this.players = [];
    }
    ramodHistory() {
        let numberOfTimes = 20;
        do {
            this.lotterys = benzlogic.getRanomByWeight().area;
            let opts = {
                nid: this.nid,
                sceneId: this.sceneId,
                roomId: this.roomId,
                lotterys: this.lotterys,
            }
            this.record_historys.push(opts);
            if (this.record_historys.length > 20) this.record_historys.shift();
            numberOfTimes--;
        } while (numberOfTimes > 0);
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
            this.players.push(new benzPlayer(dbplayer));
            return true;
        } catch (error) {
            log_logger.log("addPlayer=", dbplayer);
            return false;
        }

    }

    /**玩家离开 或者 掉线
     * droORclo true 掉线
     */
    leave(playerInfo: benzPlayer, droORclo = false) {
        if (!playerInfo) {
            log_logger.error(`ttz房间中未找到玩家${playerInfo.uid}`);
            return;
        }
        this.kickOutMessage(playerInfo.uid);
        // 如果玩家是强行离开或者掉线
        if (droORclo == true) {
            playerInfo.onLine = false;
            return;
        }
        utils.remove(this.players, 'uid', playerInfo.uid);
        this.playersChange();
    }
    /**推送玩家改变信息 */
    playersChange() {
        const opts = {
            playerNum: this.players.length,
            rankingList: this.rankingLists().slice(0, 6),
        }
        this.channelIsPlayer('BenzBmw.playersChange', opts);
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

    /**运行房间 */
    async runRoom() {
        try {
            await this.Initialization();// 初始化房间
            this.countdown = LOTTERY_COUNTDOWN;
            this.startTime = Date.now();
            // 给前端推送房间开始消息

            for (const pl of this.players) {
                const member = this.channel.getMember(pl.uid);
                const opts: benzConst.IBenz_Start = {
                    countdown: this.countdown,
                    roundId: this.roundId,
                    isRenew: pl.isCanRenew(),
                    gold: pl.gold
                }
                member && MessageService.pushMessageByUids('Benz.Start', opts, member);
            }
            this.playersChange();
            this.status = `Licensing`;

            clearInterval(this.timerInterval);
            this.timerInterval = setInterval(() => {
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
        this.channelIsPlayer("Benz.BETTING", { countdown: this.countdown });
        let opts = {
            nid: this.nid,
            roomId: this.roomId,
            sceneId: this.sceneId,
            status: this.status,
            downTime: this.countdown
        };
        roomManager.pushRoomStateMessage(this.roomId, opts,);

        this.timerInterval = setInterval(() => {
            this.countdown -= 1;
            if (this.countdown <= -1) {
                clearInterval(this.timerInterval);
                this.openAward();
            }
        }, 1000);
    }

    async openAward() {
        try {
            this.status = "OPENAWARD";
            this.endTime = Date.now();
            // 获取调控结果
            await this.control.runControl();
            // 构造压缩结果
            this.zipResult = buildRecordResult(this);
            await this.onSettlement();
            /**如果有庄家，把庄家加到推送列表 */
            let list = this.players.filter(pl => pl.bet > 0);
            let opts = {
                lotterys: this.lotterys,
                motorcade_ran: this.motorcade_ran,
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
            this.channelIsPlayer("Benz.Lottery", opts);
            {
                // const { system_room, room_lock } = await RoomManager.getOneLockedRoomFromCluster(pinus.app.getServerId(), this.nid, this.roomId);
                let opts = {
                    nid: this.nid,
                    sceneId: this.sceneId,
                    roomId: this.roomId,
                    lotterys: this.lotterys,
                }
                this.record_historys.push(opts);
                if (this.record_historys.length > 20) this.record_historys.shift();
                // system_room['record_historys'] = this.record_historys;
                // await RoomManager.updateOneRoomFromCluster(pinus.app.getServerId(), system_room, ['record_historys'], room_lock);

                roomManager.pushRoomStateMessage(this.roomId, {
                    nid: this.nid,
                    sceneId: this.sceneId,
                    roomId: this.roomId,
                    status: this.status,
                    historyData: this.record_historys
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
        // let zj_profit = 0;
        for (const pl of this.players) {
            if (pl && pl.bet) {
                await pl.addGold(this);
                // zj_profit += pl.profit > 0 ? -pl.profit : Math.abs(pl.profit);
            }
        }
    }
    /**踢掉离线玩家 */
    async br_kickNoOnline() {
        const players = this.players;
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
        // const ran = utils.random(0, benzConst.points.length - 1);
        // this.lotterys = benzConst.points[ran].area;
        this.lotterys = benzlogic.getRanomByWeight().area;
        const ran = benzConst.points.findIndex(c => c.area == this.lotterys);
        const name = benzConst.points[ran].area;
        let ran_num = utils.random(1, 10);
        let index = 0;

        // 不能开出必杀区域
        if (this.killAreas.has(benzConst.points[ran].area)) {
            return this.randomLottery();
        }

        do {
            const c = benzConst.motorcade[index];
            if (c == name) {
                ran_num--;
            }
            if (ran_num == 0) {
                this.motorcade_ran = index;
                break;
            }
            index++;
            if (index >= benzConst.motorcade.length)
                index = 0;
        } while (true);
        return benzlogic.settle_zhuang(this, this.players);
    }

    /**
     * 押注必杀区域
     * @param areas
     */
    setKillAreas(areas: Set<BetAreas>) {
        this.killAreas = areas;
    }

    /**
     * 个控
     * @param state 调控状态 调控状态 WIN 玩家赢 LOSS 玩家输
     * @param controlPlayers 被调控的玩家
     */
    personalControl(state: CommonControlState, controlPlayers: PersonalControlPlayer[]) {
        controlPlayers.forEach(p => this.getPlayer(p.uid).setControlType(ControlKinds.PERSONAL));

        for (let i = 0; i < 100; i++) {
            // 随机开奖
            this.randomLottery();
            const profit = this.statisticalPlayersProfit(controlPlayers);

            // 如果让玩家一输
            if (state === CommonControlState.LOSS && profit < 0) {
                break;
            }

            if (state === CommonControlState.WIN && profit >= 0) {
                break;
            }
        }
    }

    /**
     * 场控
     * @param state 场控状态
     * @param isPlatformControl 是否是平台调控
     */
    sceneControl(state: ControlState, isPlatformControl: boolean) {
        if (state === ControlState.NONE) {
            return this.randomLottery();
        }

        const type = isPlatformControl ? ControlKinds.PLATFORM : ControlKinds.SCENE;
        this.players.forEach(p => p.setControlType(type));
        for (let i = 0; i < 100; i++) {
            // 随机开奖
            this.randomLottery();
            const profit = this.statisticalRealPlayersProfit();

            // 如果让玩家一输
            if (state === ControlState.SYSTEM_WIN && profit < 0) {
                break;
            }

            if (state === ControlState.PLAYER_WIN && profit >= 0) {
                break;
            }
        }
    }

    /**
     * 统计玩家利润
     * @param players
     */
    statisticalPlayersProfit(players: PersonalControlPlayer[]) {
        return players.reduce((total, p) => {
            const player = this.getPlayer(p.uid);
            total += player.profit;
            return total;
        }, 0);
    }

    /**
     * 统计真实玩家利润
     */
    statisticalRealPlayersProfit() {
        return this.players.filter(p => p.isRobot === RoleEnum.REAL_PLAYER).reduce((total, p) => {
            total += p.profit;
            return total;
        }, 0);
    }
}

