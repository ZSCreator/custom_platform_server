"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const RDSClient_1 = require("../../app/common/dao/mysql/lib/RDSClient");
const connectionManager_1 = require("../../app/common/dao/mysql/lib/connectionManager");
const OnlinePlayer_redis_dao_1 = require("../../app/common/dao/redis/OnlinePlayer.redis.dao");
const Player_redis_dao_1 = require("../../app/common/dao/redis/Player.redis.dao");
async function clean() {
    console.warn(`开始执行重复uid 的玩家`);
    let sql = "SELECT Sp_Player.pk_uid , Sp_Player.gold, Sp_Player.groupRemark  FROM Sp_Player WHERE pk_uid in (select pk_uid from Sp_Player GROUP BY pk_uid HAVING count(pk_uid) > 1) ORDER BY pk_uid;";
    const allGameTables = await connectionManager_1.default.getConnection(true).query(sql);
    console.warn("总共重复uid的玩家长度：", allGameTables.length);
    for (let player of allGameTables) {
        if (player.gold < 100) {
            const onLinePlayer = await OnlinePlayer_redis_dao_1.default.findOne({ uid: player.pk_uid });
            if (onLinePlayer) {
                console.warn(`玩家uid:${player.pk_uid}在线不能进行更换uid`);
                continue;
            }
            console.warn(`玩家uid:${player.pk_uid}的金币少于1,可以进行删除`);
            let deletePlayerSql = ` DELETE FROM Sp_Player  WHERE Sp_Player.pk_uid =  ${player.pk_uid}`;
            let deletePlayerAgentSql = `DELETE  FROM Sp_Player_Agent  WHERE Sp_Player_Agent.fk_uid = ${player.pk_uid} AND Sp_Player_Agent.role_type = 1 `;
            await connectionManager_1.default.getConnection().query(deletePlayerSql);
            await connectionManager_1.default.getConnection().query(deletePlayerAgentSql);
            await Player_redis_dao_1.default.delete({ uid: player.pk_uid });
        }
    }
    return;
}
async function deletePlayerByUid(uid, group) {
    console.warn('删除玩家: ', uid, group);
    let deletePlayerSql = ` DELETE FROM Sp_Player  WHERE Sp_Player.pk_uid =  ${uid} AND Sp_Player.groupRemark = "${group}"`;
    let deletePlayerAgentSql = `DELETE  FROM Sp_Player_Agent  WHERE Sp_Player_Agent.fk_uid = ${uid} AND Sp_Player_Agent.role_type = 1 `;
    await connectionManager_1.default.getConnection().query(deletePlayerSql);
    await connectionManager_1.default.getConnection().query(deletePlayerAgentSql);
    await Player_redis_dao_1.default.delete({ uid });
}
async function exec() {
    await RDSClient_1.RDSClient.demoInit();
    const args = process.argv.splice(2);
    const uid = args[0];
    const group = args[1];
    if (!!uid && !!group) {
        await deletePlayerByUid(uid, group);
    }
    else {
        await clean();
    }
    console.warn(`执行完成`);
    process.exit();
}
exec();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2xlYXJSZXBlYXRQbGF5ZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi90b29scy9tb25nZGJUb015c3FsL2NsZWFyUmVwZWF0UGxheWVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsd0VBQXFFO0FBQ3JFLHdGQUFpRjtBQUNqRiw4RkFBdUY7QUFDdkYsa0ZBQXlFO0FBR3pFLEtBQUssVUFBVSxLQUFLO0lBQ2hCLE9BQU8sQ0FBQyxJQUFJLENBQUMsZUFBZSxDQUFDLENBQUM7SUFDOUIsSUFBSSxHQUFHLEdBQUcsMExBQTBMLENBQUM7SUFDck0sTUFBTSxhQUFhLEdBQUcsTUFBTSwyQkFBaUIsQ0FBQyxhQUFhLENBQUMsSUFBSSxDQUFDLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0lBQzdFLE9BQU8sQ0FBQyxJQUFJLENBQUMsZUFBZSxFQUFFLGFBQWEsQ0FBQyxNQUFNLENBQUMsQ0FBQztJQUVwRCxLQUFJLElBQUksTUFBTSxJQUFJLGFBQWEsRUFBQztRQUM1QixJQUFHLE1BQU0sQ0FBQyxJQUFJLEdBQUcsR0FBRyxFQUFFO1lBQ2xCLE1BQU0sWUFBWSxHQUFHLE1BQU0sZ0NBQXNCLENBQUMsT0FBTyxDQUFDLEVBQUMsR0FBRyxFQUFFLE1BQU0sQ0FBQyxNQUFNLEVBQUUsQ0FBQyxDQUFDO1lBRWpGLElBQUcsWUFBWSxFQUFDO2dCQUNaLE9BQU8sQ0FBQyxJQUFJLENBQUMsU0FBUyxNQUFNLENBQUMsTUFBTyxhQUFhLENBQUMsQ0FBQztnQkFDbkQsU0FBUzthQUNaO1lBRUQsT0FBTyxDQUFDLElBQUksQ0FBQyxTQUFTLE1BQU0sQ0FBQyxNQUFPLGVBQWUsQ0FBQyxDQUFDO1lBQ3JELElBQUksZUFBZSxHQUFHLHFEQUFxRCxNQUFNLENBQUMsTUFBTSxFQUFFLENBQUM7WUFDM0YsSUFBSSxvQkFBb0IsR0FBRyxnRUFBZ0UsTUFBTSxDQUFDLE1BQU0scUNBQXFDLENBQUM7WUFFOUksTUFBTSwyQkFBaUIsQ0FBQyxhQUFhLEVBQUUsQ0FBQyxLQUFLLENBQUMsZUFBZSxDQUFDLENBQUM7WUFFL0QsTUFBTSwyQkFBaUIsQ0FBQyxhQUFhLEVBQUUsQ0FBQyxLQUFLLENBQUMsb0JBQW9CLENBQUMsQ0FBQztZQUNwRSxNQUFNLDBCQUFjLENBQUMsTUFBTSxDQUFDLEVBQUMsR0FBRyxFQUFFLE1BQU0sQ0FBQyxNQUFNLEVBQUMsQ0FBQyxDQUFDO1NBQ3JEO0tBQ0o7SUFFRCxPQUFPO0FBQ1gsQ0FBQztBQUVELEtBQUssVUFBVSxpQkFBaUIsQ0FBQyxHQUFHLEVBQUUsS0FBSztJQUN2QyxPQUFPLENBQUMsSUFBSSxDQUFDLFFBQVEsRUFBRSxHQUFHLEVBQUUsS0FBSyxDQUFDLENBQUM7SUFDbkMsSUFBSSxlQUFlLEdBQUcscURBQXFELEdBQUcsaUNBQWlDLEtBQUssR0FBRyxDQUFDO0lBQ3hILElBQUksb0JBQW9CLEdBQUcsZ0VBQWdFLEdBQUcscUNBQXFDLENBQUM7SUFFcEksTUFBTSwyQkFBaUIsQ0FBQyxhQUFhLEVBQUUsQ0FBQyxLQUFLLENBQUMsZUFBZSxDQUFDLENBQUM7SUFFL0QsTUFBTSwyQkFBaUIsQ0FBQyxhQUFhLEVBQUUsQ0FBQyxLQUFLLENBQUMsb0JBQW9CLENBQUMsQ0FBQztJQUNwRSxNQUFNLDBCQUFjLENBQUMsTUFBTSxDQUFDLEVBQUMsR0FBRyxFQUFDLENBQUMsQ0FBQztBQUN2QyxDQUFDO0FBRUQsS0FBSyxVQUFVLElBQUk7SUFDZixNQUFNLHFCQUFTLENBQUMsUUFBUSxFQUFFLENBQUM7SUFDM0IsTUFBTSxJQUFJLEdBQUcsT0FBTyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFFcEMsTUFBTSxHQUFHLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQ3BCLE1BQU0sS0FBSyxHQUFHLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUV0QixJQUFJLENBQUMsQ0FBQyxHQUFHLElBQUssQ0FBQyxDQUFDLEtBQUssRUFBRTtRQUNuQixNQUFNLGlCQUFpQixDQUFDLEdBQUcsRUFBRSxLQUFLLENBQUMsQ0FBQztLQUN2QztTQUFNO1FBQ0gsTUFBTSxLQUFLLEVBQUUsQ0FBQztLQUNqQjtJQUVELE9BQU8sQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7SUFDckIsT0FBTyxDQUFDLElBQUksRUFBRSxDQUFDO0FBQ25CLENBQUM7QUFFRCxJQUFJLEVBQUUsQ0FBQyJ9