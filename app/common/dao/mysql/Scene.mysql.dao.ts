
import { AbstractDao } from "../ADao.abstract";
import { Scene } from "./entity/Scene.entity";
import ConnectionManager from "../mysql/lib/connectionManager";

export class SceneMysqlDao extends AbstractDao<Scene> {
    async findList(parameter: { id?: number; nid?: string; ante?: number; sceneId?: number; name?: string; entryCond?: number; lowBet?: number; capBet?: number; allinMaxNum?: number; room_count?: number; canCarryGold?: any; blindBet?: any;bullet_value?:number }): Promise<Scene[]> {
        try {
            const list = await ConnectionManager.getConnection()
                .getRepository(Scene)
                .find(parameter);

            return list;
        } catch (e) {
            return [];
        }
    }

    async findOne(parameter: { id?: number; nid?: string; sceneId?: number; ante?: number; name?: string; entryCond?: number; lowBet?: number; capBet?: number; allinMaxNum?: number; room_count?: number; canCarryGold?: any; blindBet?: any;bullet_value?:number }): Promise<Scene> {
        try {
            const scene = await ConnectionManager.getConnection()
                .getRepository(Scene)
                .findOne(parameter);

            return scene;
        } catch (e) {
            return null;
        }
    }

    async insertOne(parameter: { id?: number; nid?: string; sceneId?: number; ante?: number; name?: string; entryCond?: number; lowBet?: number; capBet?: number; allinMaxNum?: number; room_count?: number; canCarryGold?: any; blindBet?: any;bullet_value?:number }): Promise<any> {
        try {
            const SceneRepository = ConnectionManager.getConnection()
                .getRepository(Scene);

            const p = SceneRepository.create(parameter);

            return await SceneRepository.save(p);
        } catch (e) {
            console.error(`插入场信息出错:${e.stack}`);
            return null;
        }
    }

    async updateOne(parameter: { id?: number; nid?: string; sceneId?: number; ante?: number; name?: string; entryCond?: number; lowBet?: number; capBet?: number; allinMaxNum?: number; room_count?: number; canCarryGold?: any; blindBet?: any;bullet_value?:number }, partialEntity: { id?: number; nid?: string; ante?: number; sceneId?: number; name?: string; entryCond?: number; lowBet?: number; capBet?: number; allinMaxNum?: number; room_count?: number; canCarryGold?: any; blindBet?: any;bullet_value?:number }): Promise<any> {
        try {
            const { affected } = await ConnectionManager.getConnection()
                .getRepository(Scene)
                .update(parameter, partialEntity);
            return !!affected;
        } catch (e) {
            return false;
        }
    }

    async delete(parameter: { id?: number; nid?: string; sceneId?: number; name?: string; entryCond?: number; lowBet?: number; capBet?: number; allinMaxNum?: number; room_count?: number; canCarryGold?: any; blindBet?: any;bullet_value?:number }): Promise<any> {
        try {
            const { affected } = await ConnectionManager.getConnection()
                .getRepository(Scene)
                .delete(parameter);
            return !!affected;
        } catch (e) {
            return false;
        }
    }

}

export default new SceneMysqlDao();
