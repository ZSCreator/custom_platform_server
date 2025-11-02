import Room from "./cpRoom";
import { filterProperty } from "../../../utils";
import { BaseGameControl } from "../../../domain/CommonControl/baseGameControl";
import { ControlPlayer, PersonalControlPlayer } from "../../../services/newControl";

/**
 * 十三水调控
 * @property room 十三水房间
 */
export default class Control extends BaseGameControl {
    room: Room;
    constructor(params: { room: Room }) {
        super(params);
    }

    /**
     * 运行调控发牌
     */
    async runControlDeal(): Promise<any> {
        if (this.room.run_Players.every(p => p.isRobot === this.room.run_Players[0].isRobot)) {
            return this.room.randomDeal(this.room.shuffleDeck());
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

        return this.room.sceneControl(controlResult.sceneControlState, isPlatformControl);
    }

    /**
     * 包装游戏玩家
     */
    protected stripPlayers(): ControlPlayer[] {
        return this.room.run_Players.map(pl => filterProperty(pl));
    }
}