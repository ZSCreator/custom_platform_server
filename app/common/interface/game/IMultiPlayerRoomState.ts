/**
 * 多人游戏房间状态
 */
export interface IMultiPlayerRoomState {
    /** 状态开始时间 */
    startTime: number;

    /** 状态倒计时 */
    countdown: number;

    /** 状态名字 */
    stateName: string;

    /** 状态初始化 */
    init();

    /** 状态前置操作 */
    before(): Promise<void>;

    /** 状态后置操作 */
    after(): Promise<void>;

    /** 获取剩余倒计时 */
    getRemainingTime(): number;
}