import { WinLimitConfig } from "../interface/commonInterface";
import {GameNidEnum} from "../../../common/constant/game/GameNidEnum";
import {getConnection, Repository} from "typeorm";
import {SlotsWinLimit} from "../../../common/dao/mysql/entity/SlotsWinLimit.entity";
import redisConnect from "../../../common/dao/redis/lib/redisConnection";
import ConnectionManager from "../../../common/dao/mysql/lib/connectionManager";



/**
 * 总体调控DAO单例
 */
export default class SlotWinLimitDAO {
    static instance: SlotWinLimitDAO = null;
    // model: Model<Document> = mongoManager.slot_win_limit;
    model: Repository<SlotsWinLimit> = null;
    CacheKey: string = 'control:gameWinLimitConfig';

    /**
     * 获取赢钱限制配置实例 懒汉式
     * 主要原因是node.js 是单线程 不用担心线程安全 且 以防每个进程加载的时候都实例化一个
     */
    static getInstance(): SlotWinLimitDAO {
        if (SlotWinLimitDAO.instance === null) {
            SlotWinLimitDAO.instance = new SlotWinLimitDAO();
        }

        return SlotWinLimitDAO.instance;
    }

    init() {
        if (!this.model) {
            this.model = ConnectionManager.getConnection().getRepository(SlotsWinLimit);
        }
    }

    public async create(params: {nid: GameNidEnum, winLimitConfig: WinLimitConfig[]}): Promise<boolean> {
        this.init();
        const config = this.model.create(params);
        await this.model.save(config);
        return true;
    }

    /**
     * 更新一个配置
     * @param where
     * @param fields
     */
    public async updateOneConfig(where: object, fields: object) {
        this.init();
        // Object.assign(fields, {updateTime: Date.now()});

        // 先更新数据库
        await this.model.update(where, fields);
    }

    /**
     * 更新
     * @param params
     */
    public async update(params: { nid: string, updateFields: WinLimitConfig[] }): Promise<boolean> {
        this.init();
        Object.assign(params.updateFields, { updateTime: Date.now() });
        // 先更新数据库
        await this.model.update({ nid: params.nid }, { winLimitConfig: params.updateFields });
        // 再删除缓存
        await this.deleteCache(params.nid);
        return true;
    }

    /**
     * 找一个配置 只能根据 nid 查找
     * @param nid
     */
    public async findOneConfig(nid: string): Promise<WinLimitConfig[]> {
        this.init();

        const conn = await redisConnect();

        // 先查redis
        let winLimitConfig: WinLimitConfig[] = JSON.parse(await conn.hget(this.CacheKey, nid));

        // 如果找到了则直接返回
        if (winLimitConfig) {
            return winLimitConfig;
        }

        // 否则直接查找数据库
        const dbResult: any = await this.model.findOne({nid});

        // 如果数据库有则放到cache后返会
        if (dbResult) {
            // 缓存
            await this.setDataIntoTheCache(nid, dbResult.winLimitConfig);
            return dbResult.winLimitConfig;
        }

        return;
    }


    /**
     * 把配置放入缓存
     * @param nid
     * @param data
     */
    private async setDataIntoTheCache(nid: string, data: WinLimitConfig[]): Promise<void> {
        const conn = await redisConnect();

        await conn.hset(this.CacheKey, nid, JSON.stringify(data));
    }

    /**
     * 删除缓存
     * @param nid
     */
    async deleteCache(nid: string): Promise<void> {
        const conn = await redisConnect();
        conn.hdel(this.CacheKey, nid);
    }
}