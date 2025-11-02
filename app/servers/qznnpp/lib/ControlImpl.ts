import qznnRoom from "./qznnRoom";
import { filterProperty } from "../../../utils";
import { BaseGameControl } from "../../../domain/CommonControl/baseGameControl";
import { ControlPlayer, PersonalControlPlayer } from "../../../services/newControl";

/**
 * 抢庄牛牛调控
 */
export default class ControlImpl extends BaseGameControl {
    room: qznnRoom;
    constructor(params: { room: qznnRoom }) {
        super(params);
    }

    async runControl(): Promise<any> {
        // 如果所有玩家类型相同则不进行调控
        if (this.room.isSameGamePlayers()) {
            return this.room.randomDeal();
        }


        // 获取调控结果
        const controlResult = await this.getControlResult();
        const { personalControlPlayers: players, isPlatformControl } = controlResult;

        // 如果是个控方案且有个控玩家
        if (players.length > 0) {
            // 判断玩家是否满足个控概率
            const needControlPlayers: PersonalControlPlayer[] = this.filterNeedControlPlayer(players);

            if (needControlPlayers.length > 0) {
                // 查看正调控的玩家
                const positivePlayers = this.filterControlPlayer(players, true);
                // 如果有负调控的玩家
                const negativePlayers = this.filterControlPlayer(players, false);

                return this.room.controlPersonalDeal(positivePlayers, negativePlayers);
            }
        }
        return await this.room.runSceneControl(controlResult.sceneControlState, isPlatformControl);
    }

    /**
     * 包装游戏玩家
     */
    protected stripPlayers(): ControlPlayer[] {
        return this.room._cur_players.map(player => filterProperty(player));
    }
}