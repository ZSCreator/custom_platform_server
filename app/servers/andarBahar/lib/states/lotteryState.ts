import {IMultiPlayerRoomState} from "../../../../common/interface/game/IMultiPlayerRoomState";
import {Room} from "../room";
import {RoomState} from "../constants";
import {LotteryUtil} from "../util/lotteryUtil";

/**
 * 开奖状态
 */
export default class LotteryState implements IMultiPlayerRoomState {
    readonly countdown = 5 * 1000;
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

        // 开奖
        const lotteryUtil = new LotteryUtil();

        // 设置押注区域
        lotteryUtil.setBetAreas(this.room.getBetAreas());

        // 设置系统牌
        lotteryUtil.setSystemCard(this.room.getSystemCard());

        // 设置当前一个牌
        lotteryUtil.setCards(this.room.getCards());

        // 调控开奖
        await this.room.control.runControl(lotteryUtil);

        // 保存这局开奖结果
        this.room.setResult(lotteryUtil.getResult())
            .setWinAreas(lotteryUtil.getWinArea())
            .setLotteryOver(lotteryUtil.isOver());


        // console.warn('开始第一次状态', lotteryUtil.getResult());

        // 通知开奖
        this.room.routeMsg.startLotteryState(lotteryUtil.isOver() ? RoomState.SETTLEMENT : RoomState.SECOND_BET);
    }

    async after(): Promise<void> {
        // 如果结束在切换到结算状态 否则切换到再次押注状态
        this.room.isLotteryOver() ? await this.room.changeRoomState(RoomState.SETTLEMENT) :
            await this.room.changeRoomState(RoomState.SECOND_BET);
    }
}