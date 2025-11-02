"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RemoteObserver = void 0;
class RemoteObserver {
    constructor(themeName, redis) {
        this.redis = redis;
        this.themeName = themeName;
    }
    async update(message) {
        await this.redis.publish(this.themeName, message);
    }
}
exports.RemoteObserver = RemoteObserver;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoib2JzZXJ2ZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9hcHAvY29tbW9uL2NsYXNzZXMvb2JzZXJ2ZXIvcmVtb3RlT2JzZXJ2ZXIvb2JzZXJ2ZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBU0EsTUFBc0IsY0FBYztJQUloQyxZQUFzQixTQUFpQixFQUFFLEtBQVk7UUFDakQsSUFBSSxDQUFDLEtBQUssR0FBRyxLQUFLLENBQUM7UUFDbkIsSUFBSSxDQUFDLFNBQVMsR0FBRyxTQUFTLENBQUM7SUFDL0IsQ0FBQztJQUtELEtBQUssQ0FBQyxNQUFNLENBQUMsT0FBZ0I7UUFDekIsTUFBTSxJQUFJLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsU0FBUyxFQUFFLE9BQU8sQ0FBQyxDQUFDO0lBQ3RELENBQUM7Q0FDSjtBQWZELHdDQWVDIn0=