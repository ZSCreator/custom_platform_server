import PlayerAgentMysqlDao from "../../../common/dao/mysql/PlayerAgent.mysql.dao";
import GatePlayerService from "../../../servers/gate/lib/services/GatePlayerService";
import ConnectionManager from "../../../common/dao/mysql/lib/connectionManager";
import { PlayerAgent } from "../../../common/dao/mysql/entity/PlayerAgent.entity";
import PlatformNameAgentListRedisDao from "../../../common/dao/redis/PlatformNameAgentList.redis.dao";
import * as moment from "moment";
import GameRecordDateTableDao from "../../../common/dao/mysql/GameRecordDateTable.mysql.dao";
import PlayerMysqlDao from "../../../common/dao/mysql/Player.mysql.dao";



// 创建特定平台xxxxxxx
export async function createPlateform(platform: string) {
    //判断平台是否存在
    const platformData = await PlayerAgentMysqlDao.findOne({ platformName: platform });
    if (platformData) {
        // console.warn("已经存在平台", platform)
        return { uid: platformData.uid };
    }

    const { uid } = await GatePlayerService.createPlayer();

    /** Step 4: 创建平台信息 */
    const agentInfo = ConnectionManager.getRepository(PlayerAgent).create({
        uid,
        rootUid: uid,
        parentUid: uid,
        inviteCode: '',
        platformName: platform,
        platformGold: 100000000,
        deepLevel: 1,
        roleType: 2,
        status: 1,
        language: 'chinese_zh'
    });

    await PlayerAgentMysqlDao.insertOne(agentInfo);


    //将改平台的uid存入到redis key值 里面
    await PlatformNameAgentListRedisDao.insertPlatformUid({ platformName: platform, platformUid: uid });

    // 5.4 更新redis里面平台拥有哪些分代的值
    await PlatformNameAgentListRedisDao.addAgent(platform, uid);

    //创建该平台的本月表和下个月的表
    const timeTableName = moment().format("YYYYMM");
    let tableName = `${uid}_${timeTableName}`;
    const isExists = await GameRecordDateTableDao.tableBeExists(tableName);
    if (!isExists) {
        await GameRecordDateTableDao.createTable(tableName);
    }
    console.warn("创建平台成功", uid, platform);
    return { uid };
}
// 在特定平台xxxxxxx创建租户
export async function createAgent(platform: string, platformUid: string, agentName: string) {

    //判断分代是否存在
    const agentData = await PlayerAgentMysqlDao.findOne({ platformName: agentName });
    if (agentData) {
        // console.warn("已经存在租户", agentName)
        return { agentUid: agentData.uid, agentName: agentData.platformName };
    }
    /** Step 3: 创建代理账号(基于玩家) */
    const { uid } = await GatePlayerService.createPlayer(null, platformUid, platformUid, null, null, null, null, null);

    /** Step 4: 创建代理信息(基于平台下) */
    const playerAgentInfo = {
        uid,
        parentUid: platformUid,
        rootUid: platformUid,
        inviteCode: '',
        platformName: agentName,
        platformGold: 100000000,
        deepLevel: 2,
        roleType: 3,
        status: 1,
        language: 'chinese_zh'
    };

    await PlayerAgentMysqlDao.insertOne(playerAgentInfo);  // 5.1 插入代理信息

    // 5.4 更新redis里面平台拥有哪些分代的值
    await PlatformNameAgentListRedisDao.addAgent(platform, platformUid);
    console.warn("创建租户成功", uid, agentName)
    return { agentUid: uid, agentName }
}
// 在租户下面创建玩家
export async function createPlayer(platformUid: string, agentUid: string, agentName: string) {
    /** 创建玩家 */
    let player = await GatePlayerService.createPlayer(null, agentUid, platformUid, null, agentName, "chinese_zh", null, agentName);
    /** 建立代理关系 */
    let pl = await PlayerAgentMysqlDao.insertOne({
        uid: player.uid,
        parentUid: agentUid,
        rootUid: platformUid,
        platformName: player.uid,
        platformGold: 0,
        deepLevel: 3,
        roleType: 1,
        status: 1,
        language: "chinese_zh",
    })
    console.warn("创建玩家成功", player.uid)
}
//创建特定平台 租户 玩家 写入数据库
export async function GetAllSpPl() {
    const { uid } = await createPlateform("tom");
    //查询该平台所有的分代号
    const agentList = await PlayerAgentMysqlDao.findList({ rootUid: uid, roleType: 3 });
    const agentNameList = agentList.map(c => `"${c.platformName}"`);
    // await PlayerMysqlDao.updateOne({ group_id: uid }, { gold: 10000000 });
    // const list = await PlayerMysqlDao.findList({ group_id: uid });
    //根据分代号来查询所有分代号下面的玩家
    if (agentNameList.length > 0) {
        const sql = `SELECT Sp_Player.guestid FROM  Sp_Player  WHERE Sp_Player.groupRemark  in (${agentNameList.join(",")})`;
        const res = await ConnectionManager
            .getConnection(true)
            .query(sql);
        return res.map(c => c.guestid);
    }

}

/**
 * 创建测试平台玩家
 */
export async function createTestPlayer() {
    const { uid } = await createPlateform("tom");

    for (let i = 0; i < 1000; i++) {
        const { agentUid, agentName } = await createAgent("tom", uid, `MeIsTom_${i}`);
        //查找该代理下面有多少玩家
        const sql = `SELECT COUNT(Sp_Player.id) as playerLength FROM  Sp_Player  WHERE Sp_Player.groupRemark = "${agentName}"`;
        const res = await ConnectionManager
            .getConnection(true)
            .query(sql);
        //总共在这个分代下面创建多少个玩家
        let playerNum = 5;
        let lastNum = playerNum - res[0].playerLength;
        //循环创建玩家个数
        for (let i = 0; i < lastNum; i++) {
            await createPlayer(uid, agentUid, agentName);
        }
    }
}
