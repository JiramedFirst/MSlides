const p = P.viewer;
await p.getByRole('link', { name: 'Standing desk' }).click();
await p.getByRole('heading', { name: 'Item details' }).waitFor();
await shot(p, 'viewer-03-detail', [
  p.locator('.note'),
  p.locator('#f-name'),
  p.getByRole('link', { name: 'Back to items' }),
]);
return 'ok';
