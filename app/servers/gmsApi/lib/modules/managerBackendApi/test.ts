import * as moment from "moment";
/**
 * 将指定日期区间按月份分割
 * @param {Object} beginDate 开始日期
 * @param {Object} endDate 结束日期
 * @return {Array} 分割好的array数组
 */
function dateCutByMonth(beginDate, endDate) {

    //分割好的数组
    var dateCutList = new Array();

    var b_date = new Date(beginDate);
    var e_date = new Date(endDate);
    //获取各个的年份
    var b_year = b_date.getFullYear();
    var e_year = e_date.getFullYear();
    //获取各个的月份
    var b_month = b_date.getMonth() + 1;
    var e_month = e_date.getMonth() + 1;

    //获取日期之间想差的月数；
    var month_list = monthList();

    //按月份分割日期
    for (var i = 0; i < month_list.length; i++) {
        //当前月开始日期：第一天
        var i_b_date = new Date(month_list[i]);
        i_b_date.setDate(1);
        //当前月最后一天
        var i_e_date = new Date(month_list[i]);
        i_e_date.setMonth(i_e_date.getMonth() + 1);
        i_e_date.setDate(1);
        i_e_date.setDate(i_e_date.getDate() - 1);

        //第一次循环：开始月份
        if (i == 0) {
            var i_e_ymd = dateToString(i_e_date);
            dateCutList.push([beginDate, i_e_ymd]);

            //除第一次和最后一次循环：中间月份	
        } else if (i != 0 && i != month_list.length - 1) {
            var i_b_ymd = dateToString(i_b_date);
            var i_e_ymd = dateToString(i_e_date);
            dateCutList.push([i_b_ymd, i_e_ymd]);

            //最后一次循环：结束月份
        } else if (i == month_list.length - 1) {
            var i_b_ymd = dateToString(i_b_date);
            dateCutList.push([i_b_ymd, endDate]);
        }
    }
    return dateCutList;

    //---------------------------------------------------------------------------------------------------
    //-------------------------------以下为工具函数-------------------------------------------------------
    //---------------------------------------------------------------------------------------------------

    /**
     * 获取日期区间的月份集合
     */
    function monthList() {

        //相差的月份总数
        var result = new Array();

        var b = new Date(b_year, b_month - 1, 1);
        var e = new Date(e_year, e_month - 1, 1);
        while (b < e) {
            result.push(b.getFullYear() + "-" + (b.getMonth() + 1));
            b.setMonth(b.getMonth() + 1);
        }
        result.push(e_year + "-" + e_month);
        return result;
    }

    /**
     * 将日期转换为指定格式的字符串
     * @param {Date} date 要转换的日期
     */
    function dateToString(date) {
        return date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate();
    }
}


// console.log(dateCutByMonth("2021-06-01 00:00:00", "2021-07-01 20:04:00"))

console.log(moment(`2021-06-30 00:00:00`).add(1, "days").format("YYYY-MM-DD HH:mm:ss"))