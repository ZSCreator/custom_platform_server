"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const BaseGameManager_1 = require("../../../common/pojo/baseClass/BaseGameManager");
const GameNidEnum_1 = require("../../../common/constant/game/GameNidEnum");
class FishGameManager extends BaseGameManager_1.BaseGameManager {
    constructor(nid) {
        super();
        this.nid = nid;
    }
    static getInstance() {
        if (!this.instance) {
            this.instance = new FishGameManager(GameNidEnum_1.GameNidEnum.BlackGame);
        }
        return this.instance;
    }
}
exports.default = FishGameManager;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQkdHYW1lTWFuYWdlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL2FwcC9zZXJ2ZXJzL0JsYWNrR2FtZS9saWIvQkdHYW1lTWFuYWdlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLG9GQUFpRjtBQUNqRiwyRUFBd0U7QUFFeEUsTUFBcUIsZUFBZ0IsU0FBUSxpQ0FBb0I7SUFVN0QsWUFBWSxHQUFnQjtRQUN4QixLQUFLLEVBQUUsQ0FBQztRQUNSLElBQUksQ0FBQyxHQUFHLEdBQUcsR0FBRyxDQUFDO0lBQ25CLENBQUM7SUFYRCxNQUFNLENBQUMsV0FBVztRQUNkLElBQUksQ0FBQyxJQUFJLENBQUMsUUFBUSxFQUFFO1lBQ2hCLElBQUksQ0FBQyxRQUFRLEdBQUcsSUFBSSxlQUFlLENBQUMseUJBQVcsQ0FBQyxTQUFTLENBQUMsQ0FBQztTQUM5RDtRQUVELE9BQU8sSUFBSSxDQUFDLFFBQVEsQ0FBQztJQUN6QixDQUFDO0NBTUo7QUFkRCxrQ0FjQyJ9