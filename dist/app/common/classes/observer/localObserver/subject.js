"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LocalSubject = void 0;
class LocalSubject {
    constructor(themeName) {
        this.themeName = themeName;
    }
    registration(observer) {
        return observer.addRegistrant(this);
    }
    unregister(observer) {
        return observer.removeRegistrant(this);
    }
}
exports.LocalSubject = LocalSubject;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3ViamVjdC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL2FwcC9jb21tb24vY2xhc3Nlcy9vYnNlcnZlci9sb2NhbE9ic2VydmVyL3N1YmplY3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBR0EsTUFBc0IsWUFBWTtJQUk5QixZQUFzQixTQUFpQjtRQUNuQyxJQUFJLENBQUMsU0FBUyxHQUFHLFNBQVMsQ0FBQztJQUMvQixDQUFDO0lBWUQsWUFBWSxDQUFDLFFBQXVDO1FBQ2hELE9BQU8sUUFBUSxDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUN4QyxDQUFDO0lBTUQsVUFBVSxDQUFDLFFBQXVDO1FBQzlDLE9BQU8sUUFBUSxDQUFDLGdCQUFnQixDQUFDLElBQUksQ0FBQyxDQUFDO0lBQzNDLENBQUM7Q0FDSjtBQTdCRCxvQ0E2QkMifQ==