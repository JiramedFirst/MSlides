const p = P.viewer;
await p.getByLabel('Search').fill('desk');
await shot(p, 'viewer-02-search', [
  p.locator('.toolbar'),
  p.getByRole('row', { name: /Standing desk/ }),
]);
return 'ok';
