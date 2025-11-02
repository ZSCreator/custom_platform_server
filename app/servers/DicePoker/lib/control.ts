import Room from "./DiceRoom";
import {filterProperty} from "../../../utils";
import {BaseGameControl} from "../../../domain/CommonControl/baseGameControl";
import {ControlPlayer, PersonalControlPlayer} from "../../../services/newControl";
import {RoleEnum} from "../../../common/constant/player/RoleEnum";

/**
 * 二八杠调控
 */
export default class Control extends BaseGameControl {
    room: Room;
    constructor(params: { room: Room }) {
        super(params);
    }

    async runControl(): Promise<any> {
        // 如果真人玩家押注等于零直接随机
        if (this.room.roundTimes > 1 || this.room.players.every(p => p.isRobot === this.room.players[0].isRobot)) {
            return;
        }

        // 获取调控结果
        const { personalControlPlayers: players, isPlatformControl, sceneWeights } = await this.getControlResult();

        if (players.length > 0) {
            // 判断玩家是否满足个控概率
            const needControlPlayers: PersonalControlPlayer[] = this.filterNeedControlPlayer(players);

            // 如果有调控玩家
            if (needControlPlayers.length) {
                // 获取调控的玩家 以及调控状态 正调控或者负调控
                const { controlPlayers } = this.chooseControlPlayerAndControlState(needControlPlayers);

                // 个控玩家开奖
                return this.room.personalControl(controlPlayers);
            }
        }

        // 场控方案 或者 正常发牌
        return this.room.sceneControl(sceneWeights, isPlatformControl);
    }

    /**
     * 包装游戏玩家
     */
    protected stripPlayers(): ControlPlayer[] {
        return this.room.players.filter(p => p.isRobot === RoleEnum.REAL_PLAYER).map(player => filterProperty(player));
    }
}