"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GameRecordDateTableMysqlDao = void 0;
const connectionManager_1 = require("../mysql/lib/connectionManager");
const moment = require("moment");
class GameRecordDateTableMysqlDao {
    findList(parameter) {
        throw new Error("Method not implemented.");
    }
    findOne(parameter) {
        throw new Error("Method not implemented.");
    }
    async tableBeExists(tableDate) {
        try {
            const res = await connectionManager_1.default.getConnection()
                .query(`SHOW TABLES LIKE "Sp_GameRecord_${tableDate}"`);
            return !!res.length;
        }
        catch (e) {
            console.error(`备份表 | 查询目标表 Sp_GameRecord_${tableDate} 出错: ${e.stack}`);
            return false;
        }
    }
    async updateOne(tableName, parameter, partialEntity) {
        const gameResult = partialEntity.game_Records_live_result ? `'${JSON.stringify(partialEntity.game_Records_live_result)}'` : null;
        const sql = `update ${tableName}  SET game_Records_live_result=${gameResult} WHERE id=${parameter.id};`;
        const res = await connectionManager_1.default.getConnection().query(sql);
    }
    async insertOne(parameter) {
        let sql = "";
        try {
            const date = moment().format("YYYYMM");
            let tableName = `Sp_GameRecord_${date}`;
            if (parameter.group_id) {
                tableName = `Sp_GameRecord_${parameter.group_id}_${date}`;
            }
            const { uid, thirdUid, nid, gameName, sceneId, roomId, roundId, gameType, input, validBet, profit, bet_commission, win_commission, settle_commission, gameOrder, gold, status, multiple, groupRemark, isDealer, result, game_Records_live_result } = parameter;
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
            const res = await connectionManager_1.default.getConnection().query(sql);
            return { insertId: res.insertId, tableName };
        }
        catch (e) {
            console.error(`插入游戏记录出错: ${e.stack}|${sql}`);
            return null;
        }
    }
    async createTable(tableDate) {
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
            const res = await connectionManager_1.default.getConnection()
                .query(sql);
            return true;
        }
        catch (e) {
            console.error(`备份表 | 创建表 Sp_GameRecord_${tableDate} 出错: ${e.stack}`);
        }
    }
    delete(parameter) {
        throw new Error("Method not implemented.");
    }
}
exports.GameRecordDateTableMysqlDao = GameRecordDateTableMysqlDao;
exports.default = new GameRecordDateTableMysqlDao();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiR2FtZVJlY29yZERhdGVUYWJsZS5teXNxbC5kYW8uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9hcHAvY29tbW9uL2Rhby9teXNxbC9HYW1lUmVjb3JkRGF0ZVRhYmxlLm15c3FsLmRhby50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFLQSxzRUFBK0Q7QUFDL0QsaUNBQWlDO0FBRWpDLE1BQWEsMkJBQTJCO0lBQ3BDLFFBQVEsQ0FBQyxTQUFxQjtRQUMxQixNQUFNLElBQUksS0FBSyxDQUFDLHlCQUF5QixDQUFDLENBQUM7SUFDL0MsQ0FBQztJQUNELE9BQU8sQ0FBQyxTQUFxQjtRQUN6QixNQUFNLElBQUksS0FBSyxDQUFDLHlCQUF5QixDQUFDLENBQUM7SUFDL0MsQ0FBQztJQUlELEtBQUssQ0FBQyxhQUFhLENBQUMsU0FBaUI7UUFDakMsSUFBSTtZQUNBLE1BQU0sR0FBRyxHQUFHLE1BQU0sMkJBQWlCLENBQUMsYUFBYSxFQUFFO2lCQUM5QyxLQUFLLENBQUMsbUNBQW1DLFNBQVMsR0FBRyxDQUFDLENBQUM7WUFHNUQsT0FBTyxDQUFDLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQztTQUN2QjtRQUFDLE9BQU8sQ0FBQyxFQUFFO1lBQ1IsT0FBTyxDQUFDLEtBQUssQ0FBQyw2QkFBNkIsU0FBUyxRQUFRLENBQUMsQ0FBQyxLQUFLLEVBQUUsQ0FBQyxDQUFDO1lBQ3ZFLE9BQU8sS0FBSyxDQUFDO1NBQ2hCO0lBQ0wsQ0FBQztJQUVELEtBQUssQ0FBQyxTQUFTLENBQUMsU0FBaUIsRUFBRSxTQUF5QixFQUFFLGFBQWdEO1FBQzFHLE1BQU0sVUFBVSxHQUFHLGFBQWEsQ0FBQyx3QkFBd0IsQ0FBQyxDQUFDLENBQUMsSUFBSSxJQUFJLENBQUMsU0FBUyxDQUFDLGFBQWEsQ0FBQyx3QkFBd0IsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQztRQUNqSSxNQUFNLEdBQUcsR0FBRyxVQUFVLFNBQVMsa0NBQWtDLFVBQVUsYUFBYSxTQUFTLENBQUMsRUFBRSxHQUFHLENBQUM7UUFDeEcsTUFBTSxHQUFHLEdBQUcsTUFBTSwyQkFBaUIsQ0FBQyxhQUFhLEVBQUUsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUM7SUFLbkUsQ0FBQztJQUVELEtBQUssQ0FBQyxTQUFTLENBQUMsU0FBeWpCO1FBQ3JrQixJQUFJLEdBQUcsR0FBRyxFQUFFLENBQUM7UUFDYixJQUFJO1lBQ0EsTUFBTSxJQUFJLEdBQUcsTUFBTSxFQUFFLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxDQUFDO1lBQ3ZDLElBQUksU0FBUyxHQUFHLGlCQUFpQixJQUFJLEVBQUUsQ0FBQztZQUN4QyxJQUFJLFNBQVMsQ0FBQyxRQUFRLEVBQUU7Z0JBQ3BCLFNBQVMsR0FBRyxpQkFBaUIsU0FBUyxDQUFDLFFBQVEsSUFBSSxJQUFJLEVBQUUsQ0FBQzthQUM3RDtZQUVELE1BQU0sRUFDRixHQUFHLEVBQ0gsUUFBUSxFQUNSLEdBQUcsRUFDSCxRQUFRLEVBQ1IsT0FBTyxFQUNQLE1BQU0sRUFDTixPQUFPLEVBQ1AsUUFBUSxFQUNSLEtBQUssRUFDTCxRQUFRLEVBQ1IsTUFBTSxFQUNOLGNBQWMsRUFDZCxjQUFjLEVBQ2QsaUJBQWlCLEVBQ2pCLFNBQVMsRUFDVCxJQUFJLEVBQ0osTUFBTSxFQUNOLFFBQVEsRUFDUixXQUFXLEVBQ1gsUUFBUSxFQUNSLE1BQU0sRUFDTix3QkFBd0IsRUFDM0IsR0FBRyxTQUFTLENBQUM7WUFDZCxNQUFNLFVBQVUsR0FBRyx3QkFBd0IsQ0FBQyxDQUFDLENBQUMsSUFBSSxJQUFJLENBQUMsU0FBUyxDQUFDLHdCQUF3QixDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDO1lBQ3JHLEdBQUcsR0FBRzswQkFDUSxTQUFTOzs7Ozs7Ozs7OzttQkFXaEIsR0FBRyxNQUFNLFFBQVEsQ0FBQyxDQUFDLENBQUMsSUFBSSxRQUFRLEdBQUcsQ0FBQyxDQUFDLENBQUMsSUFBSSxNQUFNLFFBQVEsTUFBTSxXQUFXLENBQUMsQ0FBQyxDQUFDLElBQUksV0FBVyxHQUFHLENBQUMsQ0FBQyxDQUFDLElBQUksTUFBTSxHQUFHO2tCQUMvRyxPQUFPLE1BQU0sTUFBTSxPQUFPLE9BQU8sQ0FBQyxDQUFDLENBQUMsSUFBSSxPQUFPLEdBQUcsQ0FBQyxDQUFDLENBQUMsSUFBSSxLQUFLLFFBQVEsQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxJQUFJO2tCQUN4RixRQUFRLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsS0FBSyxLQUFLLE1BQU0sQ0FBQyxDQUFDLENBQUMsSUFBSSxNQUFNLEdBQUcsQ0FBQyxDQUFDLENBQUMsSUFBSSxLQUFLLElBQUksS0FBSyxLQUFLLEtBQUssUUFBUSxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUM7a0JBQzVHLE1BQU0sS0FBSyxjQUFjLENBQUMsQ0FBQyxDQUFDLGNBQWMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLGNBQWMsQ0FBQyxDQUFDLENBQUMsY0FBYyxDQUFDLENBQUMsQ0FBQyxDQUFDO2tCQUN0RixpQkFBaUIsQ0FBQyxDQUFDLENBQUMsaUJBQWlCLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxRQUFRLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLFNBQVMsTUFBTSxNQUFNLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQztrQkFDN0csVUFBVTswQkFDRixDQUFDO1lBRWYsTUFBTSxHQUFHLEdBQUcsTUFBTSwyQkFBaUIsQ0FBQyxhQUFhLEVBQUUsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUM7WUFDL0QsT0FBTyxFQUFFLFFBQVEsRUFBRSxHQUFHLENBQUMsUUFBUSxFQUFFLFNBQVMsRUFBRSxDQUFDO1NBQ2hEO1FBQUMsT0FBTyxDQUFDLEVBQUU7WUFDUixPQUFPLENBQUMsS0FBSyxDQUFDLGFBQWEsQ0FBQyxDQUFDLEtBQUssSUFBSSxHQUFHLEVBQUUsQ0FBQyxDQUFDO1lBQzdDLE9BQU8sSUFBSSxDQUFDO1NBQ2Y7SUFDTCxDQUFDO0lBSUQsS0FBSyxDQUFDLFdBQVcsQ0FBQyxTQUFpQjtRQUMvQixNQUFNLEdBQUcsR0FBRzt1REFDbUMsU0FBUzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7YUFnQ25ELENBQUM7UUFFTixJQUFJO1lBRUEsTUFBTSxHQUFHLEdBQUcsTUFBTSwyQkFBaUIsQ0FBQyxhQUFhLEVBQUU7aUJBQzlDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQztZQUVoQixPQUFPLElBQUksQ0FBQztTQUNmO1FBQUMsT0FBTyxDQUFDLEVBQUU7WUFDUixPQUFPLENBQUMsS0FBSyxDQUFDLDJCQUEyQixTQUFTLFFBQVEsQ0FBQyxDQUFDLEtBQUssRUFBRSxDQUFDLENBQUM7U0FDeEU7SUFDTCxDQUFDO0lBRUQsTUFBTSxDQUFDLFNBQXFCO1FBQ3hCLE1BQU0sSUFBSSxLQUFLLENBQUMseUJBQXlCLENBQUMsQ0FBQztJQUMvQyxDQUFDO0NBRUo7QUFwSkQsa0VBb0pDO0FBRUQsa0JBQWUsSUFBSSwyQkFBMkIsRUFBRSxDQUFDIn0=