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
            this.instance = new PharaohGameManager(GameNidEnum_1.GameNidEnum.CandyParty);
        }
        return this.instance;
    }
}
exports.default = PharaohGameManager;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQ2FuZHlQYXJ0eUdhbWVNYW5hZ2VyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vYXBwL3NlcnZlcnMvTW9vblByaW5jZXNzL2xpYi9DYW5keVBhcnR5R2FtZU1hbmFnZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSxvRkFBaUY7QUFDakYsMkVBQXNFO0FBRXRFLE1BQXFCLGtCQUFtQixTQUFRLGlDQUFvQjtJQVVoRSxZQUFZLEdBQWdCO1FBQ3hCLEtBQUssRUFBRSxDQUFDO1FBQ1IsSUFBSSxDQUFDLEdBQUcsR0FBRyxHQUFHLENBQUM7SUFDbkIsQ0FBQztJQVhELE1BQU0sQ0FBQyxXQUFXO1FBQ2QsSUFBSSxDQUFDLElBQUksQ0FBQyxRQUFRLEVBQUU7WUFDaEIsSUFBSSxDQUFDLFFBQVEsR0FBRyxJQUFJLGtCQUFrQixDQUFDLHlCQUFXLENBQUMsVUFBVSxDQUFDLENBQUM7U0FDbEU7UUFFRCxPQUFPLElBQUksQ0FBQyxRQUFRLENBQUM7SUFDekIsQ0FBQztDQU1KO0FBZEQscUNBY0MifQ==