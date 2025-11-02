"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const BaseGameManager_1 = require("../../../common/pojo/baseClass/BaseGameManager");
const GameNidEnum_1 = require("../../../common/constant/game/GameNidEnum");
class PharaohGameManager extends BaseGameManager_1.BaseGameManager {
    constructor(nid) {
        super();
        this.nid = nid;
    }
    static getInstance() {
        if (!this.instance) {
            this.instance = new PharaohGameManager(GameNidEnum_1.GameNidEnum.CandyMoney);
        }
        return this.instance;
    }
}
exports.default = PharaohGameManager;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQ2FuZHlNb25leUdhbWVNYW5hZ2VyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vYXBwL3NlcnZlcnMvQ2FuZHlNb25leS9saWIvQ2FuZHlNb25leUdhbWVNYW5hZ2VyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsb0ZBQWlGO0FBQ2pGLDJFQUFzRTtBQUV0RSxNQUFxQixrQkFBbUIsU0FBUSxpQ0FBb0I7SUFVaEUsWUFBWSxHQUFnQjtRQUN4QixLQUFLLEVBQUUsQ0FBQztRQUNSLElBQUksQ0FBQyxHQUFHLEdBQUcsR0FBRyxDQUFDO0lBQ25CLENBQUM7SUFYRCxNQUFNLENBQUMsV0FBVztRQUNkLElBQUksQ0FBQyxJQUFJLENBQUMsUUFBUSxFQUFFO1lBQ2hCLElBQUksQ0FBQyxRQUFRLEdBQUcsSUFBSSxrQkFBa0IsQ0FBQyx5QkFBVyxDQUFDLFVBQVUsQ0FBQyxDQUFDO1NBQ2xFO1FBRUQsT0FBTyxJQUFJLENBQUMsUUFBUSxDQUFDO0lBQ3pCLENBQUM7Q0FNSjtBQWRELHFDQWNDIn0=