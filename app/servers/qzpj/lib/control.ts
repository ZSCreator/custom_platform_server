import qzpjRoom from "./qzpjRoom";
import {filterProperty} from "../../../utils";
import {BaseGameControl} from "../../../domain/CommonControl/baseGameControl";
import {ControlPlayer, PersonalControlPlayer} from "../../../services/newControl";
import {ControlState} from "../../../services/newControl/constants";

/**
 * 抢庄牛牛调控
 */
export default class Control extends BaseGameControl {
    room: qzpjRoom;
    isControl: boolean = false;
    constructor(params: { room: qzpjRoom }) {
        super(params);
    }

    async runControl(): Promise<any> {
        this.isControl = false;
        // 如果所有玩家类型相同则不进行调控
        if (this.room.isSameGamePlayers()) {
            return this.room.randomDeal();
        }

        // 获取调控结果
        const controlResult = await this.getControlResult();
        const { personalControlPlayers: players,  isPlatformControl } = controlResult;

        // 如果是个控方案且有个控玩家
        if (players.length > 0) {
            // 判断玩家是否满足个控概率
            const needControlPlayers: PersonalControlPlayer[] = this.filterNeedControlPlayer(players);

            if (needControlPlayers.length > 0) {
                // 查看正调控的玩家
                const positivePlayers = this.filterControlPlayer(players, true);
                // 如果有负调控的玩家
                const negativePlayers = this.filterControlPlayer(players, false);
                this.isControl = true;

                return this.room.controlPersonalDeal(positivePlayers, negativePlayers);
            }
        }

        if (controlResult.sceneControlState === ControlState.NONE) {
            return this.room.randomDeal();
        }

        this.isControl = true;
        return await this.room.runSceneControl(controlResult.sceneControlState, isPlatformControl);
    }


    /**
     * 包装游戏玩家
     */
    protected stripPlayers(): ControlPlayer[] {
        return this.room._cur_players.map(player => filterProperty(player));
    }
}