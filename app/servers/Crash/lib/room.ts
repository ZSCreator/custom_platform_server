import MultiPlayerRoom from "../../../common/classes/game/multiPlayerRoom";
import Player from "./player";
import { RoomState } from "./constants";
import BetState from "./states/betState";
import LotteryState from "./states/lotteryState";
import SettlementState from "./states/settlementState";
import {CrashRoomManager} from "./roomManager";
import RouteMessage from "./classes/routeMessage";
import {remove} from '../../../utils';
import {calculateOdds, genRandomResult, LotteryUtil} from "./util/lotteryUtil";
import { PersonalControlPlayer } from "../../../services/newControl";
import { CommonControlState } from "../../../domain/CommonControl/config/commonConst";
import { ControlKinds, ControlState } from "../../../services/newControl/constants";
import ColorPlateControl from "./control";
import { RoleEnum } from "../../../common/constant/player/RoleEnum";
import { buildRecordResult } from "./util/recordUtil";

/**
 * 显示玩家元素
 * @property uid
 * @property uid
 * @property headurl 头像
 * @property gold 金币
 * @property winRoundCount 赢得回合
 */
interface DisplayProperty {
    uid: string,
    nickname: string,
    headurl: string,
    gold: number,
    winRoundCount: number,
}

/**
 * Crash房间
 * @property MAX_HISTORY_LENGTH 最大记录开奖条数
 * @property banker 庄家
 * @property _players 玩家列表 存储player的引用 加快搜索
 * @property bankerQueue 庄家列表
 * @property roomManager 房间管理
 * @property result 开奖结果
 * @property winAreas 赢的区域
 * @property displayPlayers 界面显示的六个玩家
 * @property betAreas 下注区域
 * @property lotteryHistory 开奖记录
 * @property routeMsg 消息通知
 * @property startTime 回合开始时间
 * @property endTime 回合结算时间
 * @property zipResult 开奖压缩结果
 */
export class Room extends MultiPlayerRoom<Player>{
    private readonly MAX_HISTORY_LENGTH = 20;
    private banker: Player = null;
    private _players: Map<string, Player> = new Map();
    private bankerQueue: Player[] = [];
    private result: number = 0;
    private flyTime: number = 0;
    private winAreas: string[] = [];
    private displayPlayers: DisplayProperty[] = [];
    private lotteryHistory: number[];
    private timers: NodeJS.Timer[] = [];
    public control: ColorPlateControl = new ColorPlateControl({ room: this });
    public routeMsg: RouteMessage = new RouteMessage(this);
    public startTime: number;
    public endTime: number;
    public zipResult: string;
    public roomManager: CrashRoomManager;
    public lowBet: number;
    public capBet: number;
    ChipList: number[];
    constructor(props, roomManager: CrashRoomManager) {
        super(props);
        this.roomManager = roomManager;
        this.lotteryHistory = props.lotteryHistory || [];
        this.ChipList = props.ChipList;
        this.lowBet = props.lowBet;
        this.capBet = props.capBet;
    }

    /**
     * 首次运行房间
     */
    run(): void {
        this.lotteryHistory = genRandomResult();
        this.changeRoomState(RoomState.BET);
    }

    /**
     * 房间关闭
     */
    close(): void {
        this.stopTimer();
        this.roomManager = null;
        this._players.clear();
        this.control = null;
        this.routeMsg = null;
        this.timers.forEach(t => clearInterval(t));
        this.timers = [];
    }

    /**
     * 房间初始化
     */
    init(): void {
        this.players.forEach(p => p.init());
        this.timers.forEach(t => clearInterval(t));
        this.timers = [];

        // 初始化回合id
        this.updateRoundId();
    }

    /**
     * 移除长时间离线的玩家
     */
    async removeOfflinePlayers() {
        const offlinePlayers = await this.kickOfflinePlayerAndWarnTimeoutPlayer(this.players,
            5, 3);

        offlinePlayers.forEach(p => {
            // 移除玩家
            this.removePlayer(p);

            // 不在线则从租户列表中删除 如果在线则是踢到大厅则不进行删除
            if (!p.onLine) {
                // 删除玩家
                this.roomManager.removePlayer(p);
            } else {
                this.roomManager.playerAddToChannel(p);
            }

            // 移除玩家在房间房间器中的位置
            this.roomManager.removePlayerSeat(p.uid);
        });
    }

    /**
     * 改变房间状态
     * @param stateName
     */
    changeRoomState(stateName: RoomState) {
        // 不管有没有关闭上一次定时器
        clearTimeout(this.stateTimer);

        switch (stateName) {
            case RoomState.BET: this.processState = new BetState(this); break;
            case RoomState.LOTTERY: this.processState = new LotteryState(this); break;
            case RoomState.SETTLEMENT: this.processState = new SettlementState(this); break;
            default:
                throw new Error(`Crash 场: ${this.sceneId} ${this.roomId} 切换状态错误; 当前状态 ${this.processState.stateName} 切换的状态: ${stateName}`);
        }

        // this.processState = null;
        process.nextTick(this.process.bind(this));
    }

    /**
     * 设置庄
     * @param player
     */
    setBanker(player: Player) {
        this.banker = player;
    }

    /**
     * 获取庄
     */
    getBanker() {
        return this.banker;
    }

    /**
     * 获取真实玩家且已经押注的玩家
     */
    getRealPlayersAndBetPlayers() {
        return this.players.filter(p => p.isRealPlayerAndBet());
    }

    /**
     * 添加玩家
     * @param player
     */
    addPlayerInRoom(player: any) {
        // 如果已经存在房间 说明是断线回来
        if (this._players.get(player.uid)) {
            // 设置为在线即可
            this._players.get(player.uid).resetOnlineState();
        } else {
            const _player = new Player(player);
            this.players.push(_player);
            this._players.set(_player.uid, _player);

            // 通知玩家列表发生变化
            this.routeMsg.playersChange();
        }


        // 添加消息通道
        this.addMessage(player);
        return true;
    }

    /**
     * 移除玩家
     * @param player
     */
    removePlayer(player: any) {
        // 踢出消息通道
        this.kickOutMessage(player.uid);

        // 移除玩家
        remove(this.players, 'uid', player.uid);
        this._players.delete(player.uid);

        // 通知玩家列表发生变化
        this.routeMsg.playersChange();
    }

    /**
     * 玩家离线
     * @param player
     */
    playerOffline(player: any) {
        // 踢出消息通道
        this.kickOutMessage(player.uid);

        this._players.get(player.uid).setOffline();
    }

    isBetState() {
        return this.processState.stateName === RoomState.BET;
    }

    isLotteryState() {
        return this.processState.stateName === RoomState.LOTTERY;
    }

    /**
     * 踢出上庄队列
     * @param player
     */
    private beforeRemovePlayer(player: Player) {
        // 踢出消息通道
        this.kickOutMessage(player.uid);

        // 踢出上庄队列
    }

    /**
     * 获取房间玩家
     * @param uid
     */
    getPlayer(uid: string) {
        return this._players.get(uid);
    }


    /**
     * 获取玩家列表 数组
     */
    getPlayers(): Player[] {
        return this.players;
    }

    /**
     * 设置开奖结果
     * @param result
     */
    setResult(result: number) {
        this.result = result;
        this.zipResult = buildRecordResult(result);
        return this;
    }

    /**
     * 添加一条开奖结果
     * @param result
     */
    addOneLotteryResult(result: number) {
        if (this.lotteryHistory.length >= this.MAX_HISTORY_LENGTH) {
            this.lotteryHistory.shift();
        }

        this.lotteryHistory.push(result);
    }

    /**
     * 取钱
     * @param player
     */
    async takeMoney(player: Player):Promise<number> {
        // 根据已经飞行的时间计算倍数
        let flyTime = 0;
        if (this.processState.stateName === RoomState.LOTTERY) {
            flyTime = this.processState.getRemainingTime();
        }


        const odds = calculateOdds(flyTime);
        player.setNotAuto();
        player.addProfit(odds);
        await player.settlement(this);

        return odds;
    }

    /**
     * 开奖后更新房间
     */
    async updateAfterLottery() {
        // const { system_room, room_lock } = await getOneLockedRoomFromCluster(this.backendServerId, this.nid, this.roomId);
        // system_room['lotteryHistory'] = this.lotteryHistory;
        //
        // await updateOneRoomFromCluster(this.backendServerId, system_room, ['lotteryHistory'], room_lock);
    }

    /**
     * 获取开奖结果
     */
    getResult() {
        return this.result;
    }

    /**
     * 获取飞行时间
     */
    getFlyTime() {
        return this.flyTime;
    }

    /**
     * 是否是立刻爆炸
     */
    isExplodeImmediately() {
        return this.flyTime === 0
    }

    /**
     * 获取winAreas
     */
    getWinAreas() {
        return this.winAreas;
    }

    /**
     * 添加定时器
     * @param timer
     */
    addTimer(timer: NodeJS.Timer) {
        this.timers.push(timer);
    }

    /**
     * 获取开奖结果
     */
    setFlyTime(flyTime: number) {
        this.flyTime = flyTime;
        return this;
    }

    /**
     * 获取参与了游戏的结算结果
     */
    getGamePlayerSettlementResult() {
        return this.players.filter(p => p.getTotalBet() > 0).map(p => {
            return p.settlementResult();
        });
    }

    /**
     * 获取开奖记录
     */
    getLotteryHistory(limit: boolean = false) {
        if (limit && this.lotteryHistory.length > 20) {
            return this.lotteryHistory.slice(this.lotteryHistory.length - 20);
        }

        return this.lotteryHistory;
    }

    /**
     * 获取玩家显示的数据
     */
    getDisplayPlayers() {
        return this.players.slice(0, 6).map(p => {
            return {
                uid: p.uid,
                gold: p.gold,
                nickname: p.nickname,
                headurl: p.headurl,
            }
        });
    }

    /**
     * 玩家下注
     * @param player
     * @param num
     */
    playerBet(player: Player, num: number) {
        player.addBets(num);

        // 通知有玩家下注
        this.routeMsg.playerBet(player, num);
    }

    /**
     * 获取真实玩家的押注
     */
    getRealPlayersTotalBet() {
        return this.players.filter(p => p.isRobot === RoleEnum.REAL_PLAYER).reduce((totalBet, p) => totalBet += p.getTotalBet(), 0);
    }

    /**
     * 获取前端显示玩家
     */
    getFrontDisplayPlayers() {
        return this.players.map(p => p.frontDisplayProperty());
    }

    /**
     * 获取单个玩家的收益
     * @param controlPlayers
     * @param lotteryUtil 开奖方法
     */
    getControlPlayersTotalProfit(controlPlayers: PersonalControlPlayer[], lotteryUtil: LotteryUtil) {
        let totalProfit = 0;
        controlPlayers.forEach(p => {
            const player = this.getPlayer(p.uid);
            totalProfit += player.calculateProfit(lotteryUtil.getResult());
        });

        return totalProfit;
    }

    /**
     * 获取最大收益
     * @param result
     */
    getMaxProfit(result: number) {
        const realPlayers = this.getRealPlayersAndBetPlayers();
        return realPlayers.reduce((count, p) => p.calculateProfit(result) + count, 0);
    }

    /**
     * 玩家个人调控
     * @param lotteryUtil 开奖工具类
     * @param controlPlayers 调控玩家
     * @param state 调控状态 WIN 则是让玩家赢 LOSS 则是让玩家输
     */
    personalControl(lotteryUtil: LotteryUtil, controlPlayers: PersonalControlPlayer[], state: CommonControlState): LotteryUtil {
        controlPlayers.forEach(p => this.getPlayer(p.uid).setControlType(ControlKinds.PERSONAL));

        for (let i = 0; i < 100; i++) {
            // 开奖
            lotteryUtil.lottery();
            // 获取调控玩家的收益
            const totalProfit = this.getControlPlayersTotalProfit(controlPlayers, lotteryUtil);

            // 如果是玩家赢 纯利润大于0即可 玩家输 纯利润小于等于零即可
            if (state === CommonControlState.WIN && totalProfit > 0) {
                break
            } else if (state === CommonControlState.LOSS && totalProfit <= 0) {
                break;
            }
        }

        return lotteryUtil;
    }

    /**
     * 场控
     * @param lotteryUtil 开奖工具
     * @param sceneControlState 场控状态
     * @param isPlatformControl 是否调控
     */
    sceneControl(lotteryUtil: LotteryUtil, sceneControlState: ControlState, isPlatformControl) {
        // 不调控则随机开奖
        if (sceneControlState === ControlState.NONE) {
            return this.randomLottery(lotteryUtil);
        }

        const type = isPlatformControl ? ControlKinds.PLATFORM : ControlKinds.SCENE;
        this.players.forEach(p => p.setControlType(type));

        for (let i = 0; i < 100; i++) {
            // 开奖
            lotteryUtil.lottery();
            // 获取真实玩家的收益
            const totalProfit: number = this.getMaxProfit(lotteryUtil.getResult());

            // 如果是系统赢 真人玩家的纯利润小于等于0即可 玩家赢纯利润大于零即可
            if (sceneControlState === ControlState.SYSTEM_WIN && totalProfit < 0) {
                break
            } else if (sceneControlState === ControlState.PLAYER_WIN && totalProfit > 0) {
                break;
            }
        }

        return lotteryUtil;
    }

    /**
     * 随机开奖
     * @param lotteryUtil
     */
    randomLottery(lotteryUtil: LotteryUtil) {
        lotteryUtil.lottery();

        return lotteryUtil;
    }
}