import {IMultiPlayerRoomState} from "../../../../common/interface/game/IMultiPlayerRoomState";
import {Room} from "../room";
import {RoomState} from "../constants";

/**
 * 押注状态
 */
export default class SecondBetState implements IMultiPlayerRoomState {
    readonly countdown = 10 * 1000;
    readonly stateName = RoomState.SECOND_BET;
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


        // console.warn('开始第二次下注');
        // 通知再次开始下注
        this.room.routeMsg.startSecondBetState();
    }

    async after(): Promise<void> {
        // 切换再次开奖状态状态
        await this.room.changeRoomState(RoomState.SECOND_LOTTERY);
    }
}