// Viewer: the item list. Sessions live on P so later steps reuse the same logged-in page.
const p = P.viewer ??= await session('viewer');
await p.getByRole('table').waitFor();
await shot(p, 'viewer-01-list', [
  p.locator('header.bar'),  // the whole top bar, so the crop keeps the app name instead of slicing it
  p.locator('.toolbar'),
  p.getByRole('table'),
]);
return 'ok';
