import Room from './sicboRoom';
import {filterProperty} from "../../../utils";
import Player from "./sicboPlayer";
import {mapping} from "./sicboConst";
import {ControlPlayer, PersonalControlPlayer} from "../../../services/newControl";
import {BaseGameControl} from "../../../domain/CommonControl/baseGameControl";
import {ControlKinds} from "../../../services/newControl/constants";

/**
 * 骰宝调控实现
 */
export default class SicBoControl extends BaseGameControl {
    room: Room;

    constructor({room}: { room: Room }) {
        super({room});
    }

    public async result() {
        // 个控
        const { personalControlPlayers: players, sceneControlState, isPlatformControl } = await this.getControlResult();

        // 如果有个控玩家
        if (players.length) {
            // 判断是否必杀
            const isKill = this.checkKillPlayers(players);

            // 如果不不杀 走个控
            if (!isKill) {
                // 判断玩家是否满足个控概率
                const needControlPlayers: PersonalControlPlayer[] = this.filterNeedControlPlayer(players);

                // 如果有调控玩家
                if (needControlPlayers.length) {
                    // 获取调控的玩家 以及调控状态 正调控或者负调控
                    const { state, controlPlayers } = this.chooseControlPlayerAndControlState(needControlPlayers);

                    return this.room.personalControlResult(controlPlayers, state);
                }
            }
        }


        return this.room.sceneControlResult(sceneControlState, isPlatformControl);
    }


    /**
     * 是否必杀玩家
     * @param players 调控玩家
     */
    private checkKillPlayers(players: PersonalControlPlayer[]) {
        // 是否必杀
        let isKill: boolean = false,
            // 超限区域统计
            transfinite = {};
        const controlUidList = [];

        for (let controlPlayer of players) {
            const player: Player = this.room.getPlayer(controlPlayer.uid);

            // 获取押注超限的区域
            const transfiniteArea: object = player.checkOverrunBet(controlPlayer.killCondition);

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
                this.room.addKillArea(area);
                continue;
            }

            // 获取映射区的押注额
            const mappingBetNum = transfinite[mappingArea];

            // 如果映射区域没有必杀押注则直接标记
            if (!mappingBetNum) {
                isKill = true;
                this.room.addKillArea(area);
                continue;
            }

            // 如果映射区域的押注额相等则直接跳过
            if (mappingBetNum === transfinite[area]) {
                Reflect.deleteProperty(transfinite, mappingArea);
                continue;
            }

            isKill = true;

            mappingBetNum > transfinite[area] ? this.room.addKillArea(mappingArea) :
                this.room.addKillArea(area);

            Reflect.deleteProperty(transfinite, mappingArea);
        }

        controlUidList.forEach(uid => this.room.getPlayer(uid).setControlType(ControlKinds.PERSONAL));

        return isKill;
    }

    /**
     * 包装玩家数据
     */
    protected stripPlayers(): ControlPlayer[] {
        return this.room.players.filter(p => (p.isRobot === 0 && p.bet > 0)).map(p => filterProperty(p));
    }
}