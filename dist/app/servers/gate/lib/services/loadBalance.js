"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dispatchConnectorByStatistics = void 0;
const pinus_1 = require("pinus");
const commonUtil = require("../../../../utils/lottery/commonUtil");
const dispatcher = require("../../../../utils/dispatcher");
const pinus_logger_1 = require("pinus-logger");
const Logger = (0, pinus_logger_1.getLogger)('server_out', __filename);
async function dispatchConnectorByStatistics(uid, serverType = 'connector', isRobot = false) {
    const servers = pinus_1.pinus.app.getServersByType(serverType);
    if (!servers || !servers.length) {
        return;
    }
    try {
        servers.sort((a, b) => {
            return parseInt(a.id.split('-').pop()) - parseInt(b.id.split('-').pop());
        });
        const connectorLength = servers.length;
        if (connectorLength === 1) {
            return getHostAndPort(servers[0]);
        }
        else {
            let connector_start_ = connectorLength / 2;
            let connector_end_ = connectorLength;
            if (!isRobot) {
                connector_start_ = 0;
                connector_end_ = connectorLength / 2;
            }
            let Server_one = dispatcher.dispatch(uid, servers.slice(connector_start_, connector_end_));
            return getHostAndPort(Server_one, connector_start_ != 0);
        }
    }
    catch (error) {
        Logger.error('loadBalance.dispatchConnectorByStatistics ==>', error);
        return defaultConnectorDispatch(servers);
    }
}
exports.dispatchConnectorByStatistics = dispatchConnectorByStatistics;
function defaultConnectorDispatch(servers) {
    return getHostAndPort(servers[commonUtil.randomFromRange(0, servers.length - 1)]);
}
function getHostAndPort(connector, playerRobot = true) {
    if (!connector) {
        return;
    }
    const hostAndPort = { host: connector.clientHost, port: connector.clientPort };
    if (playerRobot) {
        hostAndPort.host = connector.localHost || connector.clientHost;
    }
    return hostAndPort;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibG9hZEJhbGFuY2UuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9hcHAvc2VydmVycy9nYXRlL2xpYi9zZXJ2aWNlcy9sb2FkQmFsYW5jZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFDQSxpQ0FBMEM7QUFDMUMsbUVBQW9FO0FBQ3BFLDJEQUE0RDtBQUM1RCwrQ0FBeUM7QUFDekMsTUFBTSxNQUFNLEdBQUcsSUFBQSx3QkFBUyxFQUFDLFlBQVksRUFBRSxVQUFVLENBQUMsQ0FBQztBQU81QyxLQUFLLFVBQVUsNkJBQTZCLENBQUMsR0FBWSxFQUFFLGFBQXFCLFdBQVcsRUFBRyxVQUFtQixLQUFLO0lBQ3pILE1BQU0sT0FBTyxHQUFHLGFBQUssQ0FBQyxHQUFHLENBQUMsZ0JBQWdCLENBQUMsVUFBVSxDQUFDLENBQUM7SUFDdkQsSUFBSSxDQUFDLE9BQU8sSUFBSSxDQUFDLE9BQU8sQ0FBQyxNQUFNLEVBQUU7UUFDN0IsT0FBTztLQUNWO0lBQ0QsSUFBSTtRQUVBLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUU7WUFDbEIsT0FBTyxRQUFRLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUMsR0FBRyxRQUFRLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQztRQUM3RSxDQUFDLENBQUMsQ0FBQztRQUNILE1BQU0sZUFBZSxHQUFHLE9BQU8sQ0FBQyxNQUFNLENBQUM7UUFFdkMsSUFBSSxlQUFlLEtBQUssQ0FBQyxFQUFFO1lBRXZCLE9BQU8sY0FBYyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1NBQ3JDO2FBQU07WUFDSCxJQUFJLGdCQUFnQixHQUFHLGVBQWUsR0FBRyxDQUFDLENBQUM7WUFDM0MsSUFBSSxjQUFjLEdBQUcsZUFBZSxDQUFDO1lBQ3JDLElBQUksQ0FBQyxPQUFPLEVBQUU7Z0JBQ1YsZ0JBQWdCLEdBQUcsQ0FBQyxDQUFDO2dCQUNyQixjQUFjLEdBQUcsZUFBZSxHQUFHLENBQUMsQ0FBQzthQUN4QztZQUNELElBQUksVUFBVSxHQUFHLFVBQVUsQ0FBQyxRQUFRLENBQUMsR0FBRyxFQUFFLE9BQU8sQ0FBQyxLQUFLLENBQUMsZ0JBQWdCLEVBQUUsY0FBYyxDQUFDLENBQUMsQ0FBQztZQUMzRixPQUFPLGNBQWMsQ0FBQyxVQUFVLEVBQUUsZ0JBQWdCLElBQUksQ0FBQyxDQUFDLENBQUM7U0FDNUQ7S0FDSjtJQUFDLE9BQU8sS0FBSyxFQUFFO1FBQ1osTUFBTSxDQUFDLEtBQUssQ0FBQywrQ0FBK0MsRUFBRSxLQUFLLENBQUMsQ0FBQztRQUNyRSxPQUFPLHdCQUF3QixDQUFDLE9BQU8sQ0FBQyxDQUFDO0tBQzVDO0FBQ0wsQ0FBQztBQTdCRCxzRUE2QkM7QUFHRCxTQUFTLHdCQUF3QixDQUFDLE9BQXFCO0lBQ25ELE9BQU8sY0FBYyxDQUFDLE9BQU8sQ0FBQyxVQUFVLENBQUMsZUFBZSxDQUFDLENBQUMsRUFBRSxPQUFPLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUN0RixDQUFDO0FBR0QsU0FBUyxjQUFjLENBQUMsU0FBYyxFQUFFLFdBQVcsR0FBRyxJQUFJO0lBQ3RELElBQUksQ0FBQyxTQUFTLEVBQUU7UUFDWixPQUFPO0tBQ1Y7SUFDRCxNQUFNLFdBQVcsR0FBbUMsRUFBRSxJQUFJLEVBQUUsU0FBUyxDQUFDLFVBQVUsRUFBRSxJQUFJLEVBQUUsU0FBUyxDQUFDLFVBQVUsRUFBRSxDQUFDO0lBRS9HLElBQUksV0FBVyxFQUFFO1FBQ2IsV0FBVyxDQUFDLElBQUksR0FBRyxTQUFTLENBQUMsU0FBUyxJQUFJLFNBQVMsQ0FBQyxVQUFVLENBQUM7S0FDbEU7SUFDRCxPQUFPLFdBQVcsQ0FBQTtBQUN0QixDQUFDIn0=