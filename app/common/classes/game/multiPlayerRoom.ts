import { IMultiPlayerRoom } from "../../interface/game/IMultiPlayerRoom";
import { IMultiPlayerRoomState } from "../../interface/game/IMultiPlayerRoomState";
import { SystemRoom } from "../../pojo/entity/SystemRoom";
import { PlayerInfo } from "../../pojo/entity/PlayerInfo";

/**
 * 多人游戏房间 抽象类
 */
export default abstract class MultiPlayerRoom<T extends PlayerInfo> extends SystemRoom<T> implements IMultiPlayerRoom {
    /** 房间主要的定时器 */
    stateTimer: NodeJS.Timer;

    /** 同一时间只有一个主状态在执行 */
    processState: IMultiPlayerRoomState;

    /** 运行状态 */
    runningState: boolean = true;

    /** 第一次运行房间调用 */
    abstract run(): void;

    /** 关闭房间调用 */
    abstract close(): void;

    /** 初始化房间调用 */
    abstract init(): void;

    /** 改变房间状态   */
    abstract changeRoomState(stateName: any);

    /** 房间逻辑 大部分情况同时只有一个状态运行 如果需要多状态同时运行自行定义即可 */
    async process(): Promise<void> {
        if (!this.runningState) {
            return;
        }

        // 运行状态前置操作
        await this.processState.before();

        this.stateTimer = setTimeout(async () => {
            // 运行状态后置操作
            await this.processState.after();
        }, this.processState.countdown);
    }

    /** 停下房间逻辑 */
    stopTimer() {
        this.runningState = false;
        clearTimeout(this.stateTimer);
    }
}