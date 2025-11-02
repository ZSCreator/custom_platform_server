import { GameNidEnum } from "../../../../constant/game/GameNidEnum";
import { RoomType } from "../../BaseRoomManager";

/**
 * @name 房间管理基类构造函数传参属性
 * @property configDataPath 可选参数;项目根目录下 相对 config/data 的路径位置;如 'scenes/redPacket'。有此参数则会 new 操作时自动获取配置，否则需手动 initScene()。
 * @property type 类型 百人还是对战 电玩游戏统一为百人游戏
 */
export interface IBaseRoomManagerConstructorParameter {
    nid: GameNidEnum,
    configDataPath?: string
    type: RoomType
}
