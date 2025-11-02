"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const databaseService = require("../../../../services/databaseService");
class RedisMulti {
    static async getRedisMulti(...keys) {
        const optimisticLock = new RedisMulti();
        await optimisticLock.init(...keys);
        return optimisticLock;
    }
    async init(...keys) {
        this.keys = keys;
        this.redisClient = await databaseService.getRedisClient();
        await this.redisClient.watch(...keys);
    }
    async start() {
        this.redisClient.multi();
        return this.redisClient;
    }
    async closeMulti() {
        await this.redisClient.discard();
    }
    async end() {
        let transaction;
        const reply = await this.redisClient.exec();
        console.warn('事务运行情况', reply);
        if (!reply) {
            transaction = false;
        }
        else {
            transaction = true;
        }
        return transaction;
    }
}
exports.default = RedisMulti;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVkaXNNdWx0aS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL2FwcC9jb21tb24vZGFvL3JlZGlzL2xpYi9yZWRpc011bHRpLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBT0Esd0VBQXlFO0FBS3pFLE1BQXFCLFVBQVU7SUFLM0IsTUFBTSxDQUFDLEtBQUssQ0FBQyxhQUFhLENBQUMsR0FBRyxJQUFlO1FBQ3pDLE1BQU0sY0FBYyxHQUFHLElBQUksVUFBVSxFQUFFLENBQUM7UUFDeEMsTUFBTSxjQUFjLENBQUMsSUFBSSxDQUFDLEdBQUcsSUFBSSxDQUFDLENBQUM7UUFDbkMsT0FBTyxjQUFjLENBQUM7SUFDMUIsQ0FBQztJQU1PLEtBQUssQ0FBQyxJQUFJLENBQUMsR0FBRyxJQUFlO1FBQ2pDLElBQUksQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDO1FBQ2pCLElBQUksQ0FBQyxXQUFXLEdBQUcsTUFBTSxlQUFlLENBQUMsY0FBYyxFQUFFLENBQUM7UUFFMUQsTUFBTSxJQUFJLENBQUMsV0FBVyxDQUFDLEtBQUssQ0FBQyxHQUFHLElBQUksQ0FBQyxDQUFDO0lBQzFDLENBQUM7SUFNTSxLQUFLLENBQUMsS0FBSztRQUNkLElBQUksQ0FBQyxXQUFXLENBQUMsS0FBSyxFQUFFLENBQUM7UUFDekIsT0FBTyxJQUFJLENBQUMsV0FBVyxDQUFDO0lBQzVCLENBQUM7SUFLTSxLQUFLLENBQUMsVUFBVTtRQUNuQixNQUFNLElBQUksQ0FBQyxXQUFXLENBQUMsT0FBTyxFQUFFLENBQUM7SUFDckMsQ0FBQztJQUtNLEtBQUssQ0FBQyxHQUFHO1FBQ1osSUFBSSxXQUFvQixDQUFDO1FBQ3pCLE1BQU0sS0FBSyxHQUFHLE1BQU0sSUFBSSxDQUFDLFdBQVcsQ0FBQyxJQUFJLEVBQUUsQ0FBQztRQUU1QyxPQUFPLENBQUMsSUFBSSxDQUFDLFFBQVEsRUFBRSxLQUFLLENBQUMsQ0FBQztRQUc5QixJQUFJLENBQUMsS0FBSyxFQUFFO1lBQ1IsV0FBVyxHQUFHLEtBQUssQ0FBQztTQUN2QjthQUFNO1lBQ0gsV0FBVyxHQUFHLElBQUksQ0FBQztTQUN0QjtRQUVELE9BQU8sV0FBVyxDQUFDO0lBQ3ZCLENBQUM7Q0FDSjtBQXhERCw2QkF3REMifQ==