"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const BaseGameManager_1 = require("../../../common/pojo/baseClass/BaseGameManager");
const GameNidEnum_1 = require("../../../common/constant/game/GameNidEnum");
class IceBallGameManager extends BaseGameManager_1.BaseGameManager {
    constructor(nid) {
        super();
        this.nid = nid;
    }
    static getInstance() {
        if (!this.instance) {
            this.instance = new IceBallGameManager(GameNidEnum_1.GameNidEnum.IceBall);
        }
        return this.instance;
    }
}
exports.default = IceBallGameManager;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2FtZU1hbmFnZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9hcHAvc2VydmVycy9pY2VCYWxsL2xpYi9nYW1lTWFuYWdlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLG9GQUFpRjtBQUNqRiwyRUFBc0U7QUFFdEUsTUFBcUIsa0JBQW1CLFNBQVEsaUNBQW9CO0lBVWhFLFlBQVksR0FBZ0I7UUFDeEIsS0FBSyxFQUFFLENBQUM7UUFDUixJQUFJLENBQUMsR0FBRyxHQUFHLEdBQUcsQ0FBQztJQUNuQixDQUFDO0lBWEQsTUFBTSxDQUFDLFdBQVc7UUFDZCxJQUFJLENBQUMsSUFBSSxDQUFDLFFBQVEsRUFBRTtZQUNoQixJQUFJLENBQUMsUUFBUSxHQUFHLElBQUksa0JBQWtCLENBQUMseUJBQVcsQ0FBQyxPQUFPLENBQUMsQ0FBQztTQUMvRDtRQUVELE9BQU8sSUFBSSxDQUFDLFFBQVEsQ0FBQztJQUN6QixDQUFDO0NBTUo7QUFkRCxxQ0FjQyJ9