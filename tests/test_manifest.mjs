// Regression test for replay's manifest sync (bugs 2 and 3): wording comes from the step files, order follows them.
//   node tests/test_manifest.mjs        (no Playwright needed)
import assert from 'assert';
import { mkdtempSync, readFileSync, writeFileSync, existsSync, rmSync } from 'fs';
import { tmpdir } from 'os';
import path from 'path';
import { planSync, syncManifest, upsertSlide, readManifest } from '../plugin/skills/mslides/scripts/manifest.mjs';

const e = (shot, extra = {}) => ({ chapter: 'c', task: shot, kicker: 'K', shot, steps: ['a'], ...extra });
const dir = mkdtempSync(path.join(tmpdir(), 'mslides-manifest-'));
const file = path.join(dir, 'manifest.json');
try {
  // Bug 3: "PO detail" was captured before "PO list"; the step files run list first.
  writeFileSync(file, JSON.stringify([e('po-detail'), e('po-list'), e('hand-added')]));
  const produced = [e('po-list', { steps: ['new wording'] }), e('po-detail')];
  let r = syncManifest(file, produced);
  assert.deepStrictEqual(readManifest(file).map((x) => x.shot), ['po-list', 'po-detail', 'hand-added'], 'step-file order, hand-added last');
  assert.deepStrictEqual(r.orphans, ['hand-added']);
  assert.deepStrictEqual(r.moved.sort(), ['po-detail', 'po-list']);
  // Bug 2: wording from slide() reaches the manifest, and the old file is kept.
  assert.deepStrictEqual(readManifest(file)[0].steps, ['new wording']);
  assert.deepStrictEqual(r.changes.map((c) => [c.shot, c.kind, c.keys.join()]), [['po-list', 'changed', 'steps']]);
  assert.ok(existsSync(file + '.bak'), 'manifest.json.bak missing');
  assert.deepStrictEqual(JSON.parse(readFileSync(file + '.bak', 'utf8')).map((x) => x.shot), ['po-detail', 'po-list', 'hand-added']);
  // Idempotent: a second identical replay changes nothing.
  r = syncManifest(file, produced);
  assert.strictEqual(r.wrote, false);
  // A step that calls slide() twice for one shot: the last call wins, one entry.
  r = planSync([], [e('x', { tip: 'first' }), e('x', { tip: 'second' })]);
  assert.deepStrictEqual(r.merged.map((x) => x.tip), ['second']);
  // New slide.
  r = planSync([e('a')], [e('a'), e('b')]);
  assert.deepStrictEqual(r.changes, [{ shot: 'b', kind: 'new', keys: Object.keys(e('b')) }]);
  // --only run (full: false): upsert in place, never reorder, never report orphans.
  r = planSync([e('b'), e('a'), e('c')], [e('a', { tip: 't' })], { full: false });
  assert.deepStrictEqual(r.merged.map((x) => x.shot), ['b', 'a', 'c']);
  assert.strictEqual(r.merged[1].tip, 't');
  assert.deepStrictEqual(r.orphans, []);
  // repl.mjs path: upsert by shot, append when new.
  assert.strictEqual(upsertSlide(file, e('po-list', { tip: 'x' })), 3);
  assert.strictEqual(upsertSlide(file, e('fresh')), 4);
  assert.strictEqual(readManifest(file)[0].tip, 'x');
  console.log('manifest sync ok');
} finally {
  rmSync(dir, { recursive: true, force: true });
}
