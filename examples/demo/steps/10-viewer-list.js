// Viewer: the item list. Sessions live on P so later steps reuse the same logged-in page.
const p = P.viewer ??= await session('viewer');
await p.getByRole('table').waitFor();
await shot(p, 'viewer-01-list', [
  p.locator('header.bar'),  // the whole top bar, so the crop keeps the app name instead of slicing it
  p.locator('.toolbar'),
  p.getByRole('table'),
]);
slide({
  chapter: "viewer",
  task: "Find your way around the item list",
  kicker: "VIEWER · Items",
  shot: "viewer-01-list",
  steps: ["Open \"Items\" from the top bar", "Use \"Search\" to narrow the list", "Each row shows the **quantity** and stock status — click a name to open it"],
  tip: "\"Low stock\" means fewer than 5 left; \"Out of stock\" means none.",
});
return 'ok';
