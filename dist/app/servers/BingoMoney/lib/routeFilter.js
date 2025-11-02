"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const filter_1 = require("../../../common/classes/filter");
const roomManager_1 = require("./roomManager");
const sessionService_1 = require("../../../services/sessionService");
const apiResultDTO_1 = require("../../../common/classes/apiResultDTO");
const langsrv_1 = require("../../../services/common/langsrv");
function default_1(app) {
    return new BingoMoneyFilter(app);
}
exports.default = default_1;
class BingoMoneyFilter extends filter_1.default {
    constructor(app) {
        super(app);
        this.roomManager = roomManager_1.default;
    }
    before(routeRecord, msg, session, next) {
        const { sceneId, roomId, uid, language } = (0, sessionService_1.sessionInfo)(session);
        const room = this.roomManager.searchRoom(sceneId, roomId);
        if (!room) {
            return next(new Error(), new apiResultDTO_1.default({ code: 500, msg: (0, langsrv_1.getlanguage)(language, langsrv_1.Net_Message.id_1004) }).result());
        }
        msg.room = room;
        const player = room.getPlayer(uid);
        if (!player) {
            return next(new Error(), new apiResultDTO_1.default({ code: 500, msg: (0, langsrv_1.getlanguage)(language, langsrv_1.Net_Message.id_2017) }).result());
        }
        msg.player = player;
        next();
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicm91dGVGaWx0ZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9hcHAvc2VydmVycy9CaW5nb01vbmV5L2xpYi9yb3V0ZUZpbHRlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLDJEQUFvRDtBQUNwRCwrQ0FBaUU7QUFDakUscUVBQStEO0FBQy9ELHVFQUFnRTtBQUVoRSw4REFBMEU7QUFFMUUsbUJBQXlCLEdBQUc7SUFDeEIsT0FBTyxJQUFJLGdCQUFnQixDQUFDLEdBQUcsQ0FBQyxDQUFDO0FBQ3JDLENBQUM7QUFGRCw0QkFFQztBQUtELE1BQU0sZ0JBQWlCLFNBQVEsZ0JBQU07SUFHakMsWUFBWSxHQUFnQjtRQUN4QixLQUFLLENBQUMsR0FBRyxDQUFDLENBQUM7UUFDWCxJQUFJLENBQUMsV0FBVyxHQUFHLHFCQUFXLENBQUM7SUFDbkMsQ0FBQztJQUVELE1BQU0sQ0FBQyxXQUF3QixFQUFHLEdBQVEsRUFBRSxPQUFpQyxFQUFFLElBQXFDO1FBQ2hILE1BQU0sRUFBRSxPQUFPLEVBQUUsTUFBTSxFQUFFLEdBQUcsRUFBRSxRQUFRLEVBQUUsR0FBRyxJQUFBLDRCQUFXLEVBQUMsT0FBTyxDQUFDLENBQUM7UUFFaEUsTUFBTSxJQUFJLEdBQUcsSUFBSSxDQUFDLFdBQVcsQ0FBQyxVQUFVLENBQUMsT0FBTyxFQUFFLE1BQU0sQ0FBQyxDQUFDO1FBRzFELElBQUksQ0FBQyxJQUFJLEVBQUU7WUFDUCxPQUFPLElBQUksQ0FBQyxJQUFJLEtBQUssRUFBRSxFQUFFLElBQUksc0JBQVksQ0FBQyxFQUFFLElBQUksRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLElBQUEscUJBQVcsRUFBQyxRQUFRLEVBQUUscUJBQVcsQ0FBQyxPQUFPLENBQUMsRUFBQyxDQUFDLENBQUMsTUFBTSxFQUFFLENBQUMsQ0FBQztTQUN0SDtRQUVELEdBQUcsQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDO1FBRWhCLE1BQU0sTUFBTSxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLENBQUM7UUFFbkMsSUFBSSxDQUFDLE1BQU0sRUFBRTtZQUNULE9BQU8sSUFBSSxDQUFDLElBQUksS0FBSyxFQUFFLEVBQUUsSUFBSSxzQkFBWSxDQUFDLEVBQUUsSUFBSSxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsSUFBQSxxQkFBVyxFQUFDLFFBQVEsRUFBRSxxQkFBVyxDQUFDLE9BQU8sQ0FBQyxFQUFDLENBQUMsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxDQUFDO1NBQ3RIO1FBRUQsR0FBRyxDQUFDLE1BQU0sR0FBRyxNQUFNLENBQUM7UUFFcEIsSUFBSSxFQUFFLENBQUM7SUFDWCxDQUFDO0NBQ0oifQ==