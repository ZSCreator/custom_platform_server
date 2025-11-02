import {IMultiPlayerRoomState} from "../../../../common/interface/game/IMultiPlayerRoomState";
import {Room} from "../room";
import {RoomState} from "../constants";

/**
 * 结算状态
 */
export default class SettlementState implements IMultiPlayerRoomState {
    readonly countdown = 9 * 1000;
    readonly stateName = RoomState.SETTLEMENT;
    startTime = 0;
    room: Room;

    constructor(room: Room) {
        this.room = room;
    }

    /**
     * 获取剩余时间
     */
    getRemainingTime() {
        return this.startTime + this.countdown - Date.now();
    }

    init() {
        this.startTime = Date.now();
    };

    async before(): Promise<void> {
        this.init();

        this.room.endTime = this.startTime;

        // 添加玩家收收益
        for (let [areaName, area] of Object.entries(this.room.getBetAreas())) {
            // 如果这个区域赢了
            const lotteryResult = area.getLotteryResult();
            for (let uid in lotteryResult) {
                const player = this.room.getPlayer(uid);
                player.addProfit(lotteryResult[uid]);
            }
        }

        // 给有玩家更新金币
        await Promise.all(
            this.room.getPlayers()
                .filter(p => p.getTotalBet() > 0)
                .map(p => p.settlement(this.room))
        );

        // 通知结算结果
        this.room.routeMsg.startSettlementState();
    }

    async after(): Promise<void> {
        // 更新玩家列表
        this.room.updateDisplayPlayers();

        // 切换为押注状态
        await this.room.changeRoomState(RoomState.BET);
    }


}