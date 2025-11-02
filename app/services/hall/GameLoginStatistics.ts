/**统计每个游戏 场次 玩家登录次数 */
import redisManager from '../../common/dao/redis/lib/BaseRedisManager';
import moment = require('moment');
import GameManagerDao from "../../common/dao/daoManager/Game.manager";
import SceneManagerDao from "../..//common/dao/daoManager/Scene.manager";
import { RedisDB } from '../../common/dao/redis/config/DBCfg.enum';

export async function increase_to_db(nid: string, sceneId: number, uid: string) {
    const createDate = moment().format("YYYY-MM-DD");
    const conn = await redisManager.getConnection(RedisDB.Persistence_DB);
    let ret = await conn.sadd(`GameLoginStatistics:${createDate}:${nid}:${sceneId}`, `${uid}`);
    conn.expire(`GameLoginStatistics:${createDate}:${nid}:${sceneId}`, 2 * 24 * 60 * 60)
};



/** 获取统计信息*/
export async function getAllLoginInfo() {
    const conn = await redisManager.getConnection(RedisDB.Persistence_DB);
    const nidList = await GameManagerDao.findList({});
    const sceneList = await SceneManagerDao.findList({});
    let data1: string[] = [];
    for (let day = 0; day < 30; day++) {
        let today = new Date();
        let targetday_milliseconds = today.getTime() - 1000 * 60 * 60 * 24 * day;
        const createDate = moment(targetday_milliseconds).format("YYYY-MM-DD");
        data1.push(createDate);
    }
    let resultArr: { nid: string, sceneId: number, game_name: string, scene_name: string, day: string, num: number }[] = [];
    for (const day of data1) {
        for (const sceneInfo of sceneList) {
            let num = await conn.scard(`GameLoginStatistics:${day}:${sceneInfo.nid}:${sceneInfo.sceneId}`);
            let game_name = nidList.find(c => c.nid == sceneInfo.nid).zname;
            let scene_name = sceneInfo.name;
            resultArr.push({ nid: sceneInfo.nid, sceneId: sceneInfo.sceneId, game_name, scene_name, day, num });
        }
    }
    return resultArr;
};