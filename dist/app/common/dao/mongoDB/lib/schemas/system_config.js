'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
exports.system_config = void 0;
const mongoose_1 = require("mongoose");
const schema = new mongoose_1.Schema({
    tixianBate: Number,
    customerText: String,
    startGold: Number,
    alreadyCommissionGames: [],
    commissionSetting: {},
    wuXianConfig: {},
    nativeDomain: String,
    isReleaseWater: Boolean,
    h5GameUrl: String,
    inputGoldThan: Number,
    winGoldThan: Number,
    winAddRmb: Number,
}, { versionKey: false });
exports.system_config = (0, mongoose_1.model)("system_config", schema, 'system_config');
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3lzdGVtX2NvbmZpZy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL2FwcC9jb21tb24vZGFvL21vbmdvREIvbGliL3NjaGVtYXMvc3lzdGVtX2NvbmZpZy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxZQUFZLENBQUM7OztBQUViLHVDQUFtRDtBQWdCbkQsTUFBTSxNQUFNLEdBQUcsSUFBSSxpQkFBTSxDQUFDO0lBQ3RCLFVBQVUsRUFBRSxNQUFNO0lBQ2xCLFlBQVksRUFBRSxNQUFNO0lBQ3BCLFNBQVMsRUFBRSxNQUFNO0lBQ2pCLHNCQUFzQixFQUFFLEVBQUU7SUFDMUIsaUJBQWlCLEVBQUUsRUFBRTtJQUVyQixZQUFZLEVBQUUsRUFBRTtJQUNoQixZQUFZLEVBQUUsTUFBTTtJQUNwQixjQUFjLEVBQUUsT0FBTztJQUN2QixTQUFTLEVBQUUsTUFBTTtJQUNqQixhQUFhLEVBQUcsTUFBTTtJQUN0QixXQUFXLEVBQUcsTUFBTTtJQUNwQixTQUFTLEVBQUcsTUFBTTtDQUNyQixFQUFFLEVBQUUsVUFBVSxFQUFFLEtBQUssRUFBRSxDQUFDLENBQUM7QUFFYixRQUFBLGFBQWEsR0FBRyxJQUFBLGdCQUFLLEVBQWlCLGVBQWUsRUFBRSxNQUFNLEVBQUUsZUFBZSxDQUFDLENBQUMifQ==