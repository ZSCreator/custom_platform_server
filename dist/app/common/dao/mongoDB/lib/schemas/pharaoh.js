'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
exports.pharaoh = void 0;
const mongoose_1 = require("mongoose");
const schema = new mongoose_1.Schema({
    pass: String,
    reward: String,
    winNum: String,
    result: mongoose_1.SchemaTypes.Mixed,
}, { versionKey: false });
exports.pharaoh = (0, mongoose_1.model)("pharaoh", schema, 'pharaoh');
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGhhcmFvaC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL2FwcC9jb21tb24vZGFvL21vbmdvREIvbGliL3NjaGVtYXMvcGhhcmFvaC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxZQUFZLENBQUM7OztBQUtiLHVDQUFnRTtBQU9oRSxNQUFNLE1BQU0sR0FBRyxJQUFJLGlCQUFNLENBQUM7SUFDekIsSUFBSSxFQUFFLE1BQU07SUFDWixNQUFNLEVBQUUsTUFBTTtJQUNkLE1BQU0sRUFBRSxNQUFNO0lBQ2QsTUFBTSxFQUFFLHNCQUFXLENBQUMsS0FBSztDQUN6QixFQUFFLEVBQUUsVUFBVSxFQUFFLEtBQUssRUFBRSxDQUFDLENBQUM7QUFFYixRQUFBLE9BQU8sR0FBRyxJQUFBLGdCQUFLLEVBQVcsU0FBUyxFQUFFLE1BQU0sRUFBRSxTQUFTLENBQUMsQ0FBQyJ9