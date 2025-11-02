import {RemoteObserver} from "../../common/classes/observer/remoteObserver/observer";
import {Redis} from "ioredis";
import SlotWinLimitDAOImpl from "./DAO/winLimitConfigDAOImpl";
import {GameNidEnum} from "../../common/constant/game/GameNidEnum";
import {WinLimitConfig} from "./interface/commonInterface";
import {mappingTheme} from "./config/slotsBaseConst";
import {getRedisClient} from "../../services/databaseService";


/**
 * 电玩游戏 限押配置 监听器
 */
export class SlotLimitConfigObserver extends RemoteObserver{
    private DAO: SlotWinLimitDAOImpl = SlotWinLimitDAOImpl.getInstance();

    constructor(themeName: string, redisConn: Redis) {
        super(themeName, redisConn);
    }

    /**
     * 更新一个游戏游戏配置
     * @param nid
     * @param winLimitConfig
     */
    async updateOneGameConfig(nid: GameNidEnum, winLimitConfig: WinLimitConfig[]) {
        // 先更数据库
        await this.DAO.updateOneConfig({nid}, {winLimitConfig});

        // 再删除缓存
        await this.DAO.deleteCache(nid);

        // 发送通知
        this.update('');
    }
}

/**
 * 创建一个观察者
 * @param nid
 */
export async function createSlotLimitConfigObserver(nid: GameNidEnum) {
    return new SlotLimitConfigObserver(mappingTheme[nid], await getRedisClient())
}