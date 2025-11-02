import {IMultiPlayerRoomState} from "../../../../common/interface/game/IMultiPlayerRoomState";
import {Room} from "../room";
import {RoomState} from "../constants";

/**
 * 发牌状态
 */
export default class DealState implements IMultiPlayerRoomState {
    readonly countdown = 4 * 1000;
    readonly stateName = RoomState.DEAL;
    startTime = 0;
    room: Room;

    constructor(room: Room) {
        this.room = room;
    }

    init() {
        this.startTime = Date.now();
    };

    /**
     * 获取剩余时间
     */
    getRemainingTime() {
        return this.startTime + this.countdown - Date.now();
    }

    async before(): Promise<void> {
        // 状态初始化
        this.init();

        this.room.startTime = this.startTime;

        // 房间初始化
        this.room.init();

        // 移除长时间不在线的玩家
        await this.room.removeOfflinePlayers();

        // 开始给系统发牌
        this.room.setSystemCard();

        // console.warn('开始发牌状态', this.room.getSystemCard());

        // 通知开始
        this.room.routeMsg.startDealState();
    }

    async after(): Promise<void> {
        // 切换开奖状态
        await this.room.changeRoomState(RoomState.BET);
    }
}