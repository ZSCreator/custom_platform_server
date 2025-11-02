"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const RDSClient_1 = require("../../app/common/dao/mysql/lib/RDSClient");
const connectionManager_1 = require("../../app/common/dao/mysql/lib/connectionManager");
RDSClient_1.RDSClient.demoInit();
async function alter() {
    console.warn(`开始执行`);
    console.warn(`Sp_PayInfo 新增字段 groupRemark | 开始`);
    let addMysql = `alter table Sp_PayInfo ADD COLUMN groupRemark VARCHAR(20) DEFAULT NULL`;
    await connectionManager_1.default.getConnection(false)
        .query(addMysql);
    console.warn(`Sp_PayInfo 新增字段 groupRemark | 成功`);
    process.exit();
}
setTimeout(alter, 2000);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2hhbmdlUGF5SW5mb1RhYmxlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vdG9vbHMvbW9uZ2RiVG9NeXNxbC9jaGFuZ2VQYXlJbmZvVGFibGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSx3RUFBcUU7QUFDckUsd0ZBQWlGO0FBRWpGLHFCQUFTLENBQUMsUUFBUSxFQUFFLENBQUM7QUFDckIsS0FBSyxVQUFVLEtBQUs7SUFDaEIsT0FBTyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQztJQUVyQixPQUFPLENBQUMsSUFBSSxDQUFDLGtDQUFrQyxDQUFDLENBQUM7SUFDakQsSUFBSSxRQUFRLEdBQUcsd0VBQXdFLENBQUM7SUFDeEYsTUFBTSwyQkFBaUIsQ0FBQyxhQUFhLENBQUMsS0FBSyxDQUFDO1NBQ3ZDLEtBQUssQ0FBQyxRQUFRLENBQUMsQ0FBQztJQUVqQixPQUFPLENBQUMsSUFBSSxDQUFDLGtDQUFrQyxDQUFDLENBQUM7SUFHckQsT0FBTyxDQUFDLElBQUksRUFBRSxDQUFDO0FBQ25CLENBQUM7QUFFRCxVQUFVLENBQUMsS0FBSyxFQUFFLElBQUksQ0FBQyxDQUFDIn0=