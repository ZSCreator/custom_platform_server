"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TenantGameDataDao = void 0;
const connectionManager_1 = require("../mysql/lib/connectionManager");
const moment = require("moment");
class TenantGameDataDao {
    async getTenantGameData(platformUid, groupRemark, startDateTime, endDateTime, tableName) {
        try {
            const sql = `
            SELECT  
                COUNT(gr.id) AS recordCount,
                IFNULL(gr.groupRemark,'无') AS groupRemark,
                IFNULL(gr.gameName,'无') AS gameName,
                IFNULL(SUM(gr.validBet),0) AS validBetTotal,
                COUNT(IF(gr.profit > 0,1,null)) AS winCount,
                SUM(IF(gr.profit>0,gr.profit,0)) AS winTotal,
                SUM(IF(gr.profit<0,gr.profit,0)) AS loseTotal,
                IFNULL(SUM(gr.profit),0) AS profitTotal,
                IFNULL(SUM(gr.bet_commission),0) AS bet_commissionTotal,
                IFNULL(SUM(gr.win_commission),0) AS win_commissionTotal,
                IFNULL(SUM(gr.settle_commission),0) AS settle_commissionTotal
            FROM
                    Sp_GameRecord_${platformUid}_${tableName} AS gr
            WHERE     
             gr.groupRemark = "${groupRemark}"
            AND  gr.game_id not in ('t1','t2')
            AND gr.createTimeDate >= "${startDateTime}"
            AND gr.createTimeDate < "${endDateTime}"
            GROUP BY gr.gameName
        `;
            const total = await connectionManager_1.default.getConnection(true).query(sql);
            return total;
        }
        catch (e) {
            console.error(`查询指定租户游戏运营数据: ${e.stack}`);
            return [];
        }
    }
    async getTenantGameYesterDayData(platformUid, groupRemark, dateTimeList) {
        try {
            const [yesterdayDate, todayDate] = dateTimeList;
            let yesterdayStartTime = yesterdayDate[0];
            let yesterdayEndTime = yesterdayDate[1];
            let todayStartTime = null;
            let todayEndTime = null;
            if (todayDate.length > 0) {
                todayStartTime = todayDate[0];
                todayEndTime = todayDate[1];
            }
            let table1 = null;
            let table2 = null;
            const tableName = moment().format("YYYYMM");
            if (todayDate.length > 0) {
                table1 = `Sp_GameRecord_${platformUid}_${tableName}`;
            }
            if (yesterdayDate.length > 0) {
                table2 = `Sum_TenantOperationalData`;
            }
            let sql_1 = null;
            let sql_2 = null;
            let sql = null;
            if (table1) {
                sql_1 = `
                   ( SELECT  
                        COUNT(gr.id) AS recordCount,
                        IFNULL(gr.groupRemark,'无') AS groupRemark,
                        IFNULL(gr.gameName,'无') AS gameName,
                        IFNULL(SUM(gr.validBet),0) AS validBetTotal,
                        COUNT(IF(gr.profit > 0,1,null)) AS winCount,
                        SUM(IF(gr.profit>0,gr.profit,0)) AS winTotal,
                        SUM(IF(gr.profit<0,gr.profit,0)) AS loseTotal,
                        IFNULL(SUM(gr.profit),0) AS profitTotal,
                        IFNULL(SUM(gr.bet_commission),0) AS bet_commissionTotal,
                        IFNULL(SUM(gr.win_commission),0) AS win_commissionTotal,
                        IFNULL(SUM(gr.settle_commission),0) AS settle_commissionTotal
                    FROM
                            ${table1} AS gr
                    WHERE     
                     gr.groupRemark = "${groupRemark}"
                    AND  gr.game_id not in ('t1','t2')
                    AND gr.createTimeDate > "${todayStartTime}"
                    AND gr.createTimeDate <= "${todayEndTime}"
                    GROUP BY gr.gameName )`;
            }
            if (table2) {
                sql_2 = `
                   ( SELECT  
                    SUM(Tenant.recordCount) AS recordCount,
					IFNULL(Tenant.groupRemark,'无') AS groupRemark,
					IFNULL(Tenant.gameName,'无') AS gameName,
                    IFNULL(SUM(Tenant.validBetTotal),0) AS validBetTotal,
					IFNULL(SUM(Tenant.winCount),0) AS winCount,
					IFNULL(SUM(Tenant.winTotal),0) AS winTotal,
					IFNULL(SUM(Tenant.loseTotal),0) AS loseTotal,
                    IFNULL(SUM(Tenant.profitTotal),0) AS profitTotal,
                    IFNULL(SUM(Tenant.bet_commissionTotal),0) AS bet_commissionTotal,
                    IFNULL(SUM(Tenant.win_commissionTotal),0) AS win_commissionTotal,
                    IFNULL(SUM(Tenant.settle_commissionTotal),0) AS settle_commissionTotal
                    FROM
                            ${table2} AS Tenant
                    WHERE     
                        Tenant.groupRemark = "${groupRemark}"
                    AND Tenant.sumDate >= "${yesterdayStartTime}"
                    AND Tenant.sumDate < "${yesterdayEndTime}"
                    GROUP BY Tenant.gameName ,Tenant.groupRemark )`;
            }
            if (sql_1) {
                sql = sql_1;
            }
            if (sql_2) {
                if (sql) {
                    sql = sql + ` UNION ALL ` + sql_2;
                }
                else {
                    sql = sql_2;
                }
            }
            const total = await connectionManager_1.default.getConnection(true).query(sql);
            return total;
        }
        catch (e) {
            console.error(`查询指定租户游戏运营数据: ${e.stack}`);
            return [];
        }
    }
    async getAllPlatformGameData(platformUidList, dateTimeList, platformUid = null, tableName) {
        try {
            const [yesterdayDate, middleData, todayDate] = dateTimeList;
            let sqlToday = null;
            let sqlMiddleday = null;
            let sqlYesterday = null;
            if (todayDate.length > 0) {
                for (let key of platformUidList) {
                    if (sqlToday) {
                        sqlToday = sqlToday + "UNION ALL" +
                            `
                               ( WITH playerAgent  AS (
                                SELECT
                                        pa.parent_uid as parent_uid,
                                        pa.fk_uid  as uid,
                                        pa.platform_name AS platform_name
                                FROM
                                        Sp_Player_Agent AS pa                 
                                WHERE
                                        pa.role_type  = 3
                                ) 
                                SELECT  
                                    COUNT(gr.id) AS recordCount,
                                    IFNULL(gr.groupRemark,'无') AS groupRemark,
                                    IFNULL(playerAgent.parent_uid,'无') AS parentUid,
                                    IFNULL(playerAgent.uid,'无') AS uid,
                                    IFNULL(SUM(gr.validBet),0) AS validBetTotal,
                                    COUNT(IF(gr.profit > 0,1,null)) AS winCount,
                                    SUM(IF(gr.profit>0,gr.profit,0)) AS winTotal,
                                    SUM(IF(gr.profit<0,gr.profit,0)) AS loseTotal,
                                    IFNULL(SUM(gr.profit),0) AS profitTotal,
                                    IFNULL(SUM(gr.bet_commission),0) AS bet_commissionTotal,
                                    IFNULL(SUM(gr.win_commission),0) AS win_commissionTotal,
                                    IFNULL(SUM(gr.settle_commission),0) AS settle_commissionTotal,
                                    "${todayDate[0]}" AS startTime,
                                    "${todayDate[1]}" AS endTime
                                FROM
                                    Sp_GameRecord_${key.platformUid}_${tableName} AS gr
                                RIGHT JOIN playerAgent ON  playerAgent.platform_name =  gr.groupRemark 
                                WHERE
                                           
                                        gr.createTimeDate >= "${todayDate[0]}"
                                    AND gr.createTimeDate < "${todayDate[1]}"
                                    AND gr.game_id not in ('t1','t2')
                                GROUP BY groupRemark,parentUid,uid )
                            `;
                    }
                    else {
                        sqlToday = `
                              ( WITH playerAgent  AS (
                                SELECT
                                        pa.parent_uid as parent_uid,
                                        pa.fk_uid  as uid,
                                        pa.platform_name AS platform_name
                                FROM
                                        Sp_Player_Agent AS pa                 
                                WHERE
                                        pa.role_type  = 3
                                ) 
                                SELECT  
                                    COUNT(gr.id) AS recordCount,
                                    IFNULL(gr.groupRemark,'无') AS groupRemark,
                                    IFNULL(playerAgent.parent_uid,'无') AS parentUid,
                                    IFNULL(playerAgent.uid,'无') AS uid,
                                    IFNULL(SUM(gr.validBet),0) AS validBetTotal,
                                    COUNT(IF(gr.profit > 0,1,null)) AS winCount,
                                    SUM(IF(gr.profit>0,gr.profit,0)) AS winTotal,
                                    SUM(IF(gr.profit<0,gr.profit,0)) AS loseTotal,
                                    IFNULL(SUM(gr.profit),0) AS profitTotal,
                                    IFNULL(SUM(gr.bet_commission),0) AS bet_commissionTotal,
                                    IFNULL(SUM(gr.win_commission),0) AS win_commissionTotal,
                                    IFNULL(SUM(gr.settle_commission),0) AS settle_commissionTotal,
                                    "${todayDate[0]}" AS startTime,
                                    "${todayDate[1]}" AS endTime
                                FROM
                                    Sp_GameRecord_${key.platformUid}_${tableName} AS gr
                                RIGHT JOIN playerAgent ON  playerAgent.platform_name =  gr.groupRemark 
                                WHERE
                                           
                                        gr.createTimeDate >= "${todayDate[0]}"
                                    AND gr.createTimeDate < "${todayDate[1]}"
                                    AND gr.game_id not in ('t1','t2')
                                GROUP BY groupRemark,parentUid,uid )
                            `;
                    }
                }
            }
            if (middleData.length > 0) {
                sqlMiddleday = `
                   ( SELECT  
                        SUM(Tenant.recordCount) AS recordCount,
                        IFNULL(Tenant.groupRemark,'无') AS groupRemark,
                        Tenant.parentUid AS parentUid,
                        Tenant.fk_uid AS uid,
                        IFNULL(SUM(Tenant.validBetTotal),0) AS validBetTotal,
                        IFNULL(SUM(Tenant.winCount),0) AS winCount,
                        IFNULL(SUM(Tenant.winTotal),0) AS winTotal,
                        IFNULL(SUM(Tenant.loseTotal),0) AS loseTotal,
                        IFNULL(SUM(Tenant.profitTotal),0) AS profitTotal,
                        IFNULL(SUM(Tenant.bet_commissionTotal),0) AS bet_commissionTotal,
                        IFNULL(SUM(Tenant.win_commissionTotal),0) AS win_commissionTotal,
                        IFNULL(SUM(Tenant.settle_commissionTotal),0) AS settle_commissionTotal,
                        "${middleData[0]}" AS startTime,
                        "${middleData[1]}" AS endTime
                    FROM
                            Sum_TenantOperationalData AS Tenant
                    WHERE           
                     Tenant.sumDate >= "${middleData[0]}"
                    AND Tenant.sumDate <  "${middleData[1]}"
                    GROUP BY Tenant.groupRemark, parentUid,uid )
                `;
            }
            if (yesterdayDate.length > 0) {
                for (let key of platformUidList) {
                    if (sqlYesterday) {
                        sqlYesterday = sqlYesterday + "UNION ALL" +
                            `
                               ( WITH playerAgent  AS (
                                SELECT
                                        pa.parent_uid as parent_uid,
                                        pa.fk_uid  as uid,
                                        pa.platform_name AS platform_name
                                FROM
                                        Sp_Player_Agent AS pa                 
                                WHERE
                                        pa.role_type  = 3
                                ) 
                                SELECT  
                                    COUNT(gr.id) AS recordCount,
                                    IFNULL(gr.groupRemark,'无') AS groupRemark,
                                    IFNULL(playerAgent.parent_uid,'无') AS parentUid,
                                    IFNULL(playerAgent.uid,'无') AS uid,
                                    IFNULL(SUM(gr.validBet),0) AS validBetTotal,
                                    COUNT(IF(gr.profit > 0,1,null)) AS winCount,
                                    SUM(IF(gr.profit>0,gr.profit,0)) AS winTotal,
                                    SUM(IF(gr.profit<0,gr.profit,0)) AS loseTotal,
                                    IFNULL(SUM(gr.profit),0) AS profitTotal,
                                    IFNULL(SUM(gr.bet_commission),0) AS bet_commissionTotal,
                                    IFNULL(SUM(gr.win_commission),0) AS win_commissionTotal,
                                    IFNULL(SUM(gr.settle_commission),0) AS settle_commissionTotal,
                                    "${yesterdayDate[0]}" AS startTime,
                                    "${yesterdayDate[1]}" AS endTime
                                FROM
                                    Sp_GameRecord_${key.platformUid}_${tableName} AS gr
                                RIGHT JOIN playerAgent ON  playerAgent.platform_name =  gr.groupRemark 
                                WHERE
                                           
                                        gr.createTimeDate >= "${yesterdayDate[0]}"
                                    AND gr.createTimeDate < "${yesterdayDate[1]}"
                                    AND gr.game_id not in ('t1','t2')
                                GROUP BY groupRemark,parentUid,uid )
                            `;
                    }
                    else {
                        sqlYesterday = `
                              ( WITH playerAgent  AS (
                                SELECT
                                        pa.parent_uid as parent_uid,
                                        pa.fk_uid  as uid,
                                        pa.platform_name AS platform_name
                                FROM
                                        Sp_Player_Agent AS pa                 
                                WHERE
                                        pa.role_type  = 3
                                ) 
                                SELECT  
                                    COUNT(gr.id) AS recordCount,
                                    IFNULL(gr.groupRemark,'无') AS groupRemark,
                                    IFNULL(playerAgent.parent_uid,'无') AS parentUid,
                                    IFNULL(playerAgent.uid,'无') AS uid,
                                    IFNULL(SUM(gr.validBet),0) AS validBetTotal,
                                    COUNT(IF(gr.profit > 0,1,null)) AS winCount,
                                    SUM(IF(gr.profit>0,gr.profit,0)) AS winTotal,
                                    SUM(IF(gr.profit<0,gr.profit,0)) AS loseTotal,
                                    IFNULL(SUM(gr.profit),0) AS profitTotal,
                                    IFNULL(SUM(gr.bet_commission),0) AS bet_commissionTotal,
                                    IFNULL(SUM(gr.win_commission),0) AS win_commissionTotal,
                                    IFNULL(SUM(gr.settle_commission),0) AS settle_commissionTotal,
                                    "${yesterdayDate[0]}" AS startTime,
                                    "${yesterdayDate[1]}" AS endTime
                                FROM
                                    Sp_GameRecord_${key.platformUid}_${tableName} AS gr
                                RIGHT JOIN playerAgent ON  playerAgent.platform_name =  gr.groupRemark 
                                WHERE
                                        gr.createTimeDate >= "${yesterdayDate[0]}"
                                    AND gr.createTimeDate < "${yesterdayDate[1]}"
                                    AND gr.game_id not in ('t1','t2')
                                GROUP BY groupRemark,parentUid,uid )
                            `;
                    }
                }
            }
            let sql = null;
            if (sqlYesterday) {
                sql = sqlYesterday;
            }
            if (sqlMiddleday) {
                if (sql) {
                    sql = sql + "UNION ALL" + sqlMiddleday;
                }
                else {
                    sql = sqlMiddleday;
                }
            }
            if (sqlToday) {
                if (sql) {
                    sql = sql + "UNION ALL" + sqlToday;
                }
                else {
                    sql = sqlToday;
                }
            }
            if (sql) {
                const total = await connectionManager_1.default.getConnection(true)
                    .query(sql);
                return total;
            }
            else {
                return null;
            }
        }
        catch (e) {
            console.error(`查询${!!platformUid ? platformUid : "所有"}平台运营数据出错: ${e.stack}`);
            return [];
        }
    }
    async getPlatformGameData(dateTimeList, platformUid, tableName, list) {
        try {
            const [yesterdayDate, middleData, todayDate] = dateTimeList;
            let sqlToday = null;
            let sqlMiddleday = null;
            let sqlYesterday = null;
            if (todayDate.length > 0) {
                sqlToday = `
                (
                WITH playerAgent  AS (
                SELECT
                        pa.parent_uid as parent_uid,
                        pa.fk_uid  as uid,
                        pa.platform_name AS platform_name
                FROM
                        Sp_Player_Agent AS pa                 
                WHERE
                        pa.role_type  = 3
                ) 
                SELECT  
                    COUNT(gr.id) AS recordCount,
                    IFNULL(gr.groupRemark,'无') AS groupRemark,
                    IFNULL(playerAgent.parent_uid,'无') AS parentUid,
                    IFNULL(playerAgent.uid,'无') AS uid,
                    IFNULL(SUM(gr.validBet),0) AS validBetTotal,
                    COUNT(IF(gr.profit > 0,1,null)) AS winCount,
                    SUM(IF(gr.profit>0,gr.profit,0)) AS winTotal,
                    SUM(IF(gr.profit<0,gr.profit,0)) AS loseTotal,
                    IFNULL(SUM(gr.profit),0) AS profitTotal,
                    IFNULL(SUM(gr.bet_commission),0) AS bet_commissionTotal,
                    IFNULL(SUM(gr.win_commission),0) AS win_commissionTotal,
                    IFNULL(SUM(gr.settle_commission),0) AS settle_commissionTotal,
                    "${todayDate[0]}" AS startTime,
                    "${todayDate[1]}" AS endTime
                FROM
                    Sp_GameRecord_${platformUid}_${tableName} AS gr
                RIGHT JOIN playerAgent ON  playerAgent.platform_name =  gr.groupRemark 
                WHERE
                           
                        gr.createTimeDate >= "${todayDate[0]}"
                    AND gr.createTimeDate < "${todayDate[1]}"
                    AND gr.game_id not in ('t1','t2')
                GROUP BY groupRemark,parentUid,uid
                )
                `;
            }
            if (middleData.length > 0) {
                sqlMiddleday = `
                    (SELECT  
                        SUM(Tenant.recordCount) AS recordCount,
                        IFNULL(Tenant.groupRemark,'无') AS groupRemark,
                        Tenant.parentUid AS parentUid,
                        Tenant.fk_uid AS uid,
                        IFNULL(SUM(Tenant.validBetTotal),0) AS validBetTotal,
                        IFNULL(SUM(Tenant.winCount),0) AS winCount,
                        IFNULL(SUM(Tenant.winTotal),0) AS winTotal,
                        IFNULL(SUM(Tenant.loseTotal),0) AS loseTotal,
                        IFNULL(SUM(Tenant.profitTotal),0) AS profitTotal,
                        IFNULL(SUM(Tenant.bet_commissionTotal),0) AS bet_commissionTotal,
                        IFNULL(SUM(Tenant.win_commissionTotal),0) AS win_commissionTotal,
                        IFNULL(SUM(Tenant.settle_commissionTotal),0) AS settle_commissionTotal,
                        "${middleData[0]}" AS startTime,
                        "${middleData[1]}" AS endTime
                    FROM
                            Sum_TenantOperationalData AS Tenant
                    WHERE           
                     Tenant.sumDate >= "${middleData[0]}"
                    AND Tenant.sumDate <  "${middleData[1]}"
                    AND Tenant.groupRemark in (${list})
                    GROUP BY Tenant.groupRemark, parentUid,uid)
                `;
            }
            if (yesterdayDate.length > 0) {
                sqlYesterday = `
                (
                WITH playerAgent  AS (
                SELECT
                        pa.parent_uid as parent_uid,
                        pa.fk_uid  as uid,
                        pa.platform_name AS platform_name
                FROM
                        Sp_Player_Agent AS pa                 
                WHERE
                        pa.role_type  = 3
                ) 
                SELECT  
                    COUNT(gr.id) AS recordCount,
                    IFNULL(gr.groupRemark,'无') AS groupRemark,
                    IFNULL(playerAgent.parent_uid,'无') AS parentUid,
                    IFNULL(playerAgent.uid,'无') AS uid,
                    IFNULL(SUM(gr.validBet),0) AS validBetTotal,
                    COUNT(IF(gr.profit > 0,1,null)) AS winCount,
                    SUM(IF(gr.profit>0,gr.profit,0)) AS winTotal,
                    SUM(IF(gr.profit<0,gr.profit,0)) AS loseTotal,
                    IFNULL(SUM(gr.profit),0) AS profitTotal,
                    IFNULL(SUM(gr.bet_commission),0) AS bet_commissionTotal,
                    IFNULL(SUM(gr.win_commission),0) AS win_commissionTotal,
                    IFNULL(SUM(gr.settle_commission),0) AS settle_commissionTotal,
                    "${yesterdayDate[0]}" AS startTime,
                    "${yesterdayDate[1]}" AS endTime
                FROM
                    Sp_GameRecord_${platformUid}_${tableName} AS gr
                RIGHT JOIN playerAgent ON  playerAgent.platform_name =  gr.groupRemark 
                WHERE
                           
                        gr.createTimeDate >= "${yesterdayDate[0]}"
                    AND gr.createTimeDate < "${yesterdayDate[1]}"
                    AND gr.game_id not in ('t1','t2')
                GROUP BY groupRemark,parentUid,uid
                )
                `;
            }
            let sql = null;
            if (sqlYesterday) {
                sql = sqlYesterday;
            }
            if (sqlMiddleday) {
                if (sql) {
                    sql = sql + "UNION ALL" + sqlMiddleday;
                }
                else {
                    sql = sqlMiddleday;
                }
            }
            if (sqlToday) {
                if (sql) {
                    sql = sql + "UNION ALL" + sqlToday;
                }
                else {
                    sql = sqlToday;
                }
            }
            if (sql) {
                const total = await connectionManager_1.default.getConnection(true)
                    .query(sql);
                return total;
            }
            else {
                return null;
            }
        }
        catch (e) {
            console.error(`查询${!!platformUid ? platformUid : "所有"}平台运营数据出错: ${e.stack}`);
            return [];
        }
    }
    async getOnePlatformGameData(dateTimeList, platformName = null, tableName, platformUid) {
        try {
            const [yesterdayDate, middleData, todayDate] = dateTimeList;
            let sqlToday = null;
            let sqlMiddleday = null;
            let sqlYesterday = null;
            if (todayDate.length > 0) {
                sqlToday = `
               ( WITH playerAgent  AS (
                SELECT
                        pa.parent_uid as parent_uid,
                        pa.fk_uid  as uid,
                        pa.platform_name AS platform_name
                FROM
                        Sp_Player_Agent AS pa                 
                WHERE
                        pa.role_type  = 3
                ) 
                SELECT  
                    COUNT(gr.id) AS recordCount,
                    IFNULL(gr.groupRemark,'无') AS groupRemark,
                    IFNULL(playerAgent.parent_uid,'无') AS parentUid,
                    IFNULL(playerAgent.uid,'无') AS uid,
                    IFNULL(SUM(gr.validBet),0) AS validBetTotal,
                    COUNT(IF(gr.profit > 0,1,null)) AS winCount,
                    SUM(IF(gr.profit>0,gr.profit,0)) AS winTotal,
                    SUM(IF(gr.profit<0,gr.profit,0)) AS loseTotal,
                    IFNULL(SUM(gr.profit),0) AS profitTotal,
                    IFNULL(SUM(gr.bet_commission),0) AS bet_commissionTotal,
                    IFNULL(SUM(gr.win_commission),0) AS win_commissionTotal,
                    IFNULL(SUM(gr.settle_commission),0) AS settle_commissionTotal,
                    "${todayDate[0]}" AS startTime,
                    "${todayDate[1]}" AS endTime
                FROM
                    Sp_GameRecord_${platformUid}_${tableName} AS gr
                RIGHT JOIN playerAgent ON  playerAgent.platform_name =  gr.groupRemark 
                WHERE       
                        gr.createTimeDate >= "${todayDate[0]}"
                    AND gr.createTimeDate < "${todayDate[1]}"    
                    AND gr.groupRemark = "${platformName}"
					AND gr.game_id not in ('t1','t2')
                   
                GROUP BY groupRemark,parentUid,uid
                )
                `;
            }
            if (middleData.length > 0) {
                sqlMiddleday = `
                   ( SELECT  
                        SUM(Tenant.recordCount) AS recordCount,
                        IFNULL(Tenant.groupRemark,'无') AS groupRemark,
                        Tenant.parentUid AS parentUid,
                        Tenant.fk_uid AS uid,
                        IFNULL(SUM(Tenant.validBetTotal),0) AS validBetTotal,
                        IFNULL(SUM(Tenant.winCount),0) AS winCount,
                        IFNULL(SUM(Tenant.winTotal),0) AS winTotal,
                        IFNULL(SUM(Tenant.loseTotal),0) AS loseTotal,
                        IFNULL(SUM(Tenant.profitTotal),0) AS profitTotal,
                        IFNULL(SUM(Tenant.bet_commissionTotal),0) AS bet_commissionTotal,
                        IFNULL(SUM(Tenant.win_commissionTotal),0) AS win_commissionTotal,
                        IFNULL(SUM(Tenant.settle_commissionTotal),0) AS settle_commissionTotal,
                        "${middleData[0]}" AS startTime,
                        "${middleData[1]}" AS endTime
                    FROM
                            Sum_TenantOperationalData AS Tenant
                    WHERE   
                         Tenant.groupRemark = "${platformName}"     
                     AND Tenant.sumDate >= "${middleData[0]}"
                    AND Tenant.sumDate <  "${middleData[1]}"
                    GROUP BY Tenant.groupRemark, parentUid,uid
                    )
                `;
            }
            if (yesterdayDate.length > 0) {
                sqlYesterday = `
               ( WITH playerAgent  AS (
                SELECT
                        pa.parent_uid as parent_uid,
                        pa.fk_uid  as uid,
                        pa.platform_name AS platform_name
                FROM
                        Sp_Player_Agent AS pa                 
                WHERE
                        pa.role_type  = 3
                ) 
                SELECT  
                    COUNT(gr.id) AS recordCount,
                    IFNULL(gr.groupRemark,'无') AS groupRemark,
                    IFNULL(playerAgent.parent_uid,'无') AS parentUid,
                    IFNULL(playerAgent.uid,'无') AS uid,
                    IFNULL(SUM(gr.validBet),0) AS validBetTotal,
                    COUNT(IF(gr.profit > 0,1,null)) AS winCount,
                    SUM(IF(gr.profit>0,gr.profit,0)) AS winTotal,
                    SUM(IF(gr.profit<0,gr.profit,0)) AS loseTotal,
                    IFNULL(SUM(gr.profit),0) AS profitTotal,
                    IFNULL(SUM(gr.bet_commission),0) AS bet_commissionTotal,
                    IFNULL(SUM(gr.win_commission),0) AS win_commissionTotal,
                    IFNULL(SUM(gr.settle_commission),0) AS settle_commissionTotal,
                    "${yesterdayDate[0]}" AS startTime,
                    "${yesterdayDate[1]}" AS endTime
                FROM
                    Sp_GameRecord_${platformUid}_${tableName} AS gr
                RIGHT JOIN playerAgent ON  playerAgent.platform_name =  gr.groupRemark 
                WHERE       
                        gr.createTimeDate >= "${yesterdayDate[0]}"
                    AND gr.createTimeDate < "${yesterdayDate[1]}"    
                    AND gr.groupRemark = "${platformName}"
					AND gr.game_id not in ('t1','t2')
                   
                GROUP BY groupRemark,parentUid,uid
                )
                `;
            }
            let sql = null;
            if (sqlYesterday) {
                sql = sqlYesterday;
            }
            if (sqlMiddleday) {
                if (sql) {
                    sql = sql + "UNION ALL" + sqlMiddleday;
                }
                else {
                    sql = sqlMiddleday;
                }
            }
            if (sqlToday) {
                if (sql) {
                    sql = sql + "UNION ALL" + sqlToday;
                }
                else {
                    sql = sqlToday;
                }
            }
            if (sql) {
                const total = await connectionManager_1.default.getConnection(true)
                    .query(sql);
                return total;
            }
            else {
                return null;
            }
        }
        catch (e) {
            console.error(`查询${!!platformName ? platformName : "一个"}租户运营数据出错: ${e.stack}`);
            return [];
        }
    }
    async getTenantOperationalDataListForToday(platformUid, startDateTime, endDateTime, tableName) {
        try {
            const sql = `
            WITH playerAgent  AS (
            SELECT
                    pa.parent_uid as parent_uid,
                    pa.fk_uid  as uid,
                    pa.platform_name AS platform_name
            FROM
                    Sp_Player_Agent AS pa                 
            WHERE
                    pa.role_type  = 3
            ) 
            SELECT  
                COUNT(gr.id) AS recordCount,
                IFNULL(gr.groupRemark,'无') AS groupRemark,
                IFNULL(playerAgent.parent_uid,'无') AS parent_uid,
                IFNULL(playerAgent.uid,'无') AS uid,
                IFNULL(SUM(gr.validBet),0) AS validBetTotal,
                COUNT(IF(gr.profit > 0,1,null)) AS winCount,
                SUM(IF(gr.profit>0,gr.profit,0)) AS winTotal,
                SUM(IF(gr.profit<0,gr.profit,0)) AS loseTotal,
                IFNULL(SUM(gr.profit),0) AS profitTotal,
                IFNULL(SUM(gr.bet_commission),0) AS bet_commissionTotal,
                IFNULL(SUM(gr.win_commission),0) AS win_commissionTotal,
                IFNULL(SUM(gr.settle_commission),0) AS settle_commissionTotal
            FROM
                    Sp_GameRecord_${platformUid}_${tableName} AS gr
                    RIGHT JOIN playerAgent ON  playerAgent.platform_name =  gr.groupRemark 
            WHERE           
                 gr.createTimeDate > "${startDateTime}"
                AND gr.createTimeDate <= "${endDateTime}"
                AND  gr.game_id not in ('t1','t2')
            GROUP BY groupRemark,parent_uid,uid
        `;
            const total = await connectionManager_1.default.getConnection(true)
                .query(sql);
            return total;
        }
        catch (e) {
            console.error(`查询今日租户运营数据出错: ${e.stack}`);
            return [];
        }
    }
    async getTenantMonthData() {
        try {
            const startTime = moment().startOf('month').format('YYYY-MM-DD 00:00:00');
            const endTime = moment().endOf('month').format('YYYY-MM-DD 23:59:59');
            const sql = `
                 SELECT  
                        IFNULL(Tenant.groupRemark,'无') AS groupRemark,
                        IFNULL(SUM(Tenant.validBetTotal),0) AS validBetTotal,
                        IFNULL(SUM(Tenant.profitTotal),0) AS profitTotal
                    FROM
                            Sum_TenantOperationalData AS Tenant
                    WHERE           
                     Tenant.sumDate >= "${startTime}"
                    AND Tenant.sumDate <  "${endTime}"
                    GROUP BY Tenant.groupRemark 
        `;
            const total = await connectionManager_1.default.getConnection(true)
                .query(sql);
            return total;
        }
        catch (e) {
            console.error(`查询每个代理一个月的杀率: ${e.stack}`);
            return [];
        }
    }
    async getHotGameData(startTime, endTime, tableDate, tableName) {
        try {
            let sql = null;
            for (let platformUid of tableName) {
                if (sql) {
                    sql = sql + `
                    UNION ALL
                     (SELECT  
                        IFNULL(gr.gameName,'无') AS gameName,
						IFNULL(gr.game_id,'无') AS game_id,
						IFNULL(gr.sceneId,0) AS sceneId,
                        COUNT(distinct gr.uid) AS uid,
                        IFNULL(SUM(gr.validBet),0) AS validBetTotal,
                        SUM(IF(gr.profit>0,gr.profit,0)) AS winTotal,
                        SUM(IF(gr.profit<0,gr.profit,0)) AS loseTotal,
                        IFNULL(SUM(gr.profit),0) AS profitTotal,
                    FROM
                            Sp_GameRecord_${platformUid}_${tableDate} AS gr
                    WHERE           
                         gr.createTimeDate > "${startTime}"
                        AND gr.createTimeDate <= "${endTime}"
                        AND  gr.game_id not in ('t1','t2')
                    GROUP BY groupRemark,parent_uid,uid)
                `;
                }
                else {
                    sql = `
                     (SELECT  
                        COUNT(distinct gr.uid) AS recordCount,
                        IFNULL(SUM(gr.validBet),0) AS validBetTotal,
                        SUM(IF(gr.profit>0,gr.profit,0)) AS winTotal,
                        SUM(IF(gr.profit<0,gr.profit,0)) AS loseTotal,
                        IFNULL(SUM(gr.profit),0) AS profitTotal,
                        IFNULL(SUM(gr.bet_commission),0) AS bet_commissionTotal,
                        IFNULL(SUM(gr.win_commission),0) AS win_commissionTotal,
                        IFNULL(SUM(gr.settle_commission),0) AS settle_commissionTotal
                    FROM
                            Sp_GameRecord_${platformUid}_${tableDate} AS gr
                    WHERE           
                         gr.createTimeDate > "${startTime}"
                        AND gr.createTimeDate <= "${endTime}"
                        AND  gr.game_id not in ('t1','t2')
                    GROUP BY groupRemark,parent_uid,uid )
                `;
                }
            }
            const total = await connectionManager_1.default.getConnection(true)
                .query(sql);
            return total;
        }
        catch (e) {
            console.error(`查询每个代理一个月的杀率: ${e.stack}`);
            return [];
        }
    }
}
exports.TenantGameDataDao = TenantGameDataDao;
exports.default = new TenantGameDataDao();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVGVuYW50R2FtZURhdGEubXlzcWwuZGFvLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vYXBwL2NvbW1vbi9kYW8vbXlzcWwvVGVuYW50R2FtZURhdGEubXlzcWwuZGFvLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUFBLHNFQUErRDtBQUMvRCxpQ0FBaUM7QUFFakMsTUFBYSxpQkFBaUI7SUFRMUIsS0FBSyxDQUFDLGlCQUFpQixDQUFFLFdBQW9CLEVBQUUsV0FBbUIsRUFBRSxhQUFxQixFQUFFLFdBQW1CLEVBQUcsU0FBa0I7UUFDL0gsSUFBSTtZQUNBLE1BQU0sR0FBRyxHQUFHOzs7Ozs7Ozs7Ozs7OztvQ0FjWSxXQUFXLElBQUksU0FBUzs7aUNBRTNCLFdBQVc7O3dDQUVKLGFBQWE7dUNBQ2QsV0FBVzs7U0FFekMsQ0FBQztZQUNFLE1BQU0sS0FBSyxHQUFHLE1BQU0sMkJBQWlCLENBQUMsYUFBYSxDQUFDLElBQUksQ0FBQyxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQztZQUNyRSxPQUFPLEtBQUssQ0FBQztTQUNoQjtRQUFDLE9BQU8sQ0FBQyxFQUFFO1lBQ1IsT0FBTyxDQUFDLEtBQUssQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDLEtBQUssRUFBRSxDQUFDLENBQUM7WUFDMUMsT0FBTyxFQUFFLENBQUM7U0FDYjtJQUNMLENBQUM7SUFTRCxLQUFLLENBQUMsMEJBQTBCLENBQUMsV0FBb0IsRUFBRSxXQUFtQixFQUFFLFlBQWtDO1FBQzFHLElBQUk7WUFDQSxNQUFNLENBQUMsYUFBYSxFQUFFLFNBQVMsQ0FBQyxHQUFHLFlBQVksQ0FBQztZQUNoRCxJQUFJLGtCQUFrQixHQUFHLGFBQWEsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUMxQyxJQUFJLGdCQUFnQixHQUFHLGFBQWEsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUV4QyxJQUFJLGNBQWMsR0FBRyxJQUFJLENBQUM7WUFDMUIsSUFBSSxZQUFZLEdBQUcsSUFBSSxDQUFDO1lBQ3hCLElBQUcsU0FBUyxDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUM7Z0JBQ3BCLGNBQWMsR0FBRyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUE7Z0JBQzdCLFlBQVksR0FBRyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUE7YUFDOUI7WUFDRCxJQUFJLE1BQU0sR0FBRyxJQUFJLENBQUU7WUFDbkIsSUFBSSxNQUFNLEdBQUcsSUFBSSxDQUFFO1lBQ25CLE1BQU0sU0FBUyxHQUFHLE1BQU0sRUFBRSxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsQ0FBQztZQUU1QyxJQUFHLFNBQVMsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFDO2dCQUNwQixNQUFNLEdBQUksaUJBQWlCLFdBQVcsSUFBSSxTQUFTLEVBQUUsQ0FBQzthQUN6RDtZQUNELElBQUcsYUFBYSxDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUM7Z0JBQ3hCLE1BQU0sR0FBSywyQkFBMkIsQ0FBQzthQUMxQztZQUVELElBQUksS0FBSyxHQUFHLElBQUksQ0FBQztZQUNqQixJQUFJLEtBQUssR0FBRyxJQUFJLENBQUM7WUFDakIsSUFBSSxHQUFHLEdBQUcsSUFBSSxDQUFDO1lBQ2QsSUFBRyxNQUFNLEVBQUM7Z0JBQ0wsS0FBSyxHQUFHOzs7Ozs7Ozs7Ozs7Ozs4QkFjSSxNQUFNOzt5Q0FFSyxXQUFXOzsrQ0FFTCxjQUFjO2dEQUNiLFlBQVk7MkNBQ2pCLENBQUE7YUFDN0I7WUFFRCxJQUFHLE1BQU0sRUFBQztnQkFDTCxLQUFLLEdBQUc7Ozs7Ozs7Ozs7Ozs7OzhCQWNJLE1BQU07O2dEQUVZLFdBQVc7NkNBQ2Qsa0JBQWtCOzRDQUNuQixnQkFBZ0I7bUVBQ08sQ0FBQTthQUNyRDtZQUdELElBQUcsS0FBSyxFQUFDO2dCQUNMLEdBQUcsR0FBRyxLQUFLLENBQUM7YUFDZjtZQUVELElBQUcsS0FBSyxFQUFDO2dCQUNMLElBQUcsR0FBRyxFQUFDO29CQUNILEdBQUcsR0FBSSxHQUFHLEdBQUcsYUFBYSxHQUFHLEtBQUssQ0FBQztpQkFDdEM7cUJBQUk7b0JBQ0QsR0FBRyxHQUFHLEtBQUssQ0FBQztpQkFDZjthQUNKO1lBRUYsTUFBTSxLQUFLLEdBQUcsTUFBTSwyQkFBaUIsQ0FBQyxhQUFhLENBQUMsSUFBSSxDQUFDLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1lBQ3JFLE9BQU8sS0FBSyxDQUFDO1NBQ2hCO1FBQUMsT0FBTyxDQUFDLEVBQUU7WUFDUixPQUFPLENBQUMsS0FBSyxDQUFDLGlCQUFpQixDQUFDLENBQUMsS0FBSyxFQUFFLENBQUMsQ0FBQztZQUMxQyxPQUFPLEVBQUUsQ0FBQztTQUNiO0lBQ0wsQ0FBQztJQVVELEtBQUssQ0FBQyxzQkFBc0IsQ0FBQyxlQUFxQixFQUFHLFlBQWtDLEVBQUUsY0FBc0IsSUFBSSxFQUFHLFNBQWtCO1FBQ3BJLElBQUk7WUFDQSxNQUFNLENBQUMsYUFBYSxFQUFFLFVBQVUsRUFBRSxTQUFTLENBQUMsR0FBRyxZQUFZLENBQUM7WUFFeEQsSUFBSSxRQUFRLEdBQUcsSUFBSSxDQUFFO1lBQ3JCLElBQUksWUFBWSxHQUFHLElBQUksQ0FBRTtZQUN6QixJQUFJLFlBQVksR0FBRyxJQUFJLENBQUU7WUFDekIsSUFBRyxTQUFTLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBQztnQkFDcEIsS0FBSSxJQUFJLEdBQUcsSUFBSSxlQUFlLEVBQUM7b0JBQzNCLElBQUcsUUFBUSxFQUFDO3dCQUNSLFFBQVEsR0FBRyxRQUFRLEdBQUcsV0FBVzs0QkFDN0I7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozt1Q0F3Qk8sU0FBUyxDQUFDLENBQUMsQ0FBQzt1Q0FDWixTQUFTLENBQUMsQ0FBQyxDQUFDOztvREFFQyxHQUFHLENBQUMsV0FBVyxJQUFJLFNBQVM7Ozs7Z0VBSWhCLFNBQVMsQ0FBQyxDQUFDLENBQUM7K0RBQ2IsU0FBUyxDQUFDLENBQUMsQ0FBQzs7OzZCQUc5QyxDQUFDO3FCQUNMO3lCQUFJO3dCQUNELFFBQVEsR0FBRzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O3VDQXdCQSxTQUFTLENBQUMsQ0FBQyxDQUFDO3VDQUNaLFNBQVMsQ0FBQyxDQUFDLENBQUM7O29EQUVDLEdBQUcsQ0FBQyxXQUFXLElBQUksU0FBUzs7OztnRUFJaEIsU0FBUyxDQUFDLENBQUMsQ0FBQzsrREFDYixTQUFTLENBQUMsQ0FBQyxDQUFDOzs7NkJBRzlDLENBQUM7cUJBQ0w7aUJBRUo7YUFFSjtZQUdELElBQUcsVUFBVSxDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUM7Z0JBQ3JCLFlBQVksR0FBRzs7Ozs7Ozs7Ozs7Ozs7MkJBY1IsVUFBVSxDQUFDLENBQUMsQ0FBQzsyQkFDYixVQUFVLENBQUMsQ0FBQyxDQUFDOzs7OzBDQUlFLFVBQVUsQ0FBQyxDQUFDLENBQUM7NkNBQ1YsVUFBVSxDQUFDLENBQUMsQ0FBQzs7aUJBRXpDLENBQUM7YUFDRDtZQUdMLElBQUcsYUFBYSxDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUM7Z0JBQ3hCLEtBQUksSUFBSSxHQUFHLElBQUksZUFBZSxFQUFDO29CQUMzQixJQUFHLFlBQVksRUFBQzt3QkFDWixZQUFZLEdBQUcsWUFBWSxHQUFHLFdBQVc7NEJBQ3JDOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7dUNBd0JXLGFBQWEsQ0FBQyxDQUFDLENBQUM7dUNBQ2hCLGFBQWEsQ0FBQyxDQUFDLENBQUM7O29EQUVILEdBQUcsQ0FBQyxXQUFXLElBQUksU0FBUzs7OztnRUFJaEIsYUFBYSxDQUFDLENBQUMsQ0FBQzsrREFDakIsYUFBYSxDQUFDLENBQUMsQ0FBQzs7OzZCQUdsRCxDQUFDO3FCQUNUO3lCQUFJO3dCQUNELFlBQVksR0FBRzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O3VDQXdCQSxhQUFhLENBQUMsQ0FBQyxDQUFDO3VDQUNoQixhQUFhLENBQUMsQ0FBQyxDQUFDOztvREFFSCxHQUFHLENBQUMsV0FBVyxJQUFJLFNBQVM7OztnRUFHaEIsYUFBYSxDQUFDLENBQUMsQ0FBQzsrREFDakIsYUFBYSxDQUFDLENBQUMsQ0FBQzs7OzZCQUdsRCxDQUFDO3FCQUNUO2lCQUVKO2FBRUo7WUFVRCxJQUFJLEdBQUcsR0FBRyxJQUFJLENBQUU7WUFDaEIsSUFBRyxZQUFZLEVBQUM7Z0JBQ1osR0FBRyxHQUFHLFlBQVksQ0FBRTthQUN2QjtZQUVELElBQUcsWUFBWSxFQUFDO2dCQUNaLElBQUcsR0FBRyxFQUFDO29CQUNILEdBQUcsR0FBRyxHQUFHLEdBQUcsV0FBVyxHQUFHLFlBQVksQ0FBQztpQkFDMUM7cUJBQUk7b0JBQ0QsR0FBRyxHQUFHLFlBQVksQ0FBRTtpQkFDdkI7YUFFSjtZQUVELElBQUcsUUFBUSxFQUFDO2dCQUNSLElBQUcsR0FBRyxFQUFDO29CQUNILEdBQUcsR0FBRyxHQUFHLEdBQUcsV0FBVyxHQUFHLFFBQVEsQ0FBQztpQkFDdEM7cUJBQUk7b0JBQ0QsR0FBRyxHQUFHLFFBQVEsQ0FBRTtpQkFDbkI7YUFFSjtZQUdELElBQUcsR0FBRyxFQUFDO2dCQUNILE1BQU0sS0FBSyxHQUFHLE1BQU0sMkJBQWlCLENBQUMsYUFBYSxDQUFDLElBQUksQ0FBQztxQkFDcEQsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDO2dCQUNoQixPQUFPLEtBQUssQ0FBQzthQUNoQjtpQkFBSztnQkFDRixPQUFPLElBQUksQ0FBQzthQUNmO1NBQ0o7UUFBQyxPQUFPLENBQUMsRUFBRTtZQUNSLE9BQU8sQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDLElBQUksYUFBYSxDQUFDLENBQUMsS0FBSyxFQUFFLENBQUMsQ0FBQztZQUM3RSxPQUFPLEVBQUUsQ0FBQztTQUNiO0lBQ0wsQ0FBQztJQU9ELEtBQUssQ0FBQyxtQkFBbUIsQ0FBQyxZQUFrQyxFQUFFLFdBQW9CLEVBQUcsU0FBa0IsRUFBRyxJQUFnQjtRQUN0SCxJQUFJO1lBQ0EsTUFBTSxDQUFDLGFBQWEsRUFBRSxVQUFVLEVBQUUsU0FBUyxDQUFDLEdBQUcsWUFBWSxDQUFDO1lBQzVELElBQUksUUFBUSxHQUFHLElBQUksQ0FBRTtZQUNyQixJQUFJLFlBQVksR0FBRyxJQUFJLENBQUU7WUFDekIsSUFBSSxZQUFZLEdBQUcsSUFBSSxDQUFFO1lBRXpCLElBQUcsU0FBUyxDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUM7Z0JBQ3BCLFFBQVEsR0FBRzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozt1QkF5QkosU0FBUyxDQUFDLENBQUMsQ0FBQzt1QkFDWixTQUFTLENBQUMsQ0FBQyxDQUFDOztvQ0FFQyxXQUFXLElBQUksU0FBUzs7OztnREFJWixTQUFTLENBQUMsQ0FBQyxDQUFDOytDQUNiLFNBQVMsQ0FBQyxDQUFDLENBQUM7Ozs7aUJBSTFDLENBQUM7YUFDTDtZQUVELElBQUcsVUFBVSxDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUM7Z0JBQ3JCLFlBQVksR0FBRzs7Ozs7Ozs7Ozs7Ozs7MkJBY0osVUFBVSxDQUFDLENBQUMsQ0FBQzsyQkFDYixVQUFVLENBQUMsQ0FBQyxDQUFDOzs7OzBDQUlFLFVBQVUsQ0FBQyxDQUFDLENBQUM7NkNBQ1YsVUFBVSxDQUFDLENBQUMsQ0FBQztpREFDVCxJQUFJOztpQkFFcEMsQ0FBQzthQUNMO1lBRUQsSUFBRyxhQUFhLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBQztnQkFDeEIsWUFBWSxHQUFHOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O3VCQXlCUixhQUFhLENBQUMsQ0FBQyxDQUFDO3VCQUNoQixhQUFhLENBQUMsQ0FBQyxDQUFDOztvQ0FFSCxXQUFXLElBQUksU0FBUzs7OztnREFJWixhQUFhLENBQUMsQ0FBQyxDQUFDOytDQUNqQixhQUFhLENBQUMsQ0FBQyxDQUFDOzs7O2lCQUk5QyxDQUFDO2FBQ0w7WUFFRCxJQUFJLEdBQUcsR0FBRyxJQUFJLENBQUU7WUFDaEIsSUFBRyxZQUFZLEVBQUM7Z0JBQ1osR0FBRyxHQUFHLFlBQVksQ0FBRTthQUN2QjtZQUVELElBQUcsWUFBWSxFQUFDO2dCQUNaLElBQUcsR0FBRyxFQUFDO29CQUNILEdBQUcsR0FBRyxHQUFHLEdBQUcsV0FBVyxHQUFHLFlBQVksQ0FBQztpQkFDMUM7cUJBQUk7b0JBQ0QsR0FBRyxHQUFHLFlBQVksQ0FBRTtpQkFDdkI7YUFFSjtZQUVELElBQUcsUUFBUSxFQUFDO2dCQUNSLElBQUcsR0FBRyxFQUFDO29CQUNILEdBQUcsR0FBRyxHQUFHLEdBQUcsV0FBVyxHQUFHLFFBQVEsQ0FBQztpQkFDdEM7cUJBQUk7b0JBQ0QsR0FBRyxHQUFHLFFBQVEsQ0FBRTtpQkFDbkI7YUFFSjtZQUVELElBQUcsR0FBRyxFQUFDO2dCQUNILE1BQU0sS0FBSyxHQUFHLE1BQU0sMkJBQWlCLENBQUMsYUFBYSxDQUFDLElBQUksQ0FBQztxQkFDcEQsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDO2dCQUVoQixPQUFPLEtBQUssQ0FBQzthQUNoQjtpQkFBSztnQkFDRixPQUFPLElBQUksQ0FBQzthQUNmO1NBRUo7UUFBQyxPQUFPLENBQUMsRUFBRTtZQUNSLE9BQU8sQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDLElBQUksYUFBYSxDQUFDLENBQUMsS0FBSyxFQUFFLENBQUMsQ0FBQztZQUM3RSxPQUFPLEVBQUUsQ0FBQztTQUNiO0lBQ0wsQ0FBQztJQU9ELEtBQUssQ0FBQyxzQkFBc0IsQ0FBQyxZQUFrQyxFQUFFLGVBQXVCLElBQUksRUFBRyxTQUFrQixFQUFHLFdBQW9CO1FBQ3BJLElBQUk7WUFDQSxNQUFNLENBQUMsYUFBYSxFQUFFLFVBQVUsRUFBRSxTQUFTLENBQUMsR0FBRyxZQUFZLENBQUM7WUFFNUQsSUFBSSxRQUFRLEdBQUcsSUFBSSxDQUFFO1lBQ3JCLElBQUksWUFBWSxHQUFHLElBQUksQ0FBRTtZQUN6QixJQUFJLFlBQVksR0FBRyxJQUFJLENBQUU7WUFHekIsSUFBRyxTQUFTLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBQztnQkFDcEIsUUFBUSxHQUFHOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7dUJBd0JKLFNBQVMsQ0FBQyxDQUFDLENBQUM7dUJBQ1osU0FBUyxDQUFDLENBQUMsQ0FBQzs7b0NBRUMsV0FBVyxJQUFJLFNBQVM7OztnREFHWixTQUFTLENBQUMsQ0FBQyxDQUFDOytDQUNiLFNBQVMsQ0FBQyxDQUFDLENBQUM7NENBQ2YsWUFBWTs7Ozs7aUJBS3ZDLENBQUM7YUFDTDtZQUVELElBQUcsVUFBVSxDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUM7Z0JBQ3JCLFlBQVksR0FBRzs7Ozs7Ozs7Ozs7Ozs7MkJBY0osVUFBVSxDQUFDLENBQUMsQ0FBQzsyQkFDYixVQUFVLENBQUMsQ0FBQyxDQUFDOzs7O2lEQUlTLFlBQVk7OENBQ2YsVUFBVSxDQUFDLENBQUMsQ0FBQzs2Q0FDZCxVQUFVLENBQUMsQ0FBQyxDQUFDOzs7aUJBR3pDLENBQUM7YUFDTDtZQUlELElBQUcsYUFBYSxDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUM7Z0JBQ3hCLFlBQVksR0FBRzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O3VCQXdCUixhQUFhLENBQUMsQ0FBQyxDQUFDO3VCQUNoQixhQUFhLENBQUMsQ0FBQyxDQUFDOztvQ0FFSCxXQUFXLElBQUksU0FBUzs7O2dEQUdaLGFBQWEsQ0FBQyxDQUFDLENBQUM7K0NBQ2pCLGFBQWEsQ0FBQyxDQUFDLENBQUM7NENBQ25CLFlBQVk7Ozs7O2lCQUt2QyxDQUFDO2FBQ0w7WUFJRCxJQUFJLEdBQUcsR0FBRyxJQUFJLENBQUU7WUFDaEIsSUFBRyxZQUFZLEVBQUM7Z0JBQ1osR0FBRyxHQUFHLFlBQVksQ0FBRTthQUN2QjtZQUVELElBQUcsWUFBWSxFQUFDO2dCQUNaLElBQUcsR0FBRyxFQUFDO29CQUNILEdBQUcsR0FBRyxHQUFHLEdBQUcsV0FBVyxHQUFHLFlBQVksQ0FBQztpQkFDMUM7cUJBQUk7b0JBQ0QsR0FBRyxHQUFHLFlBQVksQ0FBRTtpQkFDdkI7YUFFSjtZQUVELElBQUcsUUFBUSxFQUFDO2dCQUNSLElBQUcsR0FBRyxFQUFDO29CQUNILEdBQUcsR0FBRyxHQUFHLEdBQUcsV0FBVyxHQUFHLFFBQVEsQ0FBQztpQkFDdEM7cUJBQUk7b0JBQ0QsR0FBRyxHQUFHLFFBQVEsQ0FBRTtpQkFDbkI7YUFFSjtZQUVELElBQUcsR0FBRyxFQUFDO2dCQUNILE1BQU0sS0FBSyxHQUFHLE1BQU0sMkJBQWlCLENBQUMsYUFBYSxDQUFDLElBQUksQ0FBQztxQkFDcEQsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDO2dCQUNoQixPQUFPLEtBQUssQ0FBQzthQUNoQjtpQkFBSztnQkFDRixPQUFPLElBQUksQ0FBQzthQUNmO1NBRUo7UUFBQyxPQUFPLENBQUMsRUFBRTtZQUNSLE9BQU8sQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDLElBQUksYUFBYSxDQUFDLENBQUMsS0FBSyxFQUFFLENBQUMsQ0FBQztZQUMvRSxPQUFPLEVBQUUsQ0FBQztTQUNiO0lBQ0wsQ0FBQztJQVVELEtBQUssQ0FBQyxvQ0FBb0MsQ0FBQyxXQUFtQixFQUFFLGFBQXFCLEVBQUUsV0FBbUIsRUFBRyxTQUFrQjtRQUMzSCxJQUFJO1lBQ0EsTUFBTSxHQUFHLEdBQUc7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7b0NBeUJZLFdBQVcsSUFBSSxTQUFTOzs7d0NBR3BCLGFBQWE7NENBQ1QsV0FBVzs7O1NBRzlDLENBQUM7WUFFRSxNQUFNLEtBQUssR0FBRyxNQUFNLDJCQUFpQixDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQUM7aUJBQ3BELEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQztZQUNoQixPQUFPLEtBQUssQ0FBQztTQUNoQjtRQUFDLE9BQU8sQ0FBQyxFQUFFO1lBQ1IsT0FBTyxDQUFDLEtBQUssQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDLEtBQUssRUFBRSxDQUFDLENBQUM7WUFDMUMsT0FBTyxFQUFFLENBQUM7U0FDYjtJQUNMLENBQUM7SUFVRCxLQUFLLENBQUMsa0JBQWtCO1FBQ3BCLElBQUk7WUFDQSxNQUFNLFNBQVMsR0FBRyxNQUFNLEVBQUUsQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLENBQUMsTUFBTSxDQUFDLHFCQUFxQixDQUFDLENBQUM7WUFDMUUsTUFBTSxPQUFPLEdBQUcsTUFBTSxFQUFFLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxDQUFDLE1BQU0sQ0FBQyxxQkFBcUIsQ0FBQyxDQUFDO1lBQ3RFLE1BQU0sR0FBRyxHQUFHOzs7Ozs7OzswQ0FRa0IsU0FBUzs2Q0FDTixPQUFPOztTQUUzQyxDQUFDO1lBQ0UsTUFBTSxLQUFLLEdBQUcsTUFBTSwyQkFBaUIsQ0FBQyxhQUFhLENBQUMsSUFBSSxDQUFDO2lCQUNwRCxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUM7WUFDaEIsT0FBTyxLQUFLLENBQUM7U0FDaEI7UUFBQyxPQUFPLENBQUMsRUFBRTtZQUNSLE9BQU8sQ0FBQyxLQUFLLENBQUMsaUJBQWlCLENBQUMsQ0FBQyxLQUFLLEVBQUUsQ0FBQyxDQUFDO1lBQzFDLE9BQU8sRUFBRSxDQUFDO1NBQ2I7SUFDTCxDQUFDO0lBU0QsS0FBSyxDQUFDLGNBQWMsQ0FBQyxTQUFtQixFQUFHLE9BQWdCLEVBQUUsU0FBa0IsRUFBRSxTQUFxQjtRQUNsRyxJQUFJO1lBQ0EsSUFBSSxHQUFHLEdBQUcsSUFBSSxDQUFDO1lBQ2YsS0FBSSxJQUFJLFdBQVcsSUFBSSxTQUFTLEVBQUM7Z0JBQzdCLElBQUcsR0FBRyxFQUFDO29CQUNILEdBQUcsR0FBRyxHQUFHLEdBQUc7Ozs7Ozs7Ozs7Ozs0Q0FZWSxXQUFXLElBQUksU0FBUzs7Z0RBRXBCLFNBQVM7b0RBQ0wsT0FBTzs7O2lCQUcxQyxDQUFDO2lCQUNEO3FCQUFJO29CQUNELEdBQUcsR0FBRzs7Ozs7Ozs7Ozs7NENBV2tCLFdBQVcsSUFBSSxTQUFTOztnREFFcEIsU0FBUztvREFDTCxPQUFPOzs7aUJBRzFDLENBQUM7aUJBQ0Q7YUFFSjtZQUVELE1BQU0sS0FBSyxHQUFHLE1BQU0sMkJBQWlCLENBQUMsYUFBYSxDQUFDLElBQUksQ0FBQztpQkFDcEQsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1lBQ2hCLE9BQU8sS0FBSyxDQUFDO1NBQ2hCO1FBQUMsT0FBTyxDQUFDLEVBQUU7WUFDUixPQUFPLENBQUMsS0FBSyxDQUFDLGlCQUFpQixDQUFDLENBQUMsS0FBSyxFQUFFLENBQUMsQ0FBQztZQUMxQyxPQUFPLEVBQUUsQ0FBQztTQUNiO0lBQ0wsQ0FBQztDQUVKO0FBbjJCRCw4Q0FtMkJDO0FBRUQsa0JBQWUsSUFBSSxpQkFBaUIsRUFBRSxDQUFDIn0=