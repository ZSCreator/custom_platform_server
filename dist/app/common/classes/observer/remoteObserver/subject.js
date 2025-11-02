"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RemoteSubject = void 0;
class RemoteSubject {
    constructor(themeName, redis) {
        this.themeName = themeName;
        this.redis = redis;
    }
    async registration() {
        await this.redis.subscribe(this.themeName);
        this.redis.on('message', (channel, message) => {
            if (channel === this.themeName) {
                if (!message || !message.length) {
                    return this.invoke();
                }
                this.invoke(JSON.parse(message));
            }
        });
    }
    async unregister() {
        await this.redis.unsubscribe(this.themeName);
    }
}
exports.RemoteSubject = RemoteSubject;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3ViamVjdC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL2FwcC9jb21tb24vY2xhc3Nlcy9vYnNlcnZlci9yZW1vdGVPYnNlcnZlci9zdWJqZWN0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQVNBLE1BQXNCLGFBQWE7SUFJL0IsWUFBc0IsU0FBaUIsRUFBRSxLQUFZO1FBQ2pELElBQUksQ0FBQyxTQUFTLEdBQUcsU0FBUyxDQUFDO1FBQzNCLElBQUksQ0FBQyxLQUFLLEdBQUcsS0FBSyxDQUFDO0lBQ3ZCLENBQUM7SUFZRCxLQUFLLENBQUMsWUFBWTtRQUNkLE1BQU0sSUFBSSxDQUFDLEtBQUssQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDO1FBRTNDLElBQUksQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDLFNBQVMsRUFBRSxDQUFDLE9BQU8sRUFBRSxPQUFlLEVBQUUsRUFBRTtZQUNsRCxJQUFJLE9BQU8sS0FBSyxJQUFJLENBQUMsU0FBUyxFQUFFO2dCQUM1QixJQUFJLENBQUMsT0FBTyxJQUFJLENBQUMsT0FBTyxDQUFDLE1BQU0sRUFBRTtvQkFDN0IsT0FBTyxJQUFJLENBQUMsTUFBTSxFQUFFLENBQUM7aUJBQ3hCO2dCQUVELElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDO2FBQ3BDO1FBQ0wsQ0FBQyxDQUFDLENBQUM7SUFDUCxDQUFDO0lBS0QsS0FBSyxDQUFDLFVBQVU7UUFDWixNQUFNLElBQUksQ0FBQyxLQUFLLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQztJQUNqRCxDQUFDO0NBQ0o7QUF2Q0Qsc0NBdUNDIn0=