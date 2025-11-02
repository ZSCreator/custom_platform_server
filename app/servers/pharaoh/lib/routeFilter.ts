import Filter from "../../../common/classes/filter";
import roomManager, {PharaohRoomManager} from "./roomManager";
import { sessionInfo } from "../../../services/sessionService";
import ApiResultDTO from "../../../common/classes/apiResultDTO";
import {RouteRecord, FrontendOrBackendSession, Application} from "pinus";
import {getlanguage, Net_Message} from "../../../services/common/langsrv";

export default function (app) {
    return new PharaohFilter(app);
}

/**
 * 西游记路由过滤器
 */
class PharaohFilter extends Filter {
    private roomManager: PharaohRoomManager;

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

        // 如果玩家是断线重连回来
        if (!msg.player.onLine) {
            msg.player.onLine = true;
            // 删除定时删除定时器
            room.deleteTimer(msg.player);
        }

        next();
    }
}