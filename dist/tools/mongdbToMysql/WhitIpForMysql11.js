"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const dbMongo = require('../../config/db/mongo.json');
async function clean() {
    const EventEmitter = require("events").EventEmitter;
    function random(min, max, addOne = 1) {
        let count = Math.max(max - min, 0) + addOne;
        return Math.floor(Math.random() * count) + min;
    }
    ;
    class Room {
        constructor(roomId) {
            this.roomId = roomId;
            this.event = new EventEmitter();
        }
        registerListener() {
            this.event.on("bet", (uid, gold) => {
                console.log(`房间 ${this.roomId} | 机器人 ${uid} 下注 ${gold}`);
            });
            return this;
        }
        addRobot() {
            const count = random(1, 5);
            this.players = [];
            for (let i = 0; i < count; i++) {
                const r = new Robot(this);
                r.registerListener();
                this.players.push(r);
            }
            return this;
        }
        robotAction() {
            this.players.forEach(p => p.event.emit("action"));
        }
    }
    class Robot {
        constructor(room) {
            this.room = room;
            this.uid = Math.random().toString().substring(2, 10);
            this.event = new EventEmitter();
        }
        registerListener() {
            this.event.on("action", () => this.action());
        }
        action() {
            setInterval(() => this.room.event.emit("bet", this.uid, random(5, 10)), 1e3);
        }
    }
    new Room("001")
        .registerListener()
        .addRobot()
        .robotAction();
    new Room("002")
        .registerListener()
        .addRobot();
}
setTimeout(clean, 2000);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiV2hpdElwRm9yTXlzcWwxMS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3Rvb2xzL21vbmdkYlRvTXlzcWwvV2hpdElwRm9yTXlzcWwxMS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUdBLE1BQU0sT0FBTyxHQUFHLE9BQU8sQ0FBQyw0QkFBNEIsQ0FBQyxDQUFDO0FBWXRELEtBQUssVUFBVSxLQUFLO0lBQ2hCLE1BQU0sWUFBWSxHQUFHLE9BQU8sQ0FBQyxRQUFRLENBQUMsQ0FBQyxZQUFZLENBQUM7SUFDcEQsU0FBUyxNQUFNLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxNQUFNLEdBQUcsQ0FBQztRQUNoQyxJQUFJLEtBQUssR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLEdBQUcsR0FBRyxHQUFHLEVBQUUsQ0FBQyxDQUFDLEdBQUcsTUFBTSxDQUFDO1FBQzVDLE9BQU8sSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFLEdBQUcsS0FBSyxDQUFDLEdBQUcsR0FBRyxDQUFDO0lBQ25ELENBQUM7SUFBQSxDQUFDO0lBRUYsTUFBTSxJQUFJO1FBQ04sWUFBWSxNQUFNO1lBQ2QsSUFBSSxDQUFDLE1BQU0sR0FBRyxNQUFNLENBQUM7WUFDckIsSUFBSSxDQUFDLEtBQUssR0FBRyxJQUFJLFlBQVksRUFBRSxDQUFDO1FBQ3BDLENBQUM7UUFFRCxnQkFBZ0I7WUFDWixJQUFJLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQyxLQUFLLEVBQUUsQ0FBQyxHQUFHLEVBQUUsSUFBSSxFQUFFLEVBQUU7Z0JBQy9CLE9BQU8sQ0FBQyxHQUFHLENBQUMsTUFBTSxJQUFJLENBQUMsTUFBTSxVQUFVLEdBQUcsT0FBTyxJQUFJLEVBQUUsQ0FBQyxDQUFDO1lBQzdELENBQUMsQ0FBQyxDQUFBO1lBQ0YsT0FBTyxJQUFJLENBQUM7UUFDaEIsQ0FBQztRQUVELFFBQVE7WUFDSixNQUFNLEtBQUssR0FBRyxNQUFNLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO1lBQzNCLElBQUksQ0FBQyxPQUFPLEdBQUcsRUFBRSxDQUFDO1lBQ2xCLEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxLQUFLLEVBQUUsQ0FBQyxFQUFFLEVBQUU7Z0JBQzVCLE1BQU0sQ0FBQyxHQUFHLElBQUksS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFBO2dCQUN6QixDQUFDLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQztnQkFDckIsSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUE7YUFDdkI7WUFDRCxPQUFPLElBQUksQ0FBQztRQUNoQixDQUFDO1FBRUQsV0FBVztZQUNQLElBQUksQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQTtRQUNyRCxDQUFDO0tBQ0o7SUFFRCxNQUFNLEtBQUs7UUFDUCxZQUFZLElBQUk7WUFDWixJQUFJLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQztZQUNqQixJQUFJLENBQUMsR0FBRyxHQUFHLElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxTQUFTLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDO1lBQ3JELElBQUksQ0FBQyxLQUFLLEdBQUcsSUFBSSxZQUFZLEVBQUUsQ0FBQztRQUNwQyxDQUFDO1FBRUQsZ0JBQWdCO1lBQ1osSUFBSSxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUMsUUFBUSxFQUFFLEdBQUcsRUFBRSxDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQyxDQUFDO1FBQ2pELENBQUM7UUFFRCxNQUFNO1lBQ0YsV0FBVyxDQUFDLEdBQUcsRUFBRSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxLQUFLLEVBQUUsSUFBSSxDQUFDLEdBQUcsRUFBRSxNQUFNLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLEVBQUUsR0FBRyxDQUFDLENBQUM7UUFDakYsQ0FBQztLQUNKO0lBRUQsSUFBSSxJQUFJLENBQUMsS0FBSyxDQUFDO1NBQ1YsZ0JBQWdCLEVBQUU7U0FDbEIsUUFBUSxFQUFFO1NBQ1YsV0FBVyxFQUFFLENBQUE7SUFFbEIsSUFBSSxJQUFJLENBQUMsS0FBSyxDQUFDO1NBQ1YsZ0JBQWdCLEVBQUU7U0FDbEIsUUFBUSxFQUFFLENBQUE7QUFFbkIsQ0FBQztBQUNELFVBQVUsQ0FBQyxLQUFLLEVBQUUsSUFBSSxDQUFDLENBQUMifQ==