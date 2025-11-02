import {IMultiPlayerRoomState} from "../../../../common/interface/game/IMultiPlayerRoomState";
import {Room} from "../room";
import {RoomState} from "../constants";
import {LotteryUtil} from "../util/lotteryUtil";
import {BetAreasName} from "../config/betAreas";

/**
 * 开奖状态
 */
export default class SecondLotteryState implements IMultiPlayerRoomState {
    public countdown = 0;
    readonly stateName = RoomState.SECOND_LOTTERY;
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

        // 设置当前开奖
        lotteryUtil.setSecond();

        // 调控开奖
        await this.room.control.runControl(lotteryUtil);


        // console.warn('33333333333333', lotteryUtil.isOver(), lotteryUtil.getResult(), lotteryUtil.getWinArea());


        const result = lotteryUtil.getResult();
        // 保存这局开奖结果
        this.room.setResult(result)
            .setWinAreas(lotteryUtil.getWinArea());

        // console.warn('开始第二次开奖', lotteryUtil.getResult());

        // 动态设置开奖时间
        this.countdown = (result[BetAreasName.ANDAR].length + result[BetAreasName.BAHAR].length) * 200 + 2000;


        // 通知再次开奖
        this.room.routeMsg.startSecondLotteryState();
    }

    async after(): Promise<void> {
        // 切换开奖状态
        await this.room.changeRoomState(RoomState.SETTLEMENT);
    }
}