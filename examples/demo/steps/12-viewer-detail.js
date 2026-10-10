const p = P.viewer;
await p.getByRole('link', { name: 'Standing desk' }).click();
await p.getByRole('heading', { name: 'Item details' }).waitFor();
await shot(p, 'viewer-03-detail', [
  p.locator('.note'),
  p.locator('#f-name'),
  p.getByRole('link', { name: 'Back to items' }),
]);
slide({
  chapter: "viewer",
  task: "Open an item's details",
  kicker: "VIEWER · Item details",
  shot: "viewer-03-detail",
  steps: ["The note tells you the page is **read only** for your role", "Check the item's \"Name\" and the other fields", "Click \"Back to items\" to return to the list"],
  tip: "Need a change? Ask an Editor — only Editors can save items.",
});
return 'ok';
