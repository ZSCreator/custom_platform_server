"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.lastMod = void 0;
const lastMod = function (schema, options) {
    schema.add({ lastMod: Date });
    schema.pre('save', function (next) {
        let modifiedPaths = this.modifiedPaths();
        if ((modifiedPaths.length > 1)
            || (modifiedPaths.length == 1 && modifiedPaths[0] != "lastMod")) {
            this.lastMod = new Date;
        }
        next();
    });
    if (options && options.index) {
        schema.path('lastMod').index(options.index);
    }
};
exports.lastMod = lastMod;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGFzdE1vZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL2FwcC9jb21tb24vZGFvL21vbmdvREIvbGliL3BsdWdpbnMvbGFzdE1vZC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBTyxNQUFNLE9BQU8sR0FBRyxVQUFTLE1BQU0sRUFBRSxPQUFPO0lBQzNDLE1BQU0sQ0FBQyxHQUFHLENBQUMsRUFBQyxPQUFPLEVBQUUsSUFBSSxFQUFDLENBQUMsQ0FBQztJQUU1QixNQUFNLENBQUMsR0FBRyxDQUFDLE1BQU0sRUFBRSxVQUFTLElBQUk7UUFDNUIsSUFBSSxhQUFhLEdBQUcsSUFBSSxDQUFDLGFBQWEsRUFBRSxDQUFDO1FBQ3pDLElBQUksQ0FBQyxhQUFhLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQztlQUN2QixDQUFDLGFBQWEsQ0FBQyxNQUFNLElBQUksQ0FBQyxJQUFJLGFBQWEsQ0FBQyxDQUFDLENBQUMsSUFBSSxTQUFTLENBQUMsRUFBRTtZQUNqRSxJQUFJLENBQUMsT0FBTyxHQUFHLElBQUksSUFBSSxDQUFDO1NBQzNCO1FBQ0QsSUFBSSxFQUFFLENBQUM7SUFDWCxDQUFDLENBQUMsQ0FBQztJQUVILElBQUksT0FBTyxJQUFJLE9BQU8sQ0FBQyxLQUFLLEVBQUU7UUFDMUIsTUFBTSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFDO0tBQy9DO0FBQ0wsQ0FBQyxDQUFDO0FBZlcsUUFBQSxPQUFPLFdBZWxCIn0=