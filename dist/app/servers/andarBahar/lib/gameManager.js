"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const BaseGameManager_1 = require("../../../common/pojo/baseClass/BaseGameManager");
class AndarBaharGameManager extends BaseGameManager_1.BaseGameManager {
    static async init(nid) {
        return new AndarBaharGameManager(nid).init();
    }
    constructor(nid) {
        super();
        this.nid = nid;
    }
}
exports.default = AndarBaharGameManager;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2FtZU1hbmFnZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9hcHAvc2VydmVycy9hbmRhckJhaGFyL2xpYi9nYW1lTWFuYWdlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLG9GQUFpRjtBQUdqRixNQUFxQixxQkFBc0IsU0FBUSxpQ0FBb0I7SUFDbkUsTUFBTSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsR0FBZ0I7UUFDOUIsT0FBTyxJQUFJLHFCQUFxQixDQUFDLEdBQUcsQ0FBQyxDQUFDLElBQUksRUFBRSxDQUFDO0lBQ2pELENBQUM7SUFFRCxZQUFZLEdBQWdCO1FBQ3hCLEtBQUssRUFBRSxDQUFDO1FBQ1IsSUFBSSxDQUFDLEdBQUcsR0FBRyxHQUFHLENBQUM7SUFDbkIsQ0FBQztDQUNKO0FBVEQsd0NBU0MifQ==