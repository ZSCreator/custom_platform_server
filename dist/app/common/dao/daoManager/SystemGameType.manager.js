"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SystemGameTypeManager = void 0;
const SystemGameType_mysql_dao_1 = require("../mysql/SystemGameType.mysql.dao");
const SystemGameType_redis_dao_1 = require("../redis/SystemGameType.redis.dao");
const SystemGameType_entity_1 = require("../mysql/entity/SystemGameType.entity");
const SystemGameType_entity_2 = require("../redis/entity/SystemGameType.entity");
const GameTypeEnum = require("../../constant/game/GameTypeEnum");
const connectionManager_1 = require("../mysql/lib/connectionManager");
class SystemGameTypeManager {
    async findList(parameter) {
        try {
            let list = await SystemGameType_redis_dao_1.default.findList(parameter);
            if (list.length == 0) {
                list = await SystemGameType_mysql_dao_1.default.findList(parameter);
                if (list.length > 0) {
                    for (let gameType of list) {
                        await SystemGameType_redis_dao_1.default.insertOne(gameType);
                    }
                }
                else {
                    await this.init();
                    return [];
                }
            }
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
                };
                resultList.push(info);
            }
            return resultList;
        }
        catch (e) {
            return [];
        }
    }
    async findOne(parameter) {
        try {
            let SystemGameType = await SystemGameType_redis_dao_1.default.findOne(parameter);
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
                const systemConfigOnMysql = await SystemGameType_mysql_dao_1.default.findOne(parameter);
                if (systemConfigOnMysql) {
                    const sec = await SystemGameType_redis_dao_1.default.insertOne(new SystemGameType_entity_2.SystemGameTypeInRedis(systemConfigOnMysql));
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
                };
                return SystemGameType_;
            }
        }
        catch (e) {
            return null;
        }
    }
    async insertOne(parameter) {
        try {
            await SystemGameType_mysql_dao_1.default.insertOne(parameter);
            await SystemGameType_redis_dao_1.default.insertOne(new SystemGameType_entity_2.SystemGameTypeInRedis(parameter));
            return true;
        }
        catch (e) {
            return null;
        }
    }
    async updateOne(parameter, partialEntity) {
        try {
            const { affected } = await connectionManager_1.default.getConnection()
                .getRepository(SystemGameType_entity_1.SystemGameType)
                .update(parameter, partialEntity);
            const isSuccess = !!affected;
            if (isSuccess) {
                await SystemGameType_redis_dao_1.default.updateOne(parameter, new SystemGameType_entity_2.SystemGameTypeInRedis(partialEntity));
            }
            return isSuccess;
        }
        catch (e) {
            return false;
        }
    }
    async delete(parameter) {
        try {
            const { affected } = await connectionManager_1.default.getConnection()
                .getRepository(SystemGameType_entity_1.SystemGameType)
                .delete(parameter);
            return !!affected;
        }
        catch (e) {
            return false;
        }
    }
    async init() {
        try {
            const result = await SystemGameType_mysql_dao_1.default.findList({});
            const GameType = GameTypeEnum.GameTypeEnumList;
            let resultList = [];
            for (let key of GameType) {
                const item = result.find(x => x.typeId === Number(key.typeId));
                if (!item) {
                    let info = {
                        typeId: Number(key.typeId),
                        sort: 0,
                        name: key.name,
                        open: true,
                        nidList: '',
                        hotNidList: '',
                    };
                    await this.insertOne(info);
                    info.nidList = [];
                    resultList.push(info);
                }
            }
            return resultList;
        }
        catch (e) {
            return false;
        }
    }
}
exports.SystemGameTypeManager = SystemGameTypeManager;
exports.default = new SystemGameTypeManager();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiU3lzdGVtR2FtZVR5cGUubWFuYWdlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL2FwcC9jb21tb24vZGFvL2Rhb01hbmFnZXIvU3lzdGVtR2FtZVR5cGUubWFuYWdlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSxnRkFBdUU7QUFDdkUsZ0ZBQXVFO0FBQ3ZFLGlGQUF1RTtBQUN2RSxpRkFBOEU7QUFDOUUsaUVBQWlFO0FBQ2pFLHNFQUErRDtBQUkvRCxNQUFhLHFCQUFxQjtJQUU5QixLQUFLLENBQUMsUUFBUSxDQUFDLFNBQW9DO1FBQy9DLElBQUk7WUFFQSxJQUFJLElBQUksR0FBRyxNQUFNLGtDQUFzQixDQUFDLFFBQVEsQ0FBQyxTQUFTLENBQUMsQ0FBQztZQUM1RCxJQUFJLElBQUksQ0FBQyxNQUFNLElBQUksQ0FBQyxFQUFFO2dCQUNsQixJQUFJLEdBQUcsTUFBTSxrQ0FBc0IsQ0FBQyxRQUFRLENBQUMsU0FBUyxDQUFDLENBQUM7Z0JBQ3hELElBQUksSUFBSSxDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUU7b0JBQ2pCLEtBQUssSUFBSSxRQUFRLElBQUksSUFBSSxFQUFFO3dCQUN2QixNQUFNLGtDQUFzQixDQUFDLFNBQVMsQ0FBQyxRQUFRLENBQUMsQ0FBQztxQkFDcEQ7aUJBQ0o7cUJBQU07b0JBRUgsTUFBTSxJQUFJLENBQUMsSUFBSSxFQUFFLENBQUM7b0JBQ2xCLE9BQU8sRUFBRSxDQUFDO2lCQUNiO2FBQ0o7WUFFRCxJQUFJLFVBQVUsR0FBRyxFQUFFLENBQUM7WUFDcEIsS0FBSyxJQUFJLFFBQVEsSUFBSSxJQUFJLEVBQUU7Z0JBQ3ZCLElBQUksU0FBUyxHQUFHLEVBQUUsQ0FBQztnQkFDbkIsSUFBSSxLQUFLLEdBQUcsQ0FBQyxDQUFDO2dCQUNkLElBQUksSUFBSSxHQUFHLENBQUMsQ0FBQztnQkFDYixJQUFJLFFBQVEsQ0FBQyxPQUFPLElBQUksUUFBUSxDQUFDLE9BQU8sS0FBSyxF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