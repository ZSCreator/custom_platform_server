"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const BaseGameManager_1 = require("../../../common/pojo/baseClass/BaseGameManager");
class FanTanGameManager extends BaseGameManager_1.BaseGameManager {
    static async init(nid) {
        return new FanTanGameManager(nid).init();
    }
    constructor(nid) {
        super();
        this.nid = nid;
    }
}
exports.default = FanTanGameManager;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2FtZU1hbmFnZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9hcHAvc2VydmVycy9mYW5UYW4vbGliL2dhbWVNYW5hZ2VyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsb0ZBQWlGO0FBR2pGLE1BQXFCLGlCQUFrQixTQUFRLGlDQUFvQjtJQUMvRCxNQUFNLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxHQUFnQjtRQUM5QixPQUFPLElBQUksaUJBQWlCLENBQUMsR0FBRyxDQUFDLENBQUMsSUFBSSxFQUFFLENBQUM7SUFDN0MsQ0FBQztJQUVELFlBQVksR0FBZ0I7UUFDeEIsS0FBSyxFQUFFLENBQUM7UUFDUixJQUFJLENBQUMsR0FBRyxHQUFHLEdBQUcsQ0FBQztJQUNuQixDQUFDO0NBQ0o7QUFURCxvQ0FTQyJ9