import {IMultiPlayerRoomState} from "./IMultiPlayerRoomState";

export interface IMultiPlayerRoom {
    /** 房间主留的定时器 */
    stateTimer: NodeJS.Timer;

    /** 同一时间只有一个主状态在执行 */
    processState: IMultiPlayerRoomState;

    /** 第一次运行房间调用 */
    run(): void;

    /** 关闭房间调用 */
    close(): void;

    /** 初始化房间调用 */
    init(): void;

    /** 房间逻辑 */
    process(): void;

    /** 改变房间状态 */
    changeRoomState(stateName: any);
}