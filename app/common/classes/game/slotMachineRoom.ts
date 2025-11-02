import { SystemRoom } from '../../pojo/entity/SystemRoom';
import GameManagerDao from "../../dao/daoManager/Game.manager";
import regulation = require('../../../domain/games/regulation');
import { pinus } from 'pinus';
import { PlayerInfo } from "../../pojo/entity/PlayerInfo";
import { genRoundId } from "../../../utils/utils";


/**
 * 电玩房间类
 * @property _players 玩家列表
 * @property runningPool 运行池 该池只属于单个房间 不属于公共调控池 后续考虑清除
 * @property profitPool 盈利池  该池只属于单个房间 不属于公共调控池 后续考虑清除
 * @property gameName 游戏名字
 */
export default abstract class BaseSlotMachineRoom<T extends PlayerInfo> extends SystemRoom<T>{
    _players: Map<string, T> = new Map();
    /** 奖池定时器 */
    jackpotTimer: NodeJS.Timer;

    abstract gameName: string;

    protected constructor(opts: any) {
        super(opts);
    }

    /****************************************  房间开奖逻辑部分 ************************************/
    /**
     * 房间
     * @param _player 玩家
     */
    abstract lottery(_player: T): Promise<any>;


    /**
     * 房间初始化
     */
    abstract init();

    /**
     * 添加玩家
     * @param player 玩家基础数据
     */
    abstract addPlayerInRoom(player: any);

    /**************************************  工具方法部分 ******************************************/


    /**
     * 保存房间奖池
     */
    async saveRoomPool() {

        // const { system_room, room_lock } = await getOneLockedRoomFromCluster(pinus.app.getServerId(), this.nid, this.roomId);

        // system_room.runningPool = this.runningPool;
        // system_room.profitPool = this.profitPool;

        // await updateOneRoomFromCluster(pinus.app.getServerId(), system_room, ['runningPool', 'profitPool'], room_lock);
    }

    /**
     * 运行奖池定时器
     */
    runJackpotTimer() {
        this.runningPool = Math.floor(100000000 + (Math.floor(Math.random() * 100000000)));
        this.jackpotTimer = setInterval(() => {
            this.runningPool += Math.floor(Math.floor(Math.random() * 1000));

            const randomNum = Math.random();

            if (randomNum < 0.0002) {
                this.runningPool -= Math.floor(Math.floor(Math.random() * 1000000));
            }
        }, 3 * 1000);
    }

    /**
     * 游戏是否开放
     */
    async isGameOpen() {
        const game = await GameManagerDao.findOne({ nid: this.nid });
        return game.opened;
    }

    /**
     * 添加调控池
     * @param num
     */
    addRunningPool(num: number) {
        this.runningPool += Math.floor(num * regulation.intoJackpot.runningPool);
        return this;
    }

    /**
     * 扣除运行奖池
     * @param num
     */
    deductRunningPool(num) {
        this.runningPool -= num;
        return this;
    }

    /**
     * 扣除奖池
     * @param num
     */
    deductJackpot(num) {
        this.jackpot -= num;
        return this;
    }

    /**
     * 添加盈利池
     * @param num
     */
    addProfitPool(num: number) {
        this.profitPool += num * regulation.intoJackpot.profitPool;
        return this;
    }
    /**
     * 获取玩家
     * @param uid
     */
    getPlayer(uid: string): T {
        return this._players.get(uid);
    }

    /**
     * 获取玩家列表
     */
    getPlayers(): T[] {
        return [...this._players.values()];
    }

    /**
     * 移除玩家
     * @param currPlayer 房间内的玩家
     */
    removePlayer(currPlayer: T) {
        this._players.delete(currPlayer.uid);

        if (!!this.channel) {
            this.kickOutMessage(currPlayer.uid);
        }
    }


    /**
     * 移除离线玩家
     * @param player
     */
    async removeOfflinePlayer(player: T) {
        // 如果没在线则踢出玩家
        if (!player.onLine) {
            this._players.delete(player.uid);
            await this.kickingPlayer(pinus.app.getServerId(), [player]);
        }
    }

    /**
     * 获取uid
     * @param uid
     */
    getRoundId(uid: string) {
        return genRoundId(this.nid, this.roomId, uid);
    }
}

