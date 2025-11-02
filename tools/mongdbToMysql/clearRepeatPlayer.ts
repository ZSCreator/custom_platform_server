import { RDSClient } from "../../app/common/dao/mysql/lib/RDSClient";
import ConnectionManager from "../../app/common/dao/mysql/lib/connectionManager";
import OnlinePlayerInRedisDao from "../../app/common/dao/redis/OnlinePlayer.redis.dao";
import PlayerRedisDao from "../../app/common/dao/redis/Player.redis.dao";


async function clean() {
    console.warn(`开始执行重复uid 的玩家`);
    let sql = "SELECT Sp_Player.pk_uid , Sp_Player.gold, Sp_Player.groupRemark  FROM Sp_Player WHERE pk_uid in (select pk_uid from Sp_Player GROUP BY pk_uid HAVING count(pk_uid) > 1) ORDER BY pk_uid;";
    const allGameTables = await ConnectionManager.getConnection(true).query(sql);
    console.warn("总共重复uid的玩家长度：", allGameTables.length);

    for(let player of allGameTables){
        if(player.gold < 100 ){
            const onLinePlayer = await OnlinePlayerInRedisDao.findOne({uid :player.pk_uid });
            // 判断玩家是否在线
            if(onLinePlayer){
                console.warn(`玩家uid:${player.pk_uid }在线不能进行更换uid`);
                continue;
            }

            console.warn(`玩家uid:${player.pk_uid }的金币少于1,可以进行删除`);
            let deletePlayerSql = ` DELETE FROM Sp_Player  WHERE Sp_Player.pk_uid =  ${player.pk_uid}`;
            let deletePlayerAgentSql = `DELETE  FROM Sp_Player_Agent  WHERE Sp_Player_Agent.fk_uid = ${player.pk_uid} AND Sp_Player_Agent.role_type = 1 `;
            // 删除玩家表 从主库删除
            await ConnectionManager.getConnection().query(deletePlayerSql);
            // 删除代理关系表 从主库删除
            await ConnectionManager.getConnection().query(deletePlayerAgentSql);
            await PlayerRedisDao.delete({uid: player.pk_uid});
        }
    }

    return;
}

async function deletePlayerByUid(uid, group) {
    console.warn('删除玩家: ', uid, group);
    let deletePlayerSql = ` DELETE FROM Sp_Player  WHERE Sp_Player.pk_uid =  ${uid} AND Sp_Player.groupRemark = "${group}"`;
    let deletePlayerAgentSql = `DELETE  FROM Sp_Player_Agent  WHERE Sp_Player_Agent.fk_uid = ${uid} AND Sp_Player_Agent.role_type = 1 `;
    // 删除玩家表 从主库删除
    await ConnectionManager.getConnection().query(deletePlayerSql);
    // 删除代理关系表 从主库删除
    await ConnectionManager.getConnection().query(deletePlayerAgentSql);
    await PlayerRedisDao.delete({uid});
}

async function exec() {
    await RDSClient.demoInit();
    const args = process.argv.splice(2);

    const uid = args[0];
    const group = args[1];

    if (!!uid  && !!group) {
        await deletePlayerByUid(uid, group);
    } else {
        await clean();
    }

    console.warn(`执行完成`);
    process.exit();
}

exec();