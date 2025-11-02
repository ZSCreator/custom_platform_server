import Player from './Player';
import utils = require('../../../utils/index');
import { Control } from './control';
import GameManagerDao from "../../../common/dao/daoManager/Game.manager";
import BaseSlotMachineRoom from "../../../common/classes/game/slotMachineRoom";
import {sendBigWinNotice} from "../../../services/MessageService";

/**
 * 水果机单机版
 * @property control 调控逻辑
 * @property betLimit 限压检测
 * @property roomCapacity 房间玩家容量
 */
export default class RoomStandAlone extends BaseSlotMachineRoom<Player>{
    gameName = '水果机'
    _players: Map<string, Player> = new Map();
    control: Control;
    betLimit: number;
    roomCapacity: number;

    constructor(opts: any) {
        super(opts);
        this.control = Control.geInstance(this.sceneId);

        this.betLimit = opts.betLimit || 0;

        this.roomCapacity = opts.roomCapacity;
    }

    /**************************************  工具方法部分 ******************************************/

    init() {
    }

    /**
     * 游戏是否开放
     */
    async isGameOpen() {
        const game = await GameManagerDao.findOne({ nid: this.nid });
        return game.opened;
    }

    getPlayer(uid: string) {
        return this._players.get(uid);
    }

    /**
     * 时间是否满员
     */
    isFull(): boolean {
        return this._players.size >= this.roomCapacity;
    }

    /**
     * 添加玩家
     * @param player 玩家基础数据
     */
    addPlayerInRoom(player: any) {
        this._players.set(player.uid, new Player(player));
        return true;
    }

    /**
     * 移除玩家
     * @param currPlayer
     */
    removePlayer(currPlayer: any) {
        this._players.delete(currPlayer.uid);
    }

    /**
     * 以数组方式放回房间
     */
    getPlayers() {
        return [...this._players.values()];
    }


    /**
     * 押注检测
     * @param player 玩家
     * @param bets 是否押注超限
     */
    checkLimit(player: Player, bets: { [area: string]: number }) {
        return player.totalBet + utils.sum(bets) > this.betLimit;
    }

    /****************************************  房间开奖逻辑部分 ************************************/
    async lottery(player: Player) {
        return this.control.result(player);
    }

    /**
     * 结算
     * @param player 结算玩家
     * @param totalProfit 总收益
     * @param bigOdds 最大赢取
     * @param lotteryResult 开奖结果
     * @param details 开奖具体位置详情
     */
    async settlement(
        player: Player,
        totalProfit: number,
        bigOdds: number,
        lotteryResult: any,
        details: any,
    ) {

        player.setRoundId(this.getRoundId(player.uid));
        await player.addGold(totalProfit, bigOdds, lotteryResult, details, this);

        //播放跑马灯
        if (totalProfit / player.totalBet > 20 && totalProfit >= 100000) {
            sendBigWinNotice(this.nid, player.nickname, totalProfit, player.isRobot, player.headurl);
        }

        player.init();
    }
}

