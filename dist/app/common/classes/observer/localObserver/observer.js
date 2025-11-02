"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Observer = void 0;
class Observer {
    constructor(themeName) {
        this.registrants = [];
        this.idCount = 0;
        this.themeName = themeName;
    }
    addRegistrant(registrant) {
        registrant.id = this.idCount;
        this.registrants.push(registrant);
        this.idCount++;
    }
    removeRegistrant(registrant) {
        const index = this.registrants.findIndex(r => r.id === registrant.id);
        if (index !== -1) {
            this.registrants.splice(index, 1);
        }
    }
    async update() {
        this.registrants.forEach(r => r.invoke());
    }
}
exports.Observer = Observer;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoib2JzZXJ2ZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9hcHAvY29tbW9uL2NsYXNzZXMvb2JzZXJ2ZXIvbG9jYWxPYnNlcnZlci9vYnNlcnZlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFVQSxNQUFzQixRQUFRO0lBSzFCLFlBQXNCLFNBQWlCO1FBSHZDLGdCQUFXLEdBQVEsRUFBRSxDQUFDO1FBQ3RCLFlBQU8sR0FBVyxDQUFDLENBQUM7UUFHaEIsSUFBSSxDQUFDLFNBQVMsR0FBRyxTQUFTLENBQUM7SUFDL0IsQ0FBQztJQU1ELGFBQWEsQ0FBQyxVQUFhO1FBQ3ZCLFVBQVUsQ0FBQyxFQUFFLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQztRQUM3QixJQUFJLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQztRQUNsQyxJQUFJLENBQUMsT0FBTyxFQUFFLENBQUM7SUFDbkIsQ0FBQztJQU1ELGdCQUFnQixDQUFDLFVBQWE7UUFDMUIsTUFBTSxLQUFLLEdBQUcsSUFBSSxDQUFDLFdBQVcsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsRUFBRSxLQUFLLFVBQVUsQ0FBQyxFQUFFLENBQUMsQ0FBQztRQUV0RSxJQUFJLEtBQUssS0FBSyxDQUFDLENBQUMsRUFBRTtZQUNkLElBQUksQ0FBQyxXQUFXLENBQUMsTUFBTSxDQUFDLEtBQUssRUFBRSxDQUFDLENBQUMsQ0FBQztTQUNyQztJQUNMLENBQUM7SUFNRCxLQUFLLENBQUMsTUFBTTtRQUNSLElBQUksQ0FBQyxXQUFXLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLE1BQU0sRUFBRSxDQUFDLENBQUM7SUFDOUMsQ0FBQztDQUNKO0FBdENELDRCQXNDQyJ9