import {filterProperty} from "../../../utils";
import {BaseGameControl} from "../../../domain/CommonControl/baseGameControl";
import RedPacketRoomImpl from "./RedPacketRoomImpl";
import RedPacketPlayerImpl from "./RedPacketPlayerImpl";
import {ControlKinds, ControlState} from "../../../services/newControl/constants";

/**
 * 龙虎斗调控实现
 */
export default class RedPacketControl extends BaseGameControl {
    constructor({ room }: { room: RedPacketRoomImpl}) {
        super({room});
    }

    /**
     * 判断是否调控
     * @param player
     */
    public async isControl(player: RedPacketPlayerImpl): Promise<boolean> {

        // 获取调控结果
        const controlResult = await this.getControlResult([filterProperty(player)]);

        const {personalControlPlayers: players, sceneControlState, isPlatformControl} = controlResult;

        // 是否个控
        if (players.length) {
            // 判断玩家是否满足个控概率
            const controlPlayers = this.filterNeedControlPlayer(players);

            // 判断是否玩家杀控 红包扫雷只做杀控
            const [controlPlayer] = this.filterControlPlayer(controlPlayers, false);

            // 因为请求的只有一个玩家 所以返回的玩家必然也是他自己
            if (controlPlayer) {
                const player = this.room.getPlayer(controlPlayer.uid);

                if (player) {
                    player.setControlType(ControlKinds.PERSONAL);
                    return true;
                }
            }
        }

        if (sceneControlState !== ControlState.NONE) {
            const type = isPlatformControl ? ControlKinds.PLATFORM : ControlKinds.SCENE;
            player.setControlType(type);
        }

        return sceneControlState === ControlState.SYSTEM_WIN;
    }
}