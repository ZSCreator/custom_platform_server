import {filterProperty} from "../../../utils/index";
import Player from "./Player";
import Room from "./Room";
import {CommonControlState} from "../../../domain/CommonControl/config/commonConst";
import {BaseGameControl} from "../../../domain/CommonControl/baseGameControl";
import {ControlPlayer, PersonalControlPlayer} from "../../../services/newControl";
import {ControlKinds} from "../../../services/newControl/constants";

/**
 * 草花机调控
 */
export default class ControlImpl extends BaseGameControl {
    room: Room;

    constructor(params: { room: Room }) {
        super(params);
    }

    async runControl(): Promise<any> {
        // 获取调控结果
        const controlResult = await this.getControlResult();
        const {personalControlPlayers: players, sceneControlState, isPlatformControl} = controlResult;

        if (players.length > 0) {
            // 是否满足必杀条件
            // 如果并标记必杀区域 标记的区域必杀 然后其余其余走场控
            const isKill = this.checkKillPlayers(players);

            // 如果必杀
            if (isKill) {
                return this.room.killDealCard();
            }

            // 判断玩家是否满足个控概率
            const needControlPlayers: PersonalControlPlayer[] = this.filterNeedControlPlayer(players);

            // 如果有调控玩家
            if (needControlPlayers.length) {
                // 获取调控的玩家 以及调控状态 正调控或者负调控
                const {state, controlPlayers} = this.chooseControlPlayerAndControlState(needControlPlayers);

                // 标记该玩家必赢
                this.room.setPlayersState({players: controlPlayers, state});
                return this.room.personalDealCards({state});
            }
        }

        // 进入场控
        return await this.room.sceneControl(sceneControlState, isPlatformControl);
    }


    /**
     * 包装游戏玩家
     */
    protected stripPlayers(): ControlPlayer[] {
        // 筛选出真实玩家且压过注的玩家 或者等于庄
        return this.room.players.filter(p => p.isRobot === 0 && p.bet > 0)
            .map(player => filterProperty(player));
    }

    /**
     * 判断玩家的是否满足必杀条件
     */
    private checkKillPlayers(players: PersonalControlPlayer[]): boolean {
        let controlArea = {};
        const controlUidList = [];

        for (let controlPlayer of players) {
            const player: Player = this.room.getPlayer(controlPlayer.uid);
            const areas: object = player.checkOverrunBet({condition: controlPlayer.killCondition});

            if (Object.keys(areas).length) {
                controlUidList.push(controlPlayer.uid);
            }

            // 统计超限得区域
            for (let index in areas) {
                if (areas[index] === CommonControlState.LOSS) {
                    controlArea[index] = CommonControlState.LOSS;
                }
            }
        }

        console.warn('不杀', controlArea, (Object.keys(controlArea).every(index => controlArea[index] === CommonControlState.RANDOM)));
        // 判断是否全不杀
        if (Object.keys(controlArea).every(index => controlArea[index] === CommonControlState.RANDOM)) {
            return false;
        }

        // 判断是否全必杀
        const allKill = Object.keys(controlArea).every(index => controlArea[index] === CommonControlState.LOSS);

        // 如果全杀 统计被杀的几个玩家的押注，开一个最少的出来
        if (allKill && Object.keys(controlArea).length === 5) {
            this.allKillDeal(players);
        } else {
            // 否则 标记被杀的区域
            Object.keys(controlArea).forEach(index => {
                if (controlArea[index] === CommonControlState.LOSS) {
                    this.room.markKillArea({area: index});
                }
            })
        }

        controlUidList.forEach(uid => this.room.getPlayer(uid).setControlType(ControlKinds.PERSONAL));

        return true;
    }

    /**
     * 如果全杀情况的处理
     * @param players 调控玩家
     */
    private allKillDeal(players: PersonalControlPlayer[]): void {
        let statisticalResult = {};

        // 统计出被调控玩家所有区域的押注额
        players.forEach(p => {
            const player: Player = this.room.getPlayer(p.uid);
            const betAreas: object = player.getBetAreas();

            for (let index in betAreas) {
                if (!statisticalResult[index]) statisticalResult[index] = 0;
                statisticalResult[index] += betAreas[index];
            }
        });

        let result: { index: any, count: number } = {index: null, count: 0},
            killAreas: string[] = [];
        // 做一次预结算
        for (let index in statisticalResult) {
            const profit = statisticalResult[index] * this.room.area[index].multiple;

            if (result.index === null) {
                result.index = index;
                result.count = profit;
            } else {
                // 只有收益小的才不会被标记
                if (result.count > profit) {
                    killAreas.push(result.index);
                    result.index = index;
                    result.count = profit;
                } else {
                    killAreas.push(index);
                }
            }
        }

        // 最后标记必杀的区域
        killAreas.forEach(area => this.room.markKillArea({area}))
    }
}