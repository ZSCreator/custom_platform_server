'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
exports.mainRemote = void 0;
const robotServerController = require("../lib/robotServerController");
function default_1(app) {
    return new mainRemote(app);
}
exports.default = default_1;
class mainRemote {
    constructor(app) {
        this.app = app;
        this.app = app;
        this.nids = [];
    }
    async NpcStart(nids, twoStrategy) {
        console.warn(this.app.getServerId(), nids.toString(), twoStrategy);
        for (const nid of nids) {
            if (twoStrategy) {
                robotServerController.start_robot_server(nid, true);
                if (!this.nids.find(c => c == nid)) {
                    this.nids.push(nid);
                }
            }
            else {
                robotServerController.stop_robot_server(nid);
                this.nids = this.nids.filter(c => c != nid);
            }
        }
        return { code: 200, nids: this.nids };
    }
    ;
    async NpcStatus() {
        return { code: 200, nids: this.nids };
    }
    ;
}
exports.mainRemote = mainRemote;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFpblJlbW90ZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL2FwcC9zZXJ2ZXJzL3JvYm90L3JlbW90ZS9tYWluUmVtb3RlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLFlBQVksQ0FBQzs7O0FBS2Isc0VBQXFFO0FBYXJFLG1CQUF5QixHQUFnQjtJQUNyQyxPQUFPLElBQUksVUFBVSxDQUFDLEdBQUcsQ0FBQyxDQUFDO0FBQy9CLENBQUM7QUFGRCw0QkFFQztBQUNELE1BQWEsVUFBVTtJQUduQixZQUFvQixHQUFnQjtRQUFoQixRQUFHLEdBQUgsR0FBRyxDQUFhO1FBQ2hDLElBQUksQ0FBQyxHQUFHLEdBQUcsR0FBRyxDQUFDO1FBQ2YsSUFBSSxDQUFDLElBQUksR0FBRyxFQUFFLENBQUM7SUFDbkIsQ0FBQztJQUVNLEtBQUssQ0FBQyxRQUFRLENBQUMsSUFBYyxFQUFFLFdBQW9CO1FBQ3RELE9BQU8sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxXQUFXLEVBQUUsRUFBRSxJQUFJLENBQUMsUUFBUSxFQUFFLEVBQUUsV0FBVyxDQUFDLENBQUM7UUFDbkUsS0FBSyxNQUFNLEdBQUcsSUFBSSxJQUFJLEVBQUU7WUFHcEIsSUFBSSxXQUFXLEVBQUU7Z0JBQ2IscUJBQXFCLENBQUMsa0JBQWtCLENBQUMsR0FBRyxFQUFFLElBQUksQ0FBQyxDQUFDO2dCQUNwRCxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLElBQUksR0FBRyxDQUFDLEVBQUU7b0JBQ2hDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDO2lCQUN2QjthQUNKO2lCQUFNO2dCQUNILHFCQUFxQixDQUFDLGlCQUFpQixDQUFDLEdBQUcsQ0FBQyxDQUFDO2dCQUM3QyxJQUFJLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxJQUFJLEdBQUcsQ0FBQyxDQUFDO2FBQy9DO1NBRUo7UUFDRCxPQUFPLEVBQUUsSUFBSSxFQUFFLEdBQUcsRUFBRSxJQUFJLEVBQUUsSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDO0lBQzFDLENBQUM7SUFBQSxDQUFDO0lBRUssS0FBSyxDQUFDLFNBQVM7UUFDbEIsT0FBTyxFQUFFLElBQUksRUFBRSxHQUFHLEVBQUUsSUFBSSxFQUFFLElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQztJQUMxQyxDQUFDO0lBQUEsQ0FBQztDQUNMO0FBOUJELGdDQThCQyJ9