"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.array_delete_array = void 0;
function array_delete_array(a, b) {
    for (let key of a) {
        const index = b.indexOf(key);
        if (index > -1) {
            b.splice(index, 1);
        }
    }
    return b;
}
exports.array_delete_array = array_delete_array;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUnVtbXlJbmRleC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL2FwcC9zZXJ2ZXJzL1J1bW15L2xpYi91bnRpbHMvUnVtbXlJbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFLQSxTQUFnQixrQkFBa0IsQ0FBQyxDQUFZLEVBQUUsQ0FBWTtJQUN6RCxLQUFJLElBQUksR0FBRyxJQUFJLENBQUMsRUFBQztRQUNiLE1BQU0sS0FBSyxHQUFHLENBQUMsQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLENBQUM7UUFDN0IsSUFBRyxLQUFLLEdBQUcsQ0FBQyxDQUFDLEVBQUM7WUFDVixDQUFDLENBQUMsTUFBTSxDQUFDLEtBQUssRUFBQyxDQUFDLENBQUMsQ0FBQztTQUNyQjtLQUNKO0lBQ0QsT0FBTyxDQUFDLENBQUM7QUFDYixDQUFDO0FBUkQsZ0RBUUMifQ==