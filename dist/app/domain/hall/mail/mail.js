'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
class Mail {
    constructor(opts, uid) {
        this.img = opts.img;
        this.uid = uid;
        this.sender = opts.sender;
        this.type = opts.type;
        this.name = opts.name;
        this.reason = opts.reason;
        this.content = opts.content;
        this.attachment = opts.attachment || { gold: 0 };
        this.time = Date.now();
        this.isRead = false;
        this.isdelete = false;
    }
}
exports.default = Mail;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFpbC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL2FwcC9kb21haW4vaGFsbC9tYWlsL21haWwudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsWUFBWSxDQUFDOztBQUtiLE1BQXFCLElBQUk7SUFZckIsWUFBWSxJQUFJLEVBQUUsR0FBSTtRQUNsQixJQUFJLENBQUMsR0FBRyxHQUFFLElBQUksQ0FBQyxHQUFHLENBQUM7UUFDbkIsSUFBSSxDQUFDLEdBQUcsR0FBRyxHQUFHLENBQUM7UUFDZixJQUFJLENBQUMsTUFBTSxHQUFFLElBQUksQ0FBQyxNQUFNLENBQUM7UUFDekIsSUFBSSxDQUFDLElBQUksR0FBRSxJQUFJLENBQUMsSUFBSSxDQUFDO1FBQ3JCLElBQUksQ0FBQyxJQUFJLEdBQUUsSUFBSSxDQUFDLElBQUksQ0FBQztRQUNyQixJQUFJLENBQUMsTUFBTSxHQUFFLElBQUksQ0FBQyxNQUFNLENBQUM7UUFDekIsSUFBSSxDQUFDLE9BQU8sR0FBRSxJQUFJLENBQUMsT0FBTyxDQUFDO1FBQzNCLElBQUksQ0FBQyxVQUFVLEdBQUUsSUFBSSxDQUFDLFVBQVUsSUFBSSxFQUFFLElBQUksRUFBQyxDQUFDLEVBQUMsQ0FBQztRQUM5QyxJQUFJLENBQUMsSUFBSSxHQUFFLElBQUksQ0FBQyxHQUFHLEVBQUUsQ0FBQztRQUN0QixJQUFJLENBQUMsTUFBTSxHQUFFLEtBQUssQ0FBQztRQUNuQixJQUFJLENBQUMsUUFBUSxHQUFFLEtBQUssQ0FBQztJQUN6QixDQUFDO0NBQ0o7QUF6QkQsdUJBeUJDIn0=