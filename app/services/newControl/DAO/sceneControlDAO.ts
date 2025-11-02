import {SceneControlInfo} from '../interfaces/simple';
import {getConnection, Repository} from "typeorm";
import {SceneControl} from "../../../common/dao/mysql/entity/SceneControl.entity";
import redisConnect from "../../../common/dao/redis/lib/redisConnection";
import ConnectionManager from "../../../common/dao/mysql/lib/connectionManager";


/**
 * 场控DAO单例
 * model mongo数据表
 */
export default class SceneControlInfoDAO {
    static instance: SceneControlInfoDAO = null;

    /**
     * 获取场控DAO实例  懒汉式
     * 主要原因是node.js 是单线程 不用担心线程安全 且 以防每个进程加载的时候都实例化一个
     */
    static getInstance(): SceneControlInfoDAO {
        if (SceneControlInfoDAO.instance === null) {
            SceneControlInfoDAO.instance = new SceneControlInfoDAO();
        }

        return SceneControlInfoDAO.instance;
    }

    init() {
        if (!this.model) {
            this.model = ConnectionManager.getConnection().getRepository(SceneControl);
        }
    }

    // model: Model<Document> = mongoManager.scene_control;
    model: Repository<SceneControl> = null;
    cacheKeyPrefix: string = 'control:scene_control:';

    /**
     * 创建一个
     * @param params
     */
    async create(params: SceneControlInfo): Promise<boolean> {
        this.init();
        const sceneControl = this.model.create(params);
        await this.model.save(sceneControl);
        return true;
    }

    /**
     * 初始化cache
     * @param nid
     */
    async initCache(nid: string) {
        const conn = await redisConnect();
        return await conn.del(this.getCacheKey(nid));
    }

    /**
     * 根据条件更新一个
     * @param where
     * @param fields
     */
    async updateOne(where: any, fields: object): Promise<boolean> {
        this.init();
        // Object.assign(fields, { updateTime: Date.now() });
        await this.model.update(where, fields);
        return true;
    }

    async findOne(params: { nid: string, sceneId: number, }): Promise<SceneControlInfo> {
        this.init();
        let data = await this.findToCache(params);

        if (data) return data;

        // 查数据库
        data = await this.model.findOne(params) ;

        // 放到缓存
        if (data) {
            await this.saveToCache(data);
        }

        return data;
    }

    /**
     * 把单个调控保存到cache
     */
    async saveToCache(params: SceneControlInfo) {
        const conn = await redisConnect();
        await conn.hset(this.getCacheKey(params.nid), params.sceneId.toString(), JSON.stringify(params));
    }

    /**
     * 删除cache
     * @param nid
     * @param sceneId
     */
    async removeOutOfCache({nid, sceneId}: {nid: string, sceneId: number}) {
        const conn = await redisConnect();
        await conn.hdel(this.getCacheKey(nid), sceneId.toString());
    }

    /**
     * 从缓存中找一个
     * @param nid
     * @param sceneId
     */
    async findToCache({nid, sceneId}: {nid: string, sceneId: number}): Promise<any> {
        const conn = await redisConnect();
        return JSON.parse(await conn.hget(this.getCacheKey(nid), sceneId.toString()));
    }

    async findDB(where: any, fields: string = '-_id -updateTime -createTime') {
        this.init();
        return this.model.find(where);
    }

    /**
     * 获取cache Key
     * @param nid
     */
    private getCacheKey(nid): string{
        return `${this.cacheKeyPrefix}${nid}`;
    }
}