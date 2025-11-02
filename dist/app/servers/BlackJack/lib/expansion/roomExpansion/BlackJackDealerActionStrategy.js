"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BlackJackDealerActionStrategy = void 0;
const pinus_logger_1 = require("pinus-logger");
class BlackJackDealerActionStrategy {
    constructor(room) {
        this.room = room;
        this.logger = (0, pinus_logger_1.getLogger)('server_out', __filename);
    }
    static getInstance(room, paramRoomId) {
        if (this.roomIdList.findIndex(roomId => roomId === paramRoomId) < 0) {
            this.roomIdList.push(paramRoomId);
            this.instanceMap[paramRoomId] = new BlackJackDealerActionStrategy(room);
        }
        return this.instanceMap[paramRoomId];
    }
    checkHandPoker() {
    }
}
exports.BlackJackDealerActionStrategy = BlackJackDealerActionStrategy;
BlackJackDealerActionStrategy.roomIdList = [];
BlackJackDealerActionStrategy.instanceMap = {};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQmxhY2tKYWNrRGVhbGVyQWN0aW9uU3RyYXRlZ3kuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi9hcHAvc2VydmVycy9CbGFja0phY2svbGliL2V4cGFuc2lvbi9yb29tRXhwYW5zaW9uL0JsYWNrSmFja0RlYWxlckFjdGlvblN0cmF0ZWd5LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUNBLCtDQUF5QztBQU16QyxNQUFhLDZCQUE2QjtJQW1CdEMsWUFBWSxJQUF1QjtRQUMvQixJQUFJLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQztRQUVqQixJQUFJLENBQUMsTUFBTSxHQUFHLElBQUEsd0JBQVMsRUFBQyxZQUFZLEVBQUUsVUFBVSxDQUFDLENBQUM7SUFDdEQsQ0FBQztJQWJELE1BQU0sQ0FBQyxXQUFXLENBQUMsSUFBdUIsRUFBRSxXQUFtQjtRQUMzRCxJQUFJLElBQUksQ0FBQyxVQUFVLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUMsTUFBTSxLQUFLLFdBQVcsQ0FBQyxHQUFHLENBQUMsRUFBRTtZQUNqRSxJQUFJLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsQ0FBQztZQUNsQyxJQUFJLENBQUMsV0FBVyxDQUFDLFdBQVcsQ0FBQyxHQUFHLElBQUksNkJBQTZCLENBQUMsSUFBSSxDQUFDLENBQUE7U0FDMUU7UUFFRCxPQUFPLElBQUksQ0FBQyxXQUFXLENBQUMsV0FBVyxDQUFDLENBQUM7SUFDekMsQ0FBQztJQVFELGNBQWM7SUFFZCxDQUFDOztBQTNCTCxzRUE2QkM7QUF2QlUsd0NBQVUsR0FBYSxFQUFFLENBQUM7QUFFMUIseUNBQVcsR0FBVyxFQUFFLENBQUMifQ==