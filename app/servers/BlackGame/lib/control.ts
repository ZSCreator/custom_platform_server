
import Room from './BGRoom';
import {filterProperty} from "../../../utils";
import {ControlPlayer, PersonalControlPlayer} from "../../../services/newControl";
import {BaseGameControl} from "../../../domain/CommonControl/baseGameControl";
import {RoleEnum} from "../../../common/constant/player/RoleEnum";


/**
 * 21点调控实现
 * @property sceneControlState 场控状态
 * @property
 */
export default class Control extends BaseGameControl {
    room: Room;


    constructor({room}: { room: Room }) {
        super({room});
    }

    /**
     * 开始调控
     */
    public async runControl() {
        // 没真人押注则随机开奖
        if (this.stripPlayers().length === 0 ) {
            return this.room.randomDeal();
        }

        // 个控
        const { personalControlPlayers: players, sceneControlState, isPlatformControl } = await this.getControlResult();

        // 如果有个控玩家
        if (players.length) {
            // 判断玩家是否满足个控概率
            const needControlPlayers: PersonalControlPlayer[] = this.filterNeedControlPlayer(players);

            // 如果有调控玩家
            if (needControlPlayers.length) {
                // 获取调控的玩家 以及调控状态 正调控或者负调控
                const { state, controlPlayers } = this.chooseControlPlayerAndControlState(needControlPlayers);

                // 个人调控
                return this.room.personalControl(controlPlayers, state);
            }
        }

        // 标记为场控状态
        this.room.sceneControl(sceneControlState, isPlatformControl);
    }

    /**
     * 包装玩家数据 只要有真人玩家且有下注的
     */
    protected stripPlayers(): ControlPlayer[] {
        return this.room.players.filter(p => !!p && (p.isRobot === RoleEnum.REAL_PLAYER && p.bet > 0)).map(p => filterProperty(p));
    }
}