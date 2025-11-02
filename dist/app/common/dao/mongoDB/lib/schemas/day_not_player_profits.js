'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
exports.day_not_player_profits = void 0;
const mongoose_1 = require("mongoose");
const schema = new mongoose_1.Schema({
    id: String,
    profits: Number,
    createTime: Number,
    uid: String,
    nickname: String,
    numLevel: Number,
    dailyFlow: Number,
    input: Number,
    nid: String,
    nextUid: String,
    superior: String,
    gameName: String,
    gameOrder: String,
    gameType: String,
    status: Number,
    error: String,
}, { versionKey: false });
exports.day_not_player_profits = (0, mongoose_1.model)("day_not_player_profits", schema, 'day_not_player_profits');
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGF5X25vdF9wbGF5ZXJfcHJvZml0cy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL2FwcC9jb21tb24vZGFvL21vbmdvREIvbGliL3NjaGVtYXMvZGF5X25vdF9wbGF5ZXJfcHJvZml0cy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxZQUFZLENBQUM7OztBQUtiLHVDQUFtRDtBQXNCbkQsTUFBTSxNQUFNLEdBQUcsSUFBSSxpQkFBTSxDQUFDO0lBQ3pCLEVBQUUsRUFBRSxNQUFNO0lBQ1YsT0FBTyxFQUFFLE1BQU07SUFDZixVQUFVLEVBQUUsTUFBTTtJQUNsQixHQUFHLEVBQUUsTUFBTTtJQUNYLFFBQVEsRUFBRSxNQUFNO0lBQ2hCLFFBQVEsRUFBRSxNQUFNO0lBQ2hCLFNBQVMsRUFBRSxNQUFNO0lBQ2pCLEtBQUssRUFBRSxNQUFNO0lBQ2IsR0FBRyxFQUFFLE1BQU07SUFDWCxPQUFPLEVBQUUsTUFBTTtJQUNmLFFBQVEsRUFBRSxNQUFNO0lBQ2hCLFFBQVEsRUFBRSxNQUFNO0lBQ2hCLFNBQVMsRUFBRSxNQUFNO0lBQ2pCLFFBQVEsRUFBRSxNQUFNO0lBQ2hCLE1BQU0sRUFBRSxNQUFNO0lBQ2QsS0FBSyxFQUFFLE1BQU07Q0FDYixFQUFFLEVBQUUsVUFBVSxFQUFFLEtBQUssRUFBRSxDQUFDLENBQUM7QUFFYixRQUFBLHNCQUFzQixHQUFHLElBQUEsZ0JBQUssRUFBMEIsd0JBQXdCLEVBQUUsTUFBTSxFQUFFLHdCQUF3QixDQUFDLENBQUMifQ==