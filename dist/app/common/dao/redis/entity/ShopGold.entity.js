"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ShopGoldInRedis = void 0;
const propExclude = ["name", "dese", "price", "language", "sort", "isOpen", "gold"];
class ShopGoldInRedis {
    constructor(initPropList) {
        for (const [key, val] of Object.entries(initPropList)) {
            if (!propExclude.includes(key)) {
                continue;
            }
            this[key] = val;
        }
    }
}
exports.ShopGoldInRedis = ShopGoldInRedis;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiU2hvcEdvbGQuZW50aXR5LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vYXBwL2NvbW1vbi9kYW8vcmVkaXMvZW50aXR5L1Nob3BHb2xkLmVudGl0eS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFLQSxNQUFNLFdBQVcsR0FBRyxDQUFDLE1BQU0sRUFBRSxNQUFNLEVBQUUsT0FBTyxFQUFFLFVBQVUsRUFBRSxNQUFNLEVBQUcsUUFBUSxFQUFHLE1BQU0sQ0FBQyxDQUFDO0FBRXRGLE1BQWEsZUFBZTtJQW9CeEIsWUFBWSxZQUEyQztRQUNuRCxLQUFLLE1BQU0sQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDLElBQUksTUFBTSxDQUFDLE9BQU8sQ0FBQyxZQUFZLENBQUMsRUFBRTtZQUNuRCxJQUFJLENBQUMsV0FBVyxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsRUFBRTtnQkFDNUIsU0FBUzthQUNaO1lBQ0QsSUFBSSxDQUFDLEdBQUcsQ0FBQyxHQUFHLEdBQUcsQ0FBQztTQUNuQjtJQUNMLENBQUM7Q0FDSjtBQTVCRCwwQ0E0QkMifQ==