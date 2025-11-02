"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthRemoter = void 0;
function default_1(app) {
    return new AuthRemoter(app);
}
exports.default = default_1;
class AuthRemoter {
    constructor(app) {
        this.app = app;
    }
    async auth(username, password) {
        return true;
    }
    async privateMethod(testarg, arg2) {
    }
}
exports.AuthRemoter = AuthRemoter;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXV0aFJlbW90ZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9hcHAvc2VydmVycy9jb25uZWN0b3IvcmVtb3RlL2F1dGhSZW1vdGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUVBLG1CQUF5QixHQUFnQjtJQUNyQyxPQUFPLElBQUksV0FBVyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0FBQ2hDLENBQUM7QUFGRCw0QkFFQztBQWFELE1BQWEsV0FBVztJQUNwQixZQUFvQixHQUFnQjtRQUFoQixRQUFHLEdBQUgsR0FBRyxDQUFhO0lBRXBDLENBQUM7SUFPTSxLQUFLLENBQUMsSUFBSSxDQUFDLFFBQWdCLEVBQUcsUUFBZ0I7UUFDakQsT0FBTyxJQUFJLENBQUM7SUFDaEIsQ0FBQztJQUdPLEtBQUssQ0FBQyxhQUFhLENBQUMsT0FBYyxFQUFDLElBQVc7SUFFdEQsQ0FBQztDQUNKO0FBbEJELGtDQWtCQyJ9