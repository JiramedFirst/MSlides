const p = P.editor;
await p.getByRole('button', { name: 'Save' }).click();
await p.getByRole('status').waitFor();
await shot(p, 'editor-03-saved', [
  p.getByRole('row', { name: /Wireless keyboard/ }),
  p.getByRole('status'),
], { keepToasts: true });
return 'ok';
