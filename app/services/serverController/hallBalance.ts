// 大厅服务器负载均衡
import { Application, BackendSession } from 'pinus';
import hallConst = require('../../consts/hallConst');
import commonUtil = require('../../utils/lottery/commonUtil');
import logService = require('../common/logService');
import { getLogger } from 'pinus-logger';
import { RoleEnum } from '../../common/constant/player/RoleEnum';
const logger = getLogger('server_out', __filename);


/**大厅服务器路由策略 */
export async function routeHall(session: BackendSession, msg: any, app: Application, cb) {
    // 玩家独立大厅进程服务器的策略
    try {
        const serverType = msg.serverType;
        let hallServers = app.getServersByType(serverType);
        if (!hallServers || !hallServers.length) {
            return cb(new Error(`can not find ${serverType} servers.`));
        }
        // 按照 server.id 最后一位的数字按升序排列
        hallServers.sort((a, b) => {
            return parseInt(a.id.split('-').pop()) - parseInt(b.id.split('-').pop());
        });
        // 有些 rpc 并没有传 session
        const isRobot = session ? session.get('isRobot') : RoleEnum.REAL_PLAYER;

        // 机器人或者只有一个大厅服务器，使用 hall-server-1
        if (hallServers.length === 1) {
            return cb(null, hallServers[0].id);
        }
        /** 金币更新路由逻辑补丁 START */
        const { route } = msg.args[0];
        const serverDis = await dispatcherForHallPayHandlerGetPayOrder(route, hallServers);
        if (serverDis) {
            return cb(null, serverDis);
        }
        /** 金币更新路由逻辑补丁 END*/
        let connectorLength = hallServers.length;
        let connector_start_ = connectorLength / 2 - 1;
        let connector_end_ = connectorLength - 1;

        if (isRobot !== RoleEnum.ROBOT) {//正常玩家
            connector_start_ = 0;
            connector_end_ = connectorLength / 2 - 1;
        }

        let less = commonUtil.randomFromRange(connector_start_, connector_end_);
        const hallServerID = hallServers[less].id;
        logService.logHallRoute(`uid: ${session ? session.uid : '无'}|isRobot: ${isRobot || 0}|${session ? session.frontendId : '无'}|${hallServerID}`);
        return cb(null, hallServerID);
    } catch (error) {
        logger.error(`${app.getServerId()}|routeHall ${error}`);
        return cb(error);
    }
};

/**
 * @param {string} route 当前调用的路由
 * @return 返回服务名称 或 false
 * @author Andy
 * @dete 2019年11月18日
 * @description 针对金币更新问题，逻辑补丁，伪消息队列，当前端调用时改为默认调用 hall 较前的服务
 */
async function dispatcherForHallPayHandlerGetPayOrder(route: string, hallServers: any): Promise<string | false> {
    if (route !== 'hall.payHandler.getPayOrder') return false;
    // console.warn(`金币更新通知:${hallServers[0].id}`);
    return hallServers[0].id;
}