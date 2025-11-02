import { Repository } from "typeorm";
import {PersonalControlInfo} from "..";
import {PersonalControl} from "../../../common/dao/mysql/entity/PersonalControl.entity";
import redisConnect from "../../../common/dao/redis/lib/redisConnection";
import ConnectionManager from "../../../common/dao/mysql/lib/connectionManager";


/**
 * 个人调控静态类
 */
export default class PersonalControlDAO {
    static instance: PersonalControlDAO = null;

    /**
     * 获取个人调控DAO实例 懒汉式
     * 主要原因是node.js 是单线程 不用担心线程安全 且 以防每个进程加载的时候都实例化一个
     */
    static getPersonalControlDAO(): PersonalControlDAO {
        if (PersonalControlDAO.instance === null) {
            PersonalControlDAO.instance = new PersonalControlDAO();
        }

        return PersonalControlDAO.instance;
    }

    init() {
        if (!this.model) {
            this.model = ConnectionManager.getConnection().getRepository(PersonalControl);
        }
    }


    // model: Model<Document> = mongoManager.personal_control;
    model: Repository<PersonalControl> = null;
    cacheKeyPrefix: string = 'control:personal_control:';

    async create(params: PersonalControlInfo): Promise<boolean> {
        this.init();
        // params.createTime = Date.now();

        const p = this.model.create(params);
        await this.model.save(p);

        return true;
    }

    /**
     * 初始化单个游戏的个控
     * @param nid
     */
    async initCache(nid: string) {
        const conn = await redisConnect();
        return await conn.del(this.getCacheKey(nid));
    }

    /**
     * 更新一个
     * @param where
     * @param fields
     */
    async updateOne(where: any, fields: object): Promise<boolean> {
        this.init();
        // Object.assign(fields, { updateTime: Date.now() });
        await this.model.update(where, fields);

        return true;
    }

    /**
     * 查找
     * @param params
     */
    async findOne(params: { nid: string, sceneId: number}): Promise<PersonalControlInfo> {
        this.init();
        let data = await this.findToCache(params);

        if (data) return data;

        // 查数据库
        data = await this.model.findOne(params);

        // 放到缓存
        if (data) {
            await this.saveToCache(data);
        }

        return data;
    }


    /**
     * 把单个调控保存到cache
     */
    async saveToCache(params: PersonalControlInfo) {
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

    /**
     * 获取cache Key
     * @param nid
     */
    private getCacheKey(nid): string{
        return `${this.cacheKeyPrefix}${nid}`;
    }
}