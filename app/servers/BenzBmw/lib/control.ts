import BenzRoom from './benzRoom';
import {filterProperty} from "../../../utils";
import benzPlayer from "./benzPlayer";
import {BaseGameControl} from "../../../domain/CommonControl/baseGameControl";
import {ControlPlayer, PersonalControlPlayer} from "../../../services/newControl";
import {BetAreas} from "./benzConst";
import {RoleEnum} from "../../../common/constant/player/RoleEnum";
import {ControlKinds} from "../../../services/newControl/constants";

/**
 * 奔驰宝马调控实现
 */
export default class ControlImpl extends BaseGameControl {
    room: BenzRoom;
    constructor(params: { room: BenzRoom }) {
        super(params);
    }

    async runControl() {
        // 没有机器人或者下注玩家就随机开奖
        if (this.stripPlayers().length === 0) {
            return this.room.randomLottery();
        }

        const { personalControlPlayers: players, sceneControlState, isPlatformControl } = await this.getControlResult();

        // 查看是否有个控玩家
        if (players.length > 0) {
            // 是否满足必杀条件 如果并标记必杀区域 标记的区域必杀 然后其余其余走场控
            const isKill = this.checkKillPlayers(players);

            // 如果调控玩家都不满足必杀条件则判断有个控玩家
            if (!isKill) {
                // 判断玩家是否满足个控概率
                const needControlPlayers: PersonalControlPlayer[] = this.filterNeedControlPlayer(players);

                // 如果有调控玩家
                if (needControlPlayers.length) {
                    // 获取调控的玩家 以及调控状态 正调控或者负调控
                    const { state, controlPlayers } = this.chooseControlPlayerAndControlState(needControlPlayers);

                    // 标记玩家
                    return this.room.personalControl(state, controlPlayers);
                }
            }
        }

        // 场控方案 或者 正常发牌
        return this.room.sceneControl(sceneControlState, isPlatformControl);
    }


    /**
     * 是否必杀玩家
     * @param players 受调控的玩家
     */
    private checkKillPlayers(players: PersonalControlPlayer[]) {
        // 是否必杀
        let isKill: boolean = false,
            // 超限区域统计
            transfinite: Set<BetAreas> = new Set();
        const controlUidList = [];

        for (let controlPlayer of players) {
            const condition = controlPlayer.killCondition * 100;

            if (condition <= 0) {
                continue;
            }

            const player: benzPlayer = this.room.getPlayer(controlPlayer.uid);

            // 获取押注超限的区域
            const transfiniteArea: object = player.checkOverrunBet(condition);

            if (Object.keys(transfiniteArea).length) {
                controlUidList.push(controlPlayer.uid);
            }

            for (let area in transfiniteArea) {
                transfinite.add(area as BetAreas);
            }
        }

        // 如果全部区域都超限 随机删除宝马或者奔驰
        if (transfinite.size === 8) {
            Math.random() > 0.5 ? transfinite.delete(BetAreas.BMW): transfinite.delete(BetAreas.Benz);
        }

        if (transfinite.size > 0) {
            isKill = true;
            this.room.setKillAreas(transfinite);
        }

        controlUidList.forEach(uid => this.room.getPlayer(uid).setControlType(ControlKinds.PERSONAL));

        return isKill;
    }

    /**
     * 过滤调控玩家
     */
    protected stripPlayers(): ControlPlayer[] {
        return this.room.players.filter(p => p.isRobot === RoleEnum.REAL_PLAYER && p.bet > 0).map(p => filterProperty(p));
    }
}