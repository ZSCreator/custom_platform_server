import { Application } from 'pinus';
import JsonMgr = require('../../../config/data/JsonMgr');
import RoomManagerDao from '../../common/dao/daoManager/Room.manager';
import JsonConfig = require('../../pojo/JsonConfig');
// 机器人服务器生命周期
import robotServerController = require('../../servers/robot/lib/robotServerController');
/**
 *  RPC服务:机器人拓展方法
 * @type {{funcName:Function}}
 * @Desc 2019年4月3日 机器人服务分离，抽离封装公共方法
 */

export default class expandingMethod {

    static MessageDispatch(Message_Id: number, app: Application, data: any) {
        switch (Message_Id) {
            case 1000:
                return this.resetRobotMonitor(data);
                break;
            case 1001:
                return this.initJsonConfig(app);
                break;
            case 1003:
                return this.maintenance(app, data);
                break;
            default:
                break;
        }
        return "err";
    }

    static async resetRobotMonitor(systemConfig) {
        // 重设机器人数量的监视器
        // console.log('重设机器人数量的监视器',systemConfig);
        // robotCommonOp.resetAddRobotInterval(systemConfig);
        return;
    }
    //robot_info
    static async initJsonConfig(app: Application) {
        try {
            JsonMgr.init();
            return { err: false };
        } catch (e) {
            return { err: e };
        }
    }
    /**
     * 运维测试服务端
     */
    static async maintenance(app: Application, timestamp: number) {
        const serverName: string = app.getServerType();
        const gameConfigIdx = JsonConfig.get_games_all().findIndex(m => m.serverName == serverName);
        let playerCountInfo = { total_player_num: 0, reality_player_num: 0, robot_player_num: 0 };
        if (gameConfigIdx >= 0) {
            const { nid } = JsonConfig.get_games_all()[gameConfigIdx];
            /** 获取所有打开的房间 */
            let roomList = await RoomManagerDao.findList({nid:nid},true);
            /** 汇总玩家 */
            playerCountInfo = roomList.reduce((result, roomInfo) => {
                // roomInfo.users.forEach(userInfo => {
                //     result.total_player_num += 1;
                //     userInfo.isRobot === 2 ? result.robot_player_num += 1 : result.reality_player_num += 1;
                // });
                return result;
            }, playerCountInfo);
        }
        return { time: (Date.now() - timestamp), remoteName: serverName, playerCountInfo };

    }
}
