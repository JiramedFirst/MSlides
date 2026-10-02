// Editor: create an item. Record names are realistic but obviously sample data.
const p = P.editor ??= await session('editor');
await p.getByRole('table').waitFor();
await shot(p, 'editor-01-new', [
  p.getByRole('heading', { name: 'Items' }),
  p.getByRole('link', { name: 'New item' }),
]);
return 'ok';
