import Player from './Player';
import {SystemRoom} from '../../../common/pojo/entity/SystemRoom';
import {getLogger} from 'pinus-logger';
import ControlImpl from "./ControlImpl";
import {CommonControlState} from "../../../domain/CommonControl/config/commonConst";
import {pinus} from 'pinus';
import {ControlKinds, ControlState} from "../../../services/newControl/constants";
import {PersonalControlPlayer} from "../../../services/newControl";
import {RoleEnum} from "../../../common/constant/player/RoleEnum";
import * as JsonMgr from "../../../../config/data/JsonMgr";
import RoomManagerDao from '../../../common/dao/daoManager/Room.manager';
import {conversionCards} from "../../../utils/GameUtil";
import * as utils from '../../../utils/index';
import * as GameUtil from '../../../utils/GameUtil';
import roomManager from './CHJRoomManagerImpl';
import {sendBigWinNotice} from "../../../services/MessageService";

const logger = getLogger('server_out', __filename);
// 中bonus奖概率
const BONUS_RATE = 0.1;

/**
 * @property internalConfig 房间内部配置
 * @property playerJackpotProfit 玩家的奖池收益
 * @property bonusTriggerProbability 中bonus奖概率 如果是调控状态概率为0
 * @property roundAddJackpotAmount 回合累加奖池金额
 * @property roundCount 回合累积
 * @property startTime 回合开始时间
 * @property endTime 回合结束时间
 * @property zipResult 压缩结果
 */
export default class Room extends SystemRoom<Player> {
    /**状态 BETTING.下注阶段 INBIPAI.比牌结算阶段 INSETTLE.结算中 */
    status: 'NONE' | 'BETTING' | 'INBIPAI' | 'INSETTLE' | 'JIESUAN' = 'NONE';
    area: {
        0: { arr: any[]; multiple: number; allBet: number; }; //黑桃区域
        1: { arr: any[]; multiple: number; allBet: number; }; //红桃区域
        2: { arr: any[]; multiple: number; allBet: number; }; //梅花区域
        3: { arr: any[]; multiple: number; allBet: number; }; //方块区域
        4: { arr: any[]; multiple: number; allBet: number; }; //王区域
    };

    areaNum: { //区域开奖次数
        0: number; //黑桃区域
        1: number; //红桃区域
        2: number; //梅花区域
        3: number; //方块区域
        4: number; //王区域
    };
    historys: any[];
    allBet: number;
    countdown: number;
    jiesuanCountDown: number;
    maxHistoryNum: number;
    maxBetNum: number;
    inbetTimer: NodeJS.Timer;
    nextTimer: NodeJS.Timer;
    players: Player[] = [];
    killAreas: Set<string>;
    internalConfig: any = JsonMgr.get('caohuaji/caohuajiVariable').datas;
    controlLogic: ControlImpl;
    playerJackpotProfit: number = 0;
    bonusTriggerProbability: number = BONUS_RATE;
    roundAddJackpotAmount: number = 0;
    roundCount: number;

    startTime: number;
    endTime: number;
    zipResult: string = '';

    constructor(opts: any) {
        super(opts)
        this.channel = opts.channel;
        // this.channelBet = opts.channelBet;
        // this.sceneId = opts.sceneId || 0;
        this.players = [];
        // this.status = 'NONE';//状态 BETTING.下注阶段 INBIPAI.比牌结算阶段 INSETTLE.结算中
        this.area = {
            0: { arr: [], multiple: 3.8, allBet: 0 },//黑桃区域
            1: { arr: [], multiple: 3.8, allBet: 0 },//红桃区域
            2: { arr: [], multiple: 3.8, allBet: 0 },//梅花区域
            3: { arr: [], multiple: 3.8, allBet: 0 },//方块区域
            4: { arr: [], multiple: 20, allBet: 0 }//王区域
        };
        this.areaNum = {//区域开奖次数
            0: 0,//黑桃区域
            1: 0,//红桃区域
            2: 0,//梅花区域
            3: 0,//方块区域
            4: 0//王区域
        };
        this.historys = opts.historys || [];
        this.allBet = 0;
        this.countdown = 20;//押注倒计时
        this.jiesuanCountDown = 5;//结算倒计时
        this.maxHistoryNum = 50;//最大历史记录数
        this.maxBetNum = 100000;
        this.killAreas = new Set();
        this.controlLogic = new ControlImpl({ room: this });
        this.roundCount = opts.roundCount || 0;
    }

    Initialization() {
        this.roundAddJackpotAmount = 0;
        this.bonusTriggerProbability = BONUS_RATE;
        this.playerJackpotProfit = 0;
        this.countdown = 20;//押注倒计时
        this.jiesuanCountDown = 5;//结算倒计时
        this.area = {
            0: { arr: [], multiple: 3.8, allBet: 0 },//黑桃区域
            1: { arr: [], multiple: 3.8, allBet: 0 },//红桃区域
            2: { arr: [], multiple: 3.8, allBet: 0 },//梅花区域
            3: { arr: [], multiple: 3.8, allBet: 0 },//方块区域
            4: { arr: [], multiple: 20, allBet: 0 }//王区域
        };
        this.allBet = 0;
        this.killAreas.clear();
        //初始化玩家数据
        this.players.forEach(pl => {
            pl.init();
        });

        this.roundCount++;
        this.startTime = Date.now();
        this.updateRoundId();
        this.updateRealPlayersNumber();
    }

    addPlayerInRoom(dbplayer) {
        let currPlayer = this.getPlayer(dbplayer.uid);
        if (currPlayer) {
            currPlayer.sid = dbplayer.sid;
            this.offLineRecover(currPlayer);
            return true;
        }
        let caohuajiPlayer = new Player(dbplayer);
        this.players.push(caohuajiPlayer);

        this.updateRealPlayersNumber();

        // 添加到消息通道
        this.addMessage(dbplayer);
        return true;
    }

    removePlayer(uid: string, offLine: boolean) {
        //踢出消息通道
        this.kickOutMessage(uid);
        const playerCaohuaji = this.getPlayer(uid);
        if (offLine) {
            console.log('草花机掉线', uid);
            playerCaohuaji.onLine = false;
            return;
        }
        // this.players.remove('uid', uid);
        utils.remove(this.players, 'uid', uid);

        this.updateRealPlayersNumber();
        this.channelIsPlayer( 'onExit', { players: this.players.length });
    }

    // 获取玩家
    getPlayer(uid) {
        return this.players.find(m => m && m.uid === uid);
    }

    /**
     * 运行房间
     */
    async run() {
        this.Initialization();//初始化房间信息
        await this.br_kickNoOnline();
        this.status = 'BETTING';
        this.inbetTimer = setInterval(() => {
            this.countdown--;
            if (this.countdown == 0) {//倒计时完成
                clearInterval(this.inbetTimer);
                this.openAward();
            }
        }, 1000);
    }

    close() {
        clearInterval(this.inbetTimer);
        clearInterval(this.nextTimer);
        this.sendRoomCloseMessage();
        this.players = [];
    }

    async startBetting() {
        clearInterval(this.nextTimer);
        await this.run();
        //通知前端游戏开始
        this.channelIsPlayer('onStart', {
            countdown: 20,
            roundId: this.roundId,
            areaNum: this.areaNum,
            historys: this.historys,
            playerRankingList: this.rankingLists(),
            area: this.area,
            allCount: this.roundCount
        });
    }
    //开奖
    async openAward() {
        this.status = 'JIESUAN';
        this.endTime = Date.now();

        // 获取调控牌型
        let poker: any;
        try {
            poker = await this.controlLogic.runControl();
        } catch (e) {
            console.error('草花机运行调控出错', e.stack || e);
            poker = this.getPoker();
        }

        try {
            //记录开奖结果日志
            this.players.length && logger.info(`结果|${this.nid}|${this.roomId}|${poker}`);
        } catch (error) {
            console.error('草花机开奖结果日志记录出错', error);
        }

        this.zipResult = conversionCards(poker);

        //结算玩家金币
        await this.settlement(poker);

        //计算出分率
        let { allBet, allGain } = this.profit(poker);
        // room.winTotal = allGain;
        // room.consumeTotal = allBet;

        // 只通知真实玩家
        let maxGainPlayers = this.players.filter(m => m.isRobot === RoleEnum.REAL_PLAYER && m.profit > 0).sort((a, b) => {
            return b.profit - a.profit
        });
        //通知前端开奖结果
        this.channelIsPlayer('onResult', {
            poker: poker,
            players: maxGainPlayers.map(m => m.strip1())
        });

        // 扣除奖池
        this.deductionJackpot(this.playerJackpotProfit);
        // 累加下注时的奖池
        this.jackpot += this.roundAddJackpotAmount;

        //五秒后开始下一回合
        this.nextTimer = setInterval(() => {
            this.jiesuanCountDown--;
            if (!this.jiesuanCountDown) {
                this.startBetting();
            }
        }, 1000);
    }

    getPoker() {
        return utils.random(0, 53);
    }

    //根据开奖结果结算
    async settlement(poker) {
        let index = GameUtil.getPokerFlowerColor(poker);
        console.log('草花机开奖区域', index, poker);
        this.areaNum[index] += 1;
        if (this.historys.length >= this.maxHistoryNum) {
            this.historys.shift();
        }
        this.historys.push(poker);
        let multiple = this.area[index].multiple;

        for (let i in this.area) {
            if(i === index.toString()) {
                this.area[i].arr.forEach(m => {
                    let player = this.players.find(n => n.uid == m.uid);
                    if (!player) {
                        return;
                    }
                    let gain = 0, bonusProfit = 0;
                    if (index == 4) {//王区域
                        bonusProfit = this.getBonusProfit();
                        player.isWang = true;
                    } else {
                        player.isWang = false;
                        (player.isRobot !== 2) && (this.runningPool -= gain);
                    }
                    gain = m.bet * multiple + bonusProfit;
                    player.profit += gain;

                    player.betDetails[i] = {bet: m.bet, win: gain};
                });
            } else {
                this.area[i].arr.forEach(m => {
                    let player = this.players.find(n => n.uid == m.uid);
                    if (!player) {
                        return;
                    }
                    player.betDetails[i] = {bet: m.bet, win: -m.bet};
                });
            }
        }

        //在线更新金币
        for (const pl of this.players) {
            if (pl.bet > 0) {
                await pl.updateGold(this, index.toString());

                //播放跑马灯
                if (pl.profit >= 100000) {
                    sendBigWinNotice(this.nid, pl.nickname, pl.profit, pl.isRobot, pl.headurl);
                }
            }
        }

        return Promise.resolve();

    }

    /**
     * 计算收益
     * @param room
     * @param oneCard
     * @param state
     */
    calculateGain(room, oneCard, state: CommonControlState = CommonControlState.RANDOM) {
        const index = GameUtil.getPokerFlowerColor(oneCard);

        // 每次计算收益前先初始化玩家奖池收益
        this.playerJackpotProfit = 0;

        let gain = 0;
        this.area[index].arr.forEach(p => {
            let player = this.players.find(player => player.uid === p.uid);

            if (!player || player.isRobot === 2 || player.controlState !== state) {
                return;
            }

            const multiple = this.area[index].multiple;
            gain += p.bet * multiple;
        });

        return gain;
    }

    /**
     * 构建玩家的押注详情
     * @param player
     */
    buildPlayerGameRecord(player): any {
        if (!player) {
            return {};
        }
        let lastPoker = this.historys[this.historys.length - 1];
        let index = GameUtil.getPokerFlowerColor(lastPoker);
        let result = {
            uid: player.uid,
            area: {},
            settlement_info: { poker: lastPoker, type: index }
        };
        let userArea = result.area;
        try {
            for (let key in this.area) {
                let userBet = this.area[key].arr.find(m => m.uid == player.uid);
                if (!!userBet) {
                    let gain = -userBet.bet;
                    if (index + '' == key) {
                        gain = player.gain;
                    }
                    userArea[key] = { bet: userBet.bet, gain };
                }
            }
            return result
        } catch (e) {
            console.error('五星宏辉构建报表玩家下注数据出错 uid:' + player.uid + ' e : ' + (e.stack | e));
            return {};
        }
    }

    //重置开奖记录
    initHistorys() {
        this.areaNum = {//区域开奖次数
            0: 0,
            1: 0,
            2: 0,
            3: 0,
            4: 0
        };
        this.historys = [];
    }

    /**获取房间列表 会返回胜率 以及上局收益 只取50条 */
    rankingLists() {
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
                    totalBet: utils.sum(pl.totalBet),
                    totalProfit: utils.sum(pl.totalProfit),
                }
            }
        });
        stripPlayers.sort((pl1, pl2) => {
            return pl2.winRound - pl1.winRound;
        });
        let copy_player = stripPlayers.shift();
        stripPlayers.sort((pl1, pl2) => {
            return utils.sum(pl2.gold) - utils.sum(pl1.gold)
        });
        stripPlayers.unshift(copy_player);
        return stripPlayers;
    }


    //计算玩家总盈利和总押注
    profit(poker) {
        let allGain = 0, allBet = 0;
        let index = GameUtil.getPokerFlowerColor(poker);
        let multiple = this.area[index].multiple;
        this.area[index].arr.forEach(m => {
            const player = this.getPlayer(m.uid);
            player.isRobot !== 2 && (allGain += m.bet * multiple);
        });
        for (let x in this.area) {
            this.area[x].arr.forEach(m => {
                const player = this.getPlayer(m.uid);
                player.isRobot !== 2 && (allBet += m.bet);
            });
        }
        return { allBet, allGain };
    }

    //转换历史记录
    toHistory() {
        let num = 0;
        for (let key in this.areaNum) {
            num += this.areaNum[key];
        }
        let ob = {
            0: 0,
            1: 0,
            2: 0,
            3: 0,
            4: 0
        }
        for (let x in ob) {
            if (x == '2') {
                ob[x] = this.areaNum[3];
            }
            if (x == '3') {
                ob[x] = this.areaNum[2];
            }
            ob[x] = this.areaNum[x];
            let temp1: number = ob[x];
            let temp2 = temp1 / num;
            let temp: any = temp2.toFixed(3);
            temp = temp * 100;
            ob[x] = temp;
        }
        return ob;
    }

    /**
     * 获取奖池收益
     */
    getBonusProfit() {
        // 如果奖池不够赔付 则不进行派发
        if (this.jackpot - this.playerJackpotProfit <= 0) {
            return 0;
        }

        let profit = 0;
        // 查看玩家是否满足获取奖池的概率
        if (Math.random() < this.bonusTriggerProbability) {
            // 取奖池的1%给玩家
            profit = Math.floor(this.jackpot * 0.01);
            this.playerJackpotProfit += profit;
        }

        return profit;
    }

    /**踢掉离线玩家 */
    async br_kickNoOnline() {
        const offlinePlayers = await this.kickOfflinePlayerAndWarnTimeoutPlayer(this.players,
            5, 3);

        offlinePlayers.forEach(p => {
            // 移除玩家
            this.removePlayer(p.uid, false);

            // 不在线则从租户列表中删除 如果在线则是踢到大厅则不进行删除
            if (!p.onLine) {
                // 删除玩家
                roomManager.removePlayer(p);
            }

            // 移除玩家在房间房间器中的位置
            roomManager.removePlayerSeat(p.uid);
        });
    }


    /**
     * 获取调控结果
     * @param sceneControlState
     * @param isPlatformControl
     */
    async sceneControl(sceneControlState: ControlState, isPlatformControl): Promise<number> {
        const room = await RoomManagerDao.findOne({ serverId: pinus.app.getServerId(), roomId: this.roomId });
        // 如果所有人都是机器人则不调控
        if (this.players.every(player => player.isRobot === RoleEnum.ROBOT) || sceneControlState === ControlState.NONE) {
            return this.getRandomResult();
        }

        // 如果进行场控或者个控 不派发bonus奖
        this.bonusTriggerProbability = 0;

        const type = isPlatformControl ? ControlKinds.PLATFORM : ControlKinds.SCENE;
        this.players.forEach(p => p.setControlType(type));

        return this.getWinORLossResult(room, sceneControlState === ControlState.SYSTEM_WIN);
    }

    getRandomResult() {
        // return () => {
        return utils.random(0, 53);
        // }
    }

    getWinORLossResult(room, isSystemWin) {
        // return () => {
        // const randomResultFunc = this.getRandomResult();
        const playerBet = this.getPlayerBetNum(0);
        let oneCard;


        for (let i = 0; i < 100; i++) {
            oneCard = this.getRandomResult();
            const gain = this.calculateGain(room, oneCard);


            if (isSystemWin && gain <= playerBet) {
                return oneCard;
            }

            if (!isSystemWin && gain > playerBet) {
                return oneCard;
            }
        }

        return oneCard;
        // }
    }

    /**
     * 获取玩家押注数值
     * @param isRobot
     */
    getPlayerBetNum(isRobot: number = 4): number {
        let num: number = 0;
        isRobot === 4 ? this.players.forEach(player => num += player.bet) :
            this.players.filter(player => player.isRobot === isRobot).forEach(player => num += player.bet);
        return num;
    }

    /**
     * 获取调控玩家的押注
     * @param params
     */
    getControlPlayerBet(params: { state: CommonControlState }): number {
        let allBet: number = 0;

        this.players.forEach(p => {
            if (p.controlState === params.state) {
                allBet += p.bet;
            }
        });

        return allBet;
    }

    /**
     * 标记必杀区域
     * @param params
     */
    markKillArea(params: { area: string }): void {
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
     * 必杀发牌
     */
    killDealCard() {
        // const randomResultFunc = this.getRandomResult();

        let oneCard;
        for (let i = 0; i < 100; i++) {
            oneCard = this.getRandomResult();
            const index = GameUtil.getPokerFlowerColor(oneCard);
            // 个控发牌只要不是必杀区域都行
            if (!this.killAreas.has(index.toString())) {
                break;
            }
        }

        return oneCard;
    }

    /**
     * 个控发牌
     */
    async personalDealCards(params: { state: CommonControlState }) {
        // const randomResultFunc = this.getRandomResult();
        const playerBet = this.getControlPlayerBet(params);
        const room = await RoomManagerDao.findOne({ serverId: pinus.app.getServerId(), roomId: this.roomId });
        let oneCard;
        for (let i = 0; i < 100; i++) {
            oneCard = this.getRandomResult();
            const gain = this.calculateGain(room, oneCard, params.state);

            if ((params.state === CommonControlState.LOSS && gain <= playerBet) ||
                (params.state === CommonControlState.WIN && gain > playerBet)) {
                break;
            }
        }

        return oneCard;
    }

    /**
     * 添加奖池
     * @param player 房间玩家
     * @param index 下注区域
     * @param bet 下注金额
     */
    addJackpot(player: Player, index: string | number, bet: number) {

        if (player.isRobot === RoleEnum.REAL_PLAYER) {
            // 如果押注区域为王 抽取20% 的押注金额投入奖池
            if (index === '4' || index === 4) {
                this.roundAddJackpotAmount += Math.floor(bet * 0.2);
                // this.jackpot += Math.floor(bet * 0.2);
            }

            // 流入其他池的配置
            this.profitPool += bet * this.internalConfig[4].value;
            this.runningPool += bet * this.internalConfig[5].value;
        }
    }

    /**
     * 扣除奖池
     * @param amount 扣除金币
     */
    deductionJackpot(amount: number) {
        if (amount > 0) {
            this.jackpot -= amount;
        }
    }


}