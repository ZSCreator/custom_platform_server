"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const connectionManager_1 = require("../mysql/lib/connectionManager");
const hotGameData_entity_1 = require("./entity/hotGameData.entity");
class HotGameDataMysqlDao {
    async findListToLimit(startTime, endTime) {
        try {
            const sql = `SELECT DATE_FORMAT(Sp_HotGameData.createTime,"%Y-%m-%d %H:%i:%s")  createTime  , Sp_HotGameData.nid AS nid, Sp_HotGameData.sceneId as sceneId, Sp_HotGameData.playerNum as playerNum 
		              FROM Sp_HotGameData WHERE Sp_HotGameData.createTime >'${startTime}' AND Sp_HotGameData.createTime <'${endTime}' `;
            const result = await connectionManager_1.default.getConnection(true)
                .query(sql);
            return result;
        }
        catch (e) {
            console.error(e);
            return false;
        }
    }
    async insertMany(parameterList) {
        try {
            await connectionManager_1.default.getConnection()
                .createQueryBuilder()
                .insert()
                .into(hotGameData_entity_1.HotGameData)
                .values(parameterList)
                .execute();
            return true;
        }
        catch (e) {
            console.error(`租户运营数据 | 批量插入 | 出错:${e.stack}`);
            return false;
        }
    }
}
exports.default = new HotGameDataMysqlDao();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiSG90R2FtZURhdGEubXlzcWwuZGFvLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vYXBwL2NvbW1vbi9kYW8vbXlzcWwvSG90R2FtZURhdGEubXlzcWwuZGFvLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsc0VBQStEO0FBQy9ELG9FQUF3RDtBQUV4RCxNQUFNLG1CQUFtQjtJQUVyQixLQUFLLENBQUMsZUFBZSxDQUFDLFNBQWtCLEVBQUcsT0FBZ0I7UUFDdkQsSUFBSTtZQUNBLE1BQU0sR0FBRyxHQUFHO3dFQUNnRCxTQUFTLHFDQUFxQyxPQUFPLElBQUksQ0FBQztZQUN0SCxNQUFNLE1BQU0sR0FBRyxNQUFNLDJCQUFpQixDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQUM7aUJBQ3JELEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQztZQUNoQixPQUFRLE1BQU0sQ0FBQztTQUNsQjtRQUFDLE9BQU8sQ0FBQyxFQUFFO1lBQ1IsT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQTtZQUNoQixPQUFPLEtBQUssQ0FBQztTQUNoQjtJQUNMLENBQUM7SUFHRCxLQUFLLENBQUMsVUFBVSxDQUFDLGFBQWlDO1FBQzlDLElBQUk7WUFDQSxNQUFNLDJCQUFpQixDQUFDLGFBQWEsRUFBRTtpQkFDbEMsa0JBQWtCLEVBQUU7aUJBQ3BCLE1BQU0sRUFBRTtpQkFDUixJQUFJLENBQUMsZ0NBQVcsQ0FBQztpQkFDakIsTUFBTSxDQUFDLGFBQWEsQ0FBQztpQkFDckIsT0FBTyxFQUFFLENBQUM7WUFDZixPQUFPLElBQUksQ0FBQztTQUNmO1FBQUMsT0FBTyxDQUFDLEVBQUU7WUFDUixPQUFPLENBQUMsS0FBSyxDQUFDLHNCQUFzQixDQUFDLENBQUMsS0FBSyxFQUFFLENBQUMsQ0FBQTtZQUM5QyxPQUFPLEtBQUssQ0FBQztTQUNoQjtJQUNMLENBQUM7Q0FHSjtBQUVELGtCQUFlLElBQUksbUJBQW1CLEVBQUUsQ0FBQyJ9