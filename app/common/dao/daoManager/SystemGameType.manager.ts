import SystemGameTypeMysqlDao from "../mysql/SystemGameType.mysql.dao";
import SystemGameTypeRedisDao from "../redis/SystemGameType.redis.dao";
import { SystemGameType } from "../mysql/entity/SystemGameType.entity";
import { SystemGameTypeInRedis } from "../redis/entity/SystemGameType.entity";
import * as GameTypeEnum from "../../constant/game/GameTypeEnum";
import ConnectionManager from "../mysql/lib/connectionManager";


type Parameter<T> = { [P in keyof T]?: T[P] };
export class SystemGameTypeManager {

    async findList(parameter: Parameter<SystemGameType>): Promise<any> {
        try {
            /**先从redis 里面找,如果redis里面没有就从数据库找然后存入redis */
            let list = await SystemGameTypeRedisDao.findList(parameter);
            if (list.length == 0) {
                list = await SystemGameTypeMysqlDao.findList(parameter);
                if (list.length > 0) {
                    for (let gameType of list) {
                        await SystemGameTypeRedisDao.insertOne(gameType);
                    }
                } else {
                    //就初始化
                    await this.init();
                    return [];
                }
            }
            //取出来的数组nid 是字符串类型，这个时候需要转换成数组模式
            let resultList = [];
            for (let gameType of list) {
                let temp_list = [];
                let hsort = 0;
                let sort = 0;
                if (gameType.nidList && gameType.nidList !== '') {
                    const nidList = gameType.nidList.split(',');
                    for (let nid of nidList) {
                        sort += 1;
                        temp_list.push({ sort: sort, nid: nid, ishot: false, hsort: 0 });
                    }
                }

                if (gameType.hotNidList && gameType.hotNidList !== '') {
                    const hotNidList = gameType.hotNidList.split(',');
                    for (let nid of hotNidList) {
                        hsort += 1;
                        const key = temp_list.findIndex(x => x.nid == nid);
                        let item = temp_list.find(x => x.nid == nid);
                        item.hsort = hsort;
                        item.ishot = true;
                        temp_list.splice(key, 1);
                        temp_list.push(item);
                    }

                }

                let info = {
                    nidList: temp_list,
                    typeId: gameType.typeId,
                    sort: gameType.sort,
                    open: gameType.open,
                    name: gameType.name,
                    id: gameType.id,
                }
                resultList.push(info);
            }
            return resultList;
        } catch (e) {
            return [];
        }
    }

    async findOne(parameter: Parameter<SystemGameType>): Promise<any> {
        try {
            // Step 1: 是否只读 Mysql 数据库;
            let SystemGameType = await SystemGameTypeRedisDao.findOne(parameter);
            if (SystemGameType) {
                let list = [];
                let hsort = 0;
                let sort = 0;
                if (SystemGameType.nidList && SystemGameType.nidList !== '') {
                    const nidList = SystemGameType.nidList.split(',');
                    for (let nid of nidList) {
                        sort += 1;
                        list.push({ sort: sort, nid: nid, ishot: false, hsort: 0 });
                    }
                }

                if (SystemGameType.hotNidList && SystemGameType.hotNidList !== '') {
                    const hotNidList = SystemGameType.hotNidList.split(',');
                    for (let nid of hotNidList) {
                        sort += 1;
                        hsort += 1;
                        const key = list.findIndex(x => x.nid == nid);
                        let item = list.find(x => x.nid == nid);
                        item.hsort = hsort;
                        item.ishot = true;
                        list.splice(key, 1);
                        list.push(item);
                    }

                }
                let SystemGameType_ = {
                    nidList: list,
                    typeId: SystemGameType.typeId,
                    sort: SystemGameType.sort,
                    open: SystemGameType.open,
                    name: SystemGameType.name,
                    id: SystemGameType.id,
                };
                return SystemGameType_;
            }
            if (!SystemGameType) {
                const systemConfigOnMysql = await SystemGameTypeMysqlDao.findOne(parameter);
                /** Mysql 有数据则更新进redis，无则返回 */
                if (systemConfigOnMysql) {
                    const sec = await SystemGameTypeRedisDao.insertOne(new SystemGameTypeInRedis(systemConfigOnMysql));
                }
                let list = [];
                let sort = 0;
                let hsort = 0;
                if (systemConfigOnMysql.nidList && systemConfigOnMysql.nidList !== '') {
                    const nidList = systemConfigOnMysql.nidList.split(',');
                    for (let nid of nidList) {
                        sort += 1;
                        list.push({ sort: sort, nid: nid, ishot: false, hsort: 0 });
                    }
                }

                if (systemConfigOnMysql.hotNidList && systemConfigOnMysql.hotNidList !== '') {
                    const hotNidList = systemConfigOnMysql.hotNidList.split(',');
                    for (let nid of hotNidList) {
                        hsort += 1;
                        const key = list.findIndex(x => x.nid == nid);
                        let item = list.find(x => x.nid == nid);
                        item.hsort = hsort;
                        item.ishot = true;
                        list.splice(key, 1);
                        list.push(item);
                    }

                }
                let SystemGameType_ = {
                    nidList: list,
                    typeId: systemConfigOnMysql.typeId,
                    sort: systemConfigOnMysql.sort,
                    open: systemConfigOnMysql.open,
                    name: systemConfigOnMysql.name,
                    id: systemConfigOnMysql.id,
                }
                return SystemGameType_;
            }

        } catch (e) {
            return null;
        }
    }

    async insertOne(parameter: Parameter<SystemGameType>): Promise<any> {
        try {
            // 将数组存储成字符串
            await SystemGameTypeMysqlDao.insertOne(parameter);
            await SystemGameTypeRedisDao.insertOne(new SystemGameTypeInRedis(parameter));
            return true;
        } catch (e) {
            return null;
        }
    }

    async updateOne(parameter: Parameter<SystemGameType>, partialEntity: Parameter<SystemGameType>): Promise<any> {
        try {
            const { affected } = await ConnectionManager.getConnection()
                .getRepository(SystemGameType)
                .update(parameter, partialEntity);
            const isSuccess = !!affected;
            if (isSuccess) {
                await SystemGameTypeRedisDao.updateOne(parameter, new SystemGameTypeInRedis(partialEntity));
            }
            return isSuccess;
        } catch (e) {
            return false;
        }
    }

    async delete(parameter: Parameter<SystemGameType>): Promise<any> {
        try {
            const { affected } = await ConnectionManager.getConnection()
                .getRepository(SystemGameType)
                .delete(parameter);
            return !!affected;
        } catch (e) {
            return false;
        }
    }

    /**
     * 初始化游戏分类
     * @param parameter
     */

    async init(): Promise<any> {
        try {
            const result = await SystemGameTypeMysqlDao.findList({});
            const GameType = GameTypeEnum.GameTypeEnumList;
            let resultList = [];
            for (let key of GameType) {
                const item = result.find(x => x.typeId === Number(key.typeId));
                if (!item) {
                    let info = {
                        typeId: Number(key.typeId),                 // 游戏类型Id
                        sort: 0,                   // 序号
                        name: key.name,           //  中文名
                        open: true,                   // 是否显示
                        nidList: '',                     //nid 的集合'1,2,4,5'
                        hotNidList: '',                     //nid 的集合'1,2,4,5'
                    };
                    await this.insertOne(info);
                    // @ts-ignore
                    info.nidList = [];
                    resultList.push(info);
                }
            }
            return resultList;
        } catch (e) {
            return false;
        }
    }

}

export default new SystemGameTypeManager();
