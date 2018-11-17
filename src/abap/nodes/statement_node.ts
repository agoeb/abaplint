import {BasicNode} from "./_basic_node";
import {Statement} from "../statements/_statement";
import {INode} from "./_inode";
import {Position} from "../../position";
import {Token} from "../tokens/_token";
import {Pragma} from "../tokens/pragma";
import {TokenNode} from "./token_node";
import {ExpressionNode} from "./expression_node";
import {Expression} from "../combi";

export class StatementNode extends BasicNode {
  private statement: Statement;

  public constructor(statement: Statement) {
    super();
    this.statement = statement;
  }

  public get() {
    return this.statement;
  }

  public setChildren(children: INode[]): StatementNode {
    if (children.length === 0) {
      throw "statement: zero children";
    }
// commented to optimize performance
/*
    // validate child nodes
    children.forEach((c) => {
      if (!(c instanceof TokenNode || c instanceof ExpressionNode)) {
        throw "statement: not token or expression node";
      }
    });
*/
    this.children = children;

    return this;
  }

  public getStart(): Position {
    return this.getTokens()[0].getPos();
  }

  public getEnd(): Position {
    let tokens = this.getTokens();
    let last = tokens[tokens.length - 1];

    let pos = new Position(last.getPos().getRow(),
                           last.getPos().getCol() + last.getStr().length);

    return pos;
  }

  public getTokens(): Array<Token> {
    let tokens: Array<Token> = [];

    this.getChildren().forEach((c) => {
      tokens = tokens.concat(this.toTokens(c));
    });

    return tokens;
  }

  public concatTokens(): string {
    let str = "";
    let prev: Token | undefined;
    for (let token of this.getTokens()) {
      if (token instanceof Pragma) {
        continue;
      }
      if (str === "") {
        str = token.getStr();
      } else if (prev && prev.getStr().length + prev.getCol() === token.getCol()
          && prev.getRow() === token.getRow()) {
        str = str + token.getStr();
      } else {
        str = str + " " + token.getStr();
      }
      prev = token;
    }
    return str;
  }

  public getTerminator(): string {
    return this.getTokens()[this.getTokens().length - 1].getStr();
  }

  public getFirstToken(): TokenNode {
    for (let child of this.getChildren()) {
      if (child instanceof TokenNode) {
        return child;
      } else if (child instanceof ExpressionNode) {
        return child.getFirstToken();
      }
    }
    throw new Error("getFirstToken, unexpected type");
  }

  public findFirstExpression(type: new () => Expression): ExpressionNode | undefined {
    for (let child of this.getChildren()) {
      if (child.get() instanceof type) {
        return child as ExpressionNode;
      } else if (child instanceof TokenNode) {
        continue;
      } else if (child instanceof ExpressionNode) {
        let res = child.findFirstExpression(type);
        if (res) {
          return res;
        }
      } else {
        throw new Error("findFirstExpression, unexpected type");
      }
    }
    return undefined;
  }

  public findAllExpressions(type: new () => Expression): ExpressionNode[] {
    let ret: ExpressionNode[] = [];
    for (let child of this.getChildren()) {
      if (child.get() instanceof type) {
        ret.push(child as ExpressionNode);
      } else if (child instanceof TokenNode) {
        continue;
      } else if (child instanceof ExpressionNode) {
        ret = ret.concat(child.findAllExpressions(type));
      } else {
        throw new Error("findAllExpressions, unexpected type");
      }
    }
    return ret;
  }

  private toTokens(b: INode): Array<Token> {
    let tokens: Array<Token> = [];

    if (b instanceof TokenNode) {
      tokens.push((b as TokenNode).get());
    }

    b.getChildren().forEach((c) => {
      if (c instanceof TokenNode) {
        tokens.push((c as TokenNode).get());
      } else {
        tokens = tokens.concat(this.toTokens(c));
      }
    });

    return tokens;
  }
}