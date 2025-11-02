import { filterProperty } from "../../../utils";
import { BaseGameControl } from "../../../domain/CommonControl/baseGameControl";
import { ControlPlayer, PersonalControlPlayer } from "../../../services/newControl";
import DzRoom from './dzRoom'
import { RoleEnum } from "../../../common/constant/player/RoleEnum";

/**
 * 德州调控
 */
export default class ControlImpl extends BaseGameControl {
    room: DzRoom;
    constructor(params: { room: DzRoom }) {
        super(params);
    }

    async runControl(): Promise<any> {
        // 如果房间里面全是真人或者全是机器人则不进行调控
        if (this.room.gamePlayers.every(p => p && p.isRobot === RoleEnum.ROBOT) || this.room.gamePlayers.every(p => p.isRobot === RoleEnum.REAL_PLAYER)) {
            // 随机发牌
            return this.room.randomDeal();
        }

        // 如果是体验场则走另外调控
        if (this.experienceField) {
            return this.room.sceneControlDeal(this.experienceFieldControl(), false);
        }


        // 获取调控结果
        const controlResult = await this.getControlResult();
        const { personalControlPlayers: players, isPlatformControl } = controlResult;

        // 有个控玩家
        if (players.length > 0) {
            // 判断玩家是否满足个控概率
            const needControlPlayers: PersonalControlPlayer[] = this.filterNeedControlPlayer(players);

            if (needControlPlayers.length) {
                // 查看正调控的玩家
                const positivePlayers = this.filterControlPlayer(needControlPlayers, true);
                // 如果有负调控的玩家
                const negativePlayers = this.filterControlPlayer(needControlPlayers, false);

                // 个控发牌
                return this.room.personalControlDeal(positivePlayers, negativePlayers);
            }
        }

        // 场控发牌
        this.room.sceneControlDeal(controlResult.sceneControlState, isPlatformControl);
    }

    /**
     * 包装游戏玩家
     */
    stripPlayers(): ControlPlayer[] {
        return this.room.gamePlayers.map(pl => pl && filterProperty(pl))
    }
}