import {RemoteSubject} from "../../common/classes/observer/remoteObserver/subject";
import {Redis} from "ioredis";
import {WinLimitConfig} from "./interface/commonInterface";
import SlotWinLimitDAO from "./DAO/winLimitConfigDAOImpl";
import {GameNidEnum} from "../../common/constant/game/GameNidEnum";
import {pinus} from "pinus";
import {WIN_LIMITED_CONFIG} from "./config/slotsBaseConst";

/**
 * 限压配置管理
 * @property nid 游戏nid
 * @property limitConfig 限押配置
 * @property DAO 限押配置DAO
 */
export abstract class SlotLimitConfigSubject extends RemoteSubject {
    abstract nid: GameNidEnum;
    limitConfig: WinLimitConfig[];
    DAO: SlotWinLimitDAO = SlotWinLimitDAO.getInstance();

    protected constructor(themeName: string, redis: Redis) {
        super(themeName, redis);
    }

    /**
     * 初始化
     * 必须在引用前初始化  非常重要
     */
    async init() {
        this.limitConfig = await this.DAO.findOneConfig(this.nid);
        if (!this.limitConfig) {
            // 获取初始化的
            const server = pinus.app.getCurServer();
            const servers = pinus.app.getServersByType(server.serverType);

            // 由第一个负责初始化
            if (server.id === servers[0].id) {
                await this.DAO.create({nid: this.nid, winLimitConfig: WIN_LIMITED_CONFIG});
            }

            this.limitConfig = WIN_LIMITED_CONFIG;
        }

        // 注册
        await this.registration();
    }

    /**
     * 获取限押配置
     */
    getConfig() {
        return this.limitConfig;
    }

    /**
     * 收到消息调用
     * @param msg
     */
    invoke(msg?: any): any {
        this.DAO.findOneConfig(this.nid).then(res => {
            if (res) {
                this.limitConfig = res;
            }
        });
    }
}