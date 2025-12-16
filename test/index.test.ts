import { describe, expect, it } from "vitest";
import { stringToArgv } from "../index.js";

describe("Import", () => {
  it("should correctly import from named export", () => {
    expect(stringToArgv).not.toBeNull();
    expect(stringToArgv).toBeInstanceOf(Function);
    expect(stringToArgv.length).toBe(1);
  });
});

describe("Process", () => {
  function parseAndValidate(
    value: string,
    expectedResult: string[],
    tryWithSingleQuotes?: boolean
  ) {
    const results = stringToArgv(value);
    expect(results.length).toBe(expectedResult.length);
    for (let i = 0; i < results.length; ++i) {
      expect(results[i]).toEqual(expectedResult[i]);
    }
    if (tryWithSingleQuotes) {
      const expectedWithSingleQuotes = expectedResult.map((r) =>
        r.replace(/"/g, "'")
      );
      parseAndValidate(
        value.replace(/"/g, "'"),
        expectedWithSingleQuotes,
        false
      );
    }
  }

  it("an empty string should return an empty array", () => {
    parseAndValidate("", []);
  });

  it("an arguments array correctly without file and env", () => {
    parseAndValidate("-test", ["-test"]);
  });

  it("a single key", () => {
    parseAndValidate("-test", ["-test"]);
  });

  it("a single key with a value", () => {
    parseAndValidate("-test testing", ["-test", "testing"]);
  });

  it("a single key=value", () => {
    parseAndValidate("-test=testing", ["-test=testing"]);
  });

  it("a single value with quotes", () => {
    parseAndValidate('"test quotes"', ["test quotes"], true);
  });

  it("a single value with empty quotes", () => {
    parseAndValidate('""', [""], true);
  });

  it("a complex string with quotes", () => {
    parseAndValidate(
      '-testing test -valid=true --quotes "test quotes"',
      ["-testing", "test", "-valid=true", "--quotes", "test quotes"],
      true
    );
  });

  it("a complex string with empty quotes", () => {
    parseAndValidate(
      '-testing test -valid=true --quotes ""',
      ["-testing", "test", "-valid=true", "--quotes", ""],
      true
    );
  });

  it("a complex string with nested quotes", () => {
    parseAndValidate(
      '--title "Peter\'s Friends" --name \'Phil "The Power" Taylor\'',
      ["--title", "Peter's Friends", "--name", 'Phil "The Power" Taylor']
    );
  });

  it("a complex key value with quotes", () => {
    parseAndValidate("--name='Phil Taylor' --title=\"Peter's Friends\"", [
      "--name=Phil Taylor",
      "--title=Peter's Friends",
    ]);
  });

  it("a complex key value with nested quotes", () => {
    parseAndValidate("--name='Phil \"The Power\" Taylor'", [
      '--name=Phil "The Power" Taylor',
    ]);
  });

  it("nested quotes with no spaces", () => {
    parseAndValidate(
      'jake run:silent["echo 1"] --trace',
      ["jake", "run:silent[echo 1]", "--trace"],
      true
    );
  });

  it("multiple nested quotes with no spaces", () => {
    parseAndValidate(
      'jake run:silent["echo 1"]["echo 2"] --trace',
      ["jake", "run:silent[echo 1][echo 2]", "--trace"],
      true
    );
  });

  it("complex multiple nested quotes", () => {
    parseAndValidate('cli value["echo"][\'grep\']+"Peter\'s Friends"', [
      "cli",
      "value[echo][grep]+Peter's Friends",
    ]);
  });

  it("combined quotation segments", () => {
    parseAndValidate("--foo=\"bar\"'baz'", ["--foo=barbaz"]);
  });

  it("unquoted text followed by quoted text with space", () => {
    parseAndValidate('a" b"', ["a b"]);
  });
});

