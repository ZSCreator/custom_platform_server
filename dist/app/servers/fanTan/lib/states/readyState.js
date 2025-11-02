"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const constants_1 = require("../constants");
class ReadyState {
    constructor(room) {
        this.countdown = 3 * 1000;
        this.stateName = constants_1.RoomState.READY;
        this.startTime = 0;
        this.room = room;
    }
    async init() {
        this.startTime = Date.now();
        this.room.init();
        await this.room.removeOfflinePlayers();
    }
    ;
    getRemainingTime() {
        return this.startTime + this.countdown - Date.now();
    }
    async before() {
        await this.init();
        this.room.routeMsg.startReadyState();
    }
    async after() {
        await this.room.changeRoomState(constants_1.RoomState.BET);
    }
}
exports.default = ReadyState;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVhZHlTdGF0ZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL2FwcC9zZXJ2ZXJzL2ZhblRhbi9saWIvc3RhdGVzL3JlYWR5U3RhdGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFFQSw0Q0FBdUM7QUFLdkMsTUFBcUIsVUFBVTtJQU0zQixZQUFZLElBQVU7UUFMYixjQUFTLEdBQUcsQ0FBQyxHQUFHLElBQUksQ0FBQztRQUNyQixjQUFTLEdBQUcscUJBQVMsQ0FBQyxLQUFLLENBQUM7UUFDckMsY0FBUyxHQUFHLENBQUMsQ0FBQztRQUlWLElBQUksQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDO0lBQ3JCLENBQUM7SUFFRCxLQUFLLENBQUMsSUFBSTtRQUNOLElBQUksQ0FBQyxTQUFTLEdBQUcsSUFBSSxDQUFDLEdBQUcsRUFBRSxDQUFDO1FBRzVCLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLENBQUM7UUFJakIsTUFBTSxJQUFJLENBQUMsSUFBSSxDQUFDLG9CQUFvQixFQUFFLENBQUM7SUFDM0MsQ0FBQztJQUFBLENBQUM7SUFLRixnQkFBZ0I7UUFDWixPQUFPLElBQUksQ0FBQyxTQUFTLEdBQUcsSUFBSSxDQUFDLFNBQVMsR0FBRyxJQUFJLENBQUMsR0FBRyxFQUFFLENBQUM7SUFDeEQsQ0FBQztJQUVELEtBQUssQ0FBQyxNQUFNO1FBQ1IsTUFBTSxJQUFJLENBQUMsSUFBSSxFQUFFLENBQUM7UUFJbEIsSUFBSSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsZUFBZSxFQUFFLENBQUM7SUFDekMsQ0FBQztJQUVELEtBQUssQ0FBQyxLQUFLO1FBRVAsTUFBTSxJQUFJLENBQUMsSUFBSSxDQUFDLGVBQWUsQ0FBQyxxQkFBUyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0lBQ25ELENBQUM7Q0FDSjtBQXhDRCw2QkF3Q0MifQ==