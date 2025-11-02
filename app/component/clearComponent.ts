import {Application, IComponent} from "pinus";
import * as DatabaseConst from "../consts/databaseConst";
import {deleteKeyFromRedis} from "../common/dao/redis/lib/redisManager";

/**
 * 清理组件 挂载在master上 用于在服务器启动之前对关服后的脏数据进行清理
 */
export class ClearComponent implements IComponent {
    name: string = '__clear__';
    app: Application;

    constructor(app: Application, opts: any) {
        this.app = app;
    }

    /**
     * 服务器开启之前操作
     */
    async beforeStart(cb: () => void) {
        console.warn(`--------------------  服务器名字: ${this.app.serverType} --------------------`);
        // 初始化系统设置
        // await initSystemConfig();
        // await initSystemGames();

        process.nextTick(cb);
    }

    async start(cb: () => void) {
        // 清除在线调控玩家集合
        // 再初始化未创建游戏
        // const { allGame, codesInfo } = await initSystemGames();
        // 先清空已有游戏的数据
        // await resetSystemGames();
        // 更新缓存里没有更新的字段
        // await resetAllPlayers();
        // 重置游戏场
        // await resetSystemScenes();
        // 清空每个 rooms 的信息
        // await resetRoomsOfGame(allGame, codesInfo);
        // 更新奖池里未更新到的字段
        // await resetAllBufferJackpot();
        // 清除游戏在线玩家信息
        // await OnlineUidSetDao.deleteAll();
        // await OnlineGameHashDao.deleteAll();
        // 删除保存的验证码信息
        await deleteKeyFromRedis(DatabaseConst.AUTH_CODE_INFO_KEY);
    }
}