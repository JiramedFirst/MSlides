const p = P.editor;
await p.getByRole('link', { name: 'New item' }).click();
await p.getByLabel('Name').fill('Wireless keyboard');
await p.getByLabel('Category').selectOption('hardware');
await p.getByLabel('Quantity').fill('15');
await shot(p, 'editor-02-form', [
  p.locator('#f-name'),
  p.locator('#f-category'),
  p.locator('#f-quantity'),
  p.getByRole('button', { name: 'Save' }),
]);
return 'ok';
