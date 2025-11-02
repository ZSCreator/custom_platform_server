"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const filter_1 = require("../../../common/classes/filter");
const roomManager_1 = require("./roomManager");
const sessionService_1 = require("../../../services/sessionService");
const apiResultDTO_1 = require("../../../common/classes/apiResultDTO");
const langsrv_1 = require("../../../services/common/langsrv");
function default_1(app) {
    return new PharaohFilter(app);
}
exports.default = default_1;
class PharaohFilter extends filter_1.default {
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
        if (!msg.player.onLine) {
            msg.player.onLine = true;
            room.deleteTimer(msg.player);
        }
        next();
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicm91dGVGaWx0ZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9hcHAvc2VydmVycy9waGFyYW9oL2xpYi9yb3V0ZUZpbHRlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLDJEQUFvRDtBQUNwRCwrQ0FBOEQ7QUFDOUQscUVBQStEO0FBQy9ELHVFQUFnRTtBQUVoRSw4REFBMEU7QUFFMUUsbUJBQXlCLEdBQUc7SUFDeEIsT0FBTyxJQUFJLGFBQWEsQ0FBQyxHQUFHLENBQUMsQ0FBQztBQUNsQyxDQUFDO0FBRkQsNEJBRUM7QUFLRCxNQUFNLGFBQWMsU0FBUSxnQkFBTTtJQUc5QixZQUFZLEdBQWdCO1FBQ3hCLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUNYLElBQUksQ0FBQyxXQUFXLEdBQUcscUJBQVcsQ0FBQztJQUNuQyxDQUFDO0lBRUQsTUFBTSxDQUFDLFdBQXdCLEVBQUcsR0FBUSxFQUFFLE9BQWlDLEVBQUUsSUFBcUM7UUFDaEgsTUFBTSxFQUFFLE9BQU8sRUFBRSxNQUFNLEVBQUUsR0FBRyxFQUFFLFFBQVEsRUFBRSxHQUFHLElBQUEsNEJBQVcsRUFBQyxPQUFPLENBQUMsQ0FBQztRQUVoRSxNQUFNLElBQUksR0FBRyxJQUFJLENBQUMsV0FBVyxDQUFDLFVBQVUsQ0FBQyxPQUFPLEVBQUUsTUFBTSxDQUFDLENBQUM7UUFFMUQsSUFBSSxDQUFDLElBQUksRUFBRTtZQUNQLE9BQU8sSUFBSSxDQUFDLElBQUksS0FBSyxFQUFFLEVBQUUsSUFBSSxzQkFBWSxDQUFDLEVBQUUsSUFBSSxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsSUFBQSxxQkFBVyxFQUFDLFFBQVEsRUFBRSxxQkFBVyxDQUFDLE9BQU8sQ0FBQyxFQUFDLENBQUMsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxDQUFDO1NBQ3RIO1FBRUQsR0FBRyxDQUFDLElBQUksR0FBRyxJQUFJLENBQUM7UUFHaEIsTUFBTSxNQUFNLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUVuQyxJQUFJLENBQUMsTUFBTSxFQUFFO1lBQ1QsT0FBTyxJQUFJLENBQUMsSUFBSSxLQUFLLEVBQUUsRUFBRSxJQUFJLHNCQUFZLENBQUMsRUFBRSxJQUFJLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxJQUFBLHFCQUFXLEVBQUMsUUFBUSxFQUFFLHFCQUFXLENBQUMsT0FBTyxDQUFDLEVBQUMsQ0FBQyxDQUFDLE1BQU0sRUFBRSxDQUFDLENBQUM7U0FDdEg7UUFFRCxHQUFHLENBQUMsTUFBTSxHQUFHLE1BQU0sQ0FBQztRQUdwQixJQUFJLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxNQUFNLEVBQUU7WUFDcEIsR0FBRyxDQUFDLE1BQU0sQ0FBQyxNQUFNLEdBQUcsSUFBSSxDQUFDO1lBRXpCLElBQUksQ0FBQyxXQUFXLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxDQUFDO1NBQ2hDO1FBRUQsSUFBSSxFQUFFLENBQUM7SUFDWCxDQUFDO0NBQ0oifQ==