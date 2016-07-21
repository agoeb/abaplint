import { Statement } from "./statement";
import { Token } from "../tokens/";
import * as Combi from "../combi";
import Reuse from "./reuse";

let str = Combi.str;
let seq = Combi.seq;
let alt = Combi.alt;
let opt = Combi.opt;

export class Loop extends Statement {

  public static get_matcher(): Combi.IRunnable {
    let where = opt(seq(str("WHERE"), Reuse.where()));
    let from = seq(str("FROM"), Reuse.integer());
    return seq(str("LOOP AT"),
               Reuse.source(),
               opt(from),
               opt(seq(alt(str("INTO"), str("ASSIGNING")), Reuse.target())),
               where,
               opt(str("TRANSPORTING NO FIELDS")));
  }

  public static match(tokens: Array<Token>): Statement {
    let result = Combi.Combi.run(this.get_matcher( ), tokens, true);
    if (result === true) {
      return new Loop(tokens);
    }
    return undefined;
  }

}