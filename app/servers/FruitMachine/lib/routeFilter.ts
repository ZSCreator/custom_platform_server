import Filter from "../../../common/classes/filter";
import { sessionInfo } from "../../../services/sessionService";
import ApiResultDTO from "../../../common/classes/apiResultDTO";
import roomManager, {FruitMachineRoomManager} from "./roomManager";
import {RouteRecord, Application, FrontendOrBackendSession} from "pinus";
import {getlanguage, Net_Message} from '../../../services/common/langsrv';

export default function (app) {
    return new FruitMachine(app);
}

/**
 * 水果机路由过滤器
 */
class FruitMachine extends Filter {
    private roomManager: FruitMachineRoomManager;

    constructor(app: Application) {
        super(app);
        this.roomManager = roomManager;
    }

    before(routeRecord: RouteRecord , msg: any, session: FrontendOrBackendSession, next: (err?: any, resp?: any) => void): void {
        const { sceneId, roomId, uid, language } = sessionInfo(session);

        const room = this.roomManager.searchRoom(sceneId, roomId);

        if (!room) {
            return next(new Error(), new ApiResultDTO({ code: 500, msg: getlanguage(language, Net_Message.id_1004)}).result());
        }

        msg.room = room;

        const player = room.getPlayer(uid);

        if (!player) {
            return next(new Error(), new ApiResultDTO({ code: 500, msg: getlanguage(language, Net_Message.id_2017)}).result());
        }

        msg.player = player;

        next();
    }
}