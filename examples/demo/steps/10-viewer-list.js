// Viewer: the item list. Sessions live on P so later steps reuse the same logged-in page.
const p = P.viewer ??= await session('viewer');
await p.getByRole('table').waitFor();
await shot(p, 'viewer-01-list', [
  p.getByRole('navigation').getByRole('link', { name: 'Items' }),
  p.locator('.toolbar'),
  p.getByRole('table'),
]);
return 'ok';
