# Omega ERP Deep-Crawl & DOM Inspection Protocol

## 1. Context & Identified Problem
In Omega Software ERP's legacy frontend stack (AngularJS 1.x / `backOfficeApp`), views are dynamically swapped via client-side routing directives and scope controllers rather than standard server-rendered URL reloads.

When automated crawling agents attempt to navigate through standard URL updates (e.g. modifying `window.location.href`) or basic anchor clicks:
1. AngularJS internal `$route` / `$state` digest cycle is not triggered.
2. The browser URL changes in the address bar, but the DOM remains frozen on the default initial view (the "Reports / Income Statement" report view).
3. The automated crawler mistakenly re-captures the same default screen repeatedly across multiple supposedly distinct sections (JVs, Purchases, Payments, Auxiliaries, Setup).

---

## 2. Robust Deep-Crawl Protocol

### Step 1: Force Explicit DOM Event Cascade
Do not rely on naive `.click()` calls. Dispatch a full pointer and mouse event cascade directly on the sidebar anchor element:
```javascript
const anchor = document.querySelector(sectionSelector);
if (anchor) {
  anchor.scrollIntoView({ behavior: 'instant', block: 'center' });
  const eventSequence = ['pointerover', 'mouseover', 'pointerdown', 'mousedown', 'pointerup', 'mouseup', 'click'];
  for (const evtName of eventSequence) {
    anchor.dispatchEvent(new MouseEvent(evtName, { bubbles: true, cancelable: true, view: window }));
  }
}
```

### Step 2: Force AngularJS Event Handler & Scope Digest
Directly notify the AngularJS runtime:
```javascript
if (window.angular && window.angular.element) {
  const ngAnchor = window.angular.element(anchor);
  ngAnchor.triggerHandler('click');
  const scope = ngAnchor.scope() || window.angular.element(document.body).scope();
  if (scope && !scope.$$phase) {
    try {
      scope.$apply();
    } catch (e) {
      console.warn('Scope digest triggered asynchronously');
    }
  }
}
```

### Step 3: Wait for Target DOM Mutation
Wait explicitly for the unique target container selector before reading or extracting the DOM:
```javascript
await page.waitForSelector(targetWrapperSelector, { visible: true, timeout: 10000 });
```

### Target Container Mapping Table
| Section | Sidebar Trigger Selector | Target Wrapper Container Selector | Expected Controller |
| :--- | :--- | :--- | :--- |
| **Dashboard** | `a[ng-click*="AccountingDashboard"]` | `.accounting-dashboard-container, #accountingDashboard` | `AccountingDasboardController` |
| **Journal Voucher** | `a[ng-click*="JournalVoucher"]` | `#journalVoucherGrid, .jv-form-container` | `AccountsJournalVoucherController` |
| **Purchases** | `a[ng-click*="Expense"]` | `.expense-grid-wrapper, #expenseTable` | `ExpenseController` |
| **Payments** | `a[ng-click*="Payment"]` | `#paymentTableWrapper, .payment-records` | `PaymentController` |
| **Receipts** | `a[ng-click*="Receipt"]` | `#receiptTableWrapper, .receipt-records` | `ReceiptController` |
| **AR Aging** | `a[ng-click*="AccountsReceivables"]` | `#arAgingTable, .ar-grid-wrapper` | `AccountsReceivablesController` |
| **AP Aging** | `a[ng-click*="AccountsPayables"]` | `#apAgingTable, .ap-grid-wrapper` | `AccountsPayablesController` |
| **Bank Recon** | `a[ng-click*="BankReconciliation"]` | `#bankReconContainer` | `BankReconciliationController` |
| **COA Accounts** | `a[ng-click*="Accounts"]` | `#treeview-accounts, .coa-tree-wrapper` | `AccountsController` |
| **Aux Classes** | `a[ng-click*="SubClass1"]` | `#subClass1Table` | `AccountsSubClass1Controller` |
| **Currencies** | `a[ng-click*="CurrencySetups"]` | `#currencyTable` | `CurrencySetupsController` |

---

## 3. Automated Verification & Artifact
The complete implementation is maintained in:
- [scratch/omega_deep_crawler_engine.js](file:///c:/Projects/Vanguard_ERP/scratch/omega_deep_crawler_engine.js)
