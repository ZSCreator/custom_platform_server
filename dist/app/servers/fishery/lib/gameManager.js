"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.init = void 0;
const BaseGameManager_1 = require("../../../common/pojo/baseClass/BaseGameManager");
class FisheryGameManager extends BaseGameManager_1.BaseGameManager {
    constructor(nid) {
        super();
        this.nid = nid;
    }
}
exports.default = FisheryGameManager;
function init(nid) {
    return new FisheryGameManager(nid).init();
}
exports.init = init;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2FtZU1hbmFnZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9hcHAvc2VydmVycy9maXNoZXJ5L2xpYi9nYW1lTWFuYWdlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFDQSxvRkFBaUY7QUFNakYsTUFBcUIsa0JBQW1CLFNBQVEsaUNBQThCO0lBQzFFLFlBQVksR0FBZ0I7UUFDeEIsS0FBSyxFQUFFLENBQUM7UUFDUixJQUFJLENBQUMsR0FBRyxHQUFHLEdBQUcsQ0FBQztJQUNuQixDQUFDO0NBQ0o7QUFMRCxxQ0FLQztBQU1ELFNBQWdCLElBQUksQ0FBQyxHQUFnQjtJQUNqQyxPQUFPLElBQUksa0JBQWtCLENBQUMsR0FBRyxDQUFDLENBQUMsSUFBSSxFQUFFLENBQUM7QUFDOUMsQ0FBQztBQUZELG9CQUVDIn0=