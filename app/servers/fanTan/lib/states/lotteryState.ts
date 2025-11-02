import {IMultiPlayerRoomState} from "../../../../common/interface/game/IMultiPlayerRoomState";
import {Room} from "../room";
import {RoomState} from "../constants";
import {LotteryUtil} from "../util/lotteryUtil";

/**
 * 开奖状态
 */
export default class LotteryState implements IMultiPlayerRoomState {
    readonly countdown = 10 * 1000;
    readonly stateName = RoomState.LOTTERY;
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
        this.init();

        // 设置赔率翻倍区域
        this.room.randomAreasDouble();

        // 开奖
        const lotteryUtil = new LotteryUtil();

        // 设置押注区域
        lotteryUtil.setBetAreas(this.room.getBetAreas());

        // 调控开奖
        await this.room.control.runControl(lotteryUtil);

        // 保存这局开奖结果
        this.room.setResult(lotteryUtil.getResult())
            .setWinAreas(lotteryUtil.getWinAreas())
            .addOneLotteryResult(lotteryUtil.getResult());

        // 通知开奖
        this.room.routeMsg.startLotteryState();
    }

    async after(): Promise<void> {
        // 更新房间信息
        await this.room.updateAfterLottery();
        // 切换开奖状态
        await this.room.changeRoomState(RoomState.SETTLEMENT);
    }
}