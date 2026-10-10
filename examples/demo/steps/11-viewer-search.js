const p = P.viewer;
await p.getByLabel('Search').fill('desk');
await shot(p, 'viewer-02-search', [
  p.locator('.toolbar'),
  p.getByRole('row', { name: /Standing desk/ }),
]);
slide({
  chapter: "viewer",
  task: "Search for an item",
  kicker: "VIEWER · Items",
  shot: "viewer-02-search",
  steps: ["Type part of a name or a category in \"Search\" — the count updates as you type", "Only matching rows stay in the table"],
  tip: "Clear the search box to see every item again.",
});
return 'ok';
