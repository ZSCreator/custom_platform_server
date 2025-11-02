class tpRoom {
}
;
;
class GameManger {
    constructor() {
        this.kinds = [];
        this.sceneList = [];
        this.kinds.push({ kind: 0, platform: "000", update_time: 0, playerList: [] });
    }
    add_pl(uid, platform) {
        for (let kind_data of this.kinds) {
            if (kind_data.kind == 0)
                continue;
            if (kind_data.platform == platform) {
                return kind_data.kind;
            }
        }
        for (let kind_data of this.kinds) {
            if (kind_data.kind == 0)
                continue;
            if (kind_data.update_time >= 10 * 60 * 1000 && kind_data.playerList.length == 0) {
                kind_data.platform = platform;
                kind_data.update_time = new Date().getDate();
                kind_data.playerList.push(uid);
                return kind_data.kind;
            }
        }
        return this.kinds[0].kind;
    }
    dell_ap(uid, kind) {
        for (let kind_data of this.kinds) {
            if (kind_data.kind == kind) {
            }
        }
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBwLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vdG9vbHMvdG9tL2FwcC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFNQSxNQUFNLE1BQU07Q0FHWDtBQUFBLENBQUM7QUFRRCxDQUFDO0FBS0YsTUFBTSxVQUFVO0lBVVo7UUFUQSxVQUFLLEdBT0ssRUFBRSxDQUFDO1FBQ2IsY0FBUyxHQUFnQixFQUFFLENBQUM7UUFFeEIsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsRUFBRSxJQUFJLEVBQUUsQ0FBQyxFQUFFLFFBQVEsRUFBRSxLQUFLLEVBQUUsV0FBVyxFQUFFLENBQUMsRUFBRSxVQUFVLEVBQUUsRUFBRSxFQUFFLENBQUMsQ0FBQztJQUNsRixDQUFDO0lBRUQsTUFBTSxDQUFDLEdBQVcsRUFBRSxRQUFnQjtRQUNoQyxLQUFLLElBQUksU0FBUyxJQUFJLElBQUksQ0FBQyxLQUFLLEVBQUU7WUFDOUIsSUFBSSxTQUFTLENBQUMsSUFBSSxJQUFJLENBQUM7Z0JBQUUsU0FBUztZQUNsQyxJQUFJLFNBQVMsQ0FBQyxRQUFRLElBQUksUUFBUSxFQUFFO2dCQUNoQyxPQUFPLFNBQVMsQ0FBQyxJQUFJLENBQUM7YUFDekI7U0FDSjtRQUNELEtBQUssSUFBSSxTQUFTLElBQUksSUFBSSxDQUFDLEtBQUssRUFBRTtZQUM5QixJQUFJLFNBQVMsQ0FBQyxJQUFJLElBQUksQ0FBQztnQkFBRSxTQUFTO1lBQ2xDLElBQUksU0FBUyxDQUFDLFdBQVcsSUFBSSxFQUFFLEdBQUcsRUFBRSxHQUFHLElBQUksSUFBSSxTQUFTLENBQUMsVUFBVSxDQUFDLE1BQU0sSUFBSSxDQUFDLEVBQUU7Z0JBQzdFLFNBQVMsQ0FBQyxRQUFRLEdBQUcsUUFBUSxDQUFDO2dCQUM5QixTQUFTLENBQUMsV0FBVyxHQUFHLElBQUksSUFBSSxFQUFFLENBQUMsT0FBTyxFQUFFLENBQUM7Z0JBQzdDLFNBQVMsQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDO2dCQUMvQixPQUFPLFNBQVMsQ0FBQyxJQUFJLENBQUM7YUFDekI7U0FDSjtRQUNELE9BQU8sSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUM7SUFDOUIsQ0FBQztJQUVELE9BQU8sQ0FBQyxHQUFXLEVBQUUsSUFBWTtRQUM3QixLQUFLLElBQUksU0FBUyxJQUFJLElBQUksQ0FBQyxLQUFLLEVBQUU7WUFFOUIsSUFBSSxTQUFTLENBQUMsSUFBSSxJQUFJLElBQUksRUFBRTthQUUzQjtTQUNKO0lBQ0wsQ0FBQztDQUVKIn0=