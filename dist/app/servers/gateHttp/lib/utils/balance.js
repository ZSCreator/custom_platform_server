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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYmFsYW5jZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL2FwcC9zZXJ2ZXJzL2dhdGVIdHRwL2xpYi91dGlscy9iYWxhbmNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUVBLGlDQUEwQztBQUMxQyxtRUFBb0U7QUFDcEUsMkRBQTREO0FBQzVELCtDQUF5QztBQUN6QyxNQUFNLE1BQU0sR0FBRyxJQUFBLHdCQUFTLEVBQUMsWUFBWSxFQUFFLFVBQVUsQ0FBQyxDQUFDO0FBTzVDLEtBQUssVUFBVSw2QkFBNkIsQ0FBQyxHQUFZLEVBQUUsYUFBcUIsV0FBVyxFQUFHLFVBQW1CLEtBQUs7SUFDekgsTUFBTSxPQUFPLEdBQUcsYUFBSyxDQUFDLEdBQUcsQ0FBQyxnQkFBZ0IsQ0FBQyxVQUFVLENBQUMsQ0FBQztJQUN2RCxJQUFJLENBQUMsT0FBTyxJQUFJLENBQUMsT0FBTyxDQUFDLE1BQU0sRUFBRTtRQUM3QixPQUFPO0tBQ1Y7SUFDRCxJQUFJO1FBRUEsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRTtZQUNsQixPQUFPLFFBQVEsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxHQUFHLFFBQVEsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFDO1FBQzdFLENBQUMsQ0FBQyxDQUFDO1FBQ0gsTUFBTSxlQUFlLEdBQUcsT0FBTyxDQUFDLE1BQU0sQ0FBQztRQUV2QyxJQUFJLGVBQWUsS0FBSyxDQUFDLEVBQUU7WUFFdkIsT0FBTyxjQUFjLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7U0FDckM7YUFBTTtZQUNILElBQUksZ0JBQWdCLEdBQUcsZUFBZSxHQUFHLENBQUMsQ0FBQztZQUMzQyxJQUFJLGNBQWMsR0FBRyxlQUFlLENBQUM7WUFDckMsSUFBSSxDQUFDLE9BQU8sRUFBRTtnQkFDVixnQkFBZ0IsR0FBRyxDQUFDLENBQUM7Z0JBQ3JCLGNBQWMsR0FBRyxlQUFlLEdBQUcsQ0FBQyxDQUFDO2FBQ3hDO1lBQ0QsSUFBSSxVQUFVLEdBQUcsVUFBVSxDQUFDLFFBQVEsQ0FBQyxHQUFHLEVBQUUsT0FBTyxDQUFDLEtBQUssQ0FBQyxnQkFBZ0IsRUFBRSxjQUFjLENBQUMsQ0FBQyxDQUFDO1lBQzNGLE9BQU8sY0FBYyxDQUFDLFVBQVUsRUFBRSxnQkFBZ0IsSUFBSSxDQUFDLENBQUMsQ0FBQztTQUM1RDtLQUNKO0lBQUMsT0FBTyxLQUFLLEVBQUU7UUFDWixNQUFNLENBQUMsS0FBSyxDQUFDLCtDQUErQyxFQUFFLEtBQUssQ0FBQyxDQUFDO1FBQ3JFLE9BQU8sd0JBQXdCLENBQUMsT0FBTyxDQUFDLENBQUM7S0FDNUM7QUFDTCxDQUFDO0FBN0JELHNFQTZCQztBQUdELFNBQVMsd0JBQXdCLENBQUMsT0FBcUI7SUFDbkQsT0FBTyxjQUFjLENBQUMsT0FBTyxDQUFDLFVBQVUsQ0FBQyxlQUFlLENBQUMsQ0FBQyxFQUFFLE9BQU8sQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQ3RGLENBQUM7QUFHRCxTQUFTLGNBQWMsQ0FBQyxTQUFjLEVBQUUsV0FBVyxHQUFHLElBQUk7SUFDdEQsSUFBSSxDQUFDLFNBQVMsRUFBRTtRQUNaLE9BQU87S0FDVjtJQUNELE1BQU0sV0FBVyxHQUFtQyxFQUFFLElBQUksRUFBRSxTQUFTLENBQUMsVUFBVSxFQUFFLElBQUksRUFBRSxTQUFTLENBQUMsVUFBVSxFQUFFLENBQUM7SUFFL0csSUFBSSxXQUFXLEVBQUU7UUFDYixXQUFXLENBQUMsSUFBSSxHQUFHLFNBQVMsQ0FBQyxTQUFTLElBQUksU0FBUyxDQUFDLFVBQVUsQ0FBQztLQUNsRTtJQUNELE9BQU8sV0FBVyxDQUFBO0FBQ3RCLENBQUMifQ==