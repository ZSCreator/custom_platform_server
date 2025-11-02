import {IMultiPlayerRoomState} from "../../../../common/interface/game/IMultiPlayerRoomState";
import {Room} from "../room";
import {RoomState} from "../constants";

/**
 * 押注状态
 */
export default class BetState implements IMultiPlayerRoomState {
    readonly countdown = 10 * 1000;
    readonly stateName = RoomState.BET;
    startTime = 0;
    room: Room;

    constructor(room: Room) {
        this.room = room;
    }

    async init() {
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
        await this.init();

        // console.warn('开始下注状态');

        // 通知开始
        this.room.routeMsg.startBetState();
    }

    async after(): Promise<void> {
        // 切换开奖状态
        await this.room.changeRoomState(RoomState.LOTTERY);
    }
}