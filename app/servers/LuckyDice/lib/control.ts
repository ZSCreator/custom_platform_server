import { filterProperty } from "../../../utils";
import { BaseGameControl } from "../../../domain/CommonControl/baseGameControl";
import Room from "./ldRoom";
import { ControlPlayer, PersonalControlPlayer } from "../../../services/newControl";
import { RoleEnum } from "../../../common/constant/player/RoleEnum";

/**
 * 幸运骰子调控实现
 */
export default class Control extends BaseGameControl {
    room: Room;

    constructor({ room }: { room: Room }) {
        super({ room });
    }

    async runControl() {
        // 没有满足条件的玩家或者所有玩家都是真人玩家随机开奖
        if (this.stripPlayers().length === 0) {
            return this.room.randomLottery();
        }

        const { personalControlPlayers: players, sceneControlState, isPlatformControl } = await this.getControlResult();


        // 查看是否有个控玩家
        if (players.length > 0) {
            // 判断玩家是否满足个控概率
            const needControlPlayers: PersonalControlPlayer[] = this.filterNeedControlPlayer(players);

            // 如果有调控玩家
            if (needControlPlayers.length) {
                // 获取调控的玩家 以及调控状态 正调控或者负调控
                const { state, controlPlayers } = this.chooseControlPlayerAndControlState(needControlPlayers);

                return this.room.personalControl(controlPlayers, state);
            }
        }

        // 场控方案 或者 正常发牌
        return this.room.sceneControl(sceneControlState, isPlatformControl);
    }

    /**
     * 过滤调控玩家
     */
    protected stripPlayers(): ControlPlayer[] {
        return this.room.players.filter(p => p && p.isRobot === RoleEnum.REAL_PLAYER).map(p => filterProperty(p));
    }
}