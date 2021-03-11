import * as Expressions from "../abap/2_statements/expressions";
import {Issue} from "../issue";
import {ABAPRule} from "./_abap_rule";
import {BasicRuleConfig} from "./_basic_rule_config";
import {IRuleMetadata, RuleTag} from "./_irule";
import {ABAPFile} from "../abap/abap_file";
import {ExpressionNode} from "../abap/nodes";

export class NoYodaConditionsConf extends BasicRuleConfig {
}

export class NoYodaConditions extends ABAPRule {

  private conf = new NoYodaConditionsConf();

  public getMetadata(): IRuleMetadata {
    return {
      key: "no_yoda_conditions",
      title: "No Yoda conditions",
      shortDescription: `Finds Yoda conditions and reports issues`,
      extendedInformation: `
https://en.wikipedia.org/wiki/Yoda_conditions`,
      tags: [RuleTag.SingleFile],
      badExample: `IF 0 <> sy-subrc.
ENDIF.`,
      goodExample: `IF sy-subrc <> 0.
ENDIF.`,
    };
  }

  public getConfig() {
    return this.conf;
  }

  public setConfig(conf: NoYodaConditionsConf) {
    this.conf = conf;
  }

  public runParsed(file: ABAPFile) {
    const issues: Issue[] = [];

    for (const c of file.getStructure()?.findAllExpressions(Expressions.Compare) || []) {
      if (c.findDirectExpression(Expressions.CompareOperator) === undefined) {
        continue;
      }

      const sources = c.findDirectExpressions(Expressions.Source);
      if (sources.length !== 2) {
        continue;
      }

      if (this.isSimple(sources[0]) === true && this.isSimple(sources[1]) === false) {
        const start = sources[0].getFirstToken().getStart();
        const end = sources[1].getLastToken().getEnd();
        const issue = Issue.atRange(file, start, end, "No Yoda conditions", this.getMetadata().key, this.conf.severity);
        issues.push(issue);
      }
    }

    return issues;
  }

  private isSimple(node: ExpressionNode): boolean {
    const children = node.getChildren();
    if (children.length > 1) {
      return false;
    } else if (children.length === 1 && children[0].countTokens() === 1) {
      return true;
    }

    return false;
  }

}
