import {filterProperty} from "../../../utils";
import {SlotGameControl} from "../../../domain/CommonControl/slotGameControl";
import {LimitConfigManager} from "./limitConfigManager";
import {PersonalControlPlayer} from "../../../services/newControl";
import {ControlKinds, ControlState} from "../../../services/newControl/constants";
import Player from './Player';
import Room from './Room';
import {Lottery, SlotResult} from "./util/lotteryUtil";

/**
 * slots777调控实现
 * @property limitManager 限押配置管理器
 */
export default class ControlImpl extends SlotGameControl<LimitConfigManager> {
    private static instances: Map<number, ControlImpl> = new Map();

    /**
     * 获取静态实例
     */
    public static getControlInstance(room: Room): ControlImpl {
        if (!this.instances.get(room.sceneId)) {
            this.instances.set(room.sceneId, new ControlImpl({room: room} ));
        }

        return this.instances.get(room.sceneId);
    }

    limitManager: LimitConfigManager = LimitConfigManager.getInstance();

    constructor({room}) {
        super({room});
        this.experienceField = room.experience;
    }

    async runControl(player: Player, lotteryUtil: Lottery): Promise<SlotResult> {
        // 如果是试玩场
        if (this.experienceField) {
            return this.runSceneControl(lotteryUtil, this.experienceFieldControl());
        }

        let result: SlotResult, controlType: ControlKinds;

        const controlResult = await this.getControlResult([filterProperty(player)]);
        const {personalControlPlayers, sceneControlState, isPlatformControl} = controlResult;

        // 设置总押注
        lotteryUtil.setTotalBet(player.totalBet);

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

        return result;
    }

    /**
     *  运行个控
     * @param lotteryUtil 开奖工具类
     * @param personalControlPlayers 个控玩家
     */
    private runPersonalControl(lotteryUtil: Lottery, personalControlPlayers:  PersonalControlPlayer[]): any | null {
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
    private runSceneControl(lotteryUtil: Lottery, sceneControlState: ControlState): any {
        // 如果使用调控方案二 则根据调控方案获取系统胜率 否则默认使用调控方案一
        if (sceneControlState === ControlState.NONE) {
            return lotteryUtil.result();
        }

        return lotteryUtil.setSystemWinOrLoss(sceneControlState === ControlState.SYSTEM_WIN).result();
    }
}