import MultiPlayerRoom from "../../../common/classes/game/multiPlayerRoom";
import Player from "./player";
import { RoomState } from "./constants";
import BetState from "./states/betState";
import LotteryState from "./states/lotteryState";
import SettlementState from "./states/settlementState";
import {FanTanRoomManager} from "./roomManager";
import RouteMessage from "./classes/routeMessage";
import { random, remove } from '../../../utils';
import { areas, betAreaOdds, BetAreasName } from "./config/betAreas";
import BetArea from "./classes/betArea";
import {genRandomResult, LotteryUtil} from "./util/lotteryUtil";
import { PersonalControlPlayer } from "../../../services/newControl";
import { CommonControlState } from "../../../domain/CommonControl/config/commonConst";
import { ControlKinds, ControlState } from "../../../services/newControl/constants";
import FanTanControl from "./control";
import { RoleEnum } from "../../../common/constant/player/RoleEnum";
import ReadyState from "./states/readyState";

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
 * 番摊房间
 * @property MAX_HISTORY_LENGTH 最大记录开奖条数
 * @property _players 玩家列表 存储player的引用 加快搜索
 * @property roomManager 房间管理
 * @property result 开奖结果
 * @property winAreas 赢的区域
 * @property displayPlayers 界面显示的六个玩家
 * @property betAreas 下注区域
 * @property lotteryHistory 开奖记录
 * @property doubleAreas 翻倍区域
 * @property routeMsg 消息通知
 */
export class Room extends MultiPlayerRoom<Player>{
    private readonly MAX_HISTORY_LENGTH = 20;
    private _players: Map<string, Player> = new Map();
    private result: number = -1;
    private winAreas: string[] = [];
    private displayPlayers: DisplayProperty[] = [];
    private betAreas: { [key in BetAreasName]: BetArea } = initBetAreas();
    private lotteryHistory: number[];
    private doubleAreas: BetAreasName[] = [];
    public roomManager: FanTanRoomManager;
    public control: FanTanControl = new FanTanControl({ room: this });
    public routeMsg: RouteMessage = new RouteMessage(this);
    ChipList: number[];
    constructor(props, roomManager: FanTanRoomManager) {
        super(props);
        this.roomManager = roomManager;
        this.lotteryHistory = props.lotteryHistory || [];
        this.ChipList = props.ChipList;
    }

    /**
     * 首次运行房间
     */
    run(): void {
        this.lotteryHistory = genRandomResult();
        this.changeRoomState(RoomState.READY);
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
    }

    /**
     * 房间初始化
     */
    init(): void {
        this.players.forEach(p => p.init());
        this.doubleAreas = [];

        // 初始化押注区域
        for (let [, betArea] of Object.entries(this.betAreas)) {
            betArea.init();
        }

        // 初始化回合id
        this.updateRoundId();
    }

    /**
     * 获取翻倍区域
     */
    getDoubleAreas() {
        return this.doubleAreas;
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
            case RoomState.READY: this.processState = new ReadyState(this); break;
            default:
                throw new Error(`番摊 场: ${this.sceneId} ${this.roomId} 切换状态错误; 当前状态 ${this.processState.stateName} 切换的状态: ${stateName}`);
        }

        // this.processState = null;

        process.nextTick(this.process.bind(this));
    }

    /**
     * 获取真实玩家且已经押注的玩家
     */
    getRealPlayersAndBetPlayers() {
        return this.players.filter(p => p.isRealPlayerAndBet());
    }

    /**
     * 获取押注数据
     */
    getBetAreas() {
        return this.betAreas;
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

            // 更新玩家列表
            this.updateDisplayPlayers();

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

        // 更新玩家列表
        this.updateDisplayPlayers();

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

    /**
     * 更新显示玩家
     */
    updateDisplayPlayers() {
        if (this.players.length === 0) return;

        const players = this.players;
        // 找出赌神
        players.sort((a, b) => b.getWinRoundCount() - a.getWinRoundCount());
        const winner = players.shift();

        // 金币排序
        players.sort((a, b) => b.gold - a.gold);

        // 把赌神放在前面
        players.unshift(winner);

        // 取前6个显示
        this.displayPlayers = players.slice(0, 6).map(p => p.displayProperty());

        this.players = players;
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
     * 退出上庄列表
     * @param player
     */
    quitBankerQueue(player: Player) {

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
     * 获取winAreas
     */
    getWinAreas() {
        return this.winAreas;
    }

    /**
     * 获取开奖结果
     */
    setWinAreas(winAreas: string[]) {
        this.winAreas = winAreas;
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
     * 随机区域翻倍
     */
    randomAreasDouble() {
        let num;

        const number = Math.random()
        if (number < 0.94) {
            num = 1;
        } else if (number < 0.98) {
            num = 2;
        } else {
            num = 3;
        }

        for (let i = 0; i < num; i++) {
            const index = random(0, areas.length - 1);
            const areaName = areas[index];

            this.doubleAreas.push(areaName);

            // 设置赔率翻倍
            this.betAreas[areaName].setDoubled();
        }
    }

    /**
     * 获取开奖记录
     */
    getLotteryHistory() {
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
     * 检查押注区域是否超限
     * @param bets
     */
    checkBets(bets: { [areaName in BetAreasName]: number }): boolean {
        for (let [areaName, num] of Object.entries(bets)) {
            if (this.betAreas[areaName].isOverrun(num)) {
                return true;
            }
        }

        return false;
    }

    /**
     * 玩家下注
     * @param player
     * @param bets
     */
    playerBet(player: Player, bets: { [areaName in BetAreasName]: number }) {
        for (let [areaName, num] of Object.entries(bets)) {
            // 记录区域
            this.betAreas[areaName].addPlayerBet(player.uid, num);
            player.addBets(areaName as BetAreasName, num);
        }

        // 通知有玩家下注
        this.routeMsg.playerBet(player, bets);
    }

    /**
     * 获取一个简易押注区域结果
     */
    getSimpleBetAreas() {
        const simpleAreas = {};

        for (let [areaName, area] of Object.entries(this.betAreas)) {
            simpleAreas[areaName] = area.getTotalBet();
        }

        return simpleAreas;
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
     */
    getControlPlayersTotalProfit(controlPlayers: PersonalControlPlayer[]) {
        let totalProfit = 0;
        for (let [, area] of Object.entries(this.betAreas)) {
            controlPlayers.forEach(p => totalProfit += area.getPlayerProfit(p.uid));
        }

        return totalProfit;
    }

    /**
     * 获取真实玩家总收益 必杀区域不计算收益
     * @param killAreas 必杀区域
     */
    getRealPlayersTotalProfit(killAreas: BetAreasName[]): number {
        let totalProfit = 0;
        const realPlayers = this.getRealPlayersAndBetPlayers();

        for (let [areaName, area] of Object.entries(this.betAreas)) {
            if (killAreas.includes(areaName as BetAreasName)) continue;
            realPlayers.forEach(p => totalProfit += area.getPlayerProfit(p.uid));
        }

        return totalProfit;
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
            const totalProfit = this.getControlPlayersTotalProfit(controlPlayers);

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
     * @param isPlatformControl 是否是平台调控
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
            const totalProfit: number = this.getRealPlayersTotalProfit(lotteryUtil.getKillAreas());

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


/**
 * 初始化下注区域
 */
function initBetAreas(): { [key in BetAreasName]: BetArea } {
    let betAreas: any = {};

    areas.forEach(area => betAreas[area] = new BetArea(betAreaOdds[area]));

    return betAreas;
}