"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ADao_abstract_1 = require("../ADao.abstract");
const Robot_entity_1 = require("./entity/Robot.entity");
const connectionManager_1 = require("../mysql/lib/connectionManager");
class RobotMysqlDao extends ADao_abstract_1.AbstractDao {
    async findList(parameter) {
        try {
            const list = await connectionManager_1.default.getConnection()
                .getRepository(Robot_entity_1.Robot)
                .find(parameter);
            return list;
        }
        catch (e) {
            return [];
        }
    }
    async findOne(parameter) {
        try {
            const player = await connectionManager_1.default.getConnection()
                .getRepository(Robot_entity_1.Robot)
                .findOne(parameter);
            return player;
        }
        catch (e) {
            return null;
        }
    }
    async updateOne(parameter, partialEntity) {
        try {
            const { affected } = await connectionManager_1.default.getConnection()
                .getRepository(Robot_entity_1.Robot)
                .update(parameter, partialEntity);
            return !!affected;
        }
        catch (e) {
            return false;
        }
    }
    async insertOne(parameter) {
        try {
            const playerRepository = connectionManager_1.default.getConnection()
                .getRepository(Robot_entity_1.Robot);
            const p = playerRepository.create(parameter);
            return await playerRepository.save(p);
        }
        catch (e) {
            return null;
        }
    }
    async delete(parameter) {
        try {
            const { affected } = await connectionManager_1.default.getConnection()
                .getRepository(Robot_entity_1.Robot)
                .delete(parameter);
            return !!affected;
        }
        catch (e) {
            return false;
        }
    }
    async updateManyForSessionClose(uidList) {
        const sql = `
        UPDATE Sp_Robot SET position = 0,robotOnLine = false
        WHERE pk_uid IN (${uidList.map((uid) => `'${uid}'`).join(",")})
        `;
        try {
            await connectionManager_1.default.getConnection()
                .query(sql);
            return true;
        }
        catch (e) {
            console.error(`RobotMysqlDao | 机器人批量更新离线信息出错:${e.stack}`);
            return false;
        }
    }
}
exports.default = new RobotMysqlDao();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUm9ib3QubXlzcWwuZGFvLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vYXBwL2NvbW1vbi9kYW8vbXlzcWwvUm9ib3QubXlzcWwuZGFvLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQ0Esb0RBQStDO0FBQy9DLHdEQUE4QztBQUM5QyxzRUFBK0Q7QUFFL0QsTUFBTSxhQUFjLFNBQVEsMkJBQWtCO0lBQzFDLEtBQUssQ0FBQyxRQUFRLENBQUMsU0FBMFI7UUFDclMsSUFBSTtZQUNBLE1BQU0sSUFBSSxHQUFHLE1BQU0sMkJBQWlCLENBQUMsYUFBYSxFQUFFO2lCQUMvQyxhQUFhLENBQUMsb0JBQUssQ0FBQztpQkFDcEIsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDO1lBRXJCLE9BQU8sSUFBSSxDQUFDO1NBQ2Y7UUFBQyxPQUFPLENBQUMsRUFBRTtZQUNSLE9BQU8sRUFBRSxDQUFDO1NBQ2I7SUFDTCxDQUFDO0lBRUQsS0FBSyxDQUFDLE9BQU8sQ0FBQyxTQUEwUjtRQUNwUyxJQUFJO1lBQ0EsTUFBTSxNQUFNLEdBQUcsTUFBTSwyQkFBaUIsQ0FBQyxhQUFhLEVBQUU7aUJBQ2pELGFBQWEsQ0FBQyxvQkFBSyxDQUFDO2lCQUNwQixPQUFPLENBQUMsU0FBUyxDQUFDLENBQUM7WUFFeEIsT0FBTyxNQUFNLENBQUM7U0FDakI7UUFBQyxPQUFPLENBQUMsRUFBRTtZQUNSLE9BQU8sSUFBSSxDQUFDO1NBQ2Y7SUFDTCxDQUFDO0lBQ0QsS0FBSyxDQUFDLFNBQVMsQ0FBQyxTQUEwUixFQUFFLGFBQThSO1FBQ3RrQixJQUFJO1lBQ0EsTUFBTSxFQUFFLFFBQVEsRUFBRSxHQUFHLE1BQU0sMkJBQWlCLENBQUMsYUFBYSxFQUFFO2lCQUN2RCxhQUFhLENBQUMsb0JBQUssQ0FBQztpQkFDcEIsTUFBTSxDQUFDLFNBQVMsRUFBRSxhQUFhLENBQUMsQ0FBQztZQUN0QyxPQUFPLENBQUMsQ0FBQyxRQUFRLENBQUM7U0FDckI7UUFBQyxPQUFPLENBQUMsRUFBRTtZQUNSLE9BQU8sS0FBSyxDQUFDO1NBQ2hCO0lBQ0wsQ0FBQztJQUNELEtBQUssQ0FBQyxTQUFTLENBQUMsU0FBMFI7UUFDdFMsSUFBSTtZQUNBLE1BQU0sZ0JBQWdCLEdBQUcsMkJBQWlCLENBQUMsYUFBYSxFQUFFO2lCQUNyRCxhQUFhLENBQUMsb0JBQUssQ0FBQyxDQUFDO1lBRTFCLE1BQU0sQ0FBQyxHQUFHLGdCQUFnQixDQUFDLE1BQU0sQ0FBQyxTQUFTLENBQUMsQ0FBQztZQUU3QyxPQUFPLE1BQU0sZ0JBQWdCLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO1NBQ3pDO1FBQUMsT0FBTyxDQUFDLEVBQUU7WUFDUixPQUFPLElBQUksQ0FBQztTQUNmO0lBQ0wsQ0FBQztJQUNELEtBQUssQ0FBQyxNQUFNLENBQUMsU0FBMFI7UUFDblMsSUFBSTtZQUNBLE1BQU0sRUFBRSxRQUFRLEVBQUUsR0FBRyxNQUFNLDJCQUFpQixDQUFDLGFBQWEsRUFBRTtpQkFDdkQsYUFBYSxDQUFDLG9CQUFLLENBQUM7aUJBQ3BCLE1BQU0sQ0FBQyxTQUFTLENBQUMsQ0FBQztZQUN2QixPQUFPLENBQUMsQ0FBQyxRQUFRLENBQUM7U0FDckI7UUFBQyxPQUFPLENBQUMsRUFBRTtZQUNSLE9BQU8sS0FBSyxDQUFDO1NBQ2hCO0lBQ0wsQ0FBQztJQU1ELEtBQUssQ0FBQyx5QkFBeUIsQ0FBQyxPQUFzQjtRQUNsRCxNQUFNLEdBQUcsR0FBRzs7MkJBRU8sT0FBTyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQVcsRUFBRSxFQUFFLENBQUMsSUFBSSxHQUFHLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUM7U0FDcEUsQ0FBQztRQUlGLElBQUk7WUFDQSxNQUFNLDJCQUFpQixDQUFDLGFBQWEsRUFBRTtpQkFDbEMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1lBQ2hCLE9BQU8sSUFBSSxDQUFDO1NBQ2Y7UUFBQyxPQUFPLENBQUMsRUFBRTtZQUNSLE9BQU8sQ0FBQyxLQUFLLENBQUMsaUNBQWlDLENBQUMsQ0FBQyxLQUFLLEVBQUUsQ0FBQyxDQUFDO1lBQzFELE9BQU8sS0FBSyxDQUFDO1NBQ2hCO0lBQ0wsQ0FBQztDQUNKO0FBRUQsa0JBQWUsSUFBSSxhQUFhLEVBQUUsQ0FBQyJ9