"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createAt = void 0;
const createAt = function (schema, options) {
    schema.add({ createAt: { type: Date, default: Date.now } });
    schema.pre('save', function (next) {
        if (!this.isNew && this.isModified('createAt'))
            delete this.createAt;
        next();
    });
    if (options && options.index) {
        schema.path('createAt').index(options.index);
    }
};
exports.createAt = createAt;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY3JlYXRlQXQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi9hcHAvY29tbW9uL2Rhby9tb25nb0RCL2xpYi9wbHVnaW5zL2NyZWF0ZUF0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUFPLE1BQU8sUUFBUSxHQUFHLFVBQVMsTUFBTSxFQUFFLE9BQU87SUFDN0MsTUFBTSxDQUFDLEdBQUcsQ0FBQyxFQUFDLFFBQVEsRUFBRSxFQUFDLElBQUksRUFBRSxJQUFJLEVBQUUsT0FBTyxFQUFFLElBQUksQ0FBQyxHQUFHLEVBQUMsRUFBQyxDQUFDLENBQUM7SUFFeEQsTUFBTSxDQUFDLEdBQUcsQ0FBQyxNQUFNLEVBQUUsVUFBUyxJQUFJO1FBQzVCLElBQUksQ0FBQyxJQUFJLENBQUMsS0FBSyxJQUFJLElBQUksQ0FBQyxVQUFVLENBQUMsVUFBVSxDQUFDO1lBQzFDLE9BQU8sSUFBSSxDQUFDLFFBQVEsQ0FBQztRQUN6QixJQUFJLEVBQUUsQ0FBQztJQUNYLENBQUMsQ0FBQyxDQUFDO0lBRUgsSUFBSSxPQUFPLElBQUksT0FBTyxDQUFDLEtBQUssRUFBRTtRQUMxQixNQUFNLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLENBQUM7S0FDaEQ7QUFDTCxDQUFDLENBQUM7QUFaWSxRQUFBLFFBQVEsWUFZcEIifQ==