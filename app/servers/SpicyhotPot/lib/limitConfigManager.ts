import {GameNidEnum} from "../../../common/constant/game/GameNidEnum";
import {mappingTheme} from "../../../domain/CommonControl/config/slotsBaseConst";
import {createRedisConnection, getRedisClient} from "../../../services/databaseService";
import {SlotLimitConfigSubject} from "../../../domain/CommonControl/slotLimitConfigSubject";

/**
 * 麻辣火锅限押配置管理器
 */
export class LimitConfigManager extends SlotLimitConfigSubject {
    private static instance: LimitConfigManager;

    /**
     * 初始化
     */
    static async init() {
        this.instance = new LimitConfigManager(mappingTheme[GameNidEnum.SpicyhotPot], await createRedisConnection());
        await this.instance.init();
    }

    /**
     * 获取配置实例
     */
    static getInstance() {
        return this.instance;
    }


    nid: GameNidEnum = GameNidEnum.SpicyhotPot;
}