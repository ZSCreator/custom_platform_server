'use strict';
import { filterProperty } from "../../../utils";
import { BaseGameControl } from "../../../domain/CommonControl/baseGameControl";
import { ControlPlayer, PersonalControlPlayer } from "../../../services/newControl";
import jhRoom from './jhRoom';
import jhPlayer from './jhPlayer';
/**
 * 三张牌调控
 */
export default class ControlImpl extends BaseGameControl {
    room: jhRoom
    constructor(params: { room: jhRoom }) {
        super(params);
        this.experienceField = params.room.experience;
    }

    async runControl(list: jhPlayer[]): Promise<any> {
        // 如果房间里面全是真人或者全是机器人则不进行调控
        if (list.every(p => p.isRobot === 2) || list.every(p => p.isRobot === 0) || this.experienceField) {
            // 随机发牌
            return this.room.randomDeal(list);
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
                return this.room.personalControlDeal(list, positivePlayers, negativePlayers);
            }
        }

        // 场控发牌
        this.room.sceneControlDeal(controlResult.sceneControlState, list, isPlatformControl);
    }

    /**
     * 包装游戏玩家
     */
    stripPlayers(): ControlPlayer[] {
        return this.room.gamePlayers.map(player => filterProperty(player))
    }
}