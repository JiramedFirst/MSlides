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
slide({
  chapter: "editor",
  task: "Fill in and save the item",
  kicker: "EDITOR · New item",
  shot: "editor-02-form",
  steps: ["Type the \"Name\" (**required**)", "Pick a \"Category\"", "Enter the \"Quantity\" on hand", "Click \"Save\""],
  tip: "\"Notes\" is optional — use it for a storage location or a serial number.",
});
return 'ok';
