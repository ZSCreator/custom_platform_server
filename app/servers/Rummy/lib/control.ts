import {filterProperty} from "../../../utils";
import {BaseGameControl} from "../../../domain/CommonControl/baseGameControl";
import {ControlPlayer, PersonalControlPlayer} from "../../../services/newControl";
import {RummyRoomImpl as Room} from './RummyRoomImpl';
import {RoleEnum} from "../../../common/constant/player/RoleEnum";
import {ControlKinds, ControlState} from "../../../services/newControl/constants";

/**
 * 三张牌调控
 */
export default class Control extends BaseGameControl {
    room: Room
    controlType: ControlKinds;
    constructor(params: { room: Room }) {
        super(params);
    }

    init() {
        this.controlType = ControlKinds.NONE;
    }

    async runControl(): Promise<any> {
        this.init();
        // 如果房间里面全是真人或者全是机器人则不进行调控
        if (this.room.players.every(p => p.isRobot === RoleEnum.REAL_PLAYER)
            || this.room.players.every(p => p.isRobot === RoleEnum.ROBOT)) {
            // 随机发牌
            return 0;
        }

        // 获取调控结果
        const controlResult = await this.getControlResult();
        const { personalControlPlayers: players, isPlatformControl, sceneWeights } = controlResult;
        this.controlType = isPlatformControl ? ControlKinds.PLATFORM : ControlKinds.SCENE;

        // 有个控玩家
        if (players.length > 0) {
            // 判断玩家是否满足个控概率
            const needControlPlayers: PersonalControlPlayer[] = this.filterNeedControlPlayer(players);

            if (needControlPlayers.length) {
                // 查看正调控的玩家
                const positivePlayers = this.filterControlPlayer(needControlPlayers, true);
                // 如果有负调控的玩家
                const negativePlayers = this.filterControlPlayer(needControlPlayers, false);

                // 因为调控状态只能有一个真人
                if (positivePlayers.length === 1) {
                    return positivePlayers[0].probability;
                }

                return negativePlayers[0].probability;
            }
        }

        return sceneWeights;
    }

    /**
     * 包装游戏玩家
     */
    stripPlayers(): ControlPlayer[] {
        return this.room.players.filter(p => !!p &&  p.isRobot === RoleEnum.REAL_PLAYER).map(player => filterProperty(player))
    }
}