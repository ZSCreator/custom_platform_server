import {ProfitPoolAbstract} from '../bean/ProfitPoolAbstract';
import {PoolImpl} from "./PoolImpl";
import {fixNoRound} from "../../../utils/lottery/commonUtil";

export class ProfitPoolImpl extends ProfitPoolAbstract {

  pool: PoolImpl;

  amount: number = 0;

  constructor(instance: PoolImpl) {
    super();
    this.pool = instance;
    this.amount = 0;
  }

  addProfitPoolAmount(_amount: number) {
    this.amount += _amount;
    this.amount = fixNoRound(this.amount, 2);
  }

}
