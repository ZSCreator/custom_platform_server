"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const filter_1 = require("../../../common/classes/filter");
const roomManager_1 = require("./roomManager");
const sessionService_1 = require("../../../services/sessionService");
const apiResultDTO_1 = require("../../../common/classes/apiResultDTO");
const langsrv_1 = require("../../../services/common/langsrv");
function default_1(app) {
    return new HalloweenFilter(app);
}
exports.default = default_1;
class HalloweenFilter extends filter_1.default {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicm91dGVGaWx0ZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9hcHAvc2VydmVycy9oYWxsb3dlZW4vbGliL3JvdXRlRmlsdGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsMkRBQW9EO0FBQ3BELCtDQUEyRDtBQUMzRCxxRUFBK0Q7QUFDL0QsdUVBQWdFO0FBRWhFLDhEQUEwRTtBQUUxRSxtQkFBeUIsR0FBRztJQUN4QixPQUFPLElBQUksZUFBZSxDQUFDLEdBQUcsQ0FBQyxDQUFDO0FBQ3BDLENBQUM7QUFGRCw0QkFFQztBQUtELE1BQU0sZUFBZ0IsU0FBUSxnQkFBTTtJQUdoQyxZQUFZLEdBQWdCO1FBQ3hCLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUNYLElBQUksQ0FBQyxXQUFXLEdBQUcscUJBQVcsQ0FBQztJQUNuQyxDQUFDO0lBRUQsTUFBTSxDQUFDLFdBQXdCLEVBQUcsR0FBUSxFQUFFLE9BQWlDLEVBQUUsSUFBcUM7UUFDaEgsTUFBTSxFQUFFLE9BQU8sRUFBRSxNQUFNLEVBQUUsR0FBRyxFQUFFLFFBQVEsRUFBRSxHQUFHLElBQUEsNEJBQVcsRUFBQyxPQUFPLENBQUMsQ0FBQztRQUVoRSxNQUFNLElBQUksR0FBRyxJQUFJLENBQUMsV0FBVyxDQUFDLFVBQVUsQ0FBQyxPQUFPLEVBQUUsTUFBTSxDQUFDLENBQUM7UUFHMUQsSUFBSSxDQUFDLElBQUksRUFBRTtZQUNQLE9BQU8sSUFBSSxDQUFDLElBQUksS0FBSyxFQUFFLEVBQUUsSUFBSSxzQkFBWSxDQUFDLEVBQUUsSUFBSSxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsSUFBQSxxQkFBVyxFQUFDLFFBQVEsRUFBRSxxQkFBVyxDQUFDLE9BQU8sQ0FBQyxFQUFDLENBQUMsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxDQUFDO1NBQ3RIO1FBRUQsR0FBRyxDQUFDLElBQUksR0FBRyxJQUFJLENBQUM7UUFFaEIsTUFBTSxNQUFNLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUVuQyxJQUFJLENBQUMsTUFBTSxFQUFFO1lBQ1QsT0FBTyxJQUFJLENBQUMsSUFBSSxLQUFLLEVBQUUsRUFBRSxJQUFJLHNCQUFZLENBQUMsRUFBRSxJQUFJLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxJQUFBLHFCQUFXLEVBQUMsUUFBUSxFQUFFLHFCQUFXLENBQUMsT0FBTyxDQUFDLEVBQUMsQ0FBQyxDQUFDLE1BQU0sRUFBRSxDQUFDLENBQUM7U0FDdEg7UUFFRCxHQUFHLENBQUMsTUFBTSxHQUFHLE1BQU0sQ0FBQztRQUVwQixJQUFJLEVBQUUsQ0FBQztJQUNYLENBQUM7Q0FDSiJ9