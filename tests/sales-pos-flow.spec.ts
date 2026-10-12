import { test, expect } from '@playwright/test';

test.describe('Sales & POS Flow', () => {

  test.beforeEach(async ({ context }) => {
    await context.addCookies([
      { name: 'vanguard_user_role', value: 'SUPER_ADMIN', url: 'http://localhost:3000' },
      { name: 'vanguard_auth_session', value: 'admin@vanguard.com', url: 'http://localhost:3000' },
      { name: 'vanguard_tenant_id', value: '1300', url: 'http://localhost:3000' },
      { name: 'sb-access-token', value: 'mocked-token', url: 'http://localhost:3000' },
    ]);
  });

  test('Scenario 1: Walk-in Cash Customer Flow (Direct Counter & Fallbacks)', async ({ page }) => {
    // Navigate to Sales/POS interface
    await page.goto('/backoffice/operations?section=sales');

    // Add items to cart
    // Using a specific product code or name that might be visible, or use standard locator
    // Let's type 'Extra Virgin' in catalog search and click add
    await page.waitForLoadState('networkidle');
    const searchInput = page.getByPlaceholder('Search Items By Description, Code or Barcode...').first();
    try {
        await searchInput.waitFor({ state: 'visible', timeout: 5000 });
    } catch (e) {
        require('fs').writeFileSync('dom_output.html', await page.content());
        throw e;
    }
    await searchInput.fill('Extra Virgin');
    
    // Find the first result row and click it to add to cart
    const itemRow = page.getByText('Extra Virgin').first();
    await itemRow.click();

    // Checkout without selection (default 'Cash' payment)
    const saveButton = page.getByRole('button', { name: 'Save', exact: true });
    await saveButton.click();

    // We can verify it appears in the Preview Sales modal
    const previewBtn = page.locator('button[title="Search & Preview Invoices"]');
    await previewBtn.click();

    // Verify modal overlay appears
    const modal = page.locator('.fixed', { hasText: 'Preview Sales' }).last();
    await expect(modal).toBeVisible();
    
    // Check the first invoice in the table inside the modal
    // In Preview Modal, it shows Customer, Total, Date
    const firstInvoiceRow = modal.locator('tbody tr.hover\\:bg-blue-50\\/40').first();

    // 1. company -> 'Walk-in Cash Customer'
    await expect(firstInvoiceRow).toContainText('Walk-in Cash Customer');
    
    // 2. Verify invoiceDate matches today (YYYY-MM-DD)
    const today = new Date().toISOString().split('T')[0];
    await expect(firstInvoiceRow).toContainText(today);
  });

  test('Scenario 2: Account-Linked / Registered Customer Flow', async ({ page }) => {
    await page.goto('/backoffice/operations?section=sales');

    // Select a specific registered customer
    const customerSelect = page.getByPlaceholder('Search customer ...').first();
    await customerSelect.fill('Supermarket');
    await customerSelect.press('Enter');
    
    // Assuming 'Supermarket' is selected or we click a dropdown result
    const firstResult = page.getByText('Supermarket').first();
    if (await firstResult.isVisible()) {
        await firstResult.click();
    }

    // Find the first result row and click it to add to cart
    const searchInput = page.getByPlaceholder('Search Items By Description, Code or Barcode...').first();
    await searchInput.fill('Extra Virgin');
    const itemRow = page.getByText('Extra Virgin').first();
    await itemRow.click();

    // Save invoice
    const saveButton = page.getByRole('button', { name: 'Save', exact: true });
    await saveButton.click();

    // Open Preview Modal
    const previewBtn = page.locator('button[title="Search & Preview Invoices"]');
    await previewBtn.click();

    // Verify modal overlay appears
    const modal = page.locator('.fixed', { hasText: 'Preview Sales' }).last();
    await expect(modal).toBeVisible();

    // Assertions
    // Ensure that fallback "Walk-in Cash Customer" is NOT present in the latest entry, but Supermarket is
    // Use the first row in the recent table to verify the saved entry
    const firstInvoiceRow = modal.locator('tbody tr.hover\\:bg-blue-50\\/40').first();
    await expect(firstInvoiceRow).toContainText('Supermarket');
    await expect(firstInvoiceRow).not.toContainText('Walk-in Cash Customer');

    // Test print action
    const printBtn = page.getByRole('button', { name: 'Print' }).first();
    await expect(printBtn).toBeVisible();
    // We could click it but it might open a native print dialog which we can't interact with.
    // Instead we just verify no runtime exceptions when rendering the modal.
  });

});
