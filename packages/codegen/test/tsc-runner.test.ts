import { test } from "node:test";
import assert from "node:assert/strict";
import { parseTscOutput, findingsForComponent } from "../src/tsc-runner";

const SAMPLE = [
  "src/components/button/Button.tsx(12,5): error TS2322: Type 'string' is not assignable to type 'number'.",
  "src/components/button/Button.stories.tsx(4,3): error TS2554: Expected 1 arguments, but got 0.",
  "src/icons/plus/Plus.tsx(3,1): error TS1005: ';' expected.",
  "src/components/chip/Chip.tsx(9,9): error TS2304: Cannot find name 'foo'.",
  "",
].join("\n");

test("parseTscOutput extracts file, line, and the TS message", () => {
  const errs = parseTscOutput(SAMPLE);
  assert.equal(errs.length, 4);
  assert.deepEqual(errs[0], {
    file: "src/components/button/Button.tsx",
    line: 12,
    message: "error TS2322: Type 'string' is not assignable to type 'number'.",
  });
});

test("findingsForComponent scopes to the component's dir and drops siblings", () => {
  const errs = parseTscOutput(SAMPLE);
  const button = findingsForComponent(errs, "button", false);
  assert.equal(button.length, 2); // Button.tsx + Button.stories.tsx, NOT chip, NOT plus
  assert.ok(button.every((f) => f.file.startsWith("src/components/button/")));
});

test("findingsForComponent uses the icons dir when isIcon", () => {
  const errs = parseTscOutput(SAMPLE);
  assert.equal(findingsForComponent(errs, "plus", true).length, 1);
  assert.equal(findingsForComponent(errs, "plus", false).length, 0); // wrong dir → none
});
