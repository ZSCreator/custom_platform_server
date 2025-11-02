"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const PersonalControl_entity_1 = require("../../../common/dao/mysql/entity/PersonalControl.entity");
const redisConnection_1 = require("../../../common/dao/redis/lib/redisConnection");
const connectionManager_1 = require("../../../common/dao/mysql/lib/connectionManager");
class PersonalControlDAO {
    constructor() {
        this.model = null;
        this.cacheKeyPrefix = 'control:personal_control:';
    }
    static getPersonalControlDAO() {
        if (PersonalControlDAO.instance === null) {
            PersonalControlDAO.instance = new PersonalControlDAO();
        }
        return PersonalControlDAO.instance;
    }
    init() {
        if (!this.model) {
            this.model = connectionManager_1.default.getConnection().getRepository(PersonalControl_entity_1.PersonalControl);
        }
    }
    async create(params) {
        this.init();
        const p = this.model.create(params);
        await this.model.save(p);
        return true;
    }
    async initCache(nid) {
        const conn = await (0, redisConnection_1.default)();
        return await conn.del(this.getCacheKey(nid));
    }
    async updateOne(where, fields) {
        this.init();
        await this.model.update(where, fields);
        return true;
    }
    async findOne(params) {
        this.init();
        let data = await this.findToCache(params);
        if (data)
            return data;
        data = await this.model.findOne(params);
        if (data) {
            await this.saveToCache(data);
        }
        return data;
    }
    async saveToCache(params) {
        const conn = await (0, redisConnection_1.default)();
        await conn.hset(this.getCacheKey(params.nid), params.sceneId.toString(), JSON.stringify(params));
    }
    async removeOutOfCache({ nid, sceneId }) {
        const conn = await (0, redisConnection_1.default)();
        await conn.hdel(this.getCacheKey(nid), sceneId.toString());
    }
    async findToCache({ nid, sceneId }) {
        const conn = await (0, redisConnection_1.default)();
        return JSON.parse(await conn.hget(this.getCacheKey(nid), sceneId.toString()));
    }
    getCacheKey(nid) {
        return `${this.cacheKeyPrefix}${nid}`;
    }
}
exports.default = PersonalControlDAO;
PersonalControlDAO.instance = null;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGVyc29uYWxDb250cm9sREFPLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vYXBwL3NlcnZpY2VzL25ld0NvbnRyb2wvREFPL3BlcnNvbmFsQ29udHJvbERBTy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUVBLG9HQUF3RjtBQUN4RixtRkFBeUU7QUFDekUsdUZBQWdGO0FBTWhGLE1BQXFCLGtCQUFrQjtJQUF2QztRQXVCSSxVQUFLLEdBQWdDLElBQUksQ0FBQztRQUMxQyxtQkFBYyxHQUFXLDJCQUEyQixDQUFDO0lBMkZ6RCxDQUFDO0lBNUdHLE1BQU0sQ0FBQyxxQkFBcUI7UUFDeEIsSUFBSSxrQkFBa0IsQ0FBQyxRQUFRLEtBQUssSUFBSSxFQUFFO1lBQ3RDLGtCQUFrQixDQUFDLFFBQVEsR0FBRyxJQUFJLGtCQUFrQixFQUFFLENBQUM7U0FDMUQ7UUFFRCxPQUFPLGtCQUFrQixDQUFDLFFBQVEsQ0FBQztJQUN2QyxDQUFDO0lBRUQsSUFBSTtRQUNBLElBQUksQ0FBQyxJQUFJLENBQUMsS0FBSyxFQUFFO1lBQ2IsSUFBSSxDQUFDLEtBQUssR0FBRywyQkFBaUIsQ0FBQyxhQUFhLEVBQUUsQ0FBQyxhQUFhLENBQUMsd0NBQWUsQ0FBQyxDQUFDO1NBQ2pGO0lBQ0wsQ0FBQztJQU9ELEtBQUssQ0FBQyxNQUFNLENBQUMsTUFBMkI7UUFDcEMsSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDO1FBR1osTUFBTSxDQUFDLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUM7UUFDcEMsTUFBTSxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUV6QixPQUFPLElBQUksQ0FBQztJQUNoQixDQUFDO0lBTUQsS0FBSyxDQUFDLFNBQVMsQ0FBQyxHQUFXO1FBQ3ZCLE1BQU0sSUFBSSxHQUFHLE1BQU0sSUFBQSx5QkFBWSxHQUFFLENBQUM7UUFDbEMsT0FBTyxNQUFNLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO0lBQ2pELENBQUM7SUFPRCxLQUFLLENBQUMsU0FBUyxDQUFDLEtBQVUsRUFBRSxNQUFjO1FBQ3RDLElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQztRQUVaLE1BQU0sSUFBSSxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsS0FBSyxFQUFFLE1BQU0sQ0FBQyxDQUFDO1FBRXZDLE9BQU8sSUFBSSxDQUFDO0lBQ2hCLENBQUM7SUFNRCxLQUFLLENBQUMsT0FBTyxDQUFDLE1BQXVDO1FBQ2pELElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQztRQUNaLElBQUksSUFBSSxHQUFHLE1BQU0sSUFBSSxDQUFDLFdBQVcsQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUUxQyxJQUFJLElBQUk7WUFBRSxPQUFPLElBQUksQ0FBQztRQUd0QixJQUFJLEdBQUcsTUFBTSxJQUFJLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUd4QyxJQUFJLElBQUksRUFBRTtZQUNOLE1BQU0sSUFBSSxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsQ0FBQztTQUNoQztRQUVELE9BQU8sSUFBSSxDQUFDO0lBQ2hCLENBQUM7SUFNRCxLQUFLLENBQUMsV0FBVyxDQUFDLE1BQTJCO1FBQ3pDLE1BQU0sSUFBSSxHQUFHLE1BQU0sSUFBQSx5QkFBWSxHQUFFLENBQUM7UUFDbEMsTUFBTSxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxFQUFFLE1BQU0sQ0FBQyxPQUFPLENBQUMsUUFBUSxFQUFFLEVBQUUsSUFBSSxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDO0lBQ3JHLENBQUM7SUFPRCxLQUFLLENBQUMsZ0JBQWdCLENBQUMsRUFBQyxHQUFHLEVBQUUsT0FBTyxFQUFpQztRQUNqRSxNQUFNLElBQUksR0FBRyxNQUFNLElBQUEseUJBQVksR0FBRSxDQUFDO1FBQ2xDLE1BQU0sSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLEdBQUcsQ0FBQyxFQUFFLE9BQU8sQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUFDO0lBQy9ELENBQUM7SUFPRCxLQUFLLENBQUMsV0FBVyxDQUFDLEVBQUMsR0FBRyxFQUFFLE9BQU8sRUFBaUM7UUFDNUQsTUFBTSxJQUFJLEdBQUcsTUFBTSxJQUFBLHlCQUFZLEdBQUUsQ0FBQztRQUNsQyxPQUFPLElBQUksQ0FBQyxLQUFLLENBQUMsTUFBTSxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsR0FBRyxDQUFDLEVBQUUsT0FBTyxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUMsQ0FBQztJQUNsRixDQUFDO0lBTU8sV0FBVyxDQUFDLEdBQUc7UUFDbkIsT0FBTyxHQUFHLElBQUksQ0FBQyxjQUFjLEdBQUcsR0FBRyxFQUFFLENBQUM7SUFDMUMsQ0FBQzs7QUFsSEwscUNBbUhDO0FBbEhVLDJCQUFRLEdBQXVCLElBQUksQ0FBQyJ9