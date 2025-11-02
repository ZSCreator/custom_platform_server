import { RDSClient } from "../../app/common/dao/mysql/lib/RDSClient";
import ConnectionManager from "../../app/common/dao/mysql/lib/connectionManager";
import PlayerRedisDao from "../../app/common/dao/redis/Player.redis.dao";
import OnlinePlayerDao from "../../app/common/dao/redis/OnlinePlayer.redis.dao";
import { lock, unlock } from "../../app/common/dao/redis/lib/redisManager";
import { PlayerInRedis } from "../../app/common/dao/redis/entity/player.entity";
RDSClient.demoInit();
async function clean() {
    console.warn(`开始执行时间：${new Date()}`);
    //第一步先在redis 加入假的在线玩家信息
    // const sql = 'SELECT Sp_Player.pk_uid FROM  Sp_Player  WHERE Sp_Player.createTime > "2021-09-01 00:00:00"  AND  Sp_Player.createTime < "2021-09-02 00:00:00" Limit 300';
    // const result =  await await ConnectionManager
    //     .getConnection(true)
    //     .query(sql);
    //
    // for(let key of result){
    //     console.warn('uid..',key.pk_uid);
    //     await OnlinePlayerDao.insertOne( { uid: key.pk_uid, nid: '1', sceneId : 1, isRobot:0 });
    //     await PlayerRedisDao.insertOne({uid: key.pk_uid,dailyFlow:100})
    // }

    //第二部清理数据库 1 先获取在线   2 清理数据库不在线的玩家今日码量 3 再一个一个清理在线玩家的码量和redis

    // const onlinePlayers  = await OnlinePlayerDao.findList({});
    // const uidList = [];
    // for(let player of onlinePlayers){
    //     uidList.push(player.uid);
    // }
    // const sql= `UPDATE Sp_Player p
    //           SET
    //             p.addDayRmb =
    //               (
    //               CASE WHEN p.gold > 0
    //               THEN
    //                 p.gold
    //               ELSE
    //                 0
    //               END),
    //             p.dailyFlow = 0,
    //             p.loginCount = 0,
    //             p.addDayTixian = 0
    //         WHERE p.dailyFlow > 0  AND p.pk_uid not in (${uidList})`;
    // await ConnectionManager.getConnection(true).query(sql);
    //
    // const uidInRedis = await PlayerRedisDao.getAllUid({});
    //
    // let uids= [];
    // for(let m of uidInRedis){
    //     uids.push(m.slice(-8));
    // }
    // let list = [];
    // for(let uid of uids){
    //     if(!uidList.includes(uid)){
    //         list.push(`Sp:player:${uid}`);
    //     }
    // }
    // await PlayerRedisDao.deleteUids(list);
    // let num = 0 ;
    // for(let uid of uidList){
    //     if(num == 300){
    //         console.warn(`结算时间：${new Date()}`);
    //         process.exit();
    //         return;
    //     }
    //     let _lock = null;
    //     try {
    //         _lock = await lock(uid);
    //         const sql = `
    //            UPDATE Sp_Player p
    //           SET
    //             p.addDayRmb =
    //               (
    //               CASE WHEN p.gold > 0
    //               THEN
    //                 p.gold
    //               ELSE
    //                 0
    //               END),
    //             p.dailyFlow = 0,
    //             p.loginCount = 0,
    //             p.addDayTixian = 0
    //         WHERE p.pk_uid = "${uid}"
    //         `;
    //         const res = await ConnectionManager
    //             .getConnection(true)
    //             .query(sql);
    //         const isSuccess = !!res.affectedRows;
    //         if (isSuccess) {
    //
    //             const p = await PlayerRedisDao.findOne({ uid });
    //
    //             if (p) {
    //                 p.addDayRmb =  p.gold > 0 ? p.gold : 0;
    //                 p.addDayTixian = 0;
    //                 p.loginCount = 0;
    //                 p.dailyFlow = 0;
    //                 await PlayerRedisDao.updateOne({ uid }, new PlayerInRedis(p));
    //             }
    //
    //         }
    //     } catch (e) {
    //         console.error(e.stack)
    //     } finally {
    //         !!_lock && unlock(_lock);
    //     }
    // }
    process.exit();
    console.warn(`结算时间：${new Date()}`);
    return;
}


setTimeout(clean, 2000);