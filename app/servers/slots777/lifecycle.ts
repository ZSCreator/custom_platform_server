import {Application, ILifeCycle} from "pinus";
import SlotsGameManager from "./lib/SlotsGameManager";
import {GameControlService} from "../../services/newControl/gameControlService";
import {GameNidEnum} from "../../common/constant/game/GameNidEnum";
import {LimitConfigManager} from "./lib/limitConfigManager";
import roomManager from "./lib/roomManager";

export default function () {
    return new Lifecycle();
}

class Lifecycle implements ILifeCycle {
    async beforeStartup(app: Application, cb: () => void) {
        console.log(app.getServerId(), 'slots777 配服务器启动之前');
        // try {
        //     const doc = await slotsRecordDao.findOne({ game: SlotsGameEnum.SlotsGameNID.NID }, null, { lean: true });
        //     doc && Utils.objAssignment(slots777Memory, doc);
        // } catch (error) {
        //     // 如果初始化失败阻塞服务器启动
        //     Logger.error('Slot777LifeCycle.beforeStartup ==> 初始化777服务器失败:', error);
        /**
         * 初始化游戏以及房间和场
         */
        await new SlotsGameManager(GameNidEnum.slots777).init();
        // }
        cb();
    }

    async afterStartup(app: Application, cb: () => void): Promise<any> {
        console.warn(app.getServerId(), 'slots777 配服务器启动之后');

        // 初始化调控
        await GameControlService.getInstance().init({nid: GameNidEnum.slots777});
        await LimitConfigManager.init();

        // 房间初始化
        await roomManager.init();

        cb();
    };

    async afterStartAll(app: Application) {
        console.log(app.getServerId(), "slots777 所有服务器启动之后");
    };

    async beforeShutdown(app: Application, shutDown: () => void, cancelShutDownTimer: () => void) {
        console.log(app.getServerId(), "slots777 服务器关闭之前");

        // 保存所有房间的奖池
        await roomManager.saveAllRoomsPool();

        shutDown();
    };
}
