import RedBlackRoom from './RedBlackRoom';
import {filterProperty} from "../../../utils";
import RedBlackPlayer from "./RedBlackPlayerImpl";
import {mapping} from "./RedBlackConst";
import {BaseGameControl} from "../../../domain/CommonControl/baseGameControl";
import {ControlPlayer, PersonalControlPlayer} from "../../../services/newControl";
import {ControlKinds} from "../../../services/newControl/constants";

/**
 * 红黑大战调控实现
 */
export default class ControlImpl extends BaseGameControl {
    room: RedBlackRoom;
    constructor(params: { room: RedBlackRoom }) {
        super(params);
        this.experienceField = params.room.experience;
    }

    async runControl() {
        // 没有满足条件的玩家随机开奖
        if (this.stripPlayers().length === 0) {
            return this.room.randomLottery();
        }

        // 如果是体验场则走另外调控
        if (this.experienceField) {
            return this.room.sceneControlResult(this.experienceFieldControl(), false);
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
                    this.room.setPlayersState({ players: controlPlayers, state });
                    return this.room.personalDealCards({ state });
                }
            }
        }

        // 场控方案 或者 正常发牌
        return this.room.sceneControlResult(sceneControlState, isPlatformControl);
    }


    /**
     * 是否必杀玩家
     * @param players 受调控的玩家
     */
    private checkKillPlayers(players: PersonalControlPlayer[]) {
        // 是否必杀
        let isKill: boolean = false,
            // 超限区域统计
            transfinite = {};
        const controlUidList = [];

        for (let controlPlayer of players) {
            const player: RedBlackPlayer = this.room.getPlayer(controlPlayer.uid);

            // 获取押注超限的区域
            const transfiniteArea: object = player.checkOverrunBet({ condition: controlPlayer.killCondition });

            if (Object.keys(transfiniteArea).length) {
                controlUidList.push(controlPlayer.uid);
            }

            for (let area in transfiniteArea) {
                if (!transfinite[area]) transfinite[area] = 0;

                transfinite[area] += transfiniteArea[area];
            }
        }

        // 检查对压的区域 对压大的区域进行标记 相同则不进行标记
        for (let area in transfinite) {
            // 获取对压的区域
            const mappingArea = mapping[area];
            // 如果没有对压区域标记这个区域必杀
            if (!mappingArea) {
                isKill = true;
                this.room.addKillArea({ area });
                continue;
            }

            // 获取映射区的押注额
            const mappingBetNum = transfinite[mappingArea];

            // 如果映射区域没有必杀押注则直接标记
            if (!mappingBetNum) {
                isKill = true;
                this.room.addKillArea({ area });
                continue;
            }

            // 如果映射区域的押注额相等则直接跳过
            if (mappingBetNum === transfinite[area]) {
                delete transfinite[mappingArea];
                continue;
            }

            mappingBetNum > transfinite[area] ? this.room.addKillArea({ area: mappingArea }) :
                this.room.addKillArea({ area });

            isKill = true;
            delete transfinite[mappingArea];
        }

        // 如果必杀 无论如果都不开幸运一击
        if (isKill) {
            this.room.addKillArea({ area: 'luck' });
        }

        controlUidList.forEach(uid => this.room.getPlayer(uid).setControlType(ControlKinds.PERSONAL));

        return isKill;
    }

    /**
     * 过滤调控玩家
     */
    protected stripPlayers(): ControlPlayer[] {
        return this.room.players.filter(p => p.isRobot === 0 && p.bet > 0).map(p => filterProperty(p));
    }
}