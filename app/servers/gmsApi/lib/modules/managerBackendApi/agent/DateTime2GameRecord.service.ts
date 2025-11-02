import * as moment from "moment";
import SumTenantOperationalDataMsyqlDao from "../../../../../../common/dao/mysql/SumTenantOperationalData.mysql.dao";

/**
 * 将指定日期区间按月份分割
 * @param {string} beginDate 开始日期
 * @param {string} endDate 结束日期
 * @return {Array} 分割好的array数组
 * 
 * 执行 
 *      console.log(dateCutByMonth("2021-05-15 20:00:00", "2021-07-01 20:04:00"))
 * 结果
 * [
 *  [ '2021-05-15 20:00:00', '2021-5-31' ],
 *   [ '2021-6-1', '2021-6-30' ],
 *   [ '2021-7-1', '2021-07-01 20:04:00' ]
 *  ]
 * 
 */

export class DateTime2GameRecordService {
    /**
     * 拆分日期
     * @description 二维数组:第一个表示昨日之前，第二个数组表示今日时间
     * @description 汇总表
     */
    async breakUpDate(startTimestamp: number = null, endTimestamp: number = null): Promise<Array<Array<string>>> {

        // 只查询今日
        if (startTimestamp === null && endTimestamp === null) {
            const startDateTime = moment().format("YYYY-MM-DD 00:00:00");
            const endDateTime = moment().format("YYYY-MM-DD 23:59:59");
            return [[], [startDateTime, endDateTime]];
        }

        if(moment(startTimestamp).format("YYYY-MM-DD HH:mm:ss") >= moment().format("YYYY-MM-DD 00:00:00") && moment(endTimestamp).format("YYYY-MM-DD HH:mm:ss") <= moment().format("YYYY-MM-DD 23:59:59")){
            const startDateTime = moment(startTimestamp).format("YYYY-MM-DD HH:mm:ss");
            const endDateTime = moment(endTimestamp).format("YYYY-MM-DD HH:mm:ss");
            return [[], [startDateTime, endDateTime]];
        }
        // 只查询昨日之前(含昨日)
        if (moment(endTimestamp).format("YYYY-MM-DD HH:mm:ss") < moment().format("YYYY-MM-DD HH:mm:ss")) {
            const startDateTime = moment(startTimestamp).format("YYYY-MM-DD HH:mm:ss");
            const endDateTime = moment(endTimestamp).format("YYYY-MM-DD HH:mm:ss");
            return [[startDateTime, endDateTime], []];
        }


        // 如果查询包含了今日 + 昨日之前的
        if (moment(endTimestamp).format("YYYY-MM-DD HH:mm:ss") > moment().format("YYYY-MM-DD HH:mm:ss") &&  moment(startTimestamp).format("YYYY-MM-DD HH:mm:ss") < moment().format("YYYY-MM-DD 00:00:00")) {
            const startDateTime = moment(startTimestamp).format("YYYY-MM-DD 00:00:00");
            const endDateTime = moment().subtract(1,'d').format("YYYY-MM-DD 23:59:59");
            const todayStartDateTime = moment().format("YYYY-MM-DD 00:00:00");
            const todayEndDateTime = moment(endTimestamp).format("YYYY-MM-DD 23:59:59");
            return [[startDateTime, endDateTime], [todayStartDateTime, todayEndDateTime]];
        }

        return [[], []];

    }



    /**
     * 拆分日期      比如： 2021-10-01 10:00:00  ---- 2021-10-05 18:00:00
     * 那么就需要将开始的第一天 和最后一天时间拆分
     * @description 二维数组:第一个表示昨日之前，第二个数组表示今日时间
     * [[ 2021-10-01 10:00:00 ,  2021-10-01 23:59:59:999],[2021-10-02 00:00:00,2021-10-05 00:00:00],[2021-10-05 00:00:00 ,2021-10-05 18:00:00 ]]
     * @description 汇总表
     */
    async newBreakUpDate(startTimestamp: number = null, endTimestamp: number = null): Promise<Array<Array<string>>> {

        // 只查询今日
        if (startTimestamp === null && endTimestamp === null) {
            const startDateTime = moment().format("YYYY-MM-DD 00:00:00");
            const endDateTime = moment().format("YYYY-MM-DD 23:59:59");
            return [[],[],[startDateTime, endDateTime]];
        }

        if(moment(startTimestamp).format("YYYY-MM-DD HH:mm:ss") >= moment().format("YYYY-MM-DD 00:00:00") && moment(endTimestamp).format("YYYY-MM-DD HH:mm:ss") <= moment().format("YYYY-MM-DD 23:59:59")){
            const startDateTime = moment(startTimestamp).format("YYYY-MM-DD HH:mm:ss");
            const endDateTime = moment(endTimestamp).format("YYYY-MM-DD HH:mm:ss");
            return [[], [],[startDateTime, endDateTime]];
        }
        // 只查询昨日之前(含昨日),如果查询日期，开始时一天的中间，比如：  2021-10-01 10:00:00 ， 结束时 也是一天的中间： 2021-10-05 18:00:00
        const endTime = moment(endTimestamp).format("YYYY-MM-DD HH:mm:ss");
        const startTime = moment(startTimestamp).format("YYYY-MM-DD HH:mm:ss");
        //判断开始时间和结束时间是否是每天的00：00：00 ,和每日的结束 , 如果结束时间包含当日因为没有进行扎帐结算,所以要把当天独立查询游戏记录表
        if(startTime == moment(startTimestamp).format("YYYY-MM-DD 00:00:00")){
            if(endTime == moment(endTimestamp).format("YYYY-MM-DD 23:59:59") && endTime == moment().format("YYYY-MM-DD 23:59:59")){
                let endSubtract = moment(endTimestamp).subtract(1,'days').format("YYYY-MM-DD 23:59:59");
                let startTodayTime = moment(endTimestamp).format("YYYY-MM-DD 00:00:00");
                return [[], [startTime,endSubtract],[startTodayTime , endTime]];
            }else if(endTime < moment(endTimestamp).format("YYYY-MM-DD 23:59:59")){
                let endSubtract = moment(endTimestamp).subtract(1,'days').format("YYYY-MM-DD 23:59:59");
                let startTodayTime = moment(endTimestamp).format("YYYY-MM-DD 00:00:00");
                return [[], [startTime,endSubtract],[startTodayTime , endTime]];
            }else {
                return [[], [startTime,endTime],[]];
            }
        }

        //判断开始时间是否是一天的中间
        let list = [[],[],[]];
        if(startTime > moment(startTimestamp).format("YYYY-MM-DD 00:00:00")){
            let startList = [ startTime ,  moment(startTime).format("YYYY-MM-DD 23:59:59:999")];
            list[0] = startList;
        }
        //判断结束时间是否是一天的中间
        if(endTime <  moment(endTimestamp).format("YYYY-MM-DD 23:59:59") ){
            let endList = [ moment(endTime).format("YYYY-MM-DD 00:00:00")  , endTime];
            list[2] = endList;
        }else if(endTime == moment().format("YYYY-MM-DD 23:59:59")){  // 如果结束时间包含当日因为没有进行扎帐结算,所以要把当天独立查询游戏记录表
            let endList = [ moment().format("YYYY-MM-DD 00:00:00")  , endTime];
            list[2] = endList;
        }

        let middleList = [];

        // 如果开始一天的时间在中间同时结束时间也是在一天的中间  定义开始时间和结束时间是否是在凌晨00：00：00
        if(startTime > moment(startTimestamp).format("YYYY-MM-DD 00:00:00")){
            middleList[0] = moment(startTimestamp).add(1,'days').format("YYYY-MM-DD 00:00:00");
        }else {
            middleList[0] = startTime;
        }


        if(endTime == moment(endTimestamp).format("YYYY-MM-DD 23:59:59") && endTime != moment().format("YYYY-MM-DD 23:59:59")){
            middleList[1] = endTime;
        }else {
            middleList[1] = moment(endTimestamp).subtract(1,'days').format("YYYY-MM-DD 23:59:59") ;
        }
        list[1] = middleList;
        return list;

    }


}

export default new DateTime2GameRecordService();
