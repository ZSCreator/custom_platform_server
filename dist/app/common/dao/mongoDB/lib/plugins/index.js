'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
exports.plugins = void 0;
const createAt_1 = require("./createAt");
const lastMod_1 = require("./lastMod");
const plugins = function (schema, options) {
    schema.plugin(createAt_1.createAt, options);
    schema.plugin(lastMod_1.lastMod, options);
};
exports.plugins = plugins;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi9hcHAvY29tbW9uL2Rhby9tb25nb0RCL2xpYi9wbHVnaW5zL2luZGV4LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLFlBQVksQ0FBQzs7O0FBRWIseUNBQW9DO0FBQ3BDLHVDQUFrQztBQUUzQixNQUFNLE9BQU8sR0FBRyxVQUFTLE1BQU0sRUFBRSxPQUFPO0lBQzlDLE1BQU0sQ0FBQyxNQUFNLENBQUMsbUJBQVEsRUFBRSxPQUFPLENBQUMsQ0FBQztJQUNqQyxNQUFNLENBQUMsTUFBTSxDQUFDLGlCQUFPLEVBQUUsT0FBTyxDQUFDLENBQUM7QUFDakMsQ0FBQyxDQUFDO0FBSFcsUUFBQSxPQUFPLFdBR2xCIn0=