import { PlayerInfo } from "../../../common/pojo/entity/PlayerInfo";
import { getResult, randomResult } from './logic';
import {filterProperty} from "../../../utils";
import {SlotGameControl} from "../../CommonControl/slotGameControl";
import {LimitConfigManager} from "./limitConfigManager";
import {PersonalControlPlayer} from "../../../services/newControl";
import {ControlState} from "../../../services/newControl/constants";
import {GameNidEnum} from "../../../common/constant/game/GameNidEnum";

/**
 * 西游记调控实现
 * @property limitManager 限押配置管理器
 */
export default class ControlImpl extends  SlotGameControl<LimitConfigManager> {
    private static instance: ControlImpl = null;

    /**
     * 获取静态实例
     */
    public static getControlInstance(): ControlImpl {
        if (this.instance === null) {
            this.instance = new ControlImpl({room: { nid: GameNidEnum.xiyouji, sceneId: 0 }} );
        }

        return this.instance;
    }

    limitManager: LimitConfigManager = LimitConfigManager.getInstance();

    constructor({room}) {
        super({room});
    }

    async runControl({player, par, totalBet}:
                         { player: PlayerInfo, par: any, totalBet: number }): Promise<any> {
        let result: any;

        const controlResult = await this.getControlResult([filterProperty(player)]);
        const {personalControlPlayers, sceneControlState} = controlResult;

        // 是否个控
        if (personalControlPlayers.length) {
            result = this.runPersonalControl({ totalBet, par, personalControlPlayers });
        }

        if (!result) {
            result = this.runSceneControl({totalBet, par, sceneControlState});
        }

        // 计算这次具体收益
        const { isOverrun }: { isOverrun: boolean } =
            this.isEarningsTransfinite({ player, profit: result.finalResult_1.allTotalWin });

        // 如果超限
        if (isOverrun) {
            // 钩子, 如果常规开奖超越了允许的上线， (开一个允许范围内的开奖z)
            result = getResult(par, totalBet, true);
        }

        return result;
    }

    /**
     * 运行个控
     * @param params
     */
    private runPersonalControl({par, totalBet, personalControlPlayers }
                                   : { par: any, totalBet: number, personalControlPlayers: PersonalControlPlayer[] }): any | null{
        // 判断玩家是否满足个控概率
        const [controlPlayer] = this.filterNeedControlPlayer(personalControlPlayers);

        // 如果需要玩家调控
        if (controlPlayer) {
            // 获取玩家自己的调控信息 因为这个列表最大长度为一
            const isPositive: boolean = this.isPositiveControl( controlPlayer );

            // 如果是正面调控就返回一个玩家必赢但不能超过限制的结果 或者 开出一个必输的结果
            return getResult(par, totalBet, !isPositive);
        }

        return ;
    }

    /**
     * 场控
     * @param par       参数
     * @param totalBet  总押注
     * @param sceneControlState  场控状态
     */
    private runSceneControl({par, totalBet, sceneControlState}
                                :{ par: any, totalBet: number, sceneControlState: ControlState}): any {
        // 如果使用调控方案二 则根据调控方案获取系统胜率 否则默认使用调控方案一
        if (sceneControlState === ControlState.NONE) {
            return randomResult(par);
        }

        return getResult(par, totalBet, sceneControlState === ControlState.SYSTEM_WIN);
    }
}