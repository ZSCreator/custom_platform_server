import MultiPlayerRoom from "../../../common/classes/game/multiPlayerRoom";
import Player from "./player";
import { RoomState } from "./constants";
import BetState from "./states/betState";
import LotteryState from "./states/lotteryState";
import SettlementState from "./states/settlementState";
import {AndarBaharRoomManager}  from "./roomManager";
import RouteMessage from "./classes/routeMessage";
import { random } from '../../../utils';
import { areas, betAreaOdds, BetAreasName } from "./config/betAreas";
import BetArea from "./classes/betArea";
import { LotteryUtil } from "./util/lotteryUtil";
import { PersonalControlPlayer } from "../../../services/newControl";
import { CommonControlState } from "../../../domain/CommonControl/config/commonConst";
import { ControlKinds, ControlState } from "../../../services/newControl/constants";
import ColorPlateControl from "./control";
import { RoleEnum } from "../../../common/constant/player/RoleEnum";
import { getPai } from "../../../utils/GameUtil";
import SecondBetState from "./states/secondBetState";
import SecondLotteryState from "./states/secondLotteryState";
import DealState from "./states/dealState";
import { buildRecordResult } from "./util/recordUtil";

/**
 * 猜AB房间
 * @property lowBet 房间最低押注
 * @property capBet 房间最高押注
 * @property capBet 玩家列表 存储player的引用 加快搜索
 * @property _players 玩家列表 存储player的引用 加快搜索
 * @property roomManager 房间管理
 * @property result 开奖结果
 * @property winArea 赢的区域
 * @property displayPlayers 界面显示的五个玩家
 * @property betAreas 下注区域
 * @property cards 一副牌
 * @property systemCard 系统牌
 * @property lotteryOver 开奖是否结束
 * @property routeMsg 消息通知
 * @property startTime 回合开始时间
 * @property endTime 回合结束时间
 * @property zipResult 压缩结果
 */
export class Room extends MultiPlayerRoom<Player>{
    readonly lowBet: number = 0;
    readonly capBet: number = 0;
    private _players: Map<string, Player> = new Map();
    private roomManager: AndarBaharRoomManager;
    private result: { [key in BetAreasName]: number[] } = null;
    private winArea: string = null;
    private betAreas: { [key in BetAreasName]: BetArea } = initBetAreas();
    private cards: number[] = [];
    private systemCard: number = null;
    private lotteryOver: boolean = true;
    public control: ColorPlateControl = new ColorPlateControl({ room: this });
    public routeMsg: RouteMessage = new RouteMessage(this);
    public startTime: number;
    public endTime: number;
    public zipResult: string = '';

    constructor(props, roomManager: AndarBaharRoomManager) {
        super(props);
        this.roomManager = roomManager;
        this.players = new Array(5).fill(null);
        this.lowBet = props.lowBet;
        this.capBet = props.capBet;
    }

    /**
     * 首次运行房间
     */
    run(): void {
        this.changeRoomState(RoomState.DEAL);
    }

    /**
     * 房间关闭
     */
    close(): void {
        this.stopTimer();
        this.roomManager = null;
        this._players.clear();
    }

    /**
     * 房间初始化
     */
    init(): void {
        // 初始化玩家
        this.players.forEach(p => !!p && p.init());

        // 初始化牌
        this.cards = getPai(1);

        this.lotteryOver = true;

        // 开奖结果初始化遗漏
        this.result = null;

        // 初始化押注区域
        for (let [, betArea] of Object.entries(this.betAreas)) {
            betArea.init();
        }

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
            }

            // 移除玩家在房间房间器中的位置
            this.roomManager.removePlayerSeat(p.uid);
        });
    }

    /**
     * 改变房间状态
     * @param stateName
     */
    async changeRoomState(stateName: RoomState) {
        // 不管有没有关闭上一次定时器
        clearTimeout(this.stateTimer);

        switch (stateName) {
            case RoomState.DEAL: this.processState = new DealState(this); break;
            case RoomState.BET: this.processState = new BetState(this); break;
            case RoomState.LOTTERY: this.processState = new LotteryState(this); break;
            case RoomState.SECOND_BET: this.processState = new SecondBetState(this); break;
            case RoomState.SECOND_LOTTERY: this.processState = new SecondLotteryState(this); break;
            case RoomState.SETTLEMENT: this.processState = new SettlementState(this); break;
            default:
                throw new Error(`猜AB 场: ${this.sceneId} ${this.roomId} 切换状态错误; 当前状态 ${this.processState.stateName} 切换的状态: ${stateName}`);
        }

        // this.processState = null;

        process.nextTick(this.process.bind(this));
    }

    /**
     * 获取真实玩家且已经押注的玩家
     */
    getRealPlayersAndBetPlayers() {
        return this.players.filter(p => !!p && p.isRealPlayerAndBet());
    }

    /**
     * 获取押注数据
     */
    getBetAreas() {
        return this.betAreas;
    }

    /**
     * 包含有真人玩家
     */
    containRealPlayer(): boolean {
        return this.players.filter(p => !!p && p.isRobot === RoleEnum.REAL_PLAYER).length > 0;
    }

    /**
     * 是否是下注状态
     */
    isBetState() {
        return this.processState.stateName === RoomState.BET ||
            this.processState.stateName === RoomState.SECOND_BET;
    }

    /**
     * 检查房间状态和玩家押注时间
     * @param player
     */
    checkBettingState(player: Player): boolean {
        // 如果是第一次押注状态 玩家只能进行一次押注
        if (this.processState.stateName === RoomState.BET && player.isBet()) {
            return true;
        }


        // 如果是再次下注状态 且 第一次押注是未押注 则不让他押注或者第一次有押注但点击跳过后也不让他押注 或者在押注的
        if (this.isSecondBetState()) {
            // 如果第一次押注
            if (player.isBet()) {
                // 如果玩家点击了跳过 则不让他押注
                if (player.isSkip() || player.isSecondBet()) {
                    return true;
                }
            } else {
                // 第一次没有押注 则不能押注
                return true;
            }
        }

        return false;
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
            const indexList: number[] = [];
            this.players.forEach((p, index) => !p && indexList.push(index));

            if (indexList.length === 0) {
                return false;
            }

            // 数组中随机一个位置
            const index = indexList[random(0, indexList.length - 1)];

            const _player = new Player(player);

            this.players[index] = _player;
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
        const index = this.players.findIndex(p => p && p.uid == player.uid);
        this.players[index] = null;
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
    setResult(result: { [key in BetAreasName]: number[] }) {
        this.result = result;
        return this;
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
    getWinArea() {
        return this.winArea;
    }

    /**
     * 获取开奖结果
     */
    setWinAreas(winArea: string) {
        this.winArea = winArea;
        this.zipResult = buildRecordResult(this.systemCard, this.result, this.winArea);
        return this;
    }

    /**
     * 获取参与了游戏的结算结果
     */
    getGamePlayerSettlementResult() {
        return this.players.filter(p => !!p && p.getTotalBet() > 0).map(p => {
            return p.settlementResult();
        });
    }

    /**
     * 检查押注区域
     * @param player 玩家
     * @param bets 押注区域
     */
    checkBetAreas(player: Player, bets: { [key in BetAreasName]: number }) {
        // 不是一个对象返回错误
        if (typeof bets !== 'object') {
            return false;
        }

        const betAreas = Object.keys(bets);

        for (const key of betAreas) {
            // 如果没有该押注区域，押注同样无效
            if (!areas.includes(key as BetAreasName)) {
                return false;
            }

            // 如果押注金币小于等于0 不合法 或者 该押注不为最低押注不合法 如果押注额超限 不合法
            if (typeof bets[key] !== 'number' ||
                bets[key] <= 0 ||
                bets[key] % this.lowBet !== 0 ||
                this.betAreas[key].getPlayerBet(player.uid) + bets[key] > this.capBet) {
                return false;
            }
        }

        return true;
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
     * 设置系统牌
     */
    setSystemCard() {
        this.systemCard = this.cards.shift();
    }

    /**
     * 获取系统牌
     */
    getSystemCard() {
        return this.systemCard;
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
     * 玩家跳过第二轮下注
     * @param player
     */
    skip(player: Player) {
        player.setSkip();

        // 通知玩家下注
        this.routeMsg.playerSkip(player);
    }

    /**
     * 修改房间押注状态
     */
    changeBettingState() {
        // 如果是第一次押注状态 当玩家都押注了提前切换为开奖状态
        if (this.processState.stateName === RoomState.BET &&
            this.players.filter(p => !!p).every(p => p.isBet())) {
            this.changeRoomState(RoomState.LOTTERY);
        }

        // 如果是第二次押注状态 当所有押注玩家都跳过了或者押注了则立即再次开奖
        if (this.processState.stateName === RoomState.SECOND_BET &&
            this.players.filter(p => !!p && p.isBet() && !p.isSkip()).every(p => p.isSecondBet())) {
            this.changeRoomState(RoomState.SECOND_LOTTERY);
        }
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

        // 如果房间是再次开奖状态 表此此玩家已下注
        if (this.processState.stateName === RoomState.SECOND_BET) {
            player.setSecondBet();
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
     * 获取当前牌局使用的牌
     */
    getCards() {
        return this.cards;
    }

    /**
     * 获取真实玩家的押注
     */
    getRealPlayersTotalBet() {
        return this.players.filter(p => !!p && p.isRobot === RoleEnum.REAL_PLAYER).reduce((totalBet, p) => totalBet += p.getTotalBet(), 0);
    }

    /**
     * 获取前端显示玩家
     */
    getFrontDisplayPlayers() {
        return this.players.map(p => !!p ? p.frontDisplayProperty() : null);
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
     * 设置是否开奖结束
     * @param over
     */
    setLotteryOver(over: boolean) {
        this.lotteryOver = over;
    }

    /**
     * 开奖是否结束
     */
    isLotteryOver() {
        return this.lotteryOver;
    }

    /**
     * 是再次下注的状态
     */
    isSecondBetState() {
        return this.processState.stateName === RoomState.SECOND_BET;
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
        this.players.forEach(p => !!p && p.setControlType(type));

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
 * 初始化下注详情
 */
function initBetAreas(): { [key in BetAreasName]: BetArea } {
    return {
        [BetAreasName.ANDAR]: new BetArea(betAreaOdds[BetAreasName.ANDAR]),
        [BetAreasName.BAHAR]: new BetArea(betAreaOdds[BetAreasName.BAHAR]),
    }
}