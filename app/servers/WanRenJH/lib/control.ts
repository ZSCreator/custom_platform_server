import wrjhRoom from './wrjhRoom';
import {filterProperty} from "../../../utils";
import Player from "./wrjhPlayer";
import {ControlPlayer, ControlResult, PersonalControlPlayer} from "../../../services/newControl";
import {BaseGameControl} from "../../../domain/CommonControl/baseGameControl";
import {CommonControlState} from "../../../domain/CommonControl/config/commonConst";
import {ControlKinds, ControlState} from "../../../services/newControl/constants";

/**
 * 龙虎斗调控实现
 */
export default class ControlImpl extends BaseGameControl {
    room: wrjhRoom;
    constructor({ room }: { room: wrjhRoom }) {
        super({ room });
    }

    public async run_result() {
        if (this.stripPlayers().length === 0) {
            return this.room.randomDeal();
        }

        // 获取调控结果
        const controlResult = await this.getControlResult();

        return this.room.bankerIsRealMan() ? this.playerBanker(controlResult) :
            this.systemBanker(controlResult);
    }


    /**
     * 系统庄
     * @param params
     */
    private systemBanker({ personalControlPlayers: players, sceneControlState, isPlatformControl }: ControlResult) {
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

                    return this.room.personalDealCards(controlPlayers, state);
                }
            }
        }

        // 场控方案 或者 正常发牌
        return this.room.sceneControlResult(sceneControlState, isPlatformControl);
    }

    /**
     * 玩家庄
     * @param params
     */
    private playerBanker({ personalControlPlayers: players, sceneControlState, bankerKill, isPlatformControl }: ControlResult) {

        // 玩家是否是个控玩家
        if (players.length > 0 && players.find(p => p.uid === this.room.zhuangInfo.uid)) {
            // 判断玩家是否满足个控概率
            const needControlPlayers: PersonalControlPlayer[] = this.filterNeedControlPlayer(players);

            const bankerControlInfo: PersonalControlPlayer | undefined = needControlPlayers.find(p => p.uid === this.room.zhuangInfo.uid);

            // 说明庄是调控玩家
            if (bankerControlInfo) {
                // 调控概率大于等于0代表正调控让庄家输 小于零让庄家赢
                this.room.getPlayer(this.room.zhuangInfo.uid).setControlType(ControlKinds.PERSONAL);
                return this.room.sceneControlResult(
                    this.isPositiveControl(bankerControlInfo) ? ControlState.PLAYER_WIN : ControlState.SYSTEM_WIN, false);
            }
        }

        // 判断是否庄杀
        if (bankerKill) {
            // 调控概率大于等于0代表正调控让庄家输 小于零让庄家赢
            this.room.getPlayer(this.room.zhuangInfo.uid).setControlType(ControlKinds.SCENE);
            return this.room.sceneControlResult(ControlState.SYSTEM_WIN, false);
        }

        // 场控发牌
        return this.room.sceneControlResult(sceneControlState, isPlatformControl);
    }

    /**
     * 是否必杀玩家
     * @param players 调控玩家
     */
    private checkKillPlayers(players: PersonalControlPlayer[]) {
        let isKill: boolean = false;
        const controlUidList = [];

        for (let controlPlayer of players) {
            if (controlPlayer.killCondition === 0) {
                continue;
            }

            const player: Player = this.room.getPlayer(controlPlayer.uid);
            const areas: CommonControlState[] = player.checkOverrunBet(controlPlayer.killCondition);

            // 如果押注超限
            if (areas.some(area => area === CommonControlState.LOSS)) {
                controlUidList.push(controlPlayer.uid);
                isKill = true;
                // 标记必杀区域
                this.room.markKillArea(areas);
            }
        }

        controlUidList.forEach(uid => this.room.getPlayer(uid).setControlType(ControlKinds.PERSONAL));

        return isKill;
    }

    /**
     * 包装玩家数据
     */
    protected stripPlayers(): ControlPlayer[] {
        return this.room.players.filter(p => {
            return p.isRobot === 0 && (p.bet > 0 || this.room.zhuangInfo.uid === p.uid);
        }).map(p => filterProperty(p));
    }
}