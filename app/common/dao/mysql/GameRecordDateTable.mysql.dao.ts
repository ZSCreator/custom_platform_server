import { GameCommissionTargetObjectEnum } from "../../constant/hall/GameCommissionTargetObjectEnum";
import { GameCommissionWayEnum } from "../../constant/hall/GameCommissionWayEnum";
import { AbstractDao } from "../ADao.abstract";
import { GameRecord } from "./entity/GameRecord.entity";
import { GameRecordStatusEnum } from "./enum/GameRecordStatus.enum";
import ConnectionManager from "../mysql/lib/connectionManager";
import * as moment from "moment";

export class GameRecordDateTableMysqlDao implements AbstractDao<GameRecord>{
    findList(parameter: GameRecord): Promise<GameRecord[]> {
        throw new Error("Method not implemented.");
    }
    findOne(parameter: GameRecord): Promise<GameRecord> {
        throw new Error("Method not implemented.");
    }



    async tableBeExists(tableDate: string) {
        try {
            const res = await ConnectionManager.getConnection()
                .query(`SHOW TABLES LIKE "Sp_GameRecord_${tableDate}"`);


            return !!res.length;
        } catch (e) {
            console.error(`备份表 | 查询目标表 Sp_GameRecord_${tableDate} 出错: ${e.stack}`);
            return false;
        }
    }

    async updateOne(tableName: string, parameter: { id: number }, partialEntity: { game_Records_live_result: any }): Promise<any> {
        const gameResult = partialEntity.game_Records_live_result ? `'${JSON.stringify(partialEntity.game_Records_live_result)}'` : null;
        const sql = `update ${tableName}  SET game_Records_live_result=${gameResult} WHERE id=${parameter.id};`;
        const res = await ConnectionManager.getConnection().query(sql);
        // const { affected } = await ConnectionManager.getConnection()
        //     .getRepository(GameRecord)
        //     .update(parameter, partialEntity);
        // return !!affected;
    }

    async insertOne(parameter: { id?: number; group_id?: string, groupRemark?: string; validBet?: number; uid?: string; thirdUid?: string; gameName?: string; nid?: string; sceneId?: number; roomId?: string; gameType?: number; roundId?: string; isDealer?: boolean; result?: string; gold?: number; input?: number; profit?: number; bet_commission?: number; win_commission?: number; settle_commission?: number; multiple?: number; addRmb?: number; addTixian?: number; status?: GameRecordStatusEnum; gameOrder?: string; game_Records_live_result?: any; createTimeDate?: Date; updateTime?: Date; }): Promise<any> {
        let sql = "";
        try {
            const date = moment().format("YYYYMM");
            let tableName = `Sp_GameRecord_${date}`;
            if (parameter.group_id) {
                tableName = `Sp_GameRecord_${parameter.group_id}_${date}`;
            }

            const {
                uid,
                thirdUid,
                nid,
                gameName,
                sceneId,
                roomId,
                roundId,
                gameType,
                input,
                validBet,
                profit,
                bet_commission,
                win_commission,
                settle_commission,
                gameOrder,
                gold,
                status,
                multiple,
                groupRemark,
                isDealer,
                result,
                game_Records_live_result
            } = parameter;
            const gameResult = game_Records_live_result ? `'${JSON.stringify(game_Records_live_result)}'` : null;
            sql = `
            INSERT INTO ${tableName} 
            ( 
                uid, thirdUid, gameName, groupRemark, game_id, 
                sceneId, roomId, round_id, gameType, 
                isDealer, game_results, gold, input, validBet, 
                profit, bet_commission, win_commission, 
                settle_commission, multiple, game_order_id, status, createTimeDate,
                game_Records_live_result
            )
            VALUES
            ( 
                "${uid}", ${thirdUid ? `"${thirdUid}"` : null}, "${gameName}", ${groupRemark ? `"${groupRemark}"` : null}, "${nid}", 
                ${sceneId}, "${roomId}",  ${roundId ? `"${roundId}"` : null}, ${gameType ? gameType : null},
                ${isDealer ? isDealer : false}, ${result ? `"${result}"` : null}, ${gold}, ${input}, ${validBet ? validBet : 0}, 
                ${profit}, ${bet_commission ? bet_commission : 0}, ${win_commission ? win_commission : 0}, 
                ${settle_commission ? settle_commission : 0}, ${multiple ? multiple : 0}, "${gameOrder}", ${status ? status : 0}, NOW(), 
                ${gameResult}
            )            `;

            const res = await ConnectionManager.getConnection().query(sql);
            return { insertId: res.insertId, tableName };
        } catch (e) {
            console.error(`插入游戏记录出错: ${e.stack}|${sql}`);
            return null;
        }
    }



    async createTable(tableDate: string) {
        const sql = `
            CREATE TABLE IF NOT Exists Sp_GameRecord_${tableDate}  (
                id int(0) NOT NULL AUTO_INCREMENT,
                uid varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '游戏编号',
                thirdUid varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '第三方账号',
                gameName varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '游戏名字',
                groupRemark varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '租客的备注信息',
                game_id varchar(5) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '游戏编号',
                sceneId int(0) NOT NULL COMMENT '场编号',
                roomId varchar(4) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '房间编号',
                round_id varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '游戏该局编号',
                gameType int(0) NULL DEFAULT NULL COMMENT '游戏类型: 1 电玩类 2 百人类 3 对战类',
                isDealer tinyint(0) NOT NULL DEFAULT 0 COMMENT '是否庄家: 0 关；1 开； 默认关',
                game_results varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT '' COMMENT '对局结果',
                gold int(0) NOT NULL DEFAULT 0 COMMENT '玩家此时金币携带量',
                input int(0) NOT NULL DEFAULT 0 COMMENT '下注额',
                validBet int(0) NOT NULL DEFAULT 0 COMMENT '有效下注额',
                profit int(0) NOT NULL DEFAULT 0 COMMENT '纯利',
                bet_commission int(0) NOT NULL DEFAULT 0 COMMENT '下注佣金',
                win_commission int(0) NOT NULL DEFAULT 0 COMMENT '赢取佣金',
                settle_commission int(0) NOT NULL DEFAULT 0 COMMENT '结算佣金',
                multiple int(0) NOT NULL DEFAULT 0 COMMENT '盈利倍数',
                status int(0) NOT NULL DEFAULT 0 COMMENT '记录状态: 0 为生效；1 生效',
                game_order_id varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '订单编号',
                createTimeDate datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) COMMENT '创建时间',
                updateTime datetime(6) NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6) COMMENT '最近修改时间',
                game_Records_live_result json NULL,
                PRIMARY KEY (id) USING BTREE,
                INDEX idx_game_order_id(game_order_id) USING BTREE,
                INDEX idx_uid_createTimeDate_game_id_groupRemark(createTimeDate, uid, game_id, groupRemark ) USING BTREE,
                INDEX idx_round_id(round_id) USING BTREE,
                INDEX idx_createTimeDate_uid_game_id(uid, game_id, createTimeDate) USING BTREE
              ) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = DYNAMIC;
            `;

        try {

            const res = await ConnectionManager.getConnection()
                .query(sql);

            return true;
        } catch (e) {
            console.error(`备份表 | 创建表 Sp_GameRecord_${tableDate} 出错: ${e.stack}`);
        }
    }

    delete(parameter: GameRecord): Promise<any> {
        throw new Error("Method not implemented.");
    }

}

export default new GameRecordDateTableMysqlDao();