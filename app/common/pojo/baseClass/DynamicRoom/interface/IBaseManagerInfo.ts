import { PlayerInfo } from "../../../entity/PlayerInfo";
import { SystemRoom } from "../../../entity/SystemRoom";

/**
 * @name 房间管理基类基础属性
 */
export interface IBaseManagerInfo {
    id: number;
    nid: string;
    name: string;
    roomList?: SystemRoom<PlayerInfo>[];
    /**对战类等待匹配队列 */
    wait_queue?: PlayerInfo[];
}
