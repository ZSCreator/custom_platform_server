import {IMultiPlayerRoomState} from "../../../../common/interface/game/IMultiPlayerRoomState";
import {Room} from "../room";
import {RoomState} from "../constants";

/**
 * 押注状态
 */
export default class BetState implements IMultiPlayerRoomState {
    readonly countdown = 15 * 1000;
    readonly stateName = RoomState.BET;
    startTime = 0;
    room: Room;

    constructor(room: Room) {
        this.room = room;
    }

    async init() {
        this.startTime = Date.now();

        // 房间初始化
        this.room.init();

        this.room.startTime = this.startTime;

        // 移除长时间不在线的玩家
        await this.room.removeOfflinePlayers();
    };

    /**
     * 获取剩余时间
     */
    getRemainingTime() {
        return this.startTime + this.countdown - Date.now();
    }

    async before(): Promise<void> {
        await this.init();


        // 通知下注
        this.room.routeMsg.startBetState();
    }

    async after(): Promise<void> {
        // 切换开奖状态
        await this.room.changeRoomState(RoomState.LOTTERY);
    }
}