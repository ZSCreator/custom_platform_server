import up7Player from './up7Player';
import { SystemRoom } from '../../../common/pojo/entity/SystemRoom';
import { getLogger } from 'pinus-logger';
import { settle } from "./util/lotteryUtil";
import { RoleEnum } from "../../../common/constant/player/RoleEnum";
import { PersonalControlPlayer } from "../../../services/newControl";
import { CommonControlState } from "../../../domain/CommonControl/config/commonConst";
import { ControlKinds, ControlState } from "../../../services/newControl/constants";
import up7Control from "./control";
import { BetAreas } from "./up7Const";
import { buildRecordResult } from "./util/recordUtil";
import util = require('../../../utils/index');
import up7Const = require('./up7Const');
import lotteryUtil = require('./util/lotteryUtil');
import MessageService = require('../../../services/MessageService');
import JsonConfig = require('../../../pojo/JsonConfig');
import utils = require('../../../utils/index');
import { createHash } from 'crypto';
import roomManager, { upRoomManger } from '../lib/up7RoomMgr';
import { genRoundId } from "../../../utils/utils";
const up7Logger = getLogger('server_out', __filename);


// const RANK_TYPE = 1; // 座位排序类型（其他:下注排序，1：vip排序）
/**
 * 7up7down房间
 * @property killAreas 必杀区域
 * @property control 调控
 * @property realPlayerTotalBet 真人玩家押注
 * @property startTime 回合开始时间
 * @property endTime 回合结束时间
 * @property zipResult 压缩结果
 */
export default class up7Room extends SystemRoom<up7Player> {
    entryCond: number;
    lowBet: number;
    /**限红 */
    tallBet: number;

    gameinning = false;

    allBetAreas: string[];
    /**房间状态 NONE默认关闭状态 BETTING下注阶段  */
    status: 'NONE' | 'BETTING' | 'OPENAWARD' = 'NONE';
    situations: { area: string, betList: { uid: string, bet: number }[], totalBet: 0 }[] = [
        { area: "AA", betList: [], totalBet: 0 },
        { area: "BB", betList: [], totalBet: 0 },
        { area: "CC", betList: [], totalBet: 0 },
    ];

    /**下注时间 */
    countDown: number = 0;
    up7Historys: {
        md5: string,
        lotteryResult: number[],
        winAreas: string[],
        userWin: {
            uid: string,
            nickname: string,
            headurl: string,
            profit: number,
            bets: {
                [area: string]: {
                    bet: number,
                    profit: number
                };
            }
        }[]
    }[] = [];

    runInterval: NodeJS.Timer = null;
    /**开奖结果 */
    result: number[];
    /**中奖区域 */
    winAreas: BetAreas;
    processingTimer: NodeJS.Timer;
    players: up7Player[] = [];

    startTime: number;
    endTime: number;
    zipResult: string = '';

    killAreas: Set<string> = new Set();
    control: up7Control;

    realPlayerTotalBet: number = 0;
    ChipList: number[];

    constructor(opts: any) {
        super(opts)
        this.ChipList = opts.ChipList;
        this.channel = opts.channel;
        this.entryCond = opts.entryCond;
        this.lowBet = opts.lowBet;
        this.tallBet = opts.tallBet;
        this.up7Historys = opts.up7Historys || [];//开奖历史记录
        this.maxCount = JsonConfig.get_games(this.nid).roomUserLimit;//房间运行最多坐多少人
        this.control = new up7Control({ room: this });
        this.ramodHistory();
    }
    /**初始化房间数据 */
    async initRoom() {
        this.situations = [
            { area: "AA", betList: [], totalBet: 0 },
            { area: "BB", betList: [], totalBet: 0 },
            { area: "CC", betList: [], totalBet: 0 },
        ];
        this.players.map(async m => m.up7Init());//初始化玩家数据
        // 初始化回合id
        this.updateRoundId();
        this.startTime = Date.now();
        this.zipResult = '';
        this.killAreas.clear();
        this.realPlayerTotalBet = 0;

        // 更新真实玩家数量
        this.updateRealPlayersNumber();
    }
    close() {
        clearInterval(this.runInterval);
    }
    ramodHistory() {
        let numberOfTimes = 20;
        do {
            this.up7Historys.push({
                md5: genRoundId(this.nid, this.roomId),
                lotteryResult: [utils.random(1, 6), utils.random(1, 6)],
                winAreas: [],
                userWin: [],
            });
            numberOfTimes--;
        } while (numberOfTimes > 0);
        this.result = this.up7Historys[this.up7Historys.length - 1].lotteryResult;
    }

    /**新的一局 */
    async gameStart() {
        clearInterval(this.runInterval);
        this.runInterval = setInterval(() => this.update(), 1000);
    }

    async update() {
        if (this.gameinning) return;
        --this.countDown;
        if (this.countDown > 0) {
            return;
        }
        do {
            if (this.status == "NONE") { this.status = "BETTING"; break; };
            if (this.status == "BETTING") { this.status = "OPENAWARD"; break; };
            if (this.status == "OPENAWARD") { this.status = "BETTING"; break; };
        } while (true);
        // this.lastCountdownTime = Date.now();
        switch (this.status) {
            case "BETTING":
                this.gameinning = true;
                await this.startBet();
                this.gameinning = false;
                break;
            case "OPENAWARD":
                this.gameinning = true;
                await this.openAward();
                this.gameinning = false;
                break;
            default:
                break;
        }
    }

    /**开始下注-中 */
    async startBet() {
        await this.initRoom();
        await this.br_kickNoOnline();
        this.status = 'BETTING';
        this.countDown = up7Const.BETTING;
        for (const pl of this.players) {
            const member = this.channel.getMember(pl.uid);
            const opts = { countDown: this.countDown, roundId: this.roundId, isRenew: pl.isCanRenew() };
            member && MessageService.pushMessageByUids('7up7down.start', opts, member);
        }
        roomManager.pushRoomStateMessage(this.roomId, { sceneId: this.sceneId, roomId: this.roomId, roomStatus: this.status, countDown: this.countDown });
    }

    //开奖中
    async openAward() {
        try {
            this.status = 'OPENAWARD';
            // const result = await this.control.result();
            const result = await this.control.result();
            let { winAreas } = lotteryUtil.settle(result, this);

            this.zipResult = buildRecordResult(result);

            //记录开奖历史

            this.recordHistory(result, winAreas);


            this.result = result;
            this.winAreas = winAreas;
            //在线玩家更新金币 
            for (const pl of this.players) {
                pl.bet > 0 && await pl.updateGold(this);
            }

            this.countDown = up7Const.KAIJIANG;
            //通知前端开奖
            this.channelIsPlayer('7up7down.result', this.resultStrip());
            roomManager.pushRoomStateMessage(this.roomId, {
                sceneId: this.sceneId,
                roomId: this.roomId,
                countDown: this.countDown,//开奖三秒
                roomStatus: this.status,
                up7Historys: this.getRecird().slice(-20)
            });

        } catch (error) {
            console.error('7up7down.Room.openAward==>', error);
        }
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

        this.players.push(new up7Player(dbplayer));
        // 添加到消息通道
        this.addMessage(dbplayer);

        // 更新真实玩家数量
        this.updateRealPlayersNumber();
        this.playersChange();
        return true;
    }

    /**玩家离开 */
    leave(playerInfo: up7Player, isOffLine: boolean) {
        this.kickOutMessage(playerInfo.uid);
        if (isOffLine) {//玩家掉线
            playerInfo.onLine = false;
            return;
        }
        util.remove(this.players, 'uid', playerInfo.uid);
        // 更新真实玩家数量
        this.updateRealPlayersNumber();
        this.playersChange();
        roomManager.removePlayerSeat(playerInfo.uid);
    }
    playersChange() {
        this.channelIsPlayer('7up7down.userChange', {
            playerNum: this.players.length,
            rankingList: this.rankingLists().slice(0, 6)
        });
    }
    /**获取玩家 */
    getPlayer(uid: string) {
        return this.players.find(m => m && m.uid === uid);
    }

    /**包装开奖数据 */
    resultStrip() {
        let opts: up7Const.I7up7down_result = {
            sceneId: this.sceneId,
            roomId: this.roomId,
            roomStatus: this.status,
            result: this.result,
            winAreas: this.winAreas,
            userWin: this.players.filter(pl => pl.bet > 0).map(pl => {
                return {
                    uid: pl.uid,
                    nickname: pl.nickname,
                    headurl: pl.headurl,
                    gold: pl.gold,
                    profit: pl.profit,
                    bets: pl.bets
                }
            }),
            countDown: this.countDown//开奖三秒
        }
        return opts;
    }

    /**获取预结算结果 */
    getBeforehandResult(result: number[]) {
        let results = lotteryUtil.settle(result, this);
        let allLossValue = this.allLoss(true);
        return allLossValue;
    }

    /**
     * 构建玩家的押注详情<报表使用>
     * @param uid
     */
    buildPlayerGameRecord(uid: string): any {
        if (!uid) {
            return {};
        }
        // let winInfo: any = this.up7Historys[this.up7Historys.length - 1];
        // if (!!winInfo) {
        //     winInfo = winInfo.userWin;
        // }
        // if (!!winInfo) {
        //     winInfo = winInfo[uid];
        // }

        let result = {
            uid,
            area: this.getPlayer(uid).bets,
            settlement_info: this.buildSettlementInfo()
        };
        return result
    }

    /**
     * 构建结算开奖数据<报表使用>
     * @param uid
     */
    buildSettlementInfo(): any {

        try {
            let settlement_info = JSON.parse(JSON.stringify(this.up7Historys[this.up7Historys.length - 1]));
            delete settlement_info.userWin;
            return settlement_info
        } catch (e) {
            console.error("7up7down 构建报表结算数据出错：" + (e.stack | e))
        }
    }

    /**计算本局总亏损isRobot 为true不计算机器人收益 */
    allLoss(isRobot: boolean) {
        let allLossNum = 0;
        for (let pl of this.players) {
            // const player = this.getPlayer(key);
            if (isRobot) {
                pl.isRobot !== 2 && (allLossNum += pl.profit > 0 ? pl.profit + pl.bet : 0);
            } else {
                allLossNum += pl.profit > 0 ? pl.profit + pl.bet : 0;
            }
        }
        return allLossNum;
    }

    /**房间玩家列表 */
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

    /**查找某个玩家在某个回合的下注情况 */
    userBetAreas(player: up7Player) {
        const userBetAreas: { id: string, selfBet: number, allBet: number }[] = [];
        this.allBetAreas.forEach(k => {
            userBetAreas.push({
                id: k,
                selfBet: !this.situations[k] ? 0 :
                    (this.situations[k].betList.find(m => m.uid === player.uid) ?
                        this.situations[k].betList.find(m => m.uid === player.uid).bet : 0),
                allBet: !this.situations[k] ? 0 : this.situations[k].totalBet
            })
        });
        return userBetAreas;
    }


    /**记录开奖结果 */
    async recordHistory(result: number[], winAreas) {
        if (this.up7Historys.length >= 20) {
            this.up7Historys.splice(0, 1);
        }
        //记录开奖结果
        this.up7Historys.push({
            md5: this.roundId,
            lotteryResult: result,
            winAreas,
            userWin: this.players.filter(pl => pl.bet > 0).map(pl => {
                return {
                    uid: pl.uid,
                    nickname: pl.nickname,
                    headurl: pl.headurl,
                    profit: pl.profit,
                    bets: pl.bets,
                }
            }),
        });
    }

    /**获取历史记录 */
    getRecird() {
        return this.up7Historys.map(c => {
            return {
                md5: c.lotteryResult,
                lotteryResult: c.lotteryResult
            }
        })
    }

    /**包装房间数据 */
    roomStrip() {
        return {
            points: up7Const.points,
        }
    }

    /**踢掉离线玩家 */
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

    /**
     *
     * @param condition 筛选条件 默认为4 0 获取真实玩家的押注 2 获取机器人玩家的押注
     */
    getAllBet(condition: RoleEnum | 4): number {
        if (condition === 4) {
            // return this.allBetNum;
        }

        let num: number = 0;
        this.players.forEach(p => {
            if (p.isRobot === condition) {
                num += p.bet;
            }
        });

        return num;
    }

    /**
     * 获取玩家总押注
     * @param players
     */
    getPlayersTotalBet(players: { uid: string }[]) {
        return players.reduce((totalBet, p) => totalBet + this.players.find(player => player.uid === p.uid).bet, 0);
    }

    /**
     * 获取玩家总利润
     * @param players
     */
    getPlayersTotalProfit(players: { uid: string }[]) {
        return players.reduce((totalBet, p) => totalBet + this.players.find(player => player.uid === p.uid).profit, 0);
    }

    /**
     * 获取个控结果
     * @param players 调控玩家
     * @param state 调控状态 WIN 玩家应 LOSS 玩家输
     */
    personalControlResult(players: PersonalControlPlayer[], state: CommonControlState) {
        if (state === CommonControlState.RANDOM) {
            return this.randomLotteryResult();
        }

        players.forEach(p => this.getPlayer(p.uid).setControlType(ControlKinds.PERSONAL));

        let result;
        for (let i = 0; i < 100; i++) {
            result = this.randomLotteryResult();

            // 预结算
            settle(result, this);

            // 调控玩家总利润
            const totalProfit = this.getPlayersTotalProfit(players);

            // 玩家总收益大于0即可
            if (state === CommonControlState.WIN && totalProfit >= 0) {
                break;
            }

            // 玩家总收益小于0即可
            if (state === CommonControlState.LOSS && totalProfit < 0) {
                break;
            }
        }

        return result;
    }

    /**
     * 获取场控结果
     * @param state 场控状态
     * @param killAreas 必杀区域
     * @param isPlatformControl 是否是平台调控
     */
    sceneControlResult(state: ControlState, killAreas: string[], isPlatformControl) {
        const type = isPlatformControl ? ControlKinds.PLATFORM : ControlKinds.SCENE;

        let result;
        for (let i = 0; i < 100; i++) {
            result = this.randomLotteryResult();

            // 预结算
            const { winAreas } = settle(result, this);

            // 如果包含必杀区域则跳过
            if (killAreas.includes(winAreas)) {
                continue;
            }

            // 如果真人玩家押注为零或者不调控状态 随机发牌
            if (state === ControlState.NONE) {
                break;
            }

            // 统计真人玩家总利润
            const totalProfit = this.getPlayersTotalProfit(this.players.filter(p => p.isRobot === RoleEnum.REAL_PLAYER));

            // 系统赢 玩家收益小于0
            if (state === ControlState.SYSTEM_WIN && totalProfit < 0) {
                this.players.forEach(p => p.bet > 0 && p.setControlType(type));
                break;
            }

            // 系统输 玩家收益大于等于0
            if (state === ControlState.PLAYER_WIN && totalProfit >= 0) {
                this.players.forEach(p => p.bet > 0 && p.setControlType(type));
                break;
            }
        }

        return result;
    }

    /**
     * 添加必杀区域
     * @param area 必杀的区域
     */
    public addKillArea(area: string): void {
        this.killAreas.add(area);
    }


    /**
     * 随机开奖结果
     */
    randomLotteryResult() {
        return [util.random(1, 6), util.random(1, 6)];
    }
}
