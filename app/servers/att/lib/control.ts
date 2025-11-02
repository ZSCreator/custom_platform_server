import {filterProperty} from "../../../utils";
import {SlotGameControl} from "../../../domain/CommonControl/slotGameControl";
import {GameNidEnum} from "../../../common/constant/game/GameNidEnum";
import {LimitConfigManager} from "./limitConfigManager";
import {PersonalControlPlayer} from "../../../services/newControl";
import {ControlKinds, ControlState} from "../../../services/newControl/constants";
import Player from './player';
import Room from './room';
import {LotteryUtil, AttResult} from "./util/lotteryUtil";

/**
 * att调控实现
 * @property limitManager 限押配置管理器
 */
export default class Control extends SlotGameControl<LimitConfigManager> {
    private static instance: Control = null;

    /**
     * 获取静态实例
     */
    public static getControlInstance(room: Room): Control {
        if (this.instance === null) {
            this.instance = new Control({room} );
        }

        return this.instance;
    }

    limitManager: LimitConfigManager = LimitConfigManager.getInstance();

    constructor({room} = {room: { nid: GameNidEnum.att, sceneId: 0 }}) {
        super({room});
    }

    async runControl(player: Player, lotteryUtil: LotteryUtil): Promise<AttResult> {
        let result: AttResult, controlType: ControlKinds;

        const controlResult = await this.getControlResult([filterProperty(player)]);
        const {personalControlPlayers, sceneControlState, isPlatformControl} = controlResult;

        // 是否个控
        if (personalControlPlayers.length) {
            result = this.runPersonalControl(lotteryUtil, personalControlPlayers);
        }

        if (!result) {
            result = this.runSceneControl(lotteryUtil, sceneControlState);
            controlType = sceneControlState === ControlState.NONE ? ControlKinds.NONE :
                isPlatformControl ? ControlKinds.PLATFORM : ControlKinds.SCENE;
        } else {
            controlType = ControlKinds.PERSONAL;
        }

        // 计算这次具体收益是否超限
        const { isOverrun }: { isOverrun: boolean } =
            this.isEarningsTransfinite({ player, profit: result.totalWin });

        // 如果超限
        if (isOverrun) {
            // 钩子, 如果常规开奖超越了允许的上线， (开一个允许范围内的开奖z)
            result = lotteryUtil.setSystemWinOrLoss(true).result();
            controlType = ControlKinds.SCENE;
        }

        player.setControlType(controlType);

        console.warn(`调控玩家 uid: ${player.uid} 玩家收益: ${ result.totalWin} 调控状态 ${controlType} 
         场控数据 ${JSON.stringify(personalControlPlayers)} ${sceneControlState} 是否超限 ${isOverrun}`);

        return result;
    }

    /**
     *  运行个控
     * @param lotteryUtil 开奖工具类
     * @param personalControlPlayers 个控玩家
     */
    private runPersonalControl(lotteryUtil: LotteryUtil, personalControlPlayers:  PersonalControlPlayer[]): any | null {
        const killCondition = personalControlPlayers[0].killCondition * 100;

        // 如果满足必杀条件 则这把直接输
        if (killCondition > 0 && killCondition <= lotteryUtil.totalBet) {
            return lotteryUtil.setSystemWinOrLoss(true).result();
        }

        // 判断玩家是否满足个控概率
        const [controlPlayer] = this.filterNeedControlPlayer(personalControlPlayers);

        // 如果需要玩家调控
        if (controlPlayer) {
            // 获取玩家自己的调控信息 因为这个列表最大长度为一
            const isPositive: boolean = this.isPositiveControl(controlPlayer);

            console.warn(`调控玩家 uid: ${controlPlayer.uid} 系统赢: ${!isPositive}`);

            // 如果是正面调控就返回一个玩家必赢但不能超过限制的结果 或者 开出一个必输的结果
            return lotteryUtil.setSystemWinOrLoss(!isPositive).result();
        }

        return ;
    }

    /**
     * 场控
     * @param lotteryUtil 开奖工具类
     * @param sceneControlState  场控状态
     */
    private runSceneControl(lotteryUtil: LotteryUtil, sceneControlState: ControlState): any {
        // 如果使用调控方案二 则根据调控方案获取系统胜率 否则默认使用调控方案一
        if (sceneControlState === ControlState.NONE) {
            return lotteryUtil.result();
        }

        return lotteryUtil.setSystemWinOrLoss(sceneControlState === ControlState.SYSTEM_WIN).result();
    }
}