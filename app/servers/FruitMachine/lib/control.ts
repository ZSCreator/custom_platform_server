import {SlotGameControl} from "../../../domain/CommonControl/slotGameControl";
import {LimitConfigManager} from './limitConfigManager';
import {GameNidEnum} from "../../../common/constant/game/GameNidEnum";
import {filterProperty} from "../../../utils";
import {PersonalControlPlayer} from "../../../services/newControl";
import {ControlKinds, ControlState} from "../../../services/newControl/constants";
import Player from './Player';
import {getRandomLotteryResultStandAlone, getWinORLossResultStandAlone} from './util/lotteryUtil';

/**
 * 水果机调控
 * @property limitManager 限压配置管理器
 */
export class Control extends SlotGameControl<LimitConfigManager>{
    private static instances: Map<number, Control> = new Map();

    /**
     * 获取静态实例
     */
    public static geInstance(sceneId: number): Control {
        let instance = this.instances.get(sceneId);

        if (!instance) {
            instance = new Control({room: { nid: GameNidEnum.FruitMachine, sceneId}});
            this.instances.set(sceneId, instance);
        }

        return instance;
    }

    limitManager = LimitConfigManager.getInstance();

    constructor({room}) {
        super({room});
    }

    async result(player: Player) {
        let result: any, controlType: ControlKinds;

        const controlResult = await this.getControlResult([filterProperty(player)]);
        const {personalControlPlayers, sceneControlState, isPlatformControl} = controlResult;

        // 是否个控
        if (personalControlPlayers.length) {
            result = this.runPersonalControl(player, personalControlPlayers);
        }

        if (!result) {
            result = this.runSceneControl(player, sceneControlState);
            controlType = sceneControlState === ControlState.NONE ? ControlKinds.NONE :
                isPlatformControl ? ControlKinds.PLATFORM : ControlKinds.SCENE;
        } else {
            controlType = ControlKinds.PERSONAL;
        }

        // 计算这次具体收益是否超限
        const { isOverrun }: { isOverrun: boolean } =
            this.isEarningsTransfinite({ player, profit: result.totalProfit });

        // 如果超限
        if (isOverrun) {
            // 钩子, 如果常规开奖超越了允许的上线， (开一个允许范围内的开奖z)
            controlType = ControlKinds.SCENE;
            result = getWinORLossResultStandAlone(player.betAreas, player.totalBet, true);
        }

        player.setControlType(controlType);

        return result;
    }

    /**
     * 运行个控
     * @param player 调控玩家
     * @param personalControlPlayers 个控玩家
     */
    private runPersonalControl(player: Player,  personalControlPlayers:  PersonalControlPlayer[]): any | null {
        const killCondition = personalControlPlayers[0].killCondition * 100;

        // 如果满足必杀条件 则这把直接输
        if (killCondition > 0 && killCondition <= player.totalBet) {
            return getWinORLossResultStandAlone(player.betAreas, player.totalBet, true);
        }

        // 判断玩家是否满足个控概率
        const [controlPlayer] = this.filterNeedControlPlayer(personalControlPlayers);

        // 如果需要玩家调控
        if (controlPlayer) {
            // 获取玩家自己的调控信息 因为这个列表最大长度为一
            const isPositive: boolean = this.isPositiveControl(controlPlayer);

            // 如果是正面调控就返回一个玩家必赢但不能 或者 开出一个必输的结果
            return getWinORLossResultStandAlone(player.betAreas, player.totalBet, !isPositive);
        }

        return ;
    }

    /**
     * 场控
     * @param player
     * @param sceneControlState  场控状态
     */
    private runSceneControl(player: Player, sceneControlState: ControlState): any {
        // 如果使用调控方案二 则根据调控方案获取系统胜率 否则默认使用调控方案一
        if (sceneControlState === ControlState.NONE) {
            return getRandomLotteryResultStandAlone(player.betAreas);
        }

        return getWinORLossResultStandAlone(player.betAreas, player.totalBet, sceneControlState === ControlState.SYSTEM_WIN);
    }
}