'use strict';
import PlayerManagerDao from '../../common/dao/daoManager/Player.manager';


/**修改断线重连状态 */
export async function setOffLineData(uid: string) {
    try {
        await PlayerManagerDao.updateOne({uid}, {kickedOutRoom:true , abnormalOffline : false});
    } catch (error) {
        console.log(error)
    }
};


