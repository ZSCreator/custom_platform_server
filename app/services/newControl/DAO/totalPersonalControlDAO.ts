import {PersonalControlPlayer} from "..";
import {clone} from "../../../utils";
import {Repository} from "typeorm";
import {TotalPersonalControl} from "../../../common/dao/mysql/entity/TotalPersonalControl.entity";
import redisConnect from "../../../common/dao/redis/lib/redisConnection";
import ConnectionManager from "../../../common/dao/mysql/lib/connectionManager";

/**
 * 个人总控单例
 * @property sortSetKey 在线玩家总控集合
 * @property hashKey 总控玩家hash key
 * @property model mongo 数据表model
 */
export class TotalPersonalControlDAO{
    static instance: TotalPersonalControlDAO = null;

    private sortSetKey: string = 'control:personal_total_control:online_player';
    private hashKey: string = 'control:total_personal_control:hash_player';
    model: Repository<TotalPersonalControl> = null;

    constructor() {
        this.model = ConnectionManager.getConnection().getRepository(TotalPersonalControl);
    }

    /**
     * 获取个人调控DAO实例 懒汉式
     * 主要原因是node.js 是单线程 不用担心线程安全 且 以防每个进程加载的时候都实例化一个
     */
    static getPersonalTotalControlDAO(): TotalPersonalControlDAO {
        if (TotalPersonalControlDAO.instance === null) {
            TotalPersonalControlDAO.instance = new TotalPersonalControlDAO();
        }

        return TotalPersonalControlDAO.instance;
    }

    async create(params: PersonalControlPlayer): Promise<boolean> {
        const totalControl =  this.model.create(params);
        await this.model.save(totalControl);
        return true;
    }

    async update(params: PersonalControlPlayer): Promise<boolean> {
        const uid = params.uid;

        const cloneParams = clone(params);
        Reflect.deleteProperty(cloneParams, 'uid');

        await this.model.update({ uid }, cloneParams);
        return true;
    }

    async findOne(params: { uid: string, fields?: string }): Promise<any> {
        return this.model.findOne({ uid: params.uid });
    }

    /**
     * 删除一个玩家
     * @param uid
     */
    public async deleteOne(uid: string): Promise<void> {
        await this.model.delete({uid});
    }

    /**
     * 删除所有的数据
     */
    public async removeAll() {
        await this.model.clear();
        const conn = await redisConnect();
        await conn.del(this.hashKey);
    }

    /**
     * 查找一个调控玩家
     * @param params
     */
    async find(params: { uid: string }): Promise<PersonalControlPlayer> {
        // 先查redis
        const conn = await redisConnect();
        let result: PersonalControlPlayer = JSON.parse(await conn.hget(this.hashKey, params.uid)) as PersonalControlPlayer ;

        // 如果找到了则直接返回
        if (result) {
            return result;
        }

        // 否则直接查找数据库
        result = await this.findOne(params);

        // 如果数据库有则放到cache后返会
        if (result) {
            // 放入缓存
            await this.setDataIntoTheCache({ uid: params.uid, data: result });
        }

        return result;
    }

    /**
     * 添加调控玩家
     * @param params
     */
    public async addTotalControlPlayer(params: PersonalControlPlayer): Promise<void> {
        /**
         * 双写一致性 策略变化
         * 以前更新策略在单线程中没有问题，如果存在多线程或者多进程写入 还是会存在脏数据
         * 1. 先更新数据库
         * 2. 再删缓存
         * 这一方案还是有两个问题：
         *  1.如果该缓存会过期，就会出现一下情况，假入一个进程A在读数据，B在写数据：
         *      1. 缓存刚好过期
         *      2. A未在缓存中读到数据，从数据库中拿到旧数据
         *      3. B 朝数据库更新数据
         *      4. B 删除缓存
         *      5. A 把新读到的数据放入缓存
         *  低概率事件，情况一就导致了里面的还是脏数据，解决办法：每次透过缓存访问数据库时对key启动一个watch事务，如果这放入之前key已经改变，放弃放入
         *  2. 删除 cache失败
         *  解决办法，对key设置过期时间，重试机制
         *  别人我为什么这些东西都没有，不想写
         */


        // 写入数据库 如果有则是更新 无则是写入
        await this.findOne({ uid: params.uid }) ?
            await this.update(params) :
            await this.create(params);

        // 然后先删除缓存
        await this.deleteDataIntoTheCache(params.uid);
    }


    /**
     * 删除调控玩家
     * @param uid 玩家key
     */
    public async deleteControlPlayer(uid: string): Promise<void> {
        // 再删数据库
        await this.deleteOne(uid);
        // 先删缓存
        await this.deleteDataIntoTheCache(uid);
    }

    /**
     * 获取所有调控玩家的uid
     */
    public async getControlPlayersUid(): Promise<string[]> {
        const controlPlayers: any[] = await this.model.find({});
        return controlPlayers.map(res => res.uid);
    }

    /**
     * 获取所有调控玩家的uid和调控值
     */
    public async getControlPlayers(): Promise<any[]> {
        const controlPlayers: any[] = await this.model.find({});
        return controlPlayers.map(res => {
            return { uid : res.uid ,probability : res.probability }
        });
    }

    /**
     * 获取特定条件区间
     * @param where
     * @param start 分页
     * @param stop 停止标
     */
    public async getControlPlayersRange( where: object, start: number, stop: number): Promise<any[]> {
        return this.model.createQueryBuilder('p').skip(start).limit(stop - start).getMany();
    }

    /**
     * 获取长度
     * @param where 查询条件
     */
    public async getControlPlayersCount(where: object ): Promise<number> {
        return this.model.createQueryBuilder('p').getCount();
    }

    /**
     * 把调控玩家数据放入
     * @param params
     */
    private async setDataIntoTheCache(params: { uid: string, data: PersonalControlPlayer }): Promise<void> {
        const conn = await redisConnect();
        await conn.hset(this.hashKey, params.uid, JSON.stringify(params.data));
    }

    /**
     * 删除调控玩家
     * @param uid
     */
    private async deleteDataIntoTheCache(uid: string) {
        const conn = await redisConnect();
        await conn.hdel(this.hashKey, uid)
    }

    /**
     * 把在线调控玩家添加到有序集合
     * @param uid
     */
    async addOnlinePlayer(uid: string): Promise<void> {
        const conn = await redisConnect();
        await conn.zadd(this.sortSetKey, uid, uid);
    }

    /**
     * 把调控玩家从在线集合中删除
     * @param uid
     */
    async deleteOnlineControlPlayer(uid: string): Promise<void> {
        const conn = await redisConnect();
        await conn.zrem(this.sortSetKey, uid);
    }

    /**
     * 获取在线调控玩家
     * @param start 起始下标
     * @param stop 结束下标
     */
    async getOnlineControlPlayers(start: number, stop: number): Promise<string[]> {
        if (typeof start !== 'number' || typeof stop !== 'number') {
            throw new Error(`getOnlineControlPlayers 参数错误 args:${arguments}`);
        }

        const conn = await redisConnect();
        return await conn.zrange(this.sortSetKey, start, stop);

    }

    /**
     * 获取集合长度
     */
    public async getOnlinePlayersLength(): Promise<number> {
        const conn = await redisConnect();
        return await conn.zcard(this.sortSetKey);
    }

    /**
     * 清空在线调控玩家集合
     */
    public async clearOnlineControlPlayersSet(): Promise<void> {
        console.warn(`--------------------  清空调控玩家  --------------------`);
        const conn = await redisConnect();
        await conn.zremrangebyrank(this.sortSetKey, 0, -1);
    }
}