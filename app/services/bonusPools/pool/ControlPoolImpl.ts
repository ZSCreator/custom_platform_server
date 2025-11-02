import {ControlPoolAbstract} from '../bean/ControlPoolAbstract';
import {PoolImpl} from "./PoolImpl";
import {fixNoRound} from "../../../utils/lottery/commonUtil";

/**
 * 调控池
 */
export class ControlPoolImpl extends ControlPoolAbstract {

  pool: PoolImpl;

  amount: number = 0;

  constructor(instance: PoolImpl) {
    super();
    this.pool = instance;
    this.amount = 0;
  }

  addControlPoolAmount(_amount: number) {
    this.amount += _amount;
    this.amount = fixNoRound(this.amount, 2);
  }

}
