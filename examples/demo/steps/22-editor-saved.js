const p = P.editor;
await p.getByRole('button', { name: 'Save' }).click();
await p.getByRole('status').waitFor();
await shot(p, 'editor-03-saved', [
  p.getByRole('row', { name: /Wireless keyboard/ }),
  p.getByRole('status'),
], { keepToasts: true });
slide({
  chapter: "editor",
  task: "Check that the item was saved",
  kicker: "EDITOR · Items",
  shot: "editor-03-saved",
  steps: ["The new item appears in the list with its stock status", "A message confirms \"Saved “…”\""],
  tip: "The message closes by itself after a few seconds.",
});
return 'ok';
