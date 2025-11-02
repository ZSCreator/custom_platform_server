import {random} from "../../utils";
import {getLogger} from 'pinus-logger';
import {ControlPlayer, ControlResult, PersonalControlPlayer} from "../../services/newControl";
import {GameControlService} from "../../services/newControl/gameControlService";
import {CommonControlState} from "./config/commonConst";
import {ControlState} from "../../services/newControl/constants";

const Logger = getLogger('server_out', __filename);


/**
 * 每个游戏调控的基类
 * 统一封装了获取场控信息以及个控信息
 * 具体调控细节由游戏单独实现
 *
 * 调控分为两种： 争对单独一个玩家的个人玩家调控和控制整体玩家调控的场控（系统调控）
 * 当两个逻辑同事存在时，优先判断是否有个人玩家调控、
 * 场正负调控: 正为让系统赢，负调控让系统输
 * 玩家正负调控：正调控让玩家赢（这时候玩家的调控概率应该为负值） 负调控让玩家输（这是玩家的调控概率为正值）
 * @property room 房间
 * @property experienceField 是否是体验场
 */
export abstract class BaseGameControl{
    room: any;
    experienceField: boolean = false;

    protected constructor({ room }: {room: any}) {
        this.room = room;
    }

    /**
     * 获取特殊的玩家列表
     * 按需覆盖
     */
    protected stripPlayers(): ControlPlayer[] {
        return [];
    };

    protected async getControlResult(players?: ControlPlayer[]): Promise<ControlResult> {
        return GameControlService.getInstance().getControlInfo(
            {sceneId: this.room.sceneId, players: players || this.stripPlayers()})
    }

    /** 过滤需要调控的玩家 */
    protected filterNeedControlPlayer(players: PersonalControlPlayer[]): PersonalControlPlayer[] {
        return players.filter(p => this.judgePlayerControlRate(p));
    }

    /**
     * 个控规则 判断玩家是否被调控
     * @param params
     */
    protected judgePlayerControlRate(params: { probability: number }) {
        return random(0, 99, 0) < Math.abs(params.probability);
    }

    /**
     * 选择调控玩家以及调控类型
     * @param players 满足调控条件的玩家
     * @return controlPlayers 最终受调控的玩家
     * @return state 调控状态 WIN 玩家赢 LOSS 玩家输
     */
    protected chooseControlPlayerAndControlState(players: PersonalControlPlayer[]):
        {controlPlayers: PersonalControlPlayer[], state: CommonControlState} {
        // 查看正调控的玩家
        const positivePlayers = this.filterControlPlayer(players, true);
        // 如果有负调控的玩家
        const negativePlayers = this.filterControlPlayer(players, false);
        // 判断调控正调控能够还是负调控
        const isPosControl: boolean = this.judgePosOrNeg(positivePlayers, negativePlayers);

        // 如果是正面调控 表示玩家赢
        if (isPosControl) {
            return {controlPlayers: positivePlayers, state: CommonControlState.WIN};
        }
        return {controlPlayers: negativePlayers, state: CommonControlState.LOSS};
    }


    /**
     * 过滤正负调控玩家
     * 正调控让玩家赢（这时候玩家的调控概率应该为负值） 负调控让玩家输（这是玩家的调控概率为正值）
     * @param players
     * @param positive 为true 过滤正调控的玩家 false过滤出负调控的玩家
     */
    protected filterControlPlayer(players: PersonalControlPlayer[], positive: boolean): PersonalControlPlayer[] {
        return players.filter(p => {
            if (positive && p.probability < 0) {
                return true;
            }

            return !positive && p.probability > 0;
        });
    }


    /**
     * 如果一个房间里面两种同时满足调控概率得玩家 看哪边得玩家调控权重更高
     * @param positivePlayers
     * @param negativePlayers
     * @return boolean 如果为true 调控正面得玩家 false 负调控玩家
     */
    protected judgePosOrNeg(positivePlayers: PersonalControlPlayer[], negativePlayers: PersonalControlPlayer[]): boolean {
        let posAmount = 0, negAmount = 0;
        positivePlayers.forEach(p => posAmount += Math.abs(p.probability));
        negativePlayers.forEach(p => negAmount += Math.abs(p.probability));

        return posAmount > negAmount;
    }


    /**
     * 单个玩家判断是否是正面调控， 由于前面已经判定过是否调控 这里只判断是正值或者负值
     * @param player
     */
    protected isPositiveControl(player: PersonalControlPlayer): boolean {
        return player.probability < 0;
    }

    /**
     * 试玩场调控 默认放10
     */
    experienceFieldControl() {
        return Math.random() < 0.1 ? ControlState.PLAYER_WIN : ControlState.NONE;
    }
}