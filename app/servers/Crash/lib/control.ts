import {filterProperty} from "../../../utils";
import {ControlPlayer, PersonalControlPlayer} from "../../../services/newControl";
import {BaseGameControl} from "../../../domain/CommonControl/baseGameControl";
import {Room} from './room';
import {LotteryUtil} from "./util/lotteryUtil";

/**
 * Crash调控实现
 */
export default class CrashControl extends BaseGameControl {
    room: Room;
    constructor(params: { room: Room }) {
        super(params);
    }

    public async runControl(lotteryUtil: LotteryUtil): Promise<LotteryUtil> {
        // 如果真人玩家押注等于零直接随机
        if (this.room.getRealPlayersTotalBet() === 0) {
            return this.room.randomLottery(lotteryUtil);
        }

        // 获取调控结果
        const { personalControlPlayers: players, sceneControlState, isPlatformControl } = await this.getControlResult();

        if (players.length > 0) {
            // 判断玩家是否满足个控概率
            const needControlPlayers: PersonalControlPlayer[] = this.filterNeedControlPlayer(players);

            // 如果有调控玩家
            if (needControlPlayers.length) {
                // 获取调控的玩家 以及调控状态 正调控或者负调控
                const { state, controlPlayers } = this.chooseControlPlayerAndControlState(needControlPlayers);

                // 个控玩家开奖
                return this.room.personalControl(lotteryUtil, controlPlayers, state);
            }
        }

        // 场控方案 或者 正常发牌
        return this.room.sceneControl(lotteryUtil, sceneControlState, isPlatformControl);
    }

    /**
     * 包装玩家数据
     */
    protected stripPlayers(): ControlPlayer[] {
        return this.room.getRealPlayersAndBetPlayers().map(p => filterProperty(p));
    }
}