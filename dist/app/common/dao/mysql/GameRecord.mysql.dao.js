"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GameRecordMysqlDao = void 0;
const ADao_abstract_1 = require("../ADao.abstract");
const GameRecord_entity_1 = require("./entity/GameRecord.entity");
const connectionManager_1 = require("../mysql/lib/connectionManager");
const moment = require("moment");
class GameRecordMysqlDao extends ADao_abstract_1.AbstractDao {
    async findList(parameter) {
        try {
            const list = await connectionManager_1.default.getConnection()
                .getRepository(GameRecord_entity_1.GameRecord)
                .find(parameter);
            return list;
        }
        catch (e) {
            return [];
        }
    }
    async findOne(parameter) {
        try {
            const gameRecord = await connectionManager_1.default.getConnection()
                .getRepository(GameRecord_entity_1.GameRecord)
                .findOne(parameter);
            return gameRecord;
        }
        catch (e) {
            return null;
        }
    }
    async updateOne(parameter, partialEntity) {
        try {
            const { affected } = await connectionManager_1.default.getConnection()
                .getRepository(GameRecord_entity_1.GameRecord)
                .update(parameter, partialEntity);
            return !!affected;
        }
        catch (e) {
            return false;
        }
    }
    async insertOne(parameter) {
        try {
            const gameRepository = connectionManager_1.default.getConnection()
                .getRepository(GameRecord_entity_1.GameRecord);
            const p = gameRepository.create(parameter);
            return await gameRepository.save(p);
        }
        catch (e) {
            return null;
        }
    }
    async delete(parameter) {
        try {
            const { affected } = await connectionManager_1.default.getConnection()
                .getRepository(GameRecord_entity_1.GameRecord)
                .delete(parameter);
            return !!affected;
        }
        catch (e) {
            return false;
        }
    }
    async findForGameOrder(table, gameOrder, startTime, endTime) {
        try {
            if (!table && !gameOrder) {
                return;
            }
            const sql = `SELECT  Sp_GameRecord.game_Records_live_result AS result ,Sp_GameRecord.game_id AS nid ,Sp_GameRecord.gameName AS gameName ,
                         Sp_GameRecord.createTimeDate AS createTimeDate ,  Sp_GameRecord.uid AS uid ,  Sp_GameRecord.status AS status
                         FROM  ${table} AS Sp_GameRecord  
                         WHERE 
                         Sp_GameRecord.createTimeDate >= "${startTime}" AND  Sp_GameRecord.createTimeDate < "${endTime}"
                         AND Sp_GameRecord.game_order_id = "${gameOrder}" `;
            const result = await connectionManager_1.default.getConnection(true)
                .query(sql);
            if (result.length != 0) {
                return result[0];
            }
            else {
                return false;
            }
        }
        catch (e) {
            return false;
        }
    }
    async findListToLimitForWhereForMoreTable(platformUid, table1, table2, where, page, limit) {
        try {
            if (!table1 && !table2) {
                return;
            }
            if (platformUid) {
                if (table1) {
                    table1 = `Sp_GameRecord_${platformUid}_${table1}`;
                }
                if (table2) {
                    table2 = `Sp_GameRecord_${platformUid}_${table2}`;
                }
            }
            else {
                table1 = `Sp_GameRecord_${table1}`;
            }
            let select = ['Sp_GameRecord.id AS id', 'Sp_GameRecord.uid AS uid', 'Sp_GameRecord.groupRemark AS groupRemark', 'Sp_GameRecord.thirdUid AS thirdUid', 'Sp_GameRecord.gameName AS gameName',
                'Sp_GameRecord.game_id AS nid', 'Sp_GameRecord.sceneId AS sceneId', 'Sp_GameRecord.roomId AS roomId', 'Sp_GameRecord.gold AS gold', 'Sp_GameRecord.validBet AS validBet', 'Sp_GameRecord.round_id AS roundId',
                'Sp_GameRecord.profit AS profit', 'Sp_GameRecord.bet_commission AS bet_commission', 'Sp_GameRecord.win_commission AS win_commission', 'Sp_GameRecord.settle_commission AS settle_commission',
                'Sp_GameRecord.game_order_id AS gameOrder', 'DATE_FORMAT(Sp_GameRecord.createTimeDate,"%Y-%m-%d %H:%i:%s")  createTimeDate'];
            let selectCount = `COUNT(Sp_GameRecord.id) AS length`;
            let sqlCount = null;
            let sql = null;
            if (table1) {
                sql = `        
                SELECT
                    ${select}
                FROM
                     ${table1} AS Sp_GameRecord
                WHERE 
                    ${where} 
                `;
                sqlCount = `        
                SELECT
                    ${selectCount}
                FROM
                     ${table1} AS Sp_GameRecord
                WHERE 
                    ${where} 
                `;
            }
            if (table2) {
                if (sql) {
                    sql = sql + `
                UNION ALL
                SELECT
                    ${select}
                FROM
                     ${table2} AS Sp_GameRecord
                WHERE 
                    ${where}
                `;
                    sqlCount = sqlCount + `
                UNION ALL
                SELECT
                    ${selectCount}
                FROM
                     ${table2} AS Sp_GameRecord
                WHERE 
                    ${where}
                `;
                }
                else {
                    sql = `        
                SELECT
                    ${select}
                FROM
                     ${table2} AS Sp_GameRecord
                WHERE 
                    ${where} 
                `;
                    sqlCount = `        
                SELECT
                    ${selectCount}
                FROM
                     ${table2} AS Sp_GameRecord
                WHERE 
                    ${where} 
                `;
                }
            }
            let startLimit = (page - 1) * limit;
            sql = sql + `ORDER BY createTimeDate DESC , id DESC
                         LIMIT ${startLimit} , ${limit}`;
            const result = await connectionManager_1.default.getConnection(true)
                .query(sql);
            const countResult = await connectionManager_1.default.getConnection(true)
                .query(sqlCount);
            let count = 0;
            for (let key of countResult) {
                count += Number(key.length);
            }
            return { list: result, count: count };
        }
        catch (e) {
            return { list: [], count: 0 };
        }
    }
    async findListToLimitForRoundId(platformUidList, table1, where, page, limit) {
        try {
            if (!table1) {
                return;
            }
            let select = ['Sp_GameRecord.id AS id', 'Sp_GameRecord.uid AS uid', 'Sp_GameRecord.groupRemark AS groupRemark', 'Sp_GameRecord.thirdUid AS thirdUid', 'Sp_GameRecord.gameName AS gameName',
                'Sp_GameRecord.game_id AS nid', 'Sp_GameRecord.sceneId AS sceneId', 'Sp_GameRecord.roomId AS roomId', 'Sp_GameRecord.gold AS gold', 'Sp_GameRecord.validBet AS validBet', 'Sp_GameRecord.round_id AS roundId',
                'Sp_GameRecord.profit AS profit', 'Sp_GameRecord.bet_commission AS bet_commission', 'Sp_GameRecord.win_commission AS win_commission', 'Sp_GameRecord.settle_commission AS settle_commission',
                'Sp_GameRecord.game_order_id AS gameOrder', 'DATE_FORMAT(Sp_GameRecord.createTimeDate,"%Y-%m-%d %H:%i:%s")  createTimeDate'];
            let sql = null;
            for (let platform of platformUidList) {
                if (platform.platformUid) {
                    if (sql) {
                        sql = sql + `
                        UNION ALL       
                        ( SELECT
                            ${select}
                        FROM
                            Sp_GameRecord_${platform.platformUid}_${table1} AS Sp_GameRecord
                        WHERE 
                            ${where} 
                        )`;
                    }
                    else {
                        sql = `
                        ( SELECT
                            ${select}
                        FROM
                            Sp_GameRecord_${platform.platformUid}_${table1} AS Sp_GameRecord
                        WHERE 
                            ${where} 
                        )`;
                    }
                }
            }
            if (!sql) {
                return { list: [], count: 0 };
            }
            const result = await connectionManager_1.default.getConnection(true)
                .query(sql);
            return { list: result, count: result.length };
        }
        catch (e) {
            console.warn(e);
            return { list: [], count: 0 };
        }
    }
    async tableBeExists(tableDate) {
        try {
            const res = await connectionManager_1.default.getConnection()
                .query(`SELECT table_name FROM information_schema.TABLES WHERE table_name = "Sp_GameRecord_${tableDate}";`);
            return !!res.length;
        }
        catch (e) {
            console.error(`备份表 | 查询目标表 Sp_GameRecord_${tableDate} 出错: ${e.stack}`);
            return false;
        }
    }
    async findListForGameScene(table, nid, uid) {
        try {
            let select = ['Sp_GameRecord.sceneId AS sceneId',
                'Sp_GameRecord.round_id AS roundId',
                'Sp_GameRecord.game_id AS nid',
                'Sp_GameRecord.profit AS profit',
                'Sp_GameRecord.validBet AS validBet',
                'Sp_GameRecord.isDealer AS isDealer',
                'Sp_GameRecord.game_order_id AS gameOrder', 'Sp_GameRecord.createTimeDate  AS createTimeDate'];
            let sql = `        
                SELECT
                    ${select}
                FROM
                     ${table} AS Sp_GameRecord
                WHERE 
                     Sp_GameRecord.uid = "${uid}" AND  Sp_GameRecord.game_id = "${nid}"
                ORDER BY createTimeDate DESC
                         LIMIT 0 , 10
                `;
            const result = await connectionManager_1.default.getConnection(true)
                .query(sql);
            return result;
        }
        catch (e) {
            return false;
        }
    }
    async findListForLuckyWheel(table, nid, uid) {
        try {
            let select = ['Sp_GameRecord.game_Records_live_result AS result',
                'Sp_GameRecord.round_id AS roundId', 'Sp_GameRecord.validBet AS validBet',];
            let sql = `        
                SELECT
                    ${select}
                FROM
                     ${table} AS Sp_GameRecord
                WHERE 
                     Sp_GameRecord.uid = "${uid}" AND  Sp_GameRecord.game_id = "${nid}"
                ORDER BY createTimeDate DESC
                         LIMIT 0 , 10
                `;
            return await connectionManager_1.default.getConnection(true)
                .query(sql);
        }
        catch (e) {
            return false;
        }
    }
    async findListAll(platformUid, groupRemark, startTime, endTime) {
        try {
            let select = ['Sp_GameRecord.game_id AS nid', 'Sp_GameRecord.groupRemark AS groupRemark', 'Sp_GameRecord.thirdUid AS thirdUid', 'Sp_GameRecord.gameName AS gameName',
                'Sp_GameRecord.game_results AS result', 'Sp_GameRecord.gameType AS gameType',
                'Sp_GameRecord.sceneId AS sceneId', 'Sp_GameRecord.roomId AS roomId', 'Sp_GameRecord.gold AS gold',
                'Sp_GameRecord.validBet AS validBet', 'Sp_GameRecord.round_id AS roundId', 'Sp_GameRecord.input AS input',
                'Sp_GameRecord.profit AS profit', 'Sp_GameRecord.bet_commission AS bet_commission',
                'Sp_GameRecord.win_commission AS win_commission', 'Sp_GameRecord.settle_commission AS settle_commission',
                'Sp_GameRecord.game_order_id AS gameOrder', 'DATE_FORMAT(Sp_GameRecord.createTimeDate,"%Y-%m-%d %H:%i:%s")  createTimeDate'];
            const starTable = moment(startTime).format("YYYYMM");
            const endTable = moment(endTime).format("YYYYMM");
            let sql = null;
            if (starTable !== endTable) {
                sql = `        
                SELECT
                    ${select}
                FROM
                     Sp_GameRecord_${platformUid}_${starTable} AS Sp_GameRecord
                WHERE 
                    Sp_GameRecord.createTimeDate >= "${startTime}" AND Sp_GameRecord.createTimeDate < "${endTime}"
                    AND  Sp_GameRecord.groupRemark = "${groupRemark}" 
                    AND  Sp_GameRecord.game_id NOT IN ("t1","t2")
                UNION ALL  
                SELECT
                    ${select}
                FROM
                     Sp_GameRecord_${platformUid}_${endTable} AS Sp_GameRecord
                WHERE 
                    Sp_GameRecord.createTimeDate >= "${startTime}" AND Sp_GameRecord.createTimeDate < "${endTime}"
                    AND  Sp_GameRecord.groupRemark = "${groupRemark}" 
                    AND  Sp_GameRecord.game_id NOT IN ("t1","t2") 
                `;
            }
            else {
                sql = `        
                SELECT
                    ${select}
                FROM
                     Sp_GameRecord_${platformUid}_${starTable} AS Sp_GameRecord
                WHERE 
                    Sp_GameRecord.createTimeDate >= "${startTime}" AND Sp_GameRecord.createTimeDate < "${endTime}"
                    AND  Sp_GameRecord.groupRemark = "${groupRemark}" 
                    AND  Sp_GameRecord.game_id NOT IN ("t1","t2")
                `;
            }
            if (!sql) {
                return [];
            }
            const result = await connectionManager_1.default.getConnection(true)
                .query(sql);
            return result;
        }
        catch (e) {
            return [];
        }
    }
    async newPlatformNamefindListAll(platformUid, startTime, endTime) {
        try {
            const list = [];
            let select = ['Sp_GameRecord.game_id AS nid', 'Sp_GameRecord.groupRemark AS groupRemark', 'Sp_GameRecord.thirdUid AS thirdUid', 'Sp_GameRecord.gameName AS gameName',
                'Sp_GameRecord.game_results AS result', 'Sp_GameRecord.gameType AS gameType',
                'Sp_GameRecord.sceneId AS sceneId', 'Sp_GameRecord.roomId AS roomId', 'Sp_GameRecord.gold AS gold',
                'Sp_GameRecord.validBet AS validBet', 'Sp_GameRecord.round_id AS roundId', 'Sp_GameRecord.input AS input',
                'Sp_GameRecord.profit AS profit', 'Sp_GameRecord.bet_commission AS bet_commission',
                'Sp_GameRecord.win_commission AS win_commission', 'Sp_GameRecord.settle_commission AS settle_commission',
                'Sp_GameRecord.game_order_id AS gameOrder', 'DATE_FORMAT(Sp_GameRecord.createTimeDate,"%Y-%m-%d %H:%i:%s")  createTimeDate'];
            const starTable = moment(startTime).format("YYYYMM");
            const endTable = moment(endTime).format("YYYYMM");
            let sql = null;
            if (starTable !== endTable) {
                sql = `        
                SELECT
                    ${select}
                FROM
                     Sp_GameRecord_${platformUid}_${starTable} AS Sp_GameRecord
                WHERE 
                    Sp_GameRecord.createTimeDate >= "${startTime}" AND Sp_GameRecord.createTimeDate < "${endTime}"
                    AND  Sp_GameRecord.game_id NOT IN ("t1","t2")
                UNION ALL  
                SELECT
                    ${select}
                FROM
                     Sp_GameRecord_${platformUid}_${endTable} AS Sp_GameRecord
                WHERE 
                    Sp_GameRecord.createTimeDate >= "${startTime}" AND Sp_GameRecord.createTimeDate < "${endTime}"
                    AND  Sp_GameRecord.game_id NOT IN ("t1","t2") 
                `;
            }
            else {
                sql = `        
                SELECT
                    ${select}
                FROM
                     Sp_GameRecord_${platformUid}_${starTable} AS Sp_GameRecord
                WHERE 
                    Sp_GameRecord.createTimeDate >= "${startTime}" AND Sp_GameRecord.createTimeDate < "${endTime}"
                    AND  Sp_GameRecord.game_id NOT IN ("t1","t2")
                `;
            }
            if (!sql) {
                return [];
            }
            const result = await connectionManager_1.default.getConnection(true)
                .query(sql);
            return result;
        }
        catch (e) {
            return [];
        }
    }
    async fileOutDataForAgent(platformUid, agentName, startTime, endTime, limit, uid, thirdUid, id, isCount = false) {
        try {
            let where = `GameRecord.createTimeDate >= "${startTime}" AND GameRecord.createTimeDate <= "${endTime}"
                         AND GameRecord.groupRemark = "${agentName}"
                         AND GameRecord.game_id NOT IN ("t1","t2")`;
            if (uid) {
                where = where + ` AND GameRecord.uid = "${uid}"`;
            }
            if (thirdUid) {
                where = where + ` AND GameRecord.thirdUid = "${thirdUid}"`;
            }
            let select = ['GameRecord.id', 'GameRecord.uid', 'GameRecord.thirdUid', 'GameRecord.groupRemark', 'GameRecord.gameName', 'GameRecord.game_order_id',
                'GameRecord.validBet', 'GameRecord.profit', 'GameRecord.settle_commission', 'GameRecord.win_commission', 'GameRecord.bet_commission', 'DATE_FORMAT(GameRecord.createTimeDate,"%Y-%m-%d %H:%i:%s")  createTimeDate'];
            let table = moment(startTime).format("YYYYMM");
            where += ` AND GameRecord.id >= ${id}`;
            let sql = `        
                SELECT
                    ${select}
                FROM
                     Sp_GameRecord_${platformUid}_${table} AS GameRecord
                WHERE 
                    ${where}
                ORDER BY id ASC
                         LIMIT ${limit} 
                `;
            const result = await connectionManager_1.default.getConnection(true)
                .query(sql);
            return { list: result };
        }
        catch (e) {
            console.warn(e);
            return { list: [] };
        }
    }
    async fileOutDataForPlatformName(platformUid, startTime, endTime, limit, uid, thirdUid, id, isCount = false) {
        try {
            let where = `GameRecord.createTimeDate >= "${startTime}" AND GameRecord.createTimeDate <= "${endTime}"
                         AND GameRecord.game_id NOT IN ("t1","t2")`;
            if (uid) {
                where = where + ` AND GameRecord.uid = "${uid}"`;
            }
            if (thirdUid) {
                where = where + ` AND GameRecord.thirdUid = "${thirdUid}"`;
            }
            let select = ['GameRecord.id', 'GameRecord.uid', 'GameRecord.thirdUid', 'GameRecord.groupRemark', 'GameRecord.gameName', 'GameRecord.game_order_id',
                'GameRecord.validBet', 'GameRecord.profit', 'GameRecord.settle_commission', 'GameRecord.win_commission', 'GameRecord.bet_commission', 'DATE_FORMAT(GameRecord.createTimeDate,"%Y-%m-%d %H:%i:%s")  createTimeDate'];
            let table = moment(startTime).format("YYYYMM");
            where += ` AND GameRecord.id >= ${id}`;
            let sql = `        
                SELECT
                    ${select}
                FROM
                     Sp_GameRecord_${platformUid}_${table} AS GameRecord
                WHERE 
                    ${where}
                ORDER BY id ASC
                         LIMIT ${limit} 
                `;
            const result = await connectionManager_1.default.getConnection(true)
                .query(sql);
            return { list: result };
        }
        catch (e) {
            console.warn(e);
            return { list: [] };
        }
    }
    async fileOutDataForLength(platformUid, startTime, endTime, limit, uid, thirdUid) {
        try {
            let where = `GameRecord.createTimeDate >= "${startTime}" AND GameRecord.createTimeDate <= "${endTime}"
                         AND GameRecord.game_id NOT IN ("t1","t2")`;
            if (uid) {
                where = where + ` AND GameRecord.uid = "${uid}"`;
            }
            if (thirdUid) {
                where = where + ` AND GameRecord.thirdUid = "${thirdUid}"`;
            }
            let table = moment(startTime).format("YYYYMM");
            let count = 0;
            let selectCount = `COUNT(GameRecord.id) AS length`;
            let sqlCount = `        
            SELECT
                ${selectCount}
            FROM
                Sp_GameRecord_${platformUid}_${table} AS GameRecord
            WHERE 
                 ${where}`;
            const countResult = await connectionManager_1.default.getConnection(true)
                .query(sqlCount);
            for (let key of countResult) {
                count += Number(key.length);
            }
            return count;
        }
        catch (e) {
            console.warn(e);
            return 0;
        }
    }
    async fileOutDataForLengthForAgent(platformUid, agentName, startTime, endTime, limit, uid, thirdUid) {
        try {
            let where = `GameRecord.createTimeDate >= "${startTime}" AND GameRecord.createTimeDate <= "${endTime}"
                         AND GameRecord.groupRemark = "${agentName}"
                         AND GameRecord.game_id NOT IN ("t1","t2")`;
            if (uid) {
                where = where + ` AND GameRecord.uid = "${uid}"`;
            }
            if (thirdUid) {
                where = where + ` AND GameRecord.thirdUid = "${thirdUid}"`;
            }
            let table = moment(startTime).format("YYYYMM");
            let count = 0;
            let selectCount = `COUNT(GameRecord.id) AS length`;
            let sqlCount = `        
            SELECT
                ${selectCount}
            FROM
                Sp_GameRecord_${platformUid}_${table} AS GameRecord
            WHERE 
                 ${where}`;
            const countResult = await connectionManager_1.default.getConnection(true)
                .query(sqlCount);
            for (let key of countResult) {
                count += Number(key.length);
            }
            return count;
        }
        catch (e) {
            console.warn(e);
            return 0;
        }
    }
    async findListAgentLimitForWhereAndTime(where, startTime, endTime, page, limit) {
        try {
            const [list, count] = await connectionManager_1.default.getConnection(true)
                .getRepository(GameRecord_entity_1.GameRecord)
                .createQueryBuilder("GameRecord")
                .where(where)
                .orderBy("GameRecord.createTimeDate", "DESC")
                .select(['GameRecord.id', 'GameRecord.uid', 'GameRecord.thirdUid', 'GameRecord.groupRemark', 'GameRecord.nid', 'GameRecord.gameName', 'GameRecord.result', 'GameRecord.roundId', 'GameRecord.sceneId', 'GameRecord.roomId', 'GameRecord.gold',
                'GameRecord.validBet', 'GameRecord.input', 'GameRecord.profit', 'GameRecord.bet_commission', 'GameRecord.win_commission', 'GameRecord.settle_commission', 'GameRecord.gameOrder', 'GameRecord.createTimeDate'])
                .skip((page - 1) * limit)
                .take(limit)
                .getManyAndCount();
            return { list, count };
        }
        catch (e) {
            return false;
        }
    }
    async findForUidAndGroupId(uid, group_id, page) {
        try {
            let limit = 100;
            const time = moment().format("YYYYMM");
            let tableName = `Sp_GameRecord_${time}`;
            if (group_id) {
                tableName = `Sp_GameRecord_${group_id}_${time}`;
            }
            let select = ['Sp_GameRecord.id AS id', 'Sp_GameRecord.uid AS uid', 'Sp_GameRecord.groupRemark AS groupRemark', 'Sp_GameRecord.thirdUid AS thirdUid', 'Sp_GameRecord.gameName AS gameName',
                'Sp_GameRecord.game_id AS nid', 'Sp_GameRecord.sceneId AS sceneId', 'Sp_GameRecord.roomId AS roomId', 'Sp_GameRecord.gold AS gold', 'Sp_GameRecord.validBet AS validBet', 'Sp_GameRecord.round_id AS roundId',
                'Sp_GameRecord.profit AS profit', 'Sp_GameRecord.bet_commission AS bet_commission', 'Sp_GameRecord.win_commission AS win_commission', 'Sp_GameRecord.settle_commission AS settle_commission',
                'Sp_GameRecord.game_order_id AS gameOrder', 'DATE_FORMAT(Sp_GameRecord.createTimeDate,"%Y-%m-%d %H:%i:%s")  createTimeDate'];
            let selectCount = `COUNT(Sp_GameRecord.id) AS length`;
            let sql = `        
                SELECT
                    ${select}
                FROM
                     ${tableName} AS Sp_GameRecord
                WHERE 
                     Sp_GameRecord.uid = ${uid}
                `;
            let sqlCount = `        
                SELECT
                    ${selectCount}
                FROM
                    ${tableName} AS Sp_GameRecord
                WHERE 
                    Sp_GameRecord.uid = ${uid}
                `;
            let startLimit = (page - 1) * limit;
            sql = sql + `ORDER BY createTimeDate DESC
                         LIMIT ${startLimit} , ${limit}`;
            const result = await connectionManager_1.default.getConnection(true)
                .query(sql);
            const countResult = await connectionManager_1.default.getConnection(true)
                .query(sqlCount);
            let count = 0;
            for (let key of countResult) {
                count += Number(key.length);
            }
            return { list: result, count: count };
        }
        catch (e) {
            return false;
        }
    }
    async getTenantGameData(platformUid, where, table1, table2) {
        try {
            let sql = `
            SELECT  
                COUNT(gr.id) AS recordCount,
                 IFNULL(gr.thirdUid,'无') AS thirdUid,
                IFNULL(SUM(gr.validBet),0) AS validBetTotal,
                IFNULL(SUM(gr.profit),0) AS profitTotal,
                IFNULL(SUM(gr.win_commission),0) AS win_commissionTotal,
                IFNULL(SUM(gr.settle_commission),0) AS settle_commissionTotal
            FROM
                    Sp_GameRecord_${platformUid}_${table1} AS gr
            WHERE     
                ${where}
            GROUP BY gr.thirdUid
        `;
            let sql2 = null;
            if (table2) {
                sql2 = `
                    SELECT  
                        COUNT(gr.id) AS recordCount,
                         IFNULL(gr.thirdUid,'无') AS thirdUid,
                        IFNULL(SUM(gr.validBet),0) AS validBetTotal,
                        IFNULL(SUM(gr.profit),0) AS profitTotal,
                        IFNULL(SUM(gr.win_commission),0) AS win_commissionTotal,
                        IFNULL(SUM(gr.settle_commission),0) AS settle_commissionTotal
                    FROM
                            Sp_GameRecord_${platformUid}_${table2} AS gr
                    WHERE     
                            ${where}
                    GROUP BY gr.thirdUid
                    `;
            }
            if (sql2) {
                sql = sql + ` UNION ALL ` + sql2;
            }
            const total = await connectionManager_1.default.getConnection(true).query(sql);
            return total;
        }
        catch (e) {
            console.error(`查询指定租户游戏运营数据: ${e.stack}`);
            return [];
        }
    }
    async getPlatformData(tableName, startDateTime, endDateTime) {
        try {
            let sql = ` 
                    SELECT
                    IFNULL(gr.groupRemark,'无') AS groupRemark,
                    IFNULL(SUM(gr.validBet),0) AS validBetTotal,
                    IFNULL(SUM(gr.bet_commission),0) AS bet_commissionTotal,
                    IFNULL(SUM(gr.win_commission),0) AS win_commissionTotal,
                    IFNULL(SUM(gr.settle_commission),0) AS settle_commissionTotal
            FROM
                    ${tableName} AS gr
            WHERE           
                 gr.createTimeDate > "${startDateTime}"
                AND gr.createTimeDate <= "${endDateTime}"
                AND gr.game_id not in ('t1','t2')
              GROUP BY groupRemark`;
            const result = await connectionManager_1.default.getConnection(true)
                .query(sql);
            return result;
        }
        catch (e) {
            return false;
        }
    }
    async insertMany(parameterList) {
        try {
            await connectionManager_1.default.getConnection()
                .createQueryBuilder()
                .insert()
                .into(GameRecord_entity_1.GameRecord)
                .values(parameterList)
                .execute();
            return true;
        }
        catch (e) {
            console.error(`玩家代理关系表 | 批量插入 | 出错:${e.stack}`);
            return false;
        }
    }
    async deleteBetweenDate(startTime, endTime) {
        try {
            const { affected } = await connectionManager_1.default.getConnection()
                .createQueryBuilder()
                .delete()
                .from(GameRecord_entity_1.GameRecord)
                .where("createTimeDate BETWEEN :startTime AND :endTime", {
                startTime,
                endTime
            })
                .execute();
            return !!affected;
        }
        catch (e) {
            return false;
        }
    }
}
exports.GameRecordMysqlDao = GameRecordMysqlDao;
exports.default = new GameRecordMysqlDao();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiR2FtZVJlY29yZC5teXNxbC5kYW8uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9hcHAvY29tbW9uL2Rhby9teXNxbC9HYW1lUmVjb3JkLm15c3FsLmRhby50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSxvREFBK0M7QUFDL0Msa0VBQXdEO0FBRXhELHNFQUErRDtBQUMvRCxpQ0FBaUM7QUFFakMsTUFBYSxrQkFBbUIsU0FBUSwyQkFBdUI7SUFFM0QsS0FBSyxDQUFDLFFBQVEsQ0FBQyxTQUFzaUI7UUFDampCLElBQUk7WUFDQSxNQUFNLElBQUksR0FBRyxNQUFNLDJCQUFpQixDQUFDLGFBQWEsRUFBRTtpQkFDL0MsYUFBYSxDQUFDLDhCQUFVLENBQUM7aUJBQ3pCLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQztZQUVyQixPQUFPLElBQUksQ0FBQztTQUNmO1FBQUMsT0FBTyxDQUFDLEVBQUU7WUFDUixPQUFPLEVBQUUsQ0FBQztTQUNiO0lBQ0wsQ0FBQztJQUVELEtBQUssQ0FBQyxPQUFPLENBQUMsU0FBdWlCO1FBQ2pqQixJQUFJO1lBQ0EsTUFBTSxVQUFVLEdBQUcsTUFBTSwyQkFBaUIsQ0FBQyxhQUFhLEVBQUU7aUJBQ3JELGFBQWEsQ0FBQyw4QkFBVSxDQUFDO2lCQUN6QixPQUFPLENBQUMsU0FBUyxDQUFDLENBQUM7WUFFeEIsT0FBTyxVQUFVLENBQUM7U0FDckI7UUFBQyxPQUFPLENBQUMsRUFBRTtZQUNSLE9BQU8sSUFBSSxDQUFDO1NBQ2Y7SUFDTCxDQUFDO0lBRUQsS0FBSyxDQUFDLFNBQVMsQ0FBQyxTQUF1aUIsRUFBRSxhQUEyaUI7UUFDaG1DLElBQUk7WUFDQSxNQUFNLEVBQUUsUUFBUSxFQUFFLEdBQUcsTUFBTSwyQkFBaUIsQ0FBQyxhQUFhLEVBQUU7aUJBQ3ZELGFBQWEsQ0FBQyw4QkFBVSxDQUFDO2lCQUN6QixNQUFNLENBQUMsU0FBUyxFQUFFLGFBQWEsQ0FBQyxDQUFDO1lBQ3RDLE9B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