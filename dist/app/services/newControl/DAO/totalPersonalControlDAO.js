"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TotalPersonalControlDAO = void 0;
const utils_1 = require("../../../utils");
const TotalPersonalControl_entity_1 = require("../../../common/dao/mysql/entity/TotalPersonalControl.entity");
const redisConnection_1 = require("../../../common/dao/redis/lib/redisConnection");
const connectionManager_1 = require("../../../common/dao/mysql/lib/connectionManager");
class TotalPersonalControlDAO {
    constructor() {
        this.sortSetKey = 'control:personal_total_control:online_player';
        this.hashKey = 'control:total_personal_control:hash_player';
        this.model = null;
        this.model = connectionManager_1.default.getConnection().getRepository(TotalPersonalControl_entity_1.TotalPersonalControl);
    }
    static getPersonalTotalControlDAO() {
        if (TotalPersonalControlDAO.instance === null) {
            TotalPersonalControlDAO.instance = new TotalPersonalControlDAO();
        }
        return TotalPersonalControlDAO.instance;
    }
    async create(params) {
        const totalControl = this.model.create(params);
        await this.model.save(totalControl);
        return true;
    }
    async update(params) {
        const uid = params.uid;
        const cloneParams = (0, utils_1.clone)(params);
        Reflect.deleteProperty(cloneParams, 'uid');
        await this.model.update({ uid }, cloneParams);
        return true;
    }
    async findOne(params) {
        return this.model.findOne({ uid: params.uid });
    }
    async deleteOne(uid) {
        await this.model.delete({ uid });
    }
    async removeAll() {
        await this.model.clear();
        const conn = await (0, redisConnection_1.default)();
        await conn.del(this.hashKey);
    }
    async find(params) {
        const conn = await (0, redisConnection_1.default)();
        let result = JSON.parse(await conn.hget(this.hashKey, params.uid));
        if (result) {
            return result;
        }
        result = await this.findOne(params);
        if (result) {
            await this.setDataIntoTheCache({ uid: params.uid, data: result });
        }
        return result;
    }
    async addTotalControlPlayer(params) {
        await this.findOne({ uid: params.uid }) ?
            await this.update(params) :
            await this.create(params);
        await this.deleteDataIntoTheCache(params.uid);
    }
    async deleteControlPlayer(uid) {
        await this.deleteOne(uid);
        await this.deleteDataIntoTheCache(uid);
    }
    async getControlPlayersUid() {
        const controlPlayers = await this.model.find({});
        return controlPlayers.map(res => res.uid);
    }
    async getControlPlayers() {
        const controlPlayers = await this.model.find({});
        return controlPlayers.map(res => {
            return { uid: res.uid, probability: res.probability };
        });
    }
    async getControlPlayersRange(where, start, stop) {
        return this.model.createQueryBuilder('p').skip(start).limit(stop - start).getMany();
    }
    async getControlPlayersCount(where) {
        return this.model.createQueryBuilder('p').getCount();
    }
    async setDataIntoTheCache(params) {
        const conn = await (0, redisConnection_1.default)();
        await conn.hset(this.hashKey, params.uid, JSON.stringify(params.data));
    }
    async deleteDataIntoTheCache(uid) {
        const conn = await (0, redisConnection_1.default)();
        await conn.hdel(this.hashKey, uid);
    }
    async addOnlinePlayer(uid) {
        const conn = await (0, redisConnection_1.default)();
        await conn.zadd(this.sortSetKey, uid, uid);
    }
    async deleteOnlineControlPlayer(uid) {
        const conn = await (0, redisConnection_1.default)();
        await conn.zrem(this.sortSetKey, uid);
    }
    async getOnlineControlPlayers(start, stop) {
        if (typeof start !== 'number' || typeof stop !== 'number') {
            throw new Error(`getOnlineControlPlayers 参数错误 args:${arguments}`);
        }
        const conn = await (0, redisConnection_1.default)();
        return await conn.zrange(this.sortSetKey, start, stop);
    }
    async getOnlinePlayersLength() {
        const conn = await (0, redisConnection_1.default)();
        return await conn.zcard(this.sortSetKey);
    }
    async clearOnlineControlPlayersSet() {
        console.warn(`--------------------  清空调控玩家  --------------------`);
        const conn = await (0, redisConnection_1.default)();
        await conn.zremrangebyrank(this.sortSetKey, 0, -1);
    }
}
exports.TotalPersonalControlDAO = TotalPersonalControlDAO;
TotalPersonalControlDAO.instance = null;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidG90YWxQZXJzb25hbENvbnRyb2xEQU8uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9hcHAvc2VydmljZXMvbmV3Q29udHJvbC9EQU8vdG90YWxQZXJzb25hbENvbnRyb2xEQU8udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQ0EsMENBQXFDO0FBRXJDLDhHQUFrRztBQUNsRyxtRkFBeUU7QUFDekUsdUZBQWdGO0FBUWhGLE1BQWEsdUJBQXVCO0lBT2hDO1FBSlEsZUFBVSxHQUFXLDhDQUE4QyxDQUFDO1FBQ3BFLFlBQU8sR0FBVyw0Q0FBNEMsQ0FBQztRQUN2RSxVQUFLLEdBQXFDLElBQUksQ0FBQztRQUczQyxJQUFJLENBQUMsS0FBSyxHQUFHLDJCQUFpQixDQUFDLGFBQWEsRUFBRSxDQUFDLGFBQWEsQ0FBQyxrREFBb0IsQ0FBQyxDQUFDO0lBQ3ZGLENBQUM7SUFNRCxNQUFNLENBQUMsMEJBQTBCO1FBQzdCLElBQUksdUJBQXVCLENBQUMsUUFBUSxLQUFLLElBQUksRUFBRTtZQUMzQyx1QkFBdUIsQ0FBQyxRQUFRLEdBQUcsSUFBSSx1QkFBdUIsRUFBRSxDQUFDO1NBQ3BFO1FBRUQsT0FBTyx1QkFBdUIsQ0FBQyxRQUFRLENBQUM7SUFDNUMsQ0FBQztJQUVELEtBQUssQ0FBQyxNQUFNLENBQUMsTUFBNkI7UUFDdEMsTUFBTSxZQUFZLEdBQUksSUFBSSxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUM7UUFDaEQsTUFBTSxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQztRQUNwQyxPQUFPLElBQUksQ0FBQztJQUNoQixDQUFDO0lBRUQsS0FBSyxDQUFDLE1BQU0sQ0FBQyxNQUE2QjtRQUN0QyxNQUFNLEdBQUcsR0FBRyxNQUFNLENBQUMsR0FBRyxDQUFDO1FBRXZCLE1BQU0sV0FBVyxHQUFHLElBQUEsYUFBSyxFQUFDLE1BQU0sQ0FBQyxDQUFDO1FBQ2xD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