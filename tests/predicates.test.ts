import { describe, expect, it } from "vitest";

import {
  compare,
  parsePredicate,
  PredicateParseError,
  resolveValue,
  testPredicate,
} from "@/domain/graph/predicates";

describe("parsePredicate", () => {
  it("parses the mini-DSL grafo.yaml uses", () => {
    expect(parsePredicate("Tag == 'EntratiSyndicate'")).toEqual({
      field: "Tag",
      op: "==",
      value: "EntratiSyndicate",
    });
    expect(parsePredicate("Title >= 2")).toEqual({
      field: "Title",
      op: ">=",
      value: 2,
    });
  });

  it("accepts negative integers (Title can be negative in real profiles)", () => {
    expect(parsePredicate("Title >= -2").value).toBe(-2);
  });

  it("keeps parameter placeholders unresolved", () => {
    expect(parsePredicate("Tag == '{syndicate_tag}'").value).toBe("{syndicate_tag}");
  });

  it("rejects at load time whatever does not match the grammar", () => {
    expect(() => parsePredicate("Title => 2")).toThrow(PredicateParseError);
    expect(() => parsePredicate("Tag == unquoted")).toThrow(PredicateParseError);
    expect(() => parsePredicate("")).toThrow(PredicateParseError);
  });
});

describe("compare", () => {
  it("treats a missing field as unknown, not as zero", () => {
    expect(compare(undefined, ">=", 0)).toBe(false);
    expect(compare(undefined, ">=", 2)).toBe(false);
    expect(compare(0, ">=", 0)).toBe(true);
  });

  it("does not order strings", () => {
    expect(compare("10", ">=", 9)).toBe(false);
  });
});

describe("resolveValue", () => {
  it("substitutes the parameter and converts it to a number", () => {
    expect(resolveValue("{target_rank}", { target_rank: "20" })).toBe(20);
    expect(resolveValue("{target_rank}", { target_rank: 20 })).toBe(20);
  });

  it("fails when the parameter is missing", () => {
    expect(() => resolveValue("{target_rank}", {})).toThrow(/target_rank/);
  });
});

describe("testPredicate", () => {
  it("does not blow up on a missing target", () => {
    expect(testPredicate(parsePredicate("Title >= 2"), undefined)).toBe(false);
  });
});
