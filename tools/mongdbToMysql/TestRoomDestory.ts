
import { RDSClient } from "../../app/common/dao/mysql/lib/RDSClient";
import ConnectionManager from "../../app/common/dao/mysql/lib/connectionManager";
import { PlayerAgent } from "../../app/common/dao/mysql/entity/PlayerAgent.entity";
import PlayerAgentMysqlDao from "../../app/common/dao/mysql/PlayerAgent.mysql.dao";
import PlayerMysqlDao from "../../app/common/dao/mysql/Player.mysql.dao";
import PlatformNameAgentListRedisDao from "../../app/common/dao/redis/PlatformNameAgentList.redis.dao";
import GameRecordDateTableDao from "../../app/common/dao/mysql/GameRecordDateTable.mysql.dao";
import GatePlayerService from "../../app/servers/gate/lib/services/GatePlayerService";
import * as moment from "moment";
import { LANGUAGE_LIST } from "../../app/consts/hallConst";
import PlatformNameAgentListMysqlDao from "../../app/common/dao/mysql/PlatformNameAgentList.mysql.dao";
import { createPlateform, createAgent, createPlayer } from "../../app/servers/robot/lib/AiAutoCreat";

RDSClient.demoInit();
async function clean() {
    return;
}



async function ss() {
    const { uid } = await createPlateform("tom");
    const { agentUid, agentName } = await createAgent("tom", uid, "MeIsTom_1");

    //查找该代理下面有多少玩家
    const sql = `SELECT COUNT(Sp_Player.id) as playerLength FROM  Sp_Player  WHERE Sp_Player.groupRemark = "${agentName}"`;
    const res = await ConnectionManager
        .getConnection(true)
        .query(sql);
    //总共在这个分代下面创建多少个玩家
    let playerNum = 5;
    let lastNum = playerNum - res[0].playerLength;
    //循环创建玩家个数
    for (let i = lastNum; i < playerNum; i++) {
        await createPlayer(uid, agentUid, agentName);
    }
    const list = await PlayerMysqlDao.findList({ group_id: uid });
    let lists = list.map(c => c.group_id);
    console.warn("流程完成")
    process.exit();
    return;
}

setTimeout(ss, 5000);