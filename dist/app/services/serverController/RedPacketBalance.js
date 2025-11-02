"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.redPacketRouteDispatch = void 0;
async function redPacketRouteDispatch(session, msg, app, callBack) {
    const { args: [{ route }, {}] } = msg;
    const serverId = session.get('backendServerId');
    callBack(null, serverId);
}
exports.redPacketRouteDispatch = redPacketRouteDispatch;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUmVkUGFja2V0QmFsYW5jZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL2FwcC9zZXJ2aWNlcy9zZXJ2ZXJDb250cm9sbGVyL1JlZFBhY2tldEJhbGFuY2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBR08sS0FBSyxVQUFVLHNCQUFzQixDQUFDLE9BQXdCLEVBQUUsR0FBUSxFQUFFLEdBQWdCLEVBQUUsUUFBdUI7SUFDdEgsTUFBTSxFQUFFLElBQUksRUFBRSxDQUFDLEVBQUUsS0FBSyxFQUFFLEVBQUUsRUFBRyxDQUFDLEVBQUUsR0FBRyxHQUFHLENBQUM7SUFFdkMsTUFBTSxRQUFRLEdBQUcsT0FBTyxDQUFDLEdBQUcsQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDO0lBRWhELFFBQVEsQ0FBQyxJQUFJLEVBQUUsUUFBUSxDQUFDLENBQUM7QUFFN0IsQ0FBQztBQVBELHdEQU9DIn0=