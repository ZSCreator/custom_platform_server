import { AbstractDao } from "../ADao.abstract";
import { GameRecord } from "./entity/GameRecord.entity";
import { GameRecordStatusEnum } from "./enum/GameRecordStatus.enum";
import ConnectionManager from "../mysql/lib/connectionManager";
import * as moment from "moment";

export class GameRecordMysqlDao extends AbstractDao<GameRecord>{

    async findList(parameter: { id?: number; groupRemark?: string; validBet?: number; uid?: string; thirdUid?: string; gameName?: string; nid?: string; sceneId?: number; roomId?: string; roundId?: string; gameType?: number; isDealer?: boolean; result?: string; gold?: number; input?: number; profit?: number; bet_commission?: number; win_commission?: number; settle_commission?: number; multiple?: number; addRmb?: number; addTixian?: number; status?: GameRecordStatusEnum; gameOrder?: string; game_Records_live_result?: any; createTimeDate?: Date; updateTime?: Date; }): Promise<GameRecord[]> {
        try {
            const list = await ConnectionManager.getConnection()
                .getRepository(GameRecord)
                .find(parameter);

            return list;
        } catch (e) {
            return [];
        }
    }

    async findOne(parameter: { id?: number; groupRemark?: string; validBet?: number; uid?: string; thirdUid?: string; gameName?: string; nid?: string; sceneId?: number; roomId?: string;  roundId?: string; gameType?: number; isDealer?: boolean; result?: string; gold?: number; input?: number; profit?: number; bet_commission?: number; win_commission?: number; settle_commission?: number; multiple?: number; addRmb?: number; addTixian?: number; status?: GameRecordStatusEnum; gameOrder?: string; game_Records_live_result?: any; createTimeDate?: Date; updateTime?: Date; }): Promise<GameRecord> {
        try {
            const gameRecord = await ConnectionManager.getConnection()
                .getRepository(GameRecord)
                .findOne(parameter);

            return gameRecord;
        } catch (e) {
            return null;
        }
    }

    async updateOne(parameter: { id?: number; groupRemark?: string; validBet?: number; uid?: string; thirdUid?: string; gameName?: string; nid?: string; sceneId?: number; roomId?: string;  roundId?: string; gameType?: number; isDealer?: boolean; result?: string; gold?: number; input?: number; profit?: number; bet_commission?: number; win_commission?: number; settle_commission?: number; multiple?: number; addRmb?: number; addTixian?: number; status?: GameRecordStatusEnum; gameOrder?: string; game_Records_live_result?: any; createTimeDate?: Date; updateTime?: Date; }, partialEntity: { id?: number; groupRemark?: string; uid?: string; validBet?: number; thirdUid?: string; gameName?: string; nid?: string; sceneId?: number; roomId?: string;  roundId?: string; gameType?: number; isDealer?: boolean; result?: string; gold?: number; input?: number; profit?: number; bet_commission?: number; win_commission?: number; settle_commission?: number; multiple?: number; addRmb?: number; addTixian?: number; status?: GameRecordStatusEnum; gameOrder?: string; game_Records_live_result?: any; createTimeDate?: Date; updateTime?: Date; }): Promise<any> {
        try {
            const { affected } = await ConnectionManager.getConnection()
                .getRepository(GameRecord)
                .update(parameter, partialEntity);
            return !!affected;
        } catch (e) {
            return false;
        }
    }

    async insertOne(parameter: { id?: number; groupRemark?: string; validBet?: number; uid?: string; thirdUid?: string; gameName?: string; nid?: string; sceneId?: number; roomId?: string;  roundId?: string; gameType?: number; isDealer?: boolean; result?: string; gold?: number; input?: number; profit?: number; bet_commission?: number; win_commission?: number; settle_commission?: number; multiple?: number; addRmb?: number; addTixian?: number; status?: GameRecordStatusEnum; gameOrder?: string; game_Records_live_result?: any; createTimeDate?: Date; updateTime?: Date; }): Promise<any> {
        try {
            const gameRepository = ConnectionManager.getConnection()
                .getRepository(GameRecord);

            const p = gameRepository.create(parameter);

            return await gameRepository.save(p);
        } catch (e) {
            return null;
        }
    }

    async delete(parameter: { id?: number; groupRemark?: string; validBet?: number; uid?: string; thirdUid?: string; gameName?: string; nid?: string; sceneId?: number; roomId?: string;  roundId?: string; gameType?: number; isDealer?: boolean; result?: string; gold?: number; input?: number; profit?: number; bet_commission?: number; win_commission?: number; settle_commission?: number; multiple?: number; addRmb?: number; addTixian?: number; status?: GameRecordStatusEnum; gameOrder?: string; game_Records_live_result?: any; createTimeDate?: Date; updateTime?: Date; }): Promise<any> {
        try {
            const { affected } = await ConnectionManager.getConnection()
                .getRepository(GameRecord)
                .delete(parameter);
            return !!affected;
        } catch (e) {
            return false;
        }
    }




    /**
     * 作用于管理后台根据 gameOrder 来进行搜索
     * @param uid
     * @param nid
     * @param page
     * @param limit
     * @param startTime
     * @param endTime
     * Sp_GameRecord_${table2} AS Sp_GameRecord
     */
    async findForGameOrder(table:string , gameOrder: string , startTime : string , endTime : string): Promise<any> {
        try {
            if(!table && !gameOrder){
                return ;
            }
            const sql = `SELECT  Sp_GameRecord.game_Records_live_result AS result ,Sp_GameRecord.game_id AS nid ,Sp_GameRecord.gameName AS gameName ,
                         Sp_GameRecord.createTimeDate AS createTimeDate ,  Sp_GameRecord.uid AS uid ,  Sp_GameRecord.status AS status
                         FROM  ${table} AS Sp_GameRecord  
                         WHERE 
                         Sp_GameRecord.createTimeDate >= "${startTime}" AND  Sp_GameRecord.createTimeDate < "${endTime}"
                         AND Sp_GameRecord.game_order_id = "${gameOrder}" `;
            //获取长度的sql语句
            const result = await ConnectionManager.getConnection(true)
                .query(sql);
            if(result.length != 0){
                return result[0] ;
            }else{
                return false;
            }
        } catch (e) {
            return false;
        }
    }





    /**
     * 作用于管理后台根据 时间 来进行搜索
     * @param uid
     * @param nid
     * @param page
     * @param limit
     * @param startTime
     * @param endTime
     */
    async findListToLimitForWhereForMoreTable(platformUid : string,table1:string ,table2:string , where: string, page: number, limit: number): Promise<any> {
        try {
            if(!table1 && !table2  ) {
                return;
            }

            if(platformUid){
                if(table1){
                    table1 = `Sp_GameRecord_${platformUid}_${table1}`;
                }
                if(table2){
                    table2 = `Sp_GameRecord_${platformUid}_${table2}`;
                }
            }else{
                table1 = `Sp_GameRecord_${table1}`;
            }


            let select = ['Sp_GameRecord.id AS id', 'Sp_GameRecord.uid AS uid', 'Sp_GameRecord.groupRemark AS groupRemark', 'Sp_GameRecord.thirdUid AS thirdUid', 'Sp_GameRecord.gameName AS gameName',
                     'Sp_GameRecord.game_id AS nid', 'Sp_GameRecord.sceneId AS sceneId', 'Sp_GameRecord.roomId AS roomId', 'Sp_GameRecord.gold AS gold', 'Sp_GameRecord.validBet AS validBet', 'Sp_GameRecord.round_id AS roundId',
                    'Sp_GameRecord.profit AS profit', 'Sp_GameRecord.bet_commission AS bet_commission', 'Sp_GameRecord.win_commission AS win_commission', 'Sp_GameRecord.settle_commission AS settle_commission',
                   'Sp_GameRecord.game_order_id AS gameOrder','DATE_FORMAT(Sp_GameRecord.createTimeDate,"%Y-%m-%d %H:%i:%s")  createTimeDate'];
            let selectCount =`COUNT(Sp_GameRecord.id) AS length`;
            let sqlCount = null;
            let sql = null ;
            if(table1){
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

            if(table2){
                if(sql){
                    sql = sql +  `
                UNION ALL
                SELECT
                    ${select}
                FROM
                     ${table2} AS Sp_GameRecord
                WHERE 
                    ${where}
                `;
                    sqlCount = sqlCount +  `
                UNION ALL
                SELECT
                    ${selectCount}
                FROM
                     ${table2} AS Sp_GameRecord
                WHERE 
                    ${where}
                `;
                }else{
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
            //获取数据的sql语句
            const result = await ConnectionManager.getConnection(true)
                .query(sql);


            //获取长度的sql语句
            const countResult = await ConnectionManager.getConnection(true)
                .query(sqlCount);
            let count = 0 ;
            for(let key of countResult){
                count += Number(key.length);
            }
            return { list : result , count: count};
        } catch (e) {
            return { list : [] , count: 0};
        }
    }

    /**
     * 作用于管理后台根据牌局编号来进行查看
     * @param uid
     * @param nid
     * @param page
     * @param limit
     * @param startTime
     * @param endTime
     */
    async findListToLimitForRoundId (platformUidList : any, table1:string  , where: string, page: number, limit: number): Promise<any> {
        try {
            if(!table1 ) {
                return;
            }
            let select = ['Sp_GameRecord.id AS id', 'Sp_GameRecord.uid AS uid', 'Sp_GameRecord.groupRemark AS groupRemark', 'Sp_GameRecord.thirdUid AS thirdUid', 'Sp_GameRecord.gameName AS gameName',
                'Sp_GameRecord.game_id AS nid', 'Sp_GameRecord.sceneId AS sceneId', 'Sp_GameRecord.roomId AS roomId', 'Sp_GameRecord.gold AS gold', 'Sp_GameRecord.validBet AS validBet', 'Sp_GameRecord.round_id AS roundId',
                'Sp_GameRecord.profit AS profit', 'Sp_GameRecord.bet_commission AS bet_commission', 'Sp_GameRecord.win_commission AS win_commission', 'Sp_GameRecord.settle_commission AS settle_commission',
                'Sp_GameRecord.game_order_id AS gameOrder', 'DATE_FORMAT(Sp_GameRecord.createTimeDate,"%Y-%m-%d %H:%i:%s")  createTimeDate'];
            let sql = null ;
            for(let platform of platformUidList){
                if(platform.platformUid){
                    if(sql){
                        sql = sql + `
                        UNION ALL       
                        ( SELECT
                            ${select}
                        FROM
                            Sp_GameRecord_${platform.platformUid}_${table1} AS Sp_GameRecord
                        WHERE 
                            ${where} 
                        )`;
                    }else{
                        sql =`
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
            if(!sql){
                return { list : [] , count: 0};
            }
            //获取数据的sql语句
            const result = await ConnectionManager.getConnection(true)
                .query(sql);
            return { list : result , count: result.length};
        } catch (e) {
            console.warn(e)
            return { list : [] , count: 0 };
        }
    }

    async tableBeExists(tableDate: string) {
        try {
            const res = await ConnectionManager.getConnection()
                .query(`SELECT table_name FROM information_schema.TABLES WHERE table_name = "Sp_GameRecord_${tableDate}";`);


            return !!res.length;
        } catch (e) {
            console.error(`备份表 | 查询目标表 Sp_GameRecord_${tableDate} 出错: ${e.stack}`);
            return false;
        }
    }




    /**
     * 作用于游戏场的牌局记录
     * @param uid
     * @param nid
     * @param page
     * @param limit
     * @param startTime
     * @param endTime
     */
    async findListForGameScene(table : string , nid: string, uid: string): Promise<any> {
        try {
            // const result = await ConnectionManager.getConnection()
            //     .getRepository(GameRecord)
            //     .createQueryBuilder("GameRecord")
            //     .where("GameRecord.nid = :nid", { nid: nid })
            //     .andWhere("GameRecord.uid = :uid", { uid: uid })
            //     .orderBy("GameRecord.createTimeDate", "DESC")
            //     .select(['GameRecord.roomId', 'GameRecord.input', 'GameRecord.profit', 'GameRecord.gameOrder', 'GameRecord.createTimeDate', 'GameRecord.isDealer'])
            //     .take(20)
            //     .getMany();
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
            const result = await ConnectionManager.getConnection(true)
                .query(sql);
            return result;
        } catch (e) {
            return false;
        }
    }

    /**
     * 查找幸运转盘的记录
     * @param table
     * @param nid
     * @param uid
     */
    async findListForLuckyWheel(table : string , nid: string, uid: string) {
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
            return await ConnectionManager.getConnection(true)
                .query(sql);
        } catch (e) {
            return false;
        }
    }



    /**
     * 作用于第三方上下分发送接口 ==third.service.getGameRecord
     * @param groupRemark
     * @param startTime
     * @param endTime
     */
    async findListAll(platformUid : string , groupRemark: string, startTime: string, endTime: string): Promise<any> {
        try {
            let select = ['Sp_GameRecord.game_id AS nid',  'Sp_GameRecord.groupRemark AS groupRemark', 'Sp_GameRecord.thirdUid AS thirdUid', 'Sp_GameRecord.gameName AS gameName',
                'Sp_GameRecord.game_results AS result', 'Sp_GameRecord.gameType AS gameType',
                'Sp_GameRecord.sceneId AS sceneId','Sp_GameRecord.roomId AS roomId','Sp_GameRecord.gold AS gold',
                'Sp_GameRecord.validBet AS validBet', 'Sp_GameRecord.round_id AS roundId','Sp_GameRecord.input AS input',
                'Sp_GameRecord.profit AS profit', 'Sp_GameRecord.bet_commission AS bet_commission',
                'Sp_GameRecord.win_commission AS win_commission', 'Sp_GameRecord.settle_commission AS settle_commission',
                'Sp_GameRecord.game_order_id AS gameOrder', 'DATE_FORMAT(Sp_GameRecord.createTimeDate,"%Y-%m-%d %H:%i:%s")  createTimeDate'];

            // const result = await ConnectionManager.getConnection()
            //     .getRepository(GameRecord)
            //     .createQueryBuilder("GameRecord")
            //     .where("GameRecord.createTimeDate BETWEEN :start AND :end", { start: startTime, end: endTime })
            //     .andWhere("GameRecord.groupRemark = :groupRemark", { groupRemark: groupRemark })
            //     .andWhere("GameRecord.nid  NOT IN (:...nids)", { nids: [THIRD_ADD_GOLD.LOWERNID, THIRD_ADD_GOLD.ADDNID] })
            //     // .orderBy("GameRecord.id", "DESC")
            //     .select(['GameRecord.thirdUid', 'GameRecord.nid', 'GameRecord.groupRemark', 'GameRecord.gameName', 'GameRecord.result', 'GameRecord.playersNumber', 'GameRecord.seat', 'GameRecord.roundId', 'GameRecord.sceneId', 'GameRecord.roomId', 'GameRecord.gold',
            //         'GameRecord.validBet', 'GameRecord.input', 'GameRecord.profit', 'GameRecord.bet_commission', 'GameRecord.win_commission', 'GameRecord.settle_commission', 'GameRecord.gameOrder', 'GameRecord.createTimeDate'])
            //     .getMany();
            const starTable = moment(startTime).format("YYYYMM");
            const endTable = moment(endTime).format("YYYYMM");
            let sql = null;
            if(starTable !== endTable){
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
            }else {
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

            const result = await ConnectionManager.getConnection(true)
                .query(sql);

            return result;
        } catch (e) {
            return [];
        }
    }




    /**
     * 新平台作用于第三方上下分发送接口 ==third.service.getGameRecordForPlatformName
     * @param groupRemark
     * @param startTime
     * @param endTime
     */
    async newPlatformNamefindListAll( platformUid :string , startTime: string, endTime: string): Promise<any> {
        try {
            const list =[];
            let select = ['Sp_GameRecord.game_id AS nid',  'Sp_GameRecord.groupRemark AS groupRemark', 'Sp_GameRecord.thirdUid AS thirdUid', 'Sp_GameRecord.gameName AS gameName',
                'Sp_GameRecord.game_results AS result', 'Sp_GameRecord.gameType AS gameType',
                'Sp_GameRecord.sceneId AS sceneId','Sp_GameRecord.roomId AS roomId','Sp_GameRecord.gold AS gold',
                'Sp_GameRecord.validBet AS validBet', 'Sp_GameRecord.round_id AS roundId','Sp_GameRecord.input AS input',
                'Sp_GameRecord.profit AS profit', 'Sp_GameRecord.bet_commission AS bet_commission',
                'Sp_GameRecord.win_commission AS win_commission', 'Sp_GameRecord.settle_commission AS settle_commission',
                'Sp_GameRecord.game_order_id AS gameOrder', 'DATE_FORMAT(Sp_GameRecord.createTimeDate,"%Y-%m-%d %H:%i:%s")  createTimeDate'];

            const starTable = moment(startTime).format("YYYYMM");
            const endTable = moment(endTime).format("YYYYMM");
            let sql = null;
            if(starTable !== endTable){
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
            }else {
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
            
            const result = await ConnectionManager.getConnection(true)
                .query(sql);

            return result;
        } catch (e) {
            return [];
        }
    }



    /**
     * 作用于到处相关的数据，根式时间来进行导出
     * @param platformUid
     * @param agentName
     * @param startTime
     * @param endTime
     * @param limit
     * @param uid
     * @param thirdUid
     * @param id 开始id
     * @param isCount 是否计数
     */
    async fileOutDataForAgent(platformUid : string ,agentName:string, startTime: string,
                              endTime: string, limit: number , uid : string, thirdUid : string, id: number, isCount: boolean = false): Promise<any> {
        try {
            let where = `GameRecord.createTimeDate >= "${startTime}" AND GameRecord.createTimeDate <= "${endTime}"
                         AND GameRecord.groupRemark = "${agentName}"
                         AND GameRecord.game_id NOT IN ("t1","t2")`;
            if(uid){
                where = where + ` AND GameRecord.uid = "${uid}"`
            }

            if(thirdUid){
                where = where + ` AND GameRecord.thirdUid = "${thirdUid}"`
            }
            let select = ['GameRecord.id', 'GameRecord.uid', 'GameRecord.thirdUid', 'GameRecord.groupRemark', 'GameRecord.gameName','GameRecord.game_order_id',
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
            const result = await ConnectionManager.getConnection(true)
                .query(sql);
            //获取长度的sql语句

            return { list : result };
        } catch (e) {
            console.warn(e)
            return { list : [] };
        }
    }




    /**
     * 作用于到处相关的数据，根式时间来进行导出
     * @param platformUid
     * @param startTime
     * @param endTime
     * @param page
     * @param limit
     * @param uid
     * @param thirdUid
     * @param id
     * @param isCount 是否计算长度
     */
    async fileOutDataForPlatformName(platformUid : string , startTime: string, endTime: string,
                                     limit: number , uid : string, thirdUid : string, id: number, isCount: boolean = false): Promise<any> {
        try {
            let where = `GameRecord.createTimeDate >= "${startTime}" AND GameRecord.createTimeDate <= "${endTime}"
                         AND GameRecord.game_id NOT IN ("t1","t2")`;
            if(uid){
                where = where + ` AND GameRecord.uid = "${uid}"`
            }

            if(thirdUid){
                where = where + ` AND GameRecord.thirdUid = "${thirdUid}"`
            }
            let select = ['GameRecord.id', 'GameRecord.uid', 'GameRecord.thirdUid', 'GameRecord.groupRemark', 'GameRecord.gameName','GameRecord.game_order_id',
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
            const result = await ConnectionManager.getConnection(true)
                .query(sql);
            //获取长度的sql语句

            return { list : result };
        } catch (e) {
            console.warn(e)
            return {list: [] };
        }
    }



    /**
     * 作用于到处相关的数据，根式时间来进行导出 计算长度
     * @param platformUid
     * @param startTime
     * @param endTime
     * @param page
     * @param limit
     * @param uid
     * @param thirdUid
     * @param id
     */
    async fileOutDataForLength(platformUid : string , startTime: string, endTime: string,
                                     limit: number , uid : string, thirdUid : string ): Promise<any> {

        try {
            let where = `GameRecord.createTimeDate >= "${startTime}" AND GameRecord.createTimeDate <= "${endTime}"
                         AND GameRecord.game_id NOT IN ("t1","t2")`;
            if(uid){
                where = where + ` AND GameRecord.uid = "${uid}"`
            }

            if(thirdUid){
                where = where + ` AND GameRecord.thirdUid = "${thirdUid}"`
            }

            let table = moment(startTime).format("YYYYMM");
            let count = 0 ;
            let selectCount =`COUNT(GameRecord.id) AS length`;
            let sqlCount = `        
            SELECT
                ${selectCount}
            FROM
                Sp_GameRecord_${platformUid}_${table} AS GameRecord
            WHERE 
                 ${where}`;

            const countResult = await ConnectionManager.getConnection(true)
                .query(sqlCount);

            for(let key of countResult){
                count += Number(key.length);
            }
            return  count;
        } catch (e) {
            console.warn(e);
            return 0;
        }
    }


    /**
     * 作用于到处相关的数据，根式时间来进行导出 计算长度
     * @param platformUid
     * @param startTime
     * @param endTime
     * @param page
     * @param limit
     * @param uid
     * @param thirdUid
     * @param id
     */
    async fileOutDataForLengthForAgent(platformUid : string ,agentName : string , startTime: string, endTime: string,
                               limit: number , uid : string, thirdUid : string ): Promise<any> {

        try {
            let where = `GameRecord.createTimeDate >= "${startTime}" AND GameRecord.createTimeDate <= "${endTime}"
                         AND GameRecord.groupRemark = "${agentName}"
                         AND GameRecord.game_id NOT IN ("t1","t2")`;
            if(uid){
                where = where + ` AND GameRecord.uid = "${uid}"`
            }

            if(thirdUid){
                where = where + ` AND GameRecord.thirdUid = "${thirdUid}"`
            }

            let table = moment(startTime).format("YYYYMM");
            let count = 0 ;
            let selectCount =`COUNT(GameRecord.id) AS length`;
            let sqlCount = `        
            SELECT
                ${selectCount}
            FROM
                Sp_GameRecord_${platformUid}_${table} AS GameRecord
            WHERE 
                 ${where}`;

            const countResult = await ConnectionManager.getConnection(true)
                .query(sqlCount);

            for(let key of countResult){
                count += Number(key.length);
            }
            return  count;
        } catch (e) {
            console.warn(e);
            return 0;
        }
    }

    /**
     * 作用于管理后台给租户看的游戏记录 ==thirdApi.service
     * @param groupRemark
     * @param startTime
     * @param endTime
     */
    async findListAgentLimitForWhereAndTime(where: string, startTime: string, endTime: string, page: number, limit: number): Promise<any> {
        try {
            const [list, count] = await ConnectionManager.getConnection(true)
                .getRepository(GameRecord)
                .createQueryBuilder("GameRecord")
                .where(where)
                .orderBy("GameRecord.createTimeDate", "DESC")
                .select(['GameRecord.id', 'GameRecord.uid', 'GameRecord.thirdUid', 'GameRecord.groupRemark','GameRecord.nid', 'GameRecord.gameName', 'GameRecord.result',  'GameRecord.roundId', 'GameRecord.sceneId', 'GameRecord.roomId', 'GameRecord.gold',
                    'GameRecord.validBet', 'GameRecord.input', 'GameRecord.profit', 'GameRecord.bet_commission', 'GameRecord.win_commission', 'GameRecord.settle_commission', 'GameRecord.gameOrder', 'GameRecord.createTimeDate'])
                .skip((page - 1) * limit)
                .take(limit)
                .getManyAndCount();
            return { list, count };
        } catch (e) {
            return false;
        }
    }




    /**
     * 作用于管理后台根据 时间 来进行搜索
     * @param uid
     * @param nid
     * @param page
     * @param limit
     * @param startTime
     * @param endTime
     */
    async findForUidAndGroupId( uid: string, group_id: string, page : number ): Promise<any> {
        try {
            let limit = 100;
            const time = moment().format("YYYYMM");
            let tableName = `Sp_GameRecord_${time}`;
            if(group_id){
                 tableName = `Sp_GameRecord_${group_id}_${time}`;
            }
            let select = ['Sp_GameRecord.id AS id', 'Sp_GameRecord.uid AS uid', 'Sp_GameRecord.groupRemark AS groupRemark', 'Sp_GameRecord.thirdUid AS thirdUid', 'Sp_GameRecord.gameName AS gameName',
                'Sp_GameRecord.game_id AS nid', 'Sp_GameRecord.sceneId AS sceneId', 'Sp_GameRecord.roomId AS roomId', 'Sp_GameRecord.gold AS gold', 'Sp_GameRecord.validBet AS validBet', 'Sp_GameRecord.round_id AS roundId',
                'Sp_GameRecord.profit AS profit', 'Sp_GameRecord.bet_commission AS bet_commission', 'Sp_GameRecord.win_commission AS win_commission', 'Sp_GameRecord.settle_commission AS settle_commission',
                'Sp_GameRecord.game_order_id AS gameOrder', 'DATE_FORMAT(Sp_GameRecord.createTimeDate,"%Y-%m-%d %H:%i:%s")  createTimeDate'];
            let selectCount =`COUNT(Sp_GameRecord.id) AS length`;
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
            //获取数据的sql语句
            const result = await ConnectionManager.getConnection(true)
                .query(sql);
            //获取长度的sql语句
            const countResult = await ConnectionManager.getConnection(true)
                .query(sqlCount);
            let count = 0 ;
            for(let key of countResult){
                count += Number(key.length);
            }
            return { list : result , count: count};
        } catch (e) {
            return false;
        }
    }


    /**
     * 查询指定代理下面玩家输赢统计
     * @param uid 租户编号
     * @param startDateTime 开始时间
     * @param endDateTime 结束时间
     */
    async getTenantGameData(platformUid : string , where: string, table1: string, table2: string): Promise<Array<any>> {
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
            if(table2){
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
            if(sql2){
                sql  = sql + ` UNION ALL ` + sql2;
            }
            const total = await ConnectionManager.getConnection(true).query(sql);
            return total;
        } catch (e) {
            console.error(`查询指定租户游戏运营数据: ${e.stack}`);
            return [];
        }
    }


    /**
     * 查询时间
     * @param uid
     * @param nid
     * @param startTime
     * @param endTime
     */
    async getPlatformData(tableName : string, startDateTime: string , endDateTime : string ,  ): Promise<any> {
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
            //获取数据的sql语句
            const result = await ConnectionManager.getConnection(true)
                .query(sql);

            return result;
        } catch (e) {
            return false;
        }
    }


    async insertMany(parameterList: Array<GameRecord>): Promise<boolean> {
        try {
            await ConnectionManager.getConnection()
                .createQueryBuilder()
                .insert()
                .into(GameRecord)
                .values(parameterList)
                .execute();
            return true;
        } catch (e) {
            console.error(`玩家代理关系表 | 批量插入 | 出错:${e.stack}`)
            return false;
        }
    }

    async deleteBetweenDate(startTime: string, endTime: string) {
        try {
            const { affected } = await ConnectionManager.getConnection()
                .createQueryBuilder()
                .delete()
                .from(GameRecord)
                .where("createTimeDate BETWEEN :startTime AND :endTime", {
                    startTime,
                    endTime
                })
                .execute();

            return !!affected;
        } catch (e) {
            return false;
        }
    }


}

export default new GameRecordMysqlDao();