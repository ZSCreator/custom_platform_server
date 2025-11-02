import baicaoRoom from "./baicaoRoom";
import { filterProperty } from "../../../utils";
import { BaseGameControl } from "../../../domain/CommonControl/baseGameControl";
import { ControlPlayer, PersonalControlPlayer } from "../../../services/newControl";
/**
 * 三公调控
 * @property room 三公房间
 */
export default class Control extends BaseGameControl {
    room: baicaoRoom;
    constructor(params: { room: baicaoRoom }) {
        super(params);
    }

    /**
     * 运行调控发牌
     */
    async runControlDeal(): Promise<any> {
        // 如果所有玩家类型相同则不进行调控
        if (this.room.isSameGamePlayers()) {
            return this.room.randomDeal();
        }

        // 获取调控结果
        const controlResult = await this.getControlResult();
        const { personalControlPlayers: players } = controlResult;

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

        return this.room.sceneControl(controlResult.sceneControlState, controlResult.isPlatformControl);
    }

    /**
     * 包装游戏玩家
     */
    protected stripPlayers(): ControlPlayer[] {
        return this.room.dealCardsPlayers.map(player => filterProperty(player));
    }
}