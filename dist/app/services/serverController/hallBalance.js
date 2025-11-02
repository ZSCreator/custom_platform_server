"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.routeHall = void 0;
const commonUtil = require("../../utils/lottery/commonUtil");
const logService = require("../common/logService");
const pinus_logger_1 = require("pinus-logger");
const RoleEnum_1 = require("../../common/constant/player/RoleEnum");
const logger = (0, pinus_logger_1.getLogger)('server_out', __filename);
async function routeHall(session, msg, app, cb) {
    try {
        const serverType = msg.serverType;
        let hallServers = app.getServersByType(serverType);
        if (!hallServers || !hallServers.length) {
            return cb(new Error(`can not find ${serverType} servers.`));
        }
        hallServers.sort((a, b) => {
            return parseInt(a.id.split('-').pop()) - parseInt(b.id.split('-').pop());
        });
        const isRobot = session ? session.get('isRobot') : RoleEnum_1.RoleEnum.REAL_PLAYER;
        if (hallServers.length === 1) {
            return cb(null, hallServers[0].id);
        }
        const { route } = msg.args[0];
        const serverDis = await dispatcherForHallPayHandlerGetPayOrder(route, hallServers);
        if (serverDis) {
            return cb(null, serverDis);
        }
        let connectorLength = hallServers.length;
        let connector_start_ = connectorLength / 2 - 1;
        let connector_end_ = connectorLength - 1;
        if (isRobot !== RoleEnum_1.RoleEnum.ROBOT) {
            connector_start_ = 0;
            connector_end_ = connectorLength / 2 - 1;
        }
        let less = commonUtil.randomFromRange(connector_start_, connector_end_);
        const hallServerID = hallServers[less].id;
        logService.logHallRoute(`uid: ${session ? session.uid : '无'}|isRobot: ${isRobot || 0}|${session ? session.frontendId : '无'}|${hallServerID}`);
        return cb(null, hallServerID);
    }
    catch (error) {
        logger.error(`${app.getServerId()}|routeHall ${error}`);
        return cb(error);
    }
}
exports.routeHall = routeHall;
;
async function dispatcherForHallPayHandlerGetPayOrder(route, hallServers) {
    if (route !== 'hall.payHandler.getPayOrder')
        return false;
    return hallServers[0].id;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaGFsbEJhbGFuY2UuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9hcHAvc2VydmljZXMvc2VydmVyQ29udHJvbGxlci9oYWxsQmFsYW5jZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFHQSw2REFBOEQ7QUFDOUQsbURBQW9EO0FBQ3BELCtDQUF5QztBQUN6QyxvRUFBaUU7QUFDakUsTUFBTSxNQUFNLEdBQUcsSUFBQSx3QkFBUyxFQUFDLFlBQVksRUFBRSxVQUFVLENBQUMsQ0FBQztBQUk1QyxLQUFLLFVBQVUsU0FBUyxDQUFDLE9BQXVCLEVBQUUsR0FBUSxFQUFFLEdBQWdCLEVBQUUsRUFBRTtJQUVuRixJQUFJO1FBQ0EsTUFBTSxVQUFVLEdBQUcsR0FBRyxDQUFDLFVBQVUsQ0FBQztRQUNsQyxJQUFJLFdBQVcsR0FBRyxHQUFHLENBQUMsZ0JBQWdCLENBQUMsVUFBVSxDQUFDLENBQUM7UUFDbkQsSUFBSSxDQUFDLFdBQVcsSUFBSSxDQUFDLFdBQVcsQ0FBQyxNQUFNLEVBQUU7WUFDckMsT0FBTyxFQUFFLENBQUMsSUFBSSxLQUFLLENBQUMsZ0JBQWdCLFVBQVUsV0FBVyxDQUFDLENBQUMsQ0FBQztTQUMvRDtRQUVELFdBQVcsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUU7WUFDdEIsT0FBTyxRQUFRLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUMsR0FBRyxRQUFRLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQztRQUM3RSxDQUFDLENBQUMsQ0FBQztRQUVILE1BQU0sT0FBTyxHQUFHLE9BQU8sQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsbUJBQVEsQ0FBQyxXQUFXLENBQUM7UUFHeEUsSUFBSSxXQUFXLENBQUMsTUFBTSxLQUFLLENBQUMsRUFBRTtZQUMxQixPQUFPLEVBQUUsQ0FBQyxJQUFJLEVBQUUsV0FBVyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDO1NBQ3RDO1FBRUQsTUFBTSxFQUFFLEtBQUssRUFBRSxHQUFHLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDOUIsTUFBTSxTQUFTLEdBQUcsTUFBTSxzQ0FBc0MsQ0FBQyxLQUFLLEVBQUUsV0FBVyxDQUFDLENBQUM7UUFDbkYsSUFBSSxTQUFTLEVBQUU7WUFDWCxPQUFPLEVBQUUsQ0FBQyxJQUFJLEVBQUUsU0FBUyxDQUFDLENBQUM7U0FDOUI7UUFFRCxJQUFJLGVBQWUsR0FBRyxXQUFXLENBQUMsTUFBTSxDQUFDO1FBQ3pDLElBQUksZ0JBQWdCLEdBQUcsZUFBZSxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUM7UUFDL0MsSUFBSSxjQUFjLEdBQUcsZUFBZSxHQUFHLENBQUMsQ0FBQztRQUV6QyxJQUFJLE9BQU8sS0FBSyxtQkFBUSxDQUFDLEtBQUssRUFBRTtZQUM1QixnQkFBZ0IsR0FBRyxDQUFDLENBQUM7WUFDckIsY0FBYyxHQUFHLGVBQWUsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1NBQzVDO1FBRUQsSUFBSSxJQUFJLEdBQUcsVUFBVSxDQUFDLGVBQWUsQ0FBQyxnQkFBZ0IsRUFBRSxjQUFjLENBQUMsQ0FBQztRQUN4RSxNQUFNLFlBQVksR0FBRyxXQUFXLENBQUMsSUFBSSxDQUFDLENBQUMsRUFBRSxDQUFDO1FBQzFDLFVBQVUsQ0FBQyxZQUFZLENBQUMsUUFBUSxPQUFPLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsYUFBYSxPQUFPLElBQUksQ0FBQyxJQUFJLE9BQU8sQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLFlBQVksRUFBRSxDQUFDLENBQUM7UUFDOUksT0FBTyxFQUFFLENBQUMsSUFBSSxFQUFFLFlBQVksQ0FBQyxDQUFDO0tBQ2pDO0lBQUMsT0FBTyxLQUFLLEVBQUU7UUFDWixNQUFNLENBQUMsS0FBSyxDQUFDLEdBQUcsR0FBRyxDQUFDLFdBQVcsRUFBRSxjQUFjLEtBQUssRUFBRSxDQUFDLENBQUM7UUFDeEQsT0FBTyxFQUFFLENBQUMsS0FBSyxDQUFDLENBQUM7S0FDcEI7QUFDTCxDQUFDO0FBM0NELDhCQTJDQztBQUFBLENBQUM7QUFTRixLQUFLLFVBQVUsc0NBQXNDLENBQUMsS0FBYSxFQUFFLFdBQWdCO0lBQ2pGLElBQUksS0FBSyxLQUFLLDZCQUE2QjtRQUFFLE9BQU8sS0FBSyxDQUFDO0lBRTFELE9BQU8sV0FBVyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQztBQUM3QixDQUFDIn0=