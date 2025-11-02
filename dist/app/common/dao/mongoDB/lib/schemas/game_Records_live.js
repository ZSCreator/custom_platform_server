'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
exports.game_Records_live = void 0;
const mongoose_1 = require("mongoose");
const schema = new mongoose_1.Schema({
    nid: String,
    uid: String,
    gameName: String,
    createTime: Number,
    result: [],
}, { versionKey: false });
exports.game_Records_live = (0, mongoose_1.model)("game_Records_live", schema, 'game_Records_live');
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2FtZV9SZWNvcmRzX2xpdmUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi9hcHAvY29tbW9uL2Rhby9tb25nb0RCL2xpYi9zY2hlbWFzL2dhbWVfUmVjb3Jkc19saXZlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLFlBQVksQ0FBQzs7O0FBQ2IsdUNBQW1EO0FBU25ELE1BQU0sTUFBTSxHQUFHLElBQUksaUJBQU0sQ0FBQztJQUN0QixHQUFHLEVBQUUsTUFBTTtJQUNYLEdBQUcsRUFBRSxNQUFNO0lBQ1gsUUFBUSxFQUFFLE1BQU07SUFDaEIsVUFBVSxFQUFFLE1BQU07SUFDbEIsTUFBTSxFQUFFLEVBQUU7Q0FDYixFQUFFLEVBQUUsVUFBVSxFQUFFLEtBQUssRUFBRSxDQUFDLENBQUM7QUFFYixRQUFBLGlCQUFpQixHQUFHLElBQUEsZ0JBQUssRUFBcUIsbUJBQW1CLEVBQUUsTUFBTSxFQUFFLG1CQUFtQixDQUFDLENBQUMifQ==