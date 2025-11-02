"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getScenes = exports.get_games_all = exports.get_games = exports.get_all_robotStatus = exports.get_robotStatus = void 0;
const JsonMgr = require("../../config/data/JsonMgr");
function get_robotStatus(nid) {
    let robotStatus = JsonMgr.get('robot/robotConfig').datas.find(m => m.nid === nid);
    return robotStatus;
}
exports.get_robotStatus = get_robotStatus;
function get_all_robotStatus() {
    let robotStatus = JsonMgr.get('robot/robotConfig').datas;
    return robotStatus;
}
exports.get_all_robotStatus = get_all_robotStatus;
function get_games(nid) {
    const gamesConfig = JsonMgr.get('games').datas;
    if (nid) {
        for (const Config of gamesConfig) {
            if (Config.nid == nid) {
                return Config;
            }
        }
    }
    else {
    }
    return null;
}
exports.get_games = get_games;
function get_games_all() {
    const gamesConfig = JsonMgr.get('games').datas;
    return gamesConfig;
}
exports.get_games_all = get_games_all;
function getScenes(name) {
    return JsonMgr.get(`scenes/${name}`);
}
exports.getScenes = getScenes;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiSnNvbkNvbmZpZy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL2FwcC9wb2pvL0pzb25Db25maWcudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEscURBQXNEO0FBd0J0RCxTQUFnQixlQUFlLENBQUMsR0FBVztJQUN2QyxJQUFJLFdBQVcsR0FBeUIsT0FBTyxDQUFDLEdBQUcsQ0FBQyxtQkFBbUIsQ0FBQyxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsR0FBRyxLQUFLLEdBQUcsQ0FBQyxDQUFDO0lBQ3hHLE9BQU8sV0FBVyxDQUFDO0FBQ3ZCLENBQUM7QUFIRCwwQ0FHQztBQUNELFNBQWdCLG1CQUFtQjtJQUMvQixJQUFJLFdBQVcsR0FBMkIsT0FBTyxDQUFDLEdBQUcsQ0FBQyxtQkFBbUIsQ0FBQyxDQUFDLEtBQUssQ0FBQztJQUNqRixPQUFPLFdBQVcsQ0FBQztBQUN2QixDQUFDO0FBSEQsa0RBR0M7QUFHRCxTQUFnQixTQUFTLENBQUMsR0FBVztJQUNqQyxNQUFNLFdBQVcsR0FBa0IsT0FBTyxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsQ0FBQyxLQUFLLENBQUM7SUFDOUQsSUFBSSxHQUFHLEVBQUU7UUFDTCxLQUFLLE1BQU0sTUFBTSxJQUFJLFdBQVcsRUFBRTtZQUM5QixJQUFJLE1BQU0sQ0FBQyxHQUFHLElBQUksR0FBRyxFQUFFO2dCQUNuQixPQUFPLE1BQU0sQ0FBQzthQUNqQjtTQUNKO0tBQ0o7U0FBTTtLQUVOO0lBQ0QsT0FBTyxJQUFJLENBQUM7QUFDaEIsQ0FBQztBQVpELDhCQVlDO0FBRUQsU0FBZ0IsYUFBYTtJQUN6QixNQUFNLFdBQVcsR0FBa0IsT0FBTyxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsQ0FBQyxLQUFLLENBQUM7SUFDOUQsT0FBTyxXQUFXLENBQUM7QUFDdkIsQ0FBQztBQUhELHNDQUdDO0FBTUQsU0FBZ0IsU0FBUyxDQUFDLElBQVk7SUFDbEMsT0FBTyxPQUFPLENBQUMsR0FBRyxDQUFDLFVBQVUsSUFBSSxFQUFFLENBQUMsQ0FBQztBQUN6QyxDQUFDO0FBRkQsOEJBRUMifQ==