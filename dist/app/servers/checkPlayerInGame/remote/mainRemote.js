'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
exports.mainRemote = void 0;
const pinus_1 = require("pinus");
const Game_manager_1 = require("../../../common/dao/daoManager/Game.manager");
function default_1(app) {
    return new mainRemote(app);
}
exports.default = default_1;
class mainRemote {
    constructor(app) {
        this.app = app;
        this.app = app;
    }
    async checkPlayerLower(paramsData) {
        try {
            let { nid, uid, sceneId, roomId, hallServerId } = paramsData;
            const { name } = await Game_manager_1.default.findOne({ nid });
            if (!pinus_1.pinus.app.rpc[name]) {
                return { code: 200, isCanLower: true };
            }
            if (!hallServerId) {
                hallServerId = `${name}-server-1`;
            }
            let result = await pinus_1.pinus.app.rpc[name].mainRemote.rpcLowerPlayer.toServer(hallServerId, { uid, sceneId, roomId });
            if (result && result.code == 200) {
                return { code: 200, isCanLower: true };
            }
            return { code: 500, isCanLower: false };
        }
        catch (e) {
            console.error(`检查玩家是否可以下分:${e}`);
            return { code: 200, isCanLower: true };
        }
    }
    ;
}
exports.mainRemote = mainRemote;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFpblJlbW90ZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL2FwcC9zZXJ2ZXJzL2NoZWNrUGxheWVySW5HYW1lL3JlbW90ZS9tYWluUmVtb3RlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLFlBQVksQ0FBQzs7O0FBRWIsaUNBQTBFO0FBQzFFLDhFQUFzRTtBQVd0RSxtQkFBeUIsR0FBZ0I7SUFDckMsT0FBTyxJQUFJLFVBQVUsQ0FBQyxHQUFHLENBQUMsQ0FBQztBQUMvQixDQUFDO0FBRkQsNEJBRUM7QUFDRCxNQUFhLFVBQVU7SUFFbkIsWUFBb0IsR0FBZ0I7UUFBaEIsUUFBRyxHQUFILEdBQUcsQ0FBYTtRQUNoQyxJQUFJLENBQUMsR0FBRyxHQUFHLEdBQUcsQ0FBQztJQUNuQixDQUFDO0lBR0QsS0FBSyxDQUFDLGdCQUFnQixDQUFDLFVBQVU7UUFDN0IsSUFBSTtZQUVBLElBQUksRUFBRSxHQUFHLEVBQUcsR0FBRyxFQUFFLE9BQU8sRUFBSSxNQUFNLEVBQUUsWUFBWSxFQUFFLEdBQUcsVUFBVSxDQUFDO1lBRWhFLE1BQU0sRUFBRSxJQUFJLEVBQUcsR0FBRyxNQUFNLHNCQUFXLENBQUMsT0FBTyxDQUFDLEVBQUUsR0FBRyxFQUFFLENBQUMsQ0FBQztZQUdyRCxJQUFJLENBQUMsYUFBSyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEVBQUU7Z0JBQ3RCLE9BQU8sRUFBQyxJQUFJLEVBQUUsR0FBRyxFQUFHLFVBQVUsRUFBRyxJQUFJLEVBQUMsQ0FBQzthQUMxQztZQUNELElBQUcsQ0FBQyxZQUFZLEVBQUM7Z0JBQ2IsWUFBWSxHQUFJLEdBQUcsSUFBSSxXQUFXLENBQUM7YUFDdEM7WUFDRCxJQUFJLE1BQU0sR0FBRyxNQUFNLGFBQUssQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDLFVBQVUsQ0FBQyxjQUFjLENBQUMsUUFBUSxDQUFDLFlBQVksRUFBQyxFQUFDLEdBQUcsRUFBRSxPQUFPLEVBQUMsTUFBTSxFQUFDLENBQUMsQ0FBQztZQUU5RyxJQUFHLE1BQU0sSUFBSSxNQUFNLENBQUMsSUFBSSxJQUFJLEdBQUcsRUFBQztnQkFDNUIsT0FBTyxFQUFDLElBQUksRUFBRSxHQUFHLEVBQUcsVUFBVSxFQUFHLElBQUksRUFBQyxDQUFDO2FBRTFDO1lBQ0QsT0FBTyxFQUFDLElBQUksRUFBRSxHQUFHLEVBQUcsVUFBVSxFQUFHLEtBQUssRUFBQyxDQUFDO1NBQzNDO1FBQUMsT0FBTyxDQUFDLEVBQUU7WUFDUixPQUFPLENBQUMsS0FBSyxDQUFDLGNBQWMsQ0FBQyxFQUFFLENBQUMsQ0FBQztZQUNqQyxPQUFPLEVBQUMsSUFBSSxFQUFFLEdBQUcsRUFBRyxVQUFVLEVBQUcsSUFBSSxFQUFDLENBQUM7U0FDMUM7SUFDTCxDQUFDO0lBQUEsQ0FBQztDQUNMO0FBakNELGdDQWlDQyJ9