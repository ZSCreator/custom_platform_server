"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SceneMysqlDao = void 0;
const ADao_abstract_1 = require("../ADao.abstract");
const Scene_entity_1 = require("./entity/Scene.entity");
const connectionManager_1 = require("../mysql/lib/connectionManager");
class SceneMysqlDao extends ADao_abstract_1.AbstractDao {
    async findList(parameter) {
        try {
            const list = await connectionManager_1.default.getConnection()
                .getRepository(Scene_entity_1.Scene)
                .find(parameter);
            return list;
        }
        catch (e) {
            return [];
        }
    }
    async findOne(parameter) {
        try {
            const scene = await connectionManager_1.default.getConnection()
                .getRepository(Scene_entity_1.Scene)
                .findOne(parameter);
            return scene;
        }
        catch (e) {
            return null;
        }
    }
    async insertOne(parameter) {
        try {
            const SceneRepository = connectionManager_1.default.getConnection()
                .getRepository(Scene_entity_1.Scene);
            const p = SceneRepository.create(parameter);
            return await SceneRepository.save(p);
        }
        catch (e) {
            console.error(`插入场信息出错:${e.stack}`);
            return null;
        }
    }
    async updateOne(parameter, partialEntity) {
        try {
            const { affected } = await connectionManager_1.default.getConnection()
                .getRepository(Scene_entity_1.Scene)
                .update(parameter, partialEntity);
            return !!affected;
        }
        catch (e) {
            return false;
        }
    }
    async delete(parameter) {
        try {
            const { affected } = await connectionManager_1.default.getConnection()
                .getRepository(Scene_entity_1.Scene)
                .delete(parameter);
            return !!affected;
        }
        catch (e) {
            return false;
        }
    }
}
exports.SceneMysqlDao = SceneMysqlDao;
exports.default = new SceneMysqlDao();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiU2NlbmUubXlzcWwuZGFvLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vYXBwL2NvbW1vbi9kYW8vbXlzcWwvU2NlbmUubXlzcWwuZGFvLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUNBLG9EQUErQztBQUMvQyx3REFBOEM7QUFDOUMsc0VBQStEO0FBRS9ELE1BQWEsYUFBYyxTQUFRLDJCQUFrQjtJQUNqRCxLQUFLLENBQUMsUUFBUSxDQUFDLFNBQWtQO1FBQzdQLElBQUk7WUFDQSxNQUFNLElBQUksR0FBRyxNQUFNLDJCQUFpQixDQUFDLGFBQWEsRUFBRTtpQkFDL0MsYUFBYSxDQUFDLG9CQUFLLENBQUM7aUJBQ3BCLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQztZQUVyQixPQUFPLElBQUksQ0FBQztTQUNmO1FBQUMsT0FBTyxDQUFDLEVBQUU7WUFDUixPQUFPLEVBQUUsQ0FBQztTQUNiO0lBQ0wsQ0FBQztJQUVELEtBQUssQ0FBQyxPQUFPLENBQUMsU0FBa1A7UUFDNVAsSUFBSTtZQUNBLE1BQU0sS0FBSyxHQUFHLE1BQU0sMkJBQWlCLENBQUMsYUFBYSxFQUFFO2lCQUNoRCxhQUFhLENBQUMsb0JBQUssQ0FBQztpQkFDcEIsT0FBTyxDQUFDLFNBQVMsQ0FBQyxDQUFDO1lBRXhCLE9BQU8sS0FBSyxDQUFDO1NBQ2hCO1FBQUMsT0FBTyxDQUFDLEVBQUU7WUFDUixPQUFPLElBQUksQ0FBQztTQUNmO0lBQ0wsQ0FBQztJQUVELEtBQUssQ0FBQyxTQUFTLENBQUMsU0FBa1A7UUFDOVAsSUFBSTtZQUNBLE1BQU0sZUFBZSxHQUFHLDJCQUFpQixDQUFDLGFBQWEsRUFBRTtpQkFDcEQsYUFBYSxDQUFDLG9CQUFLLENBQUMsQ0FBQztZQUUxQixNQUFNLENBQUMsR0FBRyxlQUFlLENBQUMsTUFBTSxDQUFDLFNBQVMsQ0FBQyxDQUFDO1lBRTVDLE9BQU8sTUFBTSxlQUFlLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO1NBQ3hDO1FBQUMsT0FBTyxDQUFDLEVBQUU7WUFDUixPQUFPLENBQUMsS0FBSyxDQUFDLFdBQVcsQ0FBQyxDQUFDLEtBQUssRUFBRSxDQUFDLENBQUM7WUFDcEMsT0FBTyxJQUFJLENBQUM7U0FDZjtJQUNMLENBQUM7SUFFRCxLQUFLLENBQUMsU0FBUyxDQUFDLFNBQWtQLEVBQUUsYUFBc1A7UUFDdGYsSUFBSTtZQUNBLE1BQU0sRUFBRSxRQUFRLEVBQUUsR0FBRyxNQUFNLDJCQUFpQixDQUFDLGFBQWEsRUFBRTtpQkFDdkQsYUFBYSxDQUFDLG9CQUFLLENBQUM7aUJBQ3BCLE1BQU0sQ0FBQyxTQUFTLEVBQUUsYUFBYSxDQUFDLENBQUM7WUFDdEMsT0FBTyxDQUFDLENBQUMsUUFBUSxDQUFDO1NBQ3JCO1FBQUMsT0FBTyxDQUFDLEVBQUU7WUFDUixPQUFPLEtBQUssQ0FBQztTQUNoQjtJQUNMLENBQUM7SUFFRCxLQUFLLENBQUMsTUFBTSxDQUFDLFNBQW1PO1FBQzVPLElBQUk7WUFDQSxNQUFNLEVBQUUsUUFBUSxFQUFFLEdBQUcsTUFBTSwyQkFBaUIsQ0FBQyxhQUFhLEVBQUU7aUJBQ3ZELGFBQWEsQ0FBQyxvQkFBSyxDQUFDO2lCQUNwQixNQUFNLENBQUMsU0FBUyxDQUFDLENBQUM7WUFDdkIsT0FBTyxDQUFDLENBQUMsUUFBUSxDQUFDO1NBQ3JCO1FBQUMsT0FBTyxDQUFDLEVBQUU7WUFDUixPQUFPLEtBQUssQ0FBQztTQUNoQjtJQUNMLENBQUM7Q0FFSjtBQTdERCxzQ0E2REM7QUFFRCxrQkFBZSxJQUFJLGFBQWEsRUFBRSxDQUFDIn0=