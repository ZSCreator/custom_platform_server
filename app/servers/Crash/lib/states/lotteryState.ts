import {IMultiPlayerRoomState} from "../../../../common/interface/game/IMultiPlayerRoomState";
import {Room} from "../room";
import {RoomState} from "../constants";
import {LotteryUtil} from "../util/lotteryUtil";

/**
 * 开奖状态
 */
export default class LotteryState implements IMultiPlayerRoomState {
    // 默认5秒开奖时间 就算立马爆炸也要给五秒的默认爆炸时间
    countdown = 0;
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
     * 获取已经飞行的时间
     */
    getRemainingTime() {
        return Date.now() - this.startTime;
    }

    async before(): Promise<void> {
        this.init();

        // 开奖
        const lotteryUtil = new LotteryUtil();

        // 调控开奖
        await this.room.control.runControl(lotteryUtil);

        // 对设置止盈点的玩家添加定时器
        this.room.players.filter(p => p.takeProfitPoint > 0 && p.takeProfitPoint <= lotteryUtil.getResult() && p.getTotalBet() > 0)
            .forEach(p => {
            const timer = setTimeout(() => {
                // 如果到了止盈点未领取则领取并发送通知
                if (!p.isTaken()) {
                    p.addProfit(p.takeProfitPoint);
                    p.settlement(this.room);
                    this.room.routeMsg.takeProfit(p);
                }
            }, (new LotteryUtil()).getFlyTimeToOdds(p.takeProfitPoint));
            this.room.addTimer(timer);
        })

        // 保存这局开奖结果
        this.room.setResult(lotteryUtil.getResult())
            .setFlyTime(lotteryUtil.getFlyTime())
            .addOneLotteryResult(lotteryUtil.getResult());

        // 开奖时间为飞行时间
        this.countdown = lotteryUtil.getFlyTime();

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