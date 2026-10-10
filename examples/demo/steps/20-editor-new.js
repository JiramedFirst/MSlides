// Editor: create an item. Record names are realistic but obviously sample data.
const p = P.editor ??= await session('editor');
await p.getByRole('table').waitFor();
await shot(p, 'editor-01-new', [
  p.getByRole('heading', { name: 'Items' }),
  p.getByRole('link', { name: 'New item' }),
]);
slide({
  chapter: "editor",
  task: "Start a new item",
  kicker: "EDITOR · Items",
  shot: "editor-01-new",
  steps: ["Go to the \"Items\" list", "Click \"New item\""],
  tip: "Only Editors see the \"New item\" button.",
});
return 'ok';
