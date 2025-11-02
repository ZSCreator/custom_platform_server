"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const typeorm_1 = require("typeorm");
class DBConnection {
    init(config) {
        if (config.length <= 0) {
            throw new Error('mysql 配置异常');
        }
        this.master = config[0].name;
        this.slaves = config.filter(c => c.name !== this.master).map(c => c.name);
        this.next = 0;
    }
    getConnection(secondary = false) {
        if (!secondary || this.slaves.length === 0) {
            return (0, typeorm_1.getConnection)(this.master);
        }
        const connection = (0, typeorm_1.getConnection)(this.slaves[this.next]);
        this.next += 1;
        if (this.next > (this.slaves.length - 1)) {
            this.next = 0;
        }
        return connection;
    }
    getRepository(entityClass) {
        return (0, typeorm_1.getRepository)(entityClass, this.master);
    }
    getManager() {
        return (0, typeorm_1.getManager)(this.master);
    }
}
exports.default = new DBConnection();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29ubmVjdGlvbk1hbmFnZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9hcHAvY29tbW9uL2Rhby9teXNxbC9saWIvY29ubmVjdGlvbk1hbmFnZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSxxQ0FBaUU7QUFjakUsTUFBTSxZQUFZO0lBS2QsSUFBSSxDQUFDLE1BQXFCO1FBQ3RCLElBQUksTUFBTSxDQUFDLE1BQU0sSUFBSSxDQUFDLEVBQUU7WUFDcEIsTUFBTSxJQUFJLEtBQUssQ0FBQyxZQUFZLENBQUMsQ0FBQztTQUNqQztRQUdELElBQUksQ0FBQyxNQUFNLEdBQUcsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQztRQUU3QixJQUFJLENBQUMsTUFBTSxHQUFHLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsSUFBSSxLQUFLLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUM7UUFHMUUsSUFBSSxDQUFDLElBQUksR0FBRyxDQUFDLENBQUM7SUFDbEIsQ0FBQztJQU1ELGFBQWEsQ0FBQyxZQUFxQixLQUFLO1FBQ3BDLElBQUksQ0FBQyxTQUFTLElBQUksSUFBSSxDQUFDLE1BQU0sQ0FBQyxNQUFNLEtBQUssQ0FBQyxFQUFFO1lBQ3hDLE9BQU8sSUFBQSx1QkFBYSxFQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQztTQUNyQztRQUVELE1BQU0sVUFBVSxHQUFHLElBQUEsdUJBQWEsRUFBQyxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO1FBR3pELElBQUksQ0FBQyxJQUFJLElBQUksQ0FBQyxDQUFDO1FBRWYsSUFBSSxJQUFJLENBQUMsSUFBSSxHQUFHLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLEVBQUU7WUFDdEMsSUFBSSxDQUFDLElBQUksR0FBRyxDQUFDLENBQUM7U0FDakI7UUFFRCxPQUFPLFVBQVUsQ0FBQztJQUN0QixDQUFDO0lBTUQsYUFBYSxDQUFDLFdBQThCO1FBQ3hDLE9BQU8sSUFBQSx1QkFBYSxFQUFDLFdBQVcsRUFBRSxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7SUFDbkQsQ0FBQztJQUtELFVBQVU7UUFDTixPQUFPLElBQUEsb0JBQVUsRUFBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7SUFDbkMsQ0FBQztDQUNKO0FBRUQsa0JBQWUsSUFBSSxZQUFZLEVBQUUsQ0FBQyJ9