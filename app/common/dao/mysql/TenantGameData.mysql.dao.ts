import ConnectionManager from "../mysql/lib/connectionManager";
import * as moment from "moment";

export class TenantGameDataDao {

    /**
     * 查询指定租户游戏运营数据
     * @param uid 租户编号
     * @param startDateTime 开始时间 
     * @param endDateTime 结束时间
     */
    async getTenantGameData( platformUid : string ,groupRemark: string, startDateTime: string, endDateTime: string , tableName : string): Promise<Array<any>> {
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
            const total = await ConnectionManager.getConnection(true).query(sql);
            return total;
        } catch (e) {
            console.error(`查询指定租户游戏运营数据: ${e.stack}`);
            return [];
        }
    }


    /**
     * 查询指定租户游戏运营数据
     * @param uid 租户编号
     * @param startDateTime 开始时间
     * @param endDateTime 结束时间
     */
    async getTenantGameYesterDayData(platformUid : string ,groupRemark: string, dateTimeList: Array<Array<string>>,): Promise<Array<any>> {
        try {
            const [yesterdayDate, todayDate] = dateTimeList;
            let yesterdayStartTime = yesterdayDate[0];
            let yesterdayEndTime = yesterdayDate[1];

            let todayStartTime = null;
            let todayEndTime = null;
            if(todayDate.length > 0){
                todayStartTime = todayDate[0]
                todayEndTime = todayDate[1]
            }
            let table1 = null ;  //今日表
            let table2 = null ;   // 月表
            const tableName = moment().format("YYYYMM");
            //如果开始时间小于今日
            if(todayDate.length > 0){
                table1 =  `Sp_GameRecord_${platformUid}_${tableName}`;
            }
            if(yesterdayDate.length > 0){
                table2 =   `Sum_TenantOperationalData`;
            }

            let sql_1 = null;
            let sql_2 = null;
            let sql = null;
             if(table1){
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
                    GROUP BY gr.gameName )`
             }

             if(table2){
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
                    GROUP BY Tenant.gameName ,Tenant.groupRemark )`
             }


             if(sql_1){
                 sql = sql_1;
             }

             if(sql_2){
                 if(sql){
                     sql  = sql + ` UNION ALL ` + sql_2;
                 }else{
                     sql = sql_2;
                 }
             }

            const total = await ConnectionManager.getConnection(true).query(sql);
            return total;
        } catch (e) {
            console.error(`查询指定租户游戏运营数据: ${e.stack}`);
            return [];
        }
    }




    /**
     * 查询所有平台运营数据
     * @param dateTimeList 日期集合
     * @description sql 优化版
     */
    async getAllPlatformGameData(platformUidList : any , dateTimeList: Array<Array<string>>, platformUid: string = null , tableName : string) {
        try {
            const [yesterdayDate, middleData, todayDate] = dateTimeList;
                //只查询今日的
                let sqlToday = null ;
                let sqlMiddleday = null ;
                let sqlYesterday = null ;
                if(todayDate.length > 0){
                    for(let key of platformUidList){
                        if(sqlToday){
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
                        }else{
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

                //查询中间日期的
                if(middleData.length > 0){
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

                //查询开始日期的中间
            if(yesterdayDate.length > 0){
                for(let key of platformUidList){
                    if(sqlYesterday){
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
                    }else{
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

            // let sql = null ;
            // if(sqlToday && !sqlYesterday){
            //     sql = sqlToday
            // }else if (!sqlToday && sqlYesterday){
            //     sql = sqlYesterday
            // }else if(sqlToday && sqlYesterday){
            //     sql = sqlToday + "UNION ALL" + sqlYesterday;
            // }
            let sql = null ;
            if(sqlYesterday){
                sql = sqlYesterday ;
            }

            if(sqlMiddleday){
                if(sql){
                    sql = sql + "UNION ALL" + sqlMiddleday;
                }else{
                    sql = sqlMiddleday ;
                }

            }

            if(sqlToday){
                if(sql){
                    sql = sql + "UNION ALL" + sqlToday;
                }else{
                    sql = sqlToday ;
                }

            }


            if(sql){
                const total = await ConnectionManager.getConnection(true)
                    .query(sql);
                return total;
            }else {
                return null;
            }
        } catch (e) {
            console.error(`查询${!!platformUid ? platformUid : "所有"}平台运营数据出错: ${e.stack}`);
            return [];
        }
    }

    /**
     * 查询所有平台运营数据
     * @param dateTimeList 日期集合
     * @description sql 优化版
     */
    async getPlatformGameData(dateTimeList: Array<Array<string>>, platformUid : string , tableName : string , list : string []) {
        try {
            const [yesterdayDate, middleData, todayDate] = dateTimeList;
            let sqlToday = null ;
            let sqlMiddleday = null ;
            let sqlYesterday = null ;
            //只查询今日的
            if(todayDate.length > 0){
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
            //查询中间的
            if(middleData.length > 0){
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
            //只查询开始时间中间的
            if(yesterdayDate.length > 0){
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

            let sql = null ;
            if(sqlYesterday){
                sql = sqlYesterday ;
            }

            if(sqlMiddleday){
                if(sql){
                    sql = sql + "UNION ALL" + sqlMiddleday;
                }else{
                    sql = sqlMiddleday ;
                }

            }

            if(sqlToday){
                if(sql){
                    sql = sql + "UNION ALL" + sqlToday;
                }else{
                    sql = sqlToday ;
                }

            }

            if(sql){
                const total = await ConnectionManager.getConnection(true)
                    .query(sql);

                return total;
            }else {
                return null;
            }

        } catch (e) {
            console.error(`查询${!!platformUid ? platformUid : "所有"}平台运营数据出错: ${e.stack}`);
            return [];
        }
    }

    /**
     * 查询单个租户运营数据  platformName 租户名称
     * @param dateTimeList 日期集合
     * @description sql 优化版
     */
    async getOnePlatformGameData(dateTimeList: Array<Array<string>>, platformName: string = null , tableName : string , platformUid : string) {
        try {
            const [yesterdayDate, middleData, todayDate] = dateTimeList;
            //只查询今日的
            let sqlToday = null ;
            let sqlMiddleday = null ;
            let sqlYesterday = null ;

            //只查询今日的
            if(todayDate.length > 0){
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
            //查询一个日期的中间
            if(middleData.length > 0){
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


            //只查询开始时间的中间
            if(yesterdayDate.length > 0){
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



            let sql = null ;
            if(sqlYesterday){
                sql = sqlYesterday ;
            }

            if(sqlMiddleday){
                if(sql){
                    sql = sql + "UNION ALL" + sqlMiddleday;
                }else{
                    sql = sqlMiddleday ;
                }

            }

            if(sqlToday){
                if(sql){
                    sql = sql + "UNION ALL" + sqlToday;
                }else{
                    sql = sqlToday ;
                }

            }

            if(sql){
                const total = await ConnectionManager.getConnection(true)
                    .query(sql);
                return total;
            }else {
                return null;
            }

        } catch (e) {
            console.error(`查询${!!platformName ? platformName : "一个"}租户运营数据出错: ${e.stack}`);
            return [];
        }
    }



    /**
     * 查询租户所有运营数据 今日
     * @param startDateTime 开始时间
     * @param endDateTime 结束时间
     * @description 优化版 - 查询今天
     */
    async getTenantOperationalDataListForToday(platformUid :string ,startDateTime: string, endDateTime: string , tableName : string) {
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

            const total = await ConnectionManager.getConnection(true)
                .query(sql);
            return total;
        } catch (e) {
            console.error(`查询今日租户运营数据出错: ${e.stack}`);
            return [];
        }
    }



    /**
     *  查询每个代理一个月的杀率
     * @param startDateTime 开始时间
     * @param endDateTime 结束时间
     * @description 优化版 - 查询今天
     */
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
            const total = await ConnectionManager.getConnection(true)
                .query(sql);
            return total;
        } catch (e) {
            console.error(`查询每个代理一个月的杀率: ${e.stack}`);
            return [];
        }
    }


    /**
     *  查询热门游戏的数据统计
     * @param startDateTime 开始时间
     * @param endDateTime 结束时间
     * @description 优化版 - 查询今天
     */
    async getHotGameData(startTime  : string , endTime : string ,tableDate : string ,tableName : string []) {
        try {
            let sql = null;
            for(let platformUid of tableName){
                if(sql){
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
                }else{
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

            const total = await ConnectionManager.getConnection(true)
                .query(sql);
            return total;
        } catch (e) {
            console.error(`查询每个代理一个月的杀率: ${e.stack}`);
            return [];
        }
    }

}

export default new TenantGameDataDao();
