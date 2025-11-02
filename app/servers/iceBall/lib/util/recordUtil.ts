/**
 * 构建记录需要结果
 */
export function buildRecordResult(bet: number, betLine: number, roundWindows: any[], freeSpin: boolean): string {
   // 基础押注|押注线|中奖线条数|是否是免费游戏|该类型中奖的条数/中奖金额/中奖类型/中奖赔率/乘数轨道
   const winLines: any[] = [];
   roundWindows.forEach((round, index) => {
      round.winLines.forEach(line => line.roundId = index + 1);
      winLines.push(...round.winLines)
   });
   const linesCount = winLines.length;
   const bill = [];
   let lines = '';

   winLines.forEach(line => {
      if (freeSpin) {
         bill.push(`${line.money}/${line.type}/${line.multiple}/${line.roundId}|`);
      } else {
         bill.push(`${line.money}/${line.type}/${line.multiple}|`);
      }

   });

   if (bill.length) {
      while (bill.length) {
         const first = bill[0];
         const others = bill.filter(detail => detail === first);
         lines += `${others.length}/${first}`;

         others.forEach(o => {
            const index = bill.findIndex(detail => detail === o);
            if (index !== -1) {
               bill.splice(index, 1);
            }
         })
      }
   }

   if (lines.length) lines = lines.slice(0, lines.length - 1);

   return `${bet}|${betLine}|${linesCount}|${freeSpin ? 1 : 0}|${lines}`;
}


// console.log(buildRecordResult(1, [{type: bonus, num: 2}]));
// console.log(buildLittleGameResult(1, 'copper'));
