import { Scene } from "../mysql/entity/Scene.entity";
import { SceneInRedis } from "../redis/entity/Scene.entity";
import SceneMysqlDao from "../mysql/Scene.mysql.dao";
import SceneRedisDao from "../redis/Scene.redis.dao";
import ConnectionManager from "../mysql/lib/connectionManager";

type Parameter<T> = { [P in keyof T]?: T[P] };

export class SceneManager {
    async findList(parameter: Parameter<Scene>, onlyMysql: boolean = false): Promise<Scene[] | SceneInRedis[]> {
        try {
            if(!parameter.nid){
                return [];
            }
            if (!onlyMysql) {
                const list = await SceneRedisDao.findList(parameter);
                if (list.length != 0) {
                    return list;
                }
            }
            const listOnMysql = await SceneMysqlDao.findList(parameter);
            const listInRedis = await SceneRedisDao.findList(parameter);
            if (listOnMysql.length != listInRedis.length) {
                if (listOnMysql.length > 0) {
                    for (let i = 0; i < listOnMysql.length; i++) {
                        const sceneInfo = listOnMysql[i];
                        await SceneRedisDao.insertOne(new SceneInRedis(sceneInfo))
                    }
                }
            }
            return listOnMysql;
        } catch (e) {
            return [];
        }
    }

    async findOne(parameter: Parameter<Scene>, onlyMysql: boolean = false): Promise<Scene | SceneInRedis> {
        try {
            // Step 1: 是否只读 Mysql 数据库;
            if (!onlyMysql) {
                const scene = await SceneRedisDao.findOne(parameter);

                if (scene) {
                    return scene;
                }

                const sceneOnMysql = await SceneMysqlDao.findOne(parameter);
                /** Mysql 有数据则更新进redis，无则返回 */
                if (sceneOnMysql) {

                    const sec = await SceneRedisDao.insertOne(new SceneInRedis(sceneOnMysql));
                }

                return sceneOnMysql;
            }

            const scene = await SceneMysqlDao.findOne(parameter);

            return scene;
        } catch (e) {
            return null;
        }
    }

    async insertOne(parameter: Parameter<Scene>): Promise<any> {
        try {
            const sec = await SceneRedisDao.insertOne(new SceneInRedis(parameter));
            return await SceneMysqlDao.insertOne(parameter);
        } catch (e) {
            console.error(`插入场信息出错:${e.stack}`);
            return null;
        }
    }

    async updateOne(parameter: Parameter<Scene>, partialEntity: Parameter<Scene>): Promise<any> {
        try {
            const { affected } = await ConnectionManager.getConnection()
                .getRepository(Scene)
                .update(parameter, partialEntity);
            const isSuccess = !!affected;

            if (isSuccess) {
                await SceneRedisDao.updateOne(parameter, new SceneInRedis(partialEntity));
            }

            return isSuccess;
        } catch (e) {
            return false;
        }
    }

    async delete(parameter: { nid: string; sceneId: number }): Promise<any> {
        try {
            await SceneMysqlDao.delete(parameter);
            await SceneRedisDao.delete(parameter);
            return true;
        } catch (e) {
            return false;
        }
    }



    /**
     * 获取所有场的数据
     * @param uid
     * @param nid
     * @param page
     * @param limit
     * @param startTime
     * @param endTime
     */
    async getAllSceneData(): Promise<any> {
        try {
            const list = await ConnectionManager.getConnection(true)
                .getRepository(Scene)
                .createQueryBuilder("Scene")
                .select(["Scene.nid", "Scene.sceneId"])
                .getMany();
            return list;
        } catch (e) {
            return false;
        }
    }

}

export default new SceneManager();
