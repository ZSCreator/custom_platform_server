// 负载均衡相关
import { pinus, ServerInfo } from 'pinus';
import commonUtil = require('../../../../utils/lottery/commonUtil');
import dispatcher = require('../../../../utils/dispatcher');
import { getLogger } from 'pinus-logger';
const Logger = getLogger('server_out', __filename);

/**
 * connector 负载均衡：
 * 1.若无多台 connector，均经同一台 connector；
 * 2.若有多台 connector，第一台供真实玩家使用，其他的供机器人使用
 * */
export async function dispatchConnectorByStatistics(uid : string ,serverType: string = 'connector' , isRobot: boolean = false,) {
    const servers = pinus.app.getServersByType(serverType);
    if (!servers || !servers.length) {
        return;
    }
    try {
        // 按照 server.id 最后一位的数字按升序排列
        servers.sort((a, b) => {
            return parseInt(a.id.split('-').pop()) - parseInt(b.id.split('-').pop());
        });
        const connectorLength = servers.length;
        // 以下均是机器人
        if (connectorLength === 1) {
            // 只有一台 connecto
            return getHostAndPort(servers[0]);
        } else {
            let connector_start_ = connectorLength / 2;
            let connector_end_ = connectorLength;
            if (!isRobot) {
                connector_start_ = 0;
                connector_end_ = connectorLength / 2;
            }
            let Server_one = dispatcher.dispatch(uid, servers.slice(connector_start_, connector_end_));
            return getHostAndPort(Server_one, connector_start_ != 0);
        }
    } catch (error) {
        Logger.error('loadBalance.dispatchConnectorByStatistics ==>', error);
        return defaultConnectorDispatch(servers);
    }
}

// 默认的分配方式
function defaultConnectorDispatch(servers: ServerInfo[]) {
    return getHostAndPort(servers[commonUtil.randomFromRange(0, servers.length - 1)]);
}

// 根据是否有机器人和connector的配置来返回 host 和 port
function getHostAndPort(connector: any, playerRobot = true) {
    if (!connector) {
        return;
    }
    const hostAndPort: { host: string, port: number } = { host: connector.clientHost, port: connector.clientPort };
    // 不是机器人
    if (playerRobot) {
        hostAndPort.host = connector.localHost || connector.clientHost;
    }
    return hostAndPort
}