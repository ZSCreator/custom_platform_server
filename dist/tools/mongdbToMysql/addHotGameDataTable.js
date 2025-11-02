"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const RDSClient_1 = require("../../app/common/dao/mysql/lib/RDSClient");
const connectionManager_1 = require("../../app/common/dao/mysql/lib/connectionManager");
async function run() {
    await RDSClient_1.RDSClient.demoInit();
    console.warn("开始生成热门游戏统计表的脚本");
    const createPlatformControlTableSQL = `
        CREATE TABLE IF NOT EXISTS Sp_HotGameData (
            id int(0) NOT NULL AUTO_INCREMENT,
            nid varchar(20) NOT NULL COMMENT '游戏id',
            sceneId int(0) NOT NULL COMMENT '场编号',
            playerNum int(0) NULL DEFAULT 0 COMMENT '登陆人数',
            createTime datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) COMMENT '创建时间',
            PRIMARY KEY (id) USING BTREE
    ) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = DYNAMIC;
    `;
    await connectionManager_1.default.getConnection()
        .query(createPlatformControlTableSQL);
    console.warn("开始生成热门游戏统计表的脚本-----结束");
    process.exit();
}
run();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWRkSG90R2FtZURhdGFUYWJsZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3Rvb2xzL21vbmdkYlRvTXlzcWwvYWRkSG90R2FtZURhdGFUYWJsZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLHdFQUFxRTtBQUNyRSx3RkFBaUY7QUFNakYsS0FBSyxVQUFVLEdBQUc7SUFDZCxNQUFNLHFCQUFTLENBQUMsUUFBUSxFQUFFLENBQUM7SUFDM0IsT0FBTyxDQUFDLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFBO0lBQzlCLE1BQU0sNkJBQTZCLEdBQUc7Ozs7Ozs7OztLQVNyQyxDQUFDO0lBRUQsTUFBTSwyQkFBaUIsQ0FBQyxhQUFhLEVBQUU7U0FDbkMsS0FBSyxDQUFDLDZCQUE2QixDQUFDLENBQUM7SUFFMUMsT0FBTyxDQUFDLElBQUksQ0FBQyx1QkFBdUIsQ0FBQyxDQUFDO0lBRXRDLE9BQU8sQ0FBQyxJQUFJLEVBQUUsQ0FBQztBQUNuQixDQUFDO0FBRUQsR0FBRyxFQUFFLENBQUMifQ==