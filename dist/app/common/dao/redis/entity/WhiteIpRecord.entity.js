"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WhiteIpRecordInRedis = void 0;
const propExclude = ["createTime", "ip", "account", "id"];
class WhiteIpRecordInRedis {
    constructor(initPropList) {
        for (const [key, val] of Object.entries(initPropList)) {
            if (!propExclude.includes(key)) {
                continue;
            }
            this[key] = val;
        }
    }
}
exports.WhiteIpRecordInRedis = WhiteIpRecordInRedis;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiV2hpdGVJcFJlY29yZC5lbnRpdHkuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9hcHAvY29tbW9uL2Rhby9yZWRpcy9lbnRpdHkvV2hpdGVJcFJlY29yZC5lbnRpdHkudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBS0EsTUFBTSxXQUFXLEdBQUcsQ0FBQyxZQUFZLEVBQUUsSUFBSSxFQUFFLFNBQVMsRUFBRSxJQUFJLENBQUMsQ0FBQztBQUUxRCxNQUFhLG9CQUFvQjtJQU83QixZQUFZLFlBQWdEO1FBQ3hELEtBQUssTUFBTSxDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUMsSUFBSSxNQUFNLENBQUMsT0FBTyxDQUFDLFlBQVksQ0FBQyxFQUFFO1lBQ25ELElBQUksQ0FBQyxXQUFXLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxFQUFFO2dCQUM1QixTQUFTO2FBQ1o7WUFDRCxJQUFJLENBQUMsR0FBRyxDQUFDLEdBQUcsR0FBRyxDQUFDO1NBQ25CO0lBQ0wsQ0FBQztDQUNKO0FBZkQsb0RBZUMifQ==