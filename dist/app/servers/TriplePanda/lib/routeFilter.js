"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const filter_1 = require("../../../common/classes/filter");
const roomManager_1 = require("./roomManager");
const sessionService_1 = require("../../../services/sessionService");
const apiResultDTO_1 = require("../../../common/classes/apiResultDTO");
const langsrv_1 = require("../../../services/common/langsrv");
function default_1(app) {
    return new TriplePandaFilter(app);
}
exports.default = default_1;
class TriplePandaFilter extends filter_1.default {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicm91dGVGaWx0ZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9hcHAvc2VydmVycy9UcmlwbGVQYW5kYS9saWIvcm91dGVGaWx0ZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSwyREFBb0Q7QUFDcEQsK0NBQWtFO0FBQ2xFLHFFQUErRDtBQUMvRCx1RUFBZ0U7QUFFaEUsOERBQTBFO0FBRTFFLG1CQUF5QixHQUFHO0lBQ3hCLE9BQU8sSUFBSSxpQkFBaUIsQ0FBQyxHQUFHLENBQUMsQ0FBQztBQUN0QyxDQUFDO0FBRkQsNEJBRUM7QUFLRCxNQUFNLGlCQUFrQixTQUFRLGdCQUFNO0lBR2xDLFlBQVksR0FBZ0I7UUFDeEIsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBQ1gsSUFBSSxDQUFDLFdBQVcsR0FBRyxxQkFBVyxDQUFDO0lBQ25DLENBQUM7SUFFRCxNQUFNLENBQUMsV0FBd0IsRUFBRyxHQUFRLEVBQUUsT0FBaUMsRUFBRSxJQUFxQztRQUNoSCxNQUFNLEVBQUUsT0FBTyxFQUFFLE1BQU0sRUFBRSxHQUFHLEVBQUUsUUFBUSxFQUFFLEdBQUcsSUFBQSw0QkFBVyxFQUFDLE9BQU8sQ0FBQyxDQUFDO1FBRWhFLE1BQU0sSUFBSSxHQUFHLElBQUksQ0FBQyxXQUFXLENBQUMsVUFBVSxDQUFDLE9BQU8sRUFBRSxNQUFNLENBQUMsQ0FBQztRQUcxRCxJQUFJLENBQUMsSUFBSSxFQUFFO1lBQ1AsT0FBTyxJQUFJLENBQUMsSUFBSSxLQUFLLEVBQUUsRUFBRSxJQUFJLHNCQUFZLENBQUMsRUFBRSxJQUFJLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxJQUFBLHFCQUFXLEVBQUMsUUFBUSxFQUFFLHFCQUFXLENBQUMsT0FBTyxDQUFDLEVBQUMsQ0FBQyxDQUFDLE1BQU0sRUFBRSxDQUFDLENBQUM7U0FDdEg7UUFFRCxHQUFHLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQztRQUVoQixNQUFNLE1BQU0sR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBRW5DLElBQUksQ0FBQyxNQUFNLEVBQUU7WUFDVCxPQUFPLElBQUksQ0FBQyxJQUFJLEtBQUssRUFBRSxFQUFFLElBQUksc0JBQVksQ0FBQyxFQUFFLElBQUksRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLElBQUEscUJBQVcsRUFBQyxRQUFRLEVBQUUscUJBQVcsQ0FBQyxPQUFPLENBQUMsRUFBQyxDQUFDLENBQUMsTUFBTSxFQUFFLENBQUMsQ0FBQztTQUN0SDtRQUVELEdBQUcsQ0FBQyxNQUFNLEdBQUcsTUFBTSxDQUFDO1FBRXBCLElBQUksRUFBRSxDQUFDO0lBQ1gsQ0FBQztDQUNKIn0=