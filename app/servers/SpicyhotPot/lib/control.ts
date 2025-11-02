import {filterProperty} from "../../../utils";
import {SlotGameControl} from "../../../domain/CommonControl/slotGameControl";
import {LimitConfigManager} from "./limitConfigManager";
import {GameNidEnum} from "../../../common/constant/game/GameNidEnum";
import {PersonalControlPlayer} from "../../../services/newControl";
import {ControlKinds, ControlState} from "../../../services/newControl/constants";
import Room from './Room';
import Player from './Player';

/**
 * 麻辣火锅调控实现
 */
export default class Control extends SlotGameControl<LimitConfigManager> {
    private static instance: Control = null;

    /**
     * 获取静态实例
     */
    public static getControlInstance(): Control {
        if (this.instance === null) {
            this.instance = new Control({room: { nid: GameNidEnum.SpicyhotPot, sceneId: 0 }} );
        }

        return this.instance;
    }

    limitManager: LimitConfigManager = LimitConfigManager.getInstance();

    constructor({room}) {
        super({room});
    }

    async result(player: Player, totalBet: number): Promise<any> {
        let result: any, controlType: ControlKinds;

        const controlResult = await this.getControlResult([filterProperty(player)]);
        const {personalControlPlayers, sceneControlState, isPlatformControl} = controlResult;

        // 是否个控
        if (personalControlPlayers.length) {
            result = this.runPersonalControl(totalBet,  personalControlPlayers);
        }

        if (!result) {
            result = this.runSceneControl(totalBet,  sceneControlState);
            controlType = sceneControlState === ControlState.NONE ? ControlKinds.NONE :
                isPlatformControl ? ControlKinds.PLATFORM : ControlKinds.SCENE;
        } else {
            controlType = ControlKinds.PERSONAL;
        }

        // 计算这次具体收益
        const { isOverrun }: { isOverrun: boolean } =
            this.isEarningsTransfinite({ player, profit: Room.calculateProfit(result.rebate, totalBet)});

        // 如果超限
        if (isOverrun) {
            // 钩子, 如果常规开奖超越了允许的上线， (开一个允许范围内的开奖z)
            result = Room.getWinOrLossResult(totalBet, true);
            controlType = ControlKinds.SCENE;
        }

        player.setControlType(controlType);

        return result;
    }

    /**
     * 运行个控
     * @param totalBet 总押注
     * @param personalControlPlayers 个控玩家
     */
    private runPersonalControl(totalBet: number, personalControlPlayers: PersonalControlPlayer[]): any | null {
        const killCondition = personalControlPlayers[0].killCondition * 100;

        // 如果满足必杀条件 则这把直接输
        if (killCondition > 0 && killCondition <= totalBet) {
            return  Room.getWinOrLossResult(totalBet, true);
        }


        // 判断玩家是否满足个控概率
        const [controlPlayer] = this.filterNeedControlPlayer(personalControlPlayers);

        // 如果需要玩家调控
        if (controlPlayer) {
            // 获取玩家自己的调控信息 因为这个列表最大长度为一
            const isPositive: boolean = this.isPositiveControl(controlPlayer);

            // 如果是正面调控就返回一个玩家必赢但不能超过限制的结果 或者 开出一个必输的结果
            return Room.getWinOrLossResult(totalBet, !isPositive);
        }

        return ;
    }

    /**
     * 场控
     * @param totalBet  总押注
     * @param sceneControlState  场控状态
     */
    private runSceneControl(totalBet: number, sceneControlState: ControlState): any {
        // 如果使用调控方案二 则根据调控方案获取系统胜率 否则默认使用调控方案一
        if (sceneControlState === ControlState.NONE) {
            return Room.getResult(totalBet);
        }

        return Room.getWinOrLossResult(totalBet, sceneControlState === ControlState.SYSTEM_WIN);
    }
}