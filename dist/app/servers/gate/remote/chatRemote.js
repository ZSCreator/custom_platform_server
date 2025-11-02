"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatRemote = void 0;
function default_1(app) {
    return new ChatRemote(app);
}
exports.default = default_1;
class ChatRemote {
    constructor(app) {
        this.app = app;
        this.app = app;
        this.channelService = app.get('channelService');
    }
    async add(uid, sid, name, flag) {
        let channel = this.channelService.getChannel(name, flag);
        if (!!channel) {
            channel.add(uid, sid);
        }
        return this.get(name, flag);
    }
    get(name, flag) {
        let users = [];
        let channel = this.channelService.getChannel(name, flag);
        if (!!channel) {
            users = channel.getMembers();
        }
        for (let i = 0; i < users.length; i++) {
            users[i] = users[i].split('*')[0];
        }
        return users;
    }
    async kick(uid, sid, name) {
    }
    async getSessionsCount() {
        let sessionService = this.app.get('sessionService');
        return sessionService.getSessionsCount();
    }
}
exports.ChatRemote = ChatRemote;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2hhdFJlbW90ZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL2FwcC9zZXJ2ZXJzL2dhdGUvcmVtb3RlL2NoYXRSZW1vdGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBRUEsbUJBQXlCLEdBQWdCO0lBQ3JDLE9BQU8sSUFBSSxVQUFVLENBQUMsR0FBRyxDQUFDLENBQUM7QUFDL0IsQ0FBQztBQUZELDRCQUVDO0FBV0QsTUFBYSxVQUFVO0lBRW5CLFlBQW9CLEdBQWdCO1FBQWhCLFFBQUcsR0FBSCxHQUFHLENBQWE7UUFDaEMsSUFBSSxDQUFDLEdBQUcsR0FBRyxHQUFHLENBQUM7UUFDZixJQUFJLENBQUMsY0FBYyxHQUFHLEdBQUcsQ0FBQyxHQUFHLENBQUMsZ0JBQWdCLENBQUMsQ0FBQztJQUNwRCxDQUFDO0lBYU0sS0FBSyxDQUFDLEdBQUcsQ0FBQyxHQUFXLEVBQUUsR0FBVyxFQUFFLElBQVksRUFBRSxJQUFhO1FBQ2xFLElBQUksT0FBTyxHQUFHLElBQUksQ0FBQyxjQUFjLENBQUMsVUFBVSxDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsQ0FBQztRQUV6RCxJQUFJLENBQUMsQ0FBQyxPQUFPLEVBQUU7WUFDWCxPQUFPLENBQUMsR0FBRyxDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUMsQ0FBQztTQUN6QjtRQUVELE9BQU8sSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLENBQUM7SUFDaEMsQ0FBQztJQVNPLEdBQUcsQ0FBQyxJQUFZLEVBQUUsSUFBYTtRQUNuQyxJQUFJLEtBQUssR0FBYSxFQUFFLENBQUM7UUFDekIsSUFBSSxPQUFPLEdBQUcsSUFBSSxDQUFDLGNBQWMsQ0FBQyxVQUFVLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxDQUFDO1FBQ3pELElBQUksQ0FBQyxDQUFDLE9BQU8sRUFBRTtZQUNYLEtBQUssR0FBRyxPQUFPLENBQUMsVUFBVSxFQUFFLENBQUM7U0FDaEM7UUFDRCxLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsS0FBSyxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRTtZQUNuQyxLQUFLLENBQUMsQ0FBQyxDQUFDLEdBQUcsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztTQUNyQztRQUNELE9BQU8sS0FBSyxDQUFDO0lBQ2pCLENBQUM7SUFVTSxLQUFLLENBQUMsSUFBSSxDQUFDLEdBQVcsRUFBRSxHQUFXLEVBQUUsSUFBWTtJQUN4RCxDQUFDO0lBS00sS0FBSyxDQUFDLGdCQUFnQjtRQUN6QixJQUFJLGNBQWMsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDO1FBQ3BELE9BQU8sY0FBYyxDQUFDLGdCQUFnQixFQUFFLENBQUM7SUFDN0MsQ0FBQztDQUNKO0FBakVELGdDQWlFQyJ9