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
            this.instance = new FishGameManager(GameNidEnum_1.GameNidEnum.buyu);
        }
        return this.instance;
    }
}
exports.default = FishGameManager;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZmlzaEdhbWVNYW5hZ2VyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vYXBwL3NlcnZlcnMvYnV5dS9saWIvZmlzaEdhbWVNYW5hZ2VyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsb0ZBQWlGO0FBQ2pGLDJFQUFzRTtBQUV0RSxNQUFxQixlQUFnQixTQUFRLGlDQUFvQjtJQVU3RCxZQUFZLEdBQWdCO1FBQ3hCLEtBQUssRUFBRSxDQUFDO1FBQ1IsSUFBSSxDQUFDLEdBQUcsR0FBRyxHQUFHLENBQUM7SUFDbkIsQ0FBQztJQVhELE1BQU0sQ0FBQyxXQUFXO1FBQ2QsSUFBSSxDQUFDLElBQUksQ0FBQyxRQUFRLEVBQUU7WUFDaEIsSUFBSSxDQUFDLFFBQVEsR0FBRyxJQUFJLGVBQWUsQ0FBQyx5QkFBVyxDQUFDLElBQUksQ0FBQyxDQUFDO1NBQ3pEO1FBRUQsT0FBTyxJQUFJLENBQUMsUUFBUSxDQUFDO0lBQ3pCLENBQUM7Q0FNSjtBQWRELGtDQWNDIn0=