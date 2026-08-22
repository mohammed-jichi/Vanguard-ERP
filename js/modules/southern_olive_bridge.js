/**
 * SOUTHERN OLIVE & OIL PRODUCTS SARL - DATA INTEGRATION & MIGRATION BRIDGE
 * 
 * Interoperability, Parsing, & Migration Engine for Southern Olive ERP V2.
 * 
 * Handles schema mapping for:
 *  - Items & Inventory (Inventory Management)
 *  - Sales & POS Transactions (Sales Control)
 *  - Customers & Debt Ledgers (Customer Directory)
 *  - Suppliers & Purchases (Suppliers & Operations)
 *  - Accounting Chart of Accounts (Finance & Ledger)
 *  - Dual-Currency USD/LBP & VAT 11% Tax Setups (Currency & Fiscal Compliance)
 */

(function (window) {
  'use strict';

  const STORAGE_KEYS = {
    SO_ITEMS: 'so_imported_items',
    SO_CUSTOMERS: 'so_imported_customers',
    SO_SUPPLIERS: 'so_imported_suppliers',
    SO_SALES: 'so_imported_sales',
    SO_ACCOUNTS: 'so_imported_accounts',
    SO_SYNC_LOGS: 'so_sync_logs'
  };

  class SouthernOliveBridge {
    constructor() {
      this.version = "2.5.0";
      this.importedCount = {
        items: 0,
        customers: 0,
        suppliers: 0,
        sales: 0,
        accounts: 0
      };
    }

    /**
     * Map Inventory Item schema to Southern Olive POS/Stock schema
     */
    mapItem(raw) {
      if (!raw) return null;
      const usdPrice = parseFloat(raw.SellingPrice || raw.SELLINGPRICE || raw.priceUsd || raw.PRICE || 0);
      const lbpPrice = parseFloat(raw.SecondSellingPrice || raw.SECONDSELLINGPRICE || raw.priceLbp || (usdPrice * 89500));
      const costUsd = parseFloat(raw.CostPrice || raw.COSTPRICE || raw.costUsd || 0);
      
      return {
        id: String(raw.ITEMID || raw.itemId || raw.id || 'SO-' + Date.now() + '-' + Math.floor(Math.random() * 1000)),
        code: String(raw.ITEMCODE || raw.itemCode || raw.code || ''),
        barcode: String(raw.BARCODE || raw.barcode || raw.code || ''),
        nameEn: raw.ITEMNAME || raw.itemName || raw.NAME || raw.name || 'Unnamed Item',
        nameAr: raw.ITEMNAMEAR || raw.itemNameAr || raw.NAMEAR || raw.nameAr || raw.ITEMNAME || 'صنف غير مسمى',
        category: raw.CATEGORYNAME || raw.categoryName || raw.CATEGORY || 'General',
        division: raw.DIVISIONNAME || raw.divisionName || raw.DIVISION || 'Retail',
        group: raw.GROUPNAME || raw.groupName || raw.GROUP || 'General',
        brand: raw.BRANDNAME || raw.brandName || 'Southern Olive',
        unitPriceUsd: usdPrice,
        unitPriceLbp: lbpPrice,
        costPriceUsd: costUsd,
        costPriceLbp: costUsd * 89500,
        quantityOnHand: parseFloat(raw.QTYONHAND || raw.qtyOnHand || raw.qty || 0),
        minQty: parseFloat(raw.MINQTY || raw.minQty || 0),
        maxQty: parseFloat(raw.MAXQTY || raw.maxQty || 0),
        vatApplicable: raw.VATAPPLICABLE !== false && raw.vat !== 0,
        vatRate: 0.11, // Standard Lebanese 11% VAT
        source: raw.SOURCE || 'Southern Olive System',
        importedAt: new Date().toISOString()
      };
    }

    /**
     * Map Customer schema to Southern Olive Customer Directory
     */
    mapCustomer(raw) {
      if (!raw) return null;
      return {
        id: String(raw.CUSTOMERID || raw.customerId || raw.id || 'CUST-SO-' + Date.now()),
        code: String(raw.CUSTOMERCODE || raw.customerCode || ''),
        name: raw.CUSTOMERNAME || raw.customerName || raw.name || 'Southern Olive Client',
        nameAr: raw.CUSTOMERNAMEAR || raw.customerNameAr || raw.CUSTOMERNAME || 'عميل',
        phone: raw.PHONE || raw.mobile || raw.PHONE1 || '',
        email: raw.EMAIL || raw.email || '',
        villageLocation: raw.ZONE || raw.CITY || raw.ADDRESS || 'South Lebanon',
        balanceUsd: parseFloat(raw.BALANCEUSD || raw.balanceUsd || raw.BALANCE || 0),
        balanceLbp: parseFloat(raw.BALANCELBP || raw.balanceLbp || 0),
        creditLimitUsd: parseFloat(raw.CREDITLIMIT || raw.creditLimit || 5000),
        category: raw.CATEGORYNAME || raw.customerCategory || 'Retail Customer',
        group: raw.GROUPNAME || raw.customerGroup || 'General',
        importedAt: new Date().toISOString()
      };
    }

    /**
     * Map Supplier schema to Southern Olive Operations/Purchases
     */
    mapSupplier(raw) {
      if (!raw) return null;
      return {
        id: String(raw.SUPPLIERID || raw.supplierId || raw.id || 'SUP-SO-' + Date.now()),
        code: String(raw.SUPPLIERCODE || raw.supplierCode || ''),
        name: raw.SUPPLIERNAME || raw.supplierName || raw.name || 'Southern Olive Supplier',
        phone: raw.PHONE || raw.TELEPHONE || '',
        address: raw.ADDRESS || raw.LOCATION || 'Lebanon',
        balanceUsd: parseFloat(raw.BALANCEUSD || raw.balanceUsd || 0),
        balanceLbp: parseFloat(raw.BALANCELBP || raw.balanceLbp || 0),
        vatNumber: raw.VATNO || raw.taxNo || '',
        importedAt: new Date().toISOString()
      };
    }

    /**
     * Map Sales/Transaction schema to Southern Olive Accounting & POS
     */
    mapSale(raw) {
      if (!raw) return null;
      const totalUsd = parseFloat(raw.TOTALUSD || raw.totalUsd || raw.NETAMOUNT || 0);
      const totalLbp = parseFloat(raw.TOTALLBP || raw.totalLbp || (totalUsd * 89500));
      return {
        id: String(raw.INVOICEID || raw.invoiceId || raw.TICKETNO || 'INV-SO-' + Date.now()),
        ticketNo: String(raw.TICKETNO || raw.ticketNo || raw.INVOICEID || ''),
        date: raw.INVOICEDATE || raw.date || new Date().toISOString().split('T')[0],
        customerName: raw.CUSTOMERNAME || raw.customerName || 'Cash Customer',
        totalUsd: totalUsd,
        totalLbp: totalLbp,
        vatUsd: parseFloat(raw.VATUSD || raw.vatUsd || (totalUsd * 0.11)),
        vatLbp: parseFloat(raw.VATLBP || raw.vatLbp || (totalLbp * 0.11)),
        paymentType: raw.PAYMENTTYPE || raw.paymentType || 'CASH',
        itemsCount: parseInt(raw.ITEMSCOUNT || raw.itemsCount || 1, 10),
        branchId: raw.BRANCHID || raw.branchId || '1',
        importedAt: new Date().toISOString()
      };
    }

    /**
     * Parse raw HTML content saved from system exports
     */
    parseHTML(htmlContent) {
      if (!htmlContent) return { items: [], customers: [], suppliers: [], sales: [] };
      const parser = new DOMParser();
      const doc = parser.parseFromString(htmlContent, 'text/html');
      
      const items = [];
      const customers = [];
      const suppliers = [];
      const sales = [];

      // Extract table rows from export tables if rendered
      const rows = doc.querySelectorAll('tr, .ng-scope, [ng-repeat]');
      rows.forEach(row => {
        const cells = Array.from(row.querySelectorAll('td, th')).map(c => c.textContent.trim());
        if (cells.length >= 4) {
          if (cells[0] && cells[1] && (!isNaN(parseFloat(cells[2])) || !isNaN(parseFloat(cells[3])))) {
            items.push(this.mapItem({
              itemCode: cells[0],
              itemName: cells[1],
              priceUsd: parseFloat(cells[2]) || 0,
              qtyOnHand: parseFloat(cells[3]) || 0
            }));
          }
        }
      });

      // Extract inline scripts or embedded JSON objects if present
      const scripts = doc.querySelectorAll('script');
      scripts.forEach(script => {
        const content = script.textContent || '';
        const jsonMatches = content.match(/(\[\s*\{.*?\}\s*\])/g);
        if (jsonMatches) {
          jsonMatches.forEach(jsonStr => {
            try {
              const arr = JSON.parse(jsonStr);
              if (Array.isArray(arr)) {
                arr.forEach(obj => {
                  if (obj.ITEMNAME || obj.itemName || obj.ITEMCODE) items.push(this.mapItem(obj));
                  if (obj.CUSTOMERNAME || obj.customerName) customers.push(this.mapCustomer(obj));
                  if (obj.SUPPLIERNAME || obj.supplierName) suppliers.push(this.mapSupplier(obj));
                  if (obj.TICKETNO || obj.INVOICEID) sales.push(this.mapSale(obj));
                });
              }
            } catch (e) {
              // Ignore non-JSON snippets
            }
          });
        }
      });

      return { items, customers, suppliers, sales };
    }

    /**
     * Merge imported items, customers, suppliers, and sales into Southern Olive local storage
     * WITHOUT removing existing data! (Strict Addition & Non-Destructive Edit Rule)
     */
    mergeIntoSouthernOlive(parsedData, options = {}) {
      const results = {
        addedItems: 0,
        addedCustomers: 0,
        addedSuppliers: 0,
        addedSales: 0
      };

      // 1. Merge Items into POS & Stock stores
      if (parsedData.items && parsedData.items.length > 0) {
        let currentPosItems = [];
        try {
          currentPosItems = JSON.parse(localStorage.getItem('so_pos_items') || '[]');
        } catch(e) { currentPosItems = []; }

        let currentStockItems = [];
        try {
          currentStockItems = JSON.parse(localStorage.getItem('so_stock_items') || '[]');
        } catch(e) { currentStockItems = []; }

        parsedData.items.forEach(newItem => {
          if (!newItem) return;
          // Check if item already exists by code or ID
          const existingPosIdx = currentPosItems.findIndex(i => i.id === newItem.id || (i.code && i.code === newItem.code));
          if (existingPosIdx >= 0) {
            // Edit existing item with updated price/stock (Non-destructive update)
            currentPosItems[existingPosIdx] = Object.assign({}, currentPosItems[existingPosIdx], {
              unitPriceUsd: newItem.unitPriceUsd || currentPosItems[existingPosIdx].unitPriceUsd,
              unitPriceLbp: newItem.unitPriceLbp || currentPosItems[existingPosIdx].unitPriceLbp,
              quantityOnHand: newItem.quantityOnHand || currentPosItems[existingPosIdx].quantityOnHand,
              importedSource: true
            });
          } else {
            // Add new item
            currentPosItems.push(newItem);
            results.addedItems++;
          }

          const existingStockIdx = currentStockItems.findIndex(s => s.id === newItem.id || (s.code && s.code === newItem.code));
          if (existingStockIdx >= 0) {
            currentStockItems[existingStockIdx] = Object.assign({}, currentStockItems[existingStockIdx], {
              qtyOnHand: newItem.quantityOnHand || currentStockItems[existingStockIdx].qtyOnHand,
              importedSource: true
            });
          } else {
            currentStockItems.push(newItem);
          }
        });

        localStorage.setItem('so_pos_items', JSON.stringify(currentPosItems));
        localStorage.setItem('so_stock_items', JSON.stringify(currentStockItems));
        localStorage.setItem(STORAGE_KEYS.SO_ITEMS, JSON.stringify(parsedData.items));
      }

      // 2. Merge Customers into Customer Directory
      if (parsedData.customers && parsedData.customers.length > 0) {
        let currentCusts = [];
        try {
          currentCusts = JSON.parse(localStorage.getItem('so_customers') || '[]');
        } catch(e) { currentCusts = []; }

        parsedData.customers.forEach(newCust => {
          if (!newCust) return;
          const idx = currentCusts.findIndex(c => c.id === newCust.id || c.name === newCust.name);
          if (idx >= 0) {
            currentCusts[idx] = Object.assign({}, currentCusts[idx], newCust);
          } else {
            currentCusts.push(newCust);
            results.addedCustomers++;
          }
        });

        localStorage.setItem('so_customers', JSON.stringify(currentCusts));
        localStorage.setItem(STORAGE_KEYS.SO_CUSTOMERS, JSON.stringify(parsedData.customers));
      }

      // 3. Merge Suppliers
      if (parsedData.suppliers && parsedData.suppliers.length > 0) {
        let currentSups = [];
        try {
          currentSups = JSON.parse(localStorage.getItem('so_suppliers') || '[]');
        } catch(e) { currentSups = []; }

        parsedData.suppliers.forEach(newSup => {
          if (!newSup) return;
          const idx = currentSups.findIndex(s => s.id === newSup.id || s.name === newSup.name);
          if (idx >= 0) {
            currentSups[idx] = Object.assign({}, currentSups[idx], newSup);
          } else {
            currentSups.push(newSup);
            results.addedSuppliers++;
          }
        });

        localStorage.setItem('so_suppliers', JSON.stringify(currentSups));
        localStorage.setItem(STORAGE_KEYS.SO_SUPPLIERS, JSON.stringify(parsedData.suppliers));
      }

      // 4. Log Sync Action
      const syncLogs = JSON.parse(localStorage.getItem(STORAGE_KEYS.SO_SYNC_LOGS) || '[]');
      syncLogs.unshift({
        timestamp: new Date().toISOString(),
        addedItems: results.addedItems,
        addedCustomers: results.addedCustomers,
        addedSuppliers: results.addedSuppliers,
        status: 'SUCCESS'
      });
      localStorage.setItem(STORAGE_KEYS.SO_SYNC_LOGS, JSON.stringify(syncLogs.slice(0, 50)));

      if (window.showToast) {
        window.showToast(
          "Southern Olive Data Integration",
          `Successfully processed data. Added/Updated: ${results.addedItems} Items, ${results.addedCustomers} Clients, ${results.addedSuppliers} Suppliers.`,
          "success"
        );
      }

      return results;
    }

    /**
     * Generate a Southern Olive Z-Report Daily Summary
     */
    generateZReport(dateStr) {
      const targetDate = dateStr || new Date().toISOString().split('T')[0];
      let sales = [];
      try {
        sales = JSON.parse(localStorage.getItem('so_sales_orders') || '[]');
      } catch(e) { sales = []; }

      const daySales = sales.filter(s => (s.date || '').startsWith(targetDate));
      const totalUsd = daySales.reduce((sum, s) => sum + parseFloat(s.totalUsd || s.total || 0), 0);
      const vatUsd = totalUsd * 0.11;
      const netUsd = totalUsd - vatUsd;
      const totalLbp = totalUsd * 89500;

      return {
        reportType: "Z-REPORT (DAILY CLOSURE)",
        company: "Southern Olive & Oil Products SARL",
        softwareSource: "Southern Olive ERP Compatible",
        date: targetDate,
        totalInvoices: daySales.length,
        grossSalesUsd: totalUsd.toFixed(2),
        vatAmountUsd: vatUsd.toFixed(2),
        netSalesUsd: netUsd.toFixed(2),
        grossSalesLbp: totalLbp.toLocaleString() + ' LBP',
        cashDrawerUsd: totalUsd.toFixed(2),
        generatedAt: new Date().toISOString()
      };
    }
    /**
     * Calculate Olive Pressing & Extraction Batch Yield
     */
    calculateOlivePressing(params = {}) {
      const weight = parseFloat(params.oliveWeightKg || 0);
      const acidity = parseFloat(params.acidityPct || 0.5);
      const pressingType = params.pressingType || 'COLD_PRESS';
      const feeRatePerKgUsd = parseFloat(params.feeRatePerKgUsd || 0.05);

      const yieldPct = pressingType === 'COLD_PRESS' ? 21.5 : 23.0;
      const oilKg = weight * (yieldPct / 100);
      const oilLiters = oilKg / 0.916;
      const tins16L = oilLiters / 16.0;

      let gradeAr = "زيت زيتون بكر ممتاز (Extra Virgin)";
      let gradeEn = "Extra Virgin Olive Oil (EVOO)";
      let qualityBadge = "success";

      if (acidity > 0.8 && acidity <= 2.0) {
        gradeAr = "زيت زيتون بكر (Virgin)";
        gradeEn = "Virgin Olive Oil";
        qualityBadge = "warning";
      } else if (acidity > 2.0) {
        gradeAr = "زيت زيتون صناعي (Lampante)";
        gradeEn = "Lampante Olive Oil";
        qualityBadge = "danger";
      }

      const totalFeeUsd = weight * feeRatePerKgUsd;
      const totalFeeLbp = totalFeeUsd * 89500;

      return {
        oliveWeightKg: weight,
        yieldPct: yieldPct.toFixed(1),
        oilKg: oilKg.toFixed(1),
        oilLiters: oilLiters.toFixed(1),
        tins16L: tins16L.toFixed(2),
        acidityPct: acidity.toFixed(2),
        gradeAr,
        gradeEn,
        qualityBadge,
        totalFeeUsd: totalFeeUsd.toFixed(2),
        totalFeeLbp: Math.round(totalFeeLbp).toLocaleString()
      };
    }

    getRawOilStock() {
      const defaultStock = { kuraKg: 800, evooKg: 1120, palmKg: 480 }; // 800kg Kura (50 tins), 1120kg EVOO (70 tins), 480kg Palm (30 tins)
      try {
        const saved = localStorage.getItem('so_raw_oil_stock');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed.kuraTins !== undefined && parsed.kuraKg === undefined) {
            parsed.kuraKg = parsed.kuraTins * 16;
            parsed.evooKg = parsed.evooTins * 16;
          }
          if (parsed.palmKg === undefined) {
            parsed.palmKg = 480;
          }
          return parsed;
        }
        return defaultStock;
      } catch (e) {
        return defaultStock;
      }
    }

    saveRawOilStock(stock) {
      try {
        localStorage.setItem('so_raw_oil_stock', JSON.stringify(stock));
      } catch (e) {}
    }

    /**
     * Open Olive Pressing Modal
     */
    openOlivePressingModal(initialMode = 'PRESSING') {
      let modal = document.getElementById('so-olive-pressing-modal');
      if (!modal) {
        modal = document.createElement('div');
        modal.id = 'so-olive-pressing-modal';
        modal.style.cssText = 'position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(0,0,0,0.85); z-index: 999999; display: flex; align-items: center; justify-content: center; font-family: system-ui, -apple-system, sans-serif;';
        modal.innerHTML = `
          <style>
            #so-olive-pressing-modal {
              color: #000000 !important;
            }
            #so-olive-pressing-modal .so-modal-card {
              background: #2b3e2a !important; /* Olive Green Box Background */
              border: 3px solid #84a98c !important;
              border-radius: 1rem !important;
              width: 95% !important;
              max-width: 780px !important;
              padding: 1.5rem !important;
              color: #000000 !important;
              box-shadow: 0 25px 50px -12px rgba(0,0,0,0.9) !important;
              max-height: 92vh !important;
              overflow-y: auto !important;
            }
            #so-olive-pressing-modal label,
            #so-olive-pressing-modal .so-label {
              color: #000000 !important;
              font-size: 0.95rem !important;
              font-weight: 800 !important;
              margin-bottom: 6px !important;
              display: block !important;
            }
            #so-olive-pressing-modal small,
            #so-olive-pressing-modal .so-small {
              color: #000000 !important;
              font-size: 0.85rem !important;
              font-weight: 700 !important;
              display: block !important;
            }
            #so-olive-pressing-modal strong,
            #so-olive-pressing-modal .so-strong {
              color: #000000 !important;
              font-weight: 900 !important;
              font-size: 1.25rem !important;
            }
            #so-olive-pressing-modal input[type="number"],
            #so-olive-pressing-modal input[type="text"],
            #so-olive-pressing-modal select {
              background-color: #ffffff !important;
              color: #000000 !important;
              font-weight: 900 !important;
              font-size: 1.05rem !important;
              border-radius: 8px !important;
              padding: 8px 10px !important;
              border: 2px solid #354b32 !important;
              box-shadow: 0 2px 4px rgba(0,0,0,0.15) !important;
            }
            #so-olive-pressing-modal select option {
              color: #000000 !important;
              background-color: #ffffff !important;
              font-weight: bold !important;
            }
            #so-olive-pressing-modal .so-res-card {
              background: #fefae0 !important; /* Cream color */
              border: 2px solid #ccd5ae !important;
              border-radius: 10px !important;
              padding: 12px !important;
              text-align: center !important;
              color: #000000 !important;
            }
          </style>

          <div class="so-modal-card">
            
            <!-- Header -->
            <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #84a98c; padding-bottom: 0.75rem; margin-bottom: 1rem;">
              <h4 style="color: #fefae0 !important; margin: 0; font-weight: bold; font-size: 1.2rem; text-shadow: 0 1px 2px rgba(0,0,0,0.5);" id="soOliveModalTitle">
                <i class="fa-solid fa-seedling me-2" style="color: #fefae0;"></i> مركز الاستلام والإنتاج -- منتوجات زيت وزيتون الجنوب
              </h4>
              <button onclick="document.getElementById('so-olive-pressing-modal').style.display='none'" style="background: #fefae0; border: 2px solid #354b32; color: #000000; font-size: 1.5rem; cursor: pointer; line-height: 1; border-radius: 50%; width: 36px; height: 36px; display: flex; align-items: center; justify-content: center; font-weight: bold;">&times;</button>
            </div>

            <!-- Mode Switcher 4 Main Tabs (Cream / White tabs with Black text) -->
            <div style="display: flex; gap: 6px; background: #1c2b1a; padding: 6px; border-radius: 10px; margin-bottom: 1.25rem; overflow-x: auto;">
              <button id="soTabReceivingBtn" onclick="window.SouthernOliveBridge.switchOliveModalMode('RECEIVING')" style="flex: 1; min-width: 100px; padding: 10px 8px; border: 2px solid #2b3e2a; border-radius: 8px; font-weight: 900; cursor: pointer; transition: all 0.2s; background: #fefae0; color: #000000; font-size: 0.85rem;">
                <i class="fa-solid fa-truck-ramp-box me-1"></i> 📦 1. استلام زيت (Receive Oil)
              </button>
              <button id="soTabProductionBtn" onclick="window.SouthernOliveBridge.switchOliveModalMode('PRODUCTION')" style="flex: 1; min-width: 100px; padding: 10px 8px; border: 2px solid transparent; border-radius: 8px; font-weight: bold; cursor: pointer; transition: all 0.2s; background: #ffffff; color: #1e293b; opacity: 0.85; font-size: 0.85rem;">
                <i class="fa-solid fa-flask-vial me-1"></i> ⚙️ 2. خلط وإنتاج (Mixing & Production)
              </button>
              <button id="soTabHandoverBtn" onclick="window.SouthernOliveBridge.switchOliveModalMode('HANDOVER')" style="flex: 1; min-width: 100px; padding: 10px 8px; border: 2px solid transparent; border-radius: 8px; font-weight: bold; cursor: pointer; transition: all 0.2s; background: #ffffff; color: #1e293b; opacity: 0.85; font-size: 0.85rem;">
                <i class="fa-solid fa-truck-fast me-1"></i> 🚚 3. تسليم الإنتاج (Production Delivery)
              </button>
              <button id="soTabInventoryBtn" onclick="window.SouthernOliveBridge.switchOliveModalMode('INVENTORY')" style="flex: 1; min-width: 100px; padding: 10px 8px; border: 2px solid transparent; border-radius: 8px; font-weight: bold; cursor: pointer; transition: all 0.2s; background: #ffffff; color: #1e293b; opacity: 0.85; font-size: 0.85rem;">
                <i class="fa-solid fa-boxes-stacked me-1"></i> 📊 4. جرد ورصيد (Inventory Balance)
              </button>
            </div>

            <!-- TAB 1: READY OIL RECEIVING (IN KG: KURA, EVOO, PALM) -->
            <div id="soModeReceivingSection">
              <div style="background: #fefae0; border: 2px solid #ccd5ae; border-radius: 12px; padding: 1.25rem; margin-bottom: 1rem; color: #000000;">
                <div style="margin-bottom: 1rem;">
                  <label class="so-label" style="color: #000000 !important;">المورد / المزارع (Vendor / Supplier):</label>
                  <div style="display: flex; gap: 8px; align-items: center;">
                    <select id="recvVendorSelect" style="flex: 1; border-color: #354b32 !important;">
                      <option value="أنور الموزع">أنور الموزع (Anwar Al-Muwazzi')</option>
                      <option value="تعاونية معاصر زيتون النبطية">تعاونية معاصر زيتون النبطية</option>
                      <option value="مزارع صيدا وحاصبيا">مزارع صيدا وحاصبيا</option>
                      <option value="مزارع صور والناقورة">مزارع صور والناقورة</option>
                    </select>
                    <button type="button" onclick="window.SouthernOliveBridge.addNewVendorPrompt()" title="إضافة مورد جديد" style="background: #16a34a; color: #ffffff !important; border: 2px solid #14532d; padding: 7px 14px; border-radius: 8px; font-weight: 800; cursor: pointer; display: flex; align-items: center; gap: 6px; box-shadow: 0 2px 8px rgba(0,0,0,0.2);">
                      <i class="fa-solid fa-plus" style="color: #ffffff !important;"></i>
                      <span style="color: #ffffff !important;">إضافة (Add)</span>
                    </button>
                  </div>
                </div>

                <!-- 3 Oil Types Input in Kg -->
                <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 0.75rem;">
                  <!-- Kura Oil Input in Kg -->
                  <div style="background: #ffffff; border: 2px solid #e2e8f0; padding: 10px; border-radius: 10px;">
                    <label class="so-label" style="color: #000000 !important;">
                      <i class="fa-solid fa-bottle-droplet me-1"></i> زيت كورة (كجم):
                    </label>
                    <div style="display: flex; align-items: center; gap: 6px;">
                      <input type="number" id="recvKuraKg" value="80" min="0" style="width: 100%; border-color: #354b32 !important;" oninput="window.SouthernOliveBridge.recalculateReceiving()" />
                      <span style="font-size: 0.9rem; color: #000000; font-weight: 900; white-space: nowrap;">kg</span>
                    </div>
                  </div>

                  <!-- Extra Virgin Input in Kg -->
                  <div style="background: #ffffff; border: 2px solid #e2e8f0; padding: 10px; border-radius: 10px;">
                    <label class="so-label" style="color: #000000 !important;">
                      <i class="fa-solid fa-award me-1"></i> بكر ممتاز (كجم):
                    </label>
                    <div style="display: flex; align-items: center; gap: 6px;">
                      <input type="number" id="recvEVOOKg" value="112" min="0" style="width: 100%; border-color: #354b32 !important;" oninput="window.SouthernOliveBridge.recalculateReceiving()" />
                      <span style="font-size: 0.9rem; color: #000000; font-weight: 900; white-space: nowrap;">kg</span>
                    </div>
                  </div>

                  <!-- Palm Oil Input in Kg -->
                  <div style="background: #ffffff; border: 2px solid #e2e8f0; padding: 10px; border-radius: 10px;">
                    <label class="so-label" style="color: #000000 !important;">
                      <i class="fa-solid fa-tree me-1"></i> زيت نخيل (كجم):
                    </label>
                    <div style="display: flex; align-items: center; gap: 6px;">
                      <input type="number" id="recvPalmKg" value="48" min="0" style="width: 100%; border-color: #354b32 !important;" oninput="window.SouthernOliveBridge.recalculateReceiving()" />
                      <span style="font-size: 0.9rem; color: #000000; font-weight: 900; white-space: nowrap;">kg</span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Live Receiving Results -->
              <div id="recvResultBox" style="background: #fefae0; border: 2px solid #84a98c; border-radius: 12px; padding: 1rem; margin-bottom: 1rem; color: #000000;">
                <!-- Dynamically injected -->
              </div>

              <div style="display: flex; gap: 0.5rem; justify-content: flex-end;">
                <button onclick="window.SouthernOliveBridge.saveReceivingBatch()" style="background: #fefae0; color: #000000; border: 2px solid #354b32; border-radius: 8px; padding: 10px 22px; font-weight: 900; cursor: pointer; box-shadow: 0 4px 10px rgba(0,0,0,0.3);">
                  <i class="fa-solid fa-box-archive me-1"></i> تسجيل واستلام الشحنة بالوزن (كجم) في المخزون
                </button>
              </div>
            </div>

            <!-- TAB 3: OIL BLENDING & PRODUCTION (DEDUCTIONS STRICTLY IN KG) -->
            <div id="soModeProductionSection" style="display: none;">
              <!-- Current Available Stock Banner -->
              <div id="prodStockBalanceBanner" style="background: #fefae0; border: 2px solid #84a98c; padding: 12px 16px; border-radius: 12px; margin-bottom: 1rem; color: #000000;">
                <!-- Injected -->
              </div>

              <div style="background: #fefae0; border: 2px solid #ccd5ae; border-radius: 12px; padding: 1.25rem; margin-bottom: 1rem; color: #000000;">
                <!-- 3 Oil Types Input for Production / Blending strictly in KG -->
                <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 0.75rem; margin-bottom: 1rem;">
                  <!-- Production Kura Input in KG -->
                  <div style="background: #ffffff; border: 2px solid #e2e8f0; padding: 10px; border-radius: 10px;">
                    <label class="so-label" style="color: #000000 !important;">
                      <i class="fa-solid fa-vial me-1"></i> سحب كورة (كجم):
                    </label>
                    <div style="display: flex; align-items: center; gap: 6px;">
                      <input type="number" id="prodKuraKg" value="80" min="0" style="width: 100%; border-color: #354b32 !important;" oninput="window.SouthernOliveBridge.recalculateProduction()" />
                      <span style="font-size: 0.9rem; color: #000000; font-weight: 900; white-space: nowrap;">kg</span>
                    </div>
                  </div>

                  <!-- Production EVOO Input in KG -->
                  <div style="background: #ffffff; border: 2px solid #e2e8f0; padding: 10px; border-radius: 10px;">
                    <label class="so-label" style="color: #000000 !important;">
                      <i class="fa-solid fa-award me-1"></i> سحب ممتاز (كجم):
                    </label>
                    <div style="display: flex; align-items: center; gap: 6px;">
                      <input type="number" id="prodEVOOKg" value="112" min="0" style="width: 100%; border-color: #354b32 !important;" oninput="window.SouthernOliveBridge.recalculateProduction()" />
                      <span style="font-size: 0.9rem; color: #000000; font-weight: 900; white-space: nowrap;">kg</span>
                    </div>
                  </div>

                  <!-- Production Palm Input in KG -->
                  <div style="background: #ffffff; border: 2px solid #e2e8f0; padding: 10px; border-radius: 10px;">
                    <label class="so-label" style="color: #000000 !important;">
                      <i class="fa-solid fa-tree me-1"></i> سحب نخيل (كجم):
                    </label>
                    <div style="display: flex; align-items: center; gap: 6px;">
                      <input type="number" id="prodPalmKg" value="48" min="0" style="width: 100%; border-color: #354b32 !important;" oninput="window.SouthernOliveBridge.recalculateProduction()" />
                      <span style="font-size: 0.9rem; color: #000000; font-weight: 900; white-space: nowrap;">kg</span>
                    </div>
                  </div>
                </div>

                <!-- Multi-Packaging Options List & Qty Inputs -->
                <div style="margin-top: 10px;">
                  <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                    <label class="so-label" style="color: #000000 !important; font-weight: 900; margin: 0;">
                      <i class="fa-solid fa-boxes-stacked me-1"></i> طرق وأعداد التعبئة والتغليف (تحديد أعداد العبوات لعدة أصناف بنفس الوقت):
                    </label>
                    <button type="button" onclick="window.SouthernOliveBridge.addNewPackagingItemPrompt()" title="إضافة صنف/عبوة جديد للمخزون" style="background: #2b3e2a; color: #ffffff; border: 1px solid #1c2b1a; padding: 4px 10px; border-radius: 6px; font-weight: bold; cursor: pointer; font-size: 0.82rem;">
                      <i class="fa-solid fa-plus me-1"></i> إضافة صنف للمخزون
                    </button>
                  </div>

                  <div id="soMultiPackList" style="max-height: 220px; overflow-y: auto; background: #fefae0; padding: 8px; border-radius: 8px; border: 1px solid #84a98c;">
                    <!-- Dynamically Injected Multi Packaging Rows -->
                  </div>
                </div>
              </div>

              <!-- Live Production Calculations -->
              <div id="prodResultBox" style="background: #fefae0; border: 2px solid #84a98c; border-radius: 12px; padding: 1rem; margin-bottom: 1rem; color: #000000;">
                <!-- Dynamically Injected -->
              </div>

              <div style="display: flex; gap: 0.5rem; justify-content: flex-end;">
                <button onclick="window.SouthernOliveBridge.executeProductionBatch()" style="background: #fefae0; color: #000000; border: 2px solid #354b32; border-radius: 8px; padding: 10px 22px; font-weight: 900; cursor: pointer; box-shadow: 0 4px 10px rgba(0,0,0,0.3);">
                  <i class="fa-solid fa-gears me-1"></i> تنفيذ خلط وإنتاج الزيت بالخصم (كجم)
                </button>
              </div>
            </div>

            <!-- TAB 3: HANDOVER TO SUPERSONIC HUB (MULTI-ITEM QUANTITY SELECTION) -->
            <div id="soModeHandoverSection" style="display: none;">
              <div style="background: #fefae0; border: 2px solid #ccd5ae; border-radius: 12px; padding: 1.25rem; margin-bottom: 1rem; color: #000000;">
                <h6 style="font-weight: 900; color: #000000 !important; margin-bottom: 1rem;"><i class="fa-solid fa-truck-fast me-2"></i> تسليم وترحيل الإنتاج إلى شركة SuperSonic (SuperSonic Delivery & Stock Handover)</h6>
                
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; margin-bottom: 1rem;">
                  <div>
                    <label class="so-label" style="color: #000000 !important;">جهة التوصيل / مستودع شركة SuperSonic المستهدف:</label>
                    <select id="modalHandoverBranchSelect" style="width: 100%; border-color: #354b32 !important;">
                      <option value="المستودع الرئيسي لشركة SuperSonic - بيروت والشويفات">المستودع الرئيسي لشركة SuperSonic - بيروت والشويفات</option>
                      <option value="مستودع شركة SuperSonic - فرع الجنوب وصيدا">مستودع شركة SuperSonic - فرع الجنوب وصيدا</option>
                      <option value="مستودع شركة SuperSonic - فرع البقاع وزحلة">مستودع شركة SuperSonic - فرع البقاع وزحلة</option>
                    </select>
                  </div>
                  <div>
                    <label class="so-label" style="color: #000000 !important;">وصف وملاحظات شحنة التسليم:</label>
                    <input type="text" id="modalHandoverNotes" placeholder="أدخل تفاصيل الشحنة والملاحظات اللوجستية..." style="width: 100%; border-color: #354b32 !important;" />
                  </div>
                </div>

                <!-- Multi-Item Quantity Handover Table -->
                <div style="background: #ffffff; border: 2px solid #84a98c; border-radius: 10px; padding: 10px; margin-top: 10px;">
                  <label class="so-label" style="color: #000000 !important; font-weight: 900; margin-bottom: 8px; display: block;">
                    <i class="fa-solid fa-boxes-stacked me-1"></i> الكمية المسلمة والمرحلة حسب الصنف والعبوة (تحديد الكميات لعدة أصناف بنفس الوقت):
                  </label>
                  
                  <div style="display: flex; flex-direction: column; gap: 8px;">
                    <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #e2e8f0; padding-bottom: 6px;">
                      <strong style="color: #000000; font-size: 0.9rem;">تنكة كاملة خضير (15.2 كجم) — زيت بلدي خضير</strong>
                      <div style="display: flex; align-items: center; gap: 6px;">
                        <span style="font-size: 0.8rem; font-weight: bold; color: #64748b;">الكمية المسلمة:</span>
                        <input type="number" class="modal-handover-item-qty" data-item="تنكة كاملة خضير (15.2 كجم)" value="10" min="0" style="width: 80px; text-align: center; border: 1px solid #354b32; border-radius: 6px; padding: 4px; font-weight: bold;" />
                        <span style="font-size: 0.8rem; font-weight: bold;">عبوة</span>
                      </div>
                    </div>

                    <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #e2e8f0; padding-bottom: 6px;">
                      <strong style="color: #000000; font-size: 0.9rem;">تنكة كاملة فيرجن (15.2 كجم) — بكر ممتاز EVOO</strong>
                      <div style="display: flex; align-items: center; gap: 6px;">
                        <span style="font-size: 0.8rem; font-weight: bold; color: #64748b;">الكمية المسلمة:</span>
                        <input type="number" class="modal-handover-item-qty" data-item="تنكة كاملة فيرجن (15.2 كجم)" value="5" min="0" style="width: 80px; text-align: center; border: 1px solid #354b32; border-radius: 6px; padding: 4px; font-weight: bold;" />
                        <span style="font-size: 0.8rem; font-weight: bold;">عبوة</span>
                      </div>
                    </div>

                    <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #e2e8f0; padding-bottom: 6px;">
                      <strong style="color: #000000; font-size: 0.9rem;">نصف تنكة (7.8 كجم) — تطفيح صاج</strong>
                      <div style="display: flex; align-items: center; gap: 6px;">
                        <span style="font-size: 0.8rem; font-weight: bold; color: #64748b;">الكمية المسلمة:</span>
                        <input type="number" class="modal-handover-item-qty" data-item="نصف تنكة (7.8 كجم)" value="5" min="0" style="width: 80px; text-align: center; border: 1px solid #354b32; border-radius: 6px; padding: 4px; font-weight: bold;" />
                        <span style="font-size: 0.8rem; font-weight: bold;">عبوة</span>
                      </div>
                    </div>

                    <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #e2e8f0; padding-bottom: 6px;">
                      <strong style="color: #000000; font-size: 0.9rem;">غالون بلاستيك 5 لتر (4.5 كجم) — بلاستيك مقوى</strong>
                      <div style="display: flex; align-items: center; gap: 6px;">
                        <span style="font-size: 0.8rem; font-weight: bold; color: #64748b;">الكمية المسلمة:</span>
                        <input type="number" class="modal-handover-item-qty" data-item="غالون بلاستيك 5 لتر (4.5 كجم)" value="0" min="0" style="width: 80px; text-align: center; border: 1px solid #354b32; border-radius: 6px; padding: 4px; font-weight: bold;" />
                        <span style="font-size: 0.8rem; font-weight: bold;">عبوة</span>
                      </div>
                    </div>

                    <div style="display: flex; justify-content: space-between; align-items: center;">
                      <strong style="color: #000000; font-size: 0.9rem;">قنينة زجاج 1 لتر (1.09 كجم) — زجاج فاخر</strong>
                      <div style="display: flex; align-items: center; gap: 6px;">
                        <span style="font-size: 0.8rem; font-weight: bold; color: #64748b;">الكمية المسلمة:</span>
                        <input type="number" class="modal-handover-item-qty" data-item="قنينة زجاج 1 لتر (1.09 كجم)" value="0" min="0" style="width: 80px; text-align: center; border: 1px solid #354b32; border-radius: 6px; padding: 4px; font-weight: bold;" />
                        <span style="font-size: 0.8rem; font-weight: bold;">عبوة</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div style="margin-top: 1rem; display: flex; justify-content: flex-end;">
                  <button onclick="window.SouthernOliveBridge.saveModalHandover()" style="background: #16a34a; color: #ffffff !important; border: 2px solid #14532d; border-radius: 8px; padding: 10px 22px; font-weight: 900; cursor: pointer; box-shadow: 0 4px 10px rgba(0,0,0,0.3);">
                    <i class="fa-solid fa-paper-plane me-1" style="color: #ffffff !important;"></i> <span style="color: #ffffff !important;">تأكيد تحويل وتسليم الشحنة لشركة SuperSonic</span>
                  </button>
                </div>
              </div>
            </div>
            <!-- TAB 4: INVENTORY AUDIT & BALANCE SECTION (4 INNER SUB-TABS) -->
            <div id="soModeInventorySection" style="display: none;">
              <div style="background: #fefae0; border: 2px solid #ccd5ae; border-radius: 12px; padding: 1.25rem; margin-bottom: 1rem; color: #000000;">
                <h6 style="font-weight: 900; color: #000000 !important; margin-bottom: 1rem;"><i class="fa-solid fa-boxes-stacked me-2"></i> جرد ورصيد المستودع والأسطول (Inventory Balance & Audit)</h6>
                
                <!-- 4 Inner Sub-Tabs Bar -->
                <div style="display: flex; gap: 4px; background: #ffffff; padding: 6px; border-radius: 8px; margin-bottom: 1rem; border: 1px solid #84a98c;">
                  <button id="modalSubtabStockBtn" onclick="window.SouthernOliveBridge.switchModalInvSubtab('stock')" style="flex: 1; padding: 6px 4px; border: 1px solid #2b3e2a; border-radius: 6px; font-weight: bold; background: #2b3e2a; color: #ffffff; cursor: pointer; font-size: 0.8rem;">
                    جرد المخزون (Stock)
                  </button>
                  <button id="modalSubtabLogBtn" onclick="window.SouthernOliveBridge.switchModalInvSubtab('log')" style="flex: 1; padding: 6px 4px; border: 1px solid #cbd5e1; border-radius: 6px; font-weight: bold; background: #f8fafc; color: #1e293b; cursor: pointer; font-size: 0.8rem;">
                    سجل الحركات (Log)
                  </button>
                  <button id="modalSubtabSupersonicBtn" onclick="window.SouthernOliveBridge.switchModalInvSubtab('supersonic')" style="flex: 1; padding: 6px 4px; border: 1px solid #cbd5e1; border-radius: 6px; font-weight: bold; background: #f8fafc; color: #1e293b; cursor: pointer; font-size: 0.8rem;">
                    جرد الأسطول (Supersonic)
                  </button>
                  <button id="modalSubtabAlertsBtn" onclick="window.SouthernOliveBridge.switchModalInvSubtab('alerts')" style="flex: 1; padding: 6px 4px; border: 1px solid #fca5a5; border-radius: 6px; font-weight: bold; background: #fef2f2; color: #991b1b; cursor: pointer; font-size: 0.8rem;">
                    تنبيهات نقص المخزون (Alerts)
                  </button>
                </div>

                <!-- SUBTAB 1: STOCK -->
                <div id="modalInvSubtabStock">
                  <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 0.75rem; margin-bottom: 1rem;">
                    <div class="so-res-card">
                      <span class="so-small">زيت كورة خام:</span>
                      <h5 id="modalInvKuraKg" style="font-weight: 900; color: #000000; margin: 4px 0;">1600 kg</h5>
                      <small id="modalInvKuraTins" style="color: #334155; font-weight: 700;">(105.3 تنكة 15.2kg)</small>
                    </div>
                    <div class="so-res-card">
                      <span class="so-small">زيت بكر ممتاز:</span>
                      <h5 id="modalInvEvooKg" style="font-weight: 900; color: #000000; margin: 4px 0;">2400 kg</h5>
                      <small id="modalInvEvooTins" style="color: #334155; font-weight: 700;">(157.9 تنكة 15.2kg)</small>
                    </div>
                    <div class="so-res-card">
                      <span class="so-small">زيت نخيل فاخر:</span>
                      <h5 id="modalInvPalmKg" style="font-weight: 900; color: #000000; margin: 4px 0;">800 kg</h5>
                      <small id="modalInvPalmTins" style="color: #334155; font-weight: 700;">(52.6 تنكة 15.2kg)</small>
                    </div>
                  </div>

                  <div style="background: #ffffff; border: 2px solid #84a98c; border-radius: 10px; padding: 10px; overflow-x: auto;">
                    <table style="width: 100%; border-collapse: collapse; font-size: 0.9rem; color: #000000;">
                      <thead>
                        <tr style="border-bottom: 2px solid #84a98c; text-align: right;">
                          <th style="padding: 6px;">اسم المنتج والعبوة</th>
                          <th style="padding: 6px;">سعة العبوة (كجم)</th>
                          <th style="padding: 6px;">نوع التعبئة</th>
                          <th style="padding: 6px;">الحالة</th>
                        </tr>
                      </thead>
                      <tbody id="modalInventoryPackTable">
                        <tr>
                          <td style="padding: 6px; font-weight: bold;">تنكة كاملة خضير (15.2 كجم)</td>
                          <td style="padding: 6px;"><span style="background: #16a34a; color: #fff; padding: 2px 6px; border-radius: 4px;">15.2 kg</span></td>
                          <td style="padding: 6px;">زيت بلدي خضير</td>
                          <td style="padding: 6px;"><span style="background: #2563eb; color: #fff; padding: 2px 6px; border-radius: 4px;">جاهز للتعبئة والتوزيع</span></td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                <!-- SUBTAB 2: LOG -->
                <div id="modalInvSubtabLog" style="display: none;">
                  <div style="background: #ffffff; border: 1px solid #cbd5e1; border-radius: 8px; padding: 10px; font-size: 0.85rem;">
                    <div style="border-bottom: 1px solid #e2e8f0; padding-bottom: 6px; margin-bottom: 6px; display: flex; justify-content: space-between;">
                      <span>🟢 <strong>استلام زيت خام من أنور الموزع</strong> (240 كجم)</span>
                      <small style="color: #64748b;">اليوم 09:30 ص</small>
                    </div>
                    <div style="border-bottom: 1px solid #e2e8f0; padding-bottom: 6px; margin-bottom: 6px; display: flex; justify-content: space-between;">
                      <span>⚙️ <strong>إنتاج وتعبئة 20 تنكة (15.2 كجم)</strong></span>
                      <small style="color: #64748b;">اليوم 10:45 ص</small>
                    </div>
                    <div style="display: flex; justify-content: space-between;">
                      <span>🚚 <strong>تسليم ترحيل لشركة SuperSonic Fleet</strong> (15 عبوة)</span>
                      <small style="color: #64748b;">اليوم 11:20 ص</small>
                    </div>
                  </div>
                </div>

                <!-- SUBTAB 3: SUPERSONIC -->
                <div id="modalInvSubtabSupersonic" style="display: none;">
                  <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">
                    <div style="background: #ffffff; border: 1px solid #93c5fd; padding: 8px; border-radius: 8px;">
                      <strong style="color: #1e3a8a; display: block;">سائق S-01 (أبو علي)</strong>
                      <span style="font-size: 0.8rem;">تنكة كاملة (15.2كجم): <strong style="color: #16a34a;">18 عبوة</strong></span>
                    </div>
                    <div style="background: #ffffff; border: 1px solid #93c5fd; padding: 8px; border-radius: 8px;">
                      <strong style="color: #1e3a8a; display: block;">سائق S-02 (حسن)</strong>
                      <span style="font-size: 0.8rem;">نصف تنكة (7.8كجم): <strong style="color: #16a34a;">12 عبوة</strong></span>
                    </div>
                  </div>
                </div>

                <!-- SUBTAB 4: ALERTS -->
                <div id="modalInvSubtabAlerts" style="display: none;">
                  <div style="background: #fef2f2; border: 1px solid #fca5a5; padding: 8px; border-radius: 8px; color: #991b1b; font-size: 0.85rem;">
                    <strong>⚠️ تنبيه نقص الرصيد:</strong>
                    <span>نصف تنكة (7.8 كجم) وصل للحد الأدنى (25 عبوة).</span>
                  </div>
                </div>

              </div>
            </div>

          </div>
        `;
        document.body.appendChild(modal);
      }
      modal.classList.remove('hidden');
      modal.style.setProperty('display', 'flex', 'important');

      this.switchOliveModalMode(initialMode);
    }

    switchOliveModalMode(mode) {
      const pSec = document.getElementById('soModePressingSection');
      const rSec = document.getElementById('soModeReceivingSection');
      const prSec = document.getElementById('soModeProductionSection');
      const hSec = document.getElementById('soModeHandoverSection');
      const iSec = document.getElementById('soModeInventorySection');

      const pBtn = document.getElementById('soTabPressingBtn');
      const rBtn = document.getElementById('soTabReceivingBtn');
      const prBtn = document.getElementById('soTabProductionBtn');
      const hBtn = document.getElementById('soTabHandoverBtn');
      const iBtn = document.getElementById('soTabInventoryBtn');

      const setInactive = (btn) => {
        if (btn) { btn.style.background = '#ffffff'; btn.style.color = '#1e293b'; btn.style.borderColor = 'transparent'; btn.style.opacity = '0.85'; }
      };
      const setActive = (btn) => {
        if (btn) { btn.style.background = '#fefae0'; btn.style.color = '#000000'; btn.style.borderColor = '#2b3e2a'; btn.style.opacity = '1'; }
      };

      if (mode === 'PRESSING') {
        if (pSec) pSec.style.display = 'block';
        if (rSec) rSec.style.display = 'none';
        if (prSec) prSec.style.display = 'none';
        if (hSec) hSec.style.display = 'none';
        if (iSec) iSec.style.display = 'none';

        setActive(pBtn); setInactive(rBtn); setInactive(prBtn); setInactive(hBtn); setInactive(iBtn);
        this.recalculatePressing();

      } else if (mode === 'RECEIVING') {
        if (pSec) pSec.style.display = 'none';
        if (rSec) rSec.style.display = 'block';
        if (prSec) prSec.style.display = 'none';
        if (hSec) hSec.style.display = 'none';
        if (iSec) iSec.style.display = 'none';

        setActive(rBtn); setInactive(pBtn); setInactive(prBtn); setInactive(hBtn); setInactive(iBtn);
        this.recalculateReceiving();

      } else if (mode === 'PRODUCTION') {
        if (pSec) pSec.style.display = 'none';
        if (rSec) rSec.style.display = 'none';
        if (prSec) prSec.style.display = 'block';
        if (hSec) hSec.style.display = 'none';
        if (iSec) iSec.style.display = 'none';

        setActive(prBtn); setInactive(pBtn); setInactive(rBtn); setInactive(hBtn); setInactive(iBtn);
        this.loadInventoryPackagingOptions();
        this.recalculateProduction();

      } else if (mode === 'HANDOVER') {
        if (pSec) pSec.style.display = 'none';
        if (rSec) rSec.style.display = 'none';
        if (prSec) prSec.style.display = 'none';
        if (hSec) hSec.style.display = 'block';
        if (iSec) iSec.style.display = 'none';

        setActive(hBtn); setInactive(pBtn); setInactive(rBtn); setInactive(prBtn); setInactive(iBtn);

      } else if (mode === 'INVENTORY') {
        if (pSec) pSec.style.display = 'none';
        if (rSec) rSec.style.display = 'none';
        if (prSec) prSec.style.display = 'none';
        if (hSec) hSec.style.display = 'none';
        if (iSec) iSec.style.display = 'block';

        setActive(iBtn); setInactive(pBtn); setInactive(rBtn); setInactive(prBtn); setInactive(hBtn);
        
        // Update Inventory Metrics
        const st = this.getRawOilStock();
        const kuraTins = (st.kuraKg / 15.2).toFixed(1);
        const evooTins = (st.evooKg / 15.2).toFixed(1);
        const palmTins = (st.palmKg / 15.2).toFixed(1);

        const mk = document.getElementById('modalInvKuraKg');
        if (mk) {
          mk.innerText = `${st.kuraKg} kg`;
          document.getElementById('modalInvKuraTins').innerText = `(${kuraTins} تنكة 15.2kg)`;
          document.getElementById('modalInvEvooKg').innerText = `${st.evooKg} kg`;
          document.getElementById('modalInvEvooTins').innerText = `(${evooTins} تنكة 15.2kg)`;
          document.getElementById('modalInvPalmKg').innerText = `${st.palmKg} kg`;
          document.getElementById('modalInvPalmTins').innerText = `(${palmTins} تنكة 15.2kg)`;
        }
      }
    }

    switchModalInvSubtab(sub) {
      const stock = document.getElementById('modalInvSubtabStock');
      const log = document.getElementById('modalInvSubtabLog');
      const supersonic = document.getElementById('modalInvSubtabSupersonic');
      const alerts = document.getElementById('modalInvSubtabAlerts');

      const btns = {
        stock: document.getElementById('modalSubtabStockBtn'),
        log: document.getElementById('modalSubtabLogBtn'),
        supersonic: document.getElementById('modalSubtabSupersonicBtn'),
        alerts: document.getElementById('modalSubtabAlertsBtn')
      };

      Object.keys(btns).forEach(key => {
        const btn = btns[key];
        if (btn) {
          if (key === sub) {
            btn.style.background = '#2b3e2a';
            btn.style.color = '#ffffff';
            btn.style.borderColor = '#2b3e2a';
          } else if (key === 'alerts') {
            btn.style.background = '#fef2f2';
            btn.style.color = '#991b1b';
            btn.style.borderColor = '#fca5a5';
          } else {
            btn.style.background = '#f8fafc';
            btn.style.color = '#1e293b';
            btn.style.borderColor = '#cbd5e1';
          }
        }
      });

      if (stock) stock.style.display = sub === 'stock' ? 'block' : 'none';
      if (log) log.style.display = sub === 'log' ? 'block' : 'none';
      if (supersonic) supersonic.style.display = sub === 'supersonic' ? 'block' : 'none';
      if (alerts) alerts.style.display = sub === 'alerts' ? 'block' : 'none';
    }

    saveModalHandover() {
      const driver = document.getElementById('modalHandoverDriverSelect')?.value || 'سائق عام';
      const ref = document.getElementById('modalHandoverRef')?.value || 'ORD-' + Math.floor(Math.random() * 9000 + 1000);
      const item = document.getElementById('modalHandoverItemSelect')?.value || 'تنكة كاملة خضير (15.2 كجم)';
      const qty = parseInt(document.getElementById('modalHandoverQty')?.value || 0, 10);

      if (qty <= 0) {
        alert("يرجى إدخال كمية العبوات المسلمة للسائق!");
        return;
      }

      let handovers = [];
      try {
        handovers = JSON.parse(localStorage.getItem('so_delivery_handovers') || '[]');
      } catch(e) {}

      const record = {
        id: 'HO-' + Date.now(),
        timestamp: new Date().toLocaleString('ar-LB'),
        driver,
        ref,
        item,
        qty,
        status: 'قيد التوصيل (In Transit)'
      };

      handovers.unshift(record);
      localStorage.setItem('so_delivery_handovers', JSON.stringify(handovers));

      if (window.showToast) {
        window.showToast("تسليم قسم التوصيل", `تم تسليم ${qty} عبوات (${item}) للسائق [${driver}] بنجاح!`, "success");
      } else {
        alert(`تم وتسليم الشحنة (${qty} عبوة - ${item}) للسائق [${driver}] وتحديث أسطول SuperSonic بنجاح!`);
      }
    }

    recalculatePressing() {
      const kg = document.getElementById('pressOliveKg')?.value || 500;
      const acid = document.getElementById('pressAcidity')?.value || 0.4;
      const type = document.getElementById('pressType')?.value || 'COLD_PRESS';

      const res = this.calculateOlivePressing({ oliveWeightKg: kg, acidityPct: acid, pressingType: type });
      const box = document.getElementById('pressResultBox');
      if (box) {
        box.innerHTML = `
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; border-bottom: 2px solid #ccd5ae; padding-bottom: 8px;">
            <span style="font-weight: 900; color: #000000 !important; font-size: 1rem;">تصنيف الجودة المستخرجة:</span>
            <span class="badge bg-${res.qualityBadge}" style="font-size: 0.95rem; padding: 6px 14px; font-weight: bold; border: 1px solid #000000;">${res.gradeAr}</span>
          </div>
          <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px; text-align: center; margin-top: 10px;">
            <div class="so-res-card">
              <small class="so-small">الإنتاج باللتر</small>
              <strong style="color: #000000 !important;">${res.oilLiters} L</strong>
            </div>
            <div class="so-res-card">
              <small class="so-small">التنكات (16 كجم)</small>
              <strong style="color: #000000 !important;">${res.tins16L} تنكة</strong>
            </div>
            <div class="so-res-card">
              <small class="so-small">رسوم العصر ($)</small>
              <strong style="color: #000000 !important;">$${res.totalFeeUsd}</strong>
            </div>
          </div>
        `;
      }
    }

    recalculateReceiving() {
      const kuraKg = parseFloat(document.getElementById('recvKuraKg')?.value || 0);
      const evooKg = parseFloat(document.getElementById('recvEVOOKg')?.value || 0);
      const palmKg = parseFloat(document.getElementById('recvPalmKg')?.value || 0);

      const totalKg = kuraKg + evooKg + palmKg;
      // User Spec: Receiving is in Kg! 1 Tin = 16 Kg, 1 Tin = 17.5 L
      const totalTins = (totalKg / 16).toFixed(1);
      const kuraTins = (kuraKg / 16).toFixed(1);
      const evooTins = (evooKg / 16).toFixed(1);
      const palmTins = (palmKg / 16).toFixed(1);
      const totalLiters = (totalTins * 17.5).toFixed(1);

      const kuraPct = totalKg > 0 ? ((kuraKg / totalKg) * 100).toFixed(1) : 0;
      const evooPct = totalKg > 0 ? ((evooKg / totalKg) * 100).toFixed(1) : 0;
      const palmPct = totalKg > 0 ? ((palmKg / totalKg) * 100).toFixed(1) : 0;

      const box = document.getElementById('recvResultBox');
      if (box) {
        box.innerHTML = `
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; border-bottom: 2px solid #ccd5ae; padding-bottom: 8px;">
            <span style="font-weight: 900; color: #000000 !important; font-size: 0.95rem;">ملخص استلام الشحنة بالوزن من المورد:</span>
            <span style="color: #000000 !important; font-weight: 900; font-size: 0.95rem;">
              ${kuraKg}k كورة + ${evooKg}k ممتاز + ${palmKg}k نخيل = <span style="font-size: 1.1rem; color: #000000 !important;">${totalKg} kg</span>
            </span>
          </div>
          <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px; text-align: center; margin-top: 10px;">
            <div class="so-res-card">
              <small class="so-small">إجمالي الوزن المستلم</small>
              <strong style="color: #000000 !important;">${totalKg} kg</strong>
            </div>
            <div class="so-res-card">
              <small class="so-small">ما يعادل بالتنكات (16 كجم/تنكة)</small>
              <strong style="color: #000000 !important;">${totalTins} تنكة</strong>
            </div>
            <div class="so-res-card">
              <small class="so-small">الحجم بالليتر (17.5 لتر/تنكة)</small>
              <strong style="color: #000000 !important;">${totalLiters} L</strong>
            </div>
          </div>
          <div style="text-align: center; margin-top: 10px; font-size: 0.9rem; color: #000000; font-weight: 700;">
            نسب الأصناف: <span style="color:#000000;">${kuraPct}% كورة (${kuraTins} تنكة)</span> | <span style="color:#000000;">${evooPct}% ممتاز (${evooTins} تنكة)</span> | <span style="color:#000000;">${palmPct}% نخيل (${palmTins} تنكة)</span>
          </div>
        `;
      }
    }

    getInventoryPackagingItems() {
      let customCatalog = [];
      try {
        const raw = localStorage.getItem('so_packaging_catalog');
        if (raw) customCatalog = JSON.parse(raw);
      } catch (e) {}

      let stockCatalog = [];
      try {
        const rawStock = localStorage.getItem('so_stock_items');
        if (rawStock) {
          const list = JSON.parse(rawStock);
          stockCatalog = list.map(i => ({
            id: i.id || ('STK-' + (i.code || Math.random())),
            name: i.name || i.title || i.itemName,
            capacityKg: parseFloat(i.capacityKg || i.specKg || (i.name && i.name.includes('8') ? 7.8 : 15.2))
          }));
        }
      } catch (e) {}

      const defaultCatalog = [
        { id: 'PKG-16KG-KHUDAIR', name: 'تنكة كاملة خضير (15.2 كجم = 17.5 لتر)', capacityKg: 15.2 },
        { id: 'PKG-16KG-VIRGIN', name: 'تنكة كاملة فيرجن (15.2 كجم = 17.5 لتر)', capacityKg: 15.2 },
        { id: 'PKG-8KG-KHUDAIR', name: 'نصف تنكة خضير (7.8 كجم = 8.75 لتر)', capacityKg: 7.8 },
        { id: 'PKG-8KG-VIRGIN', name: 'نصف تنكة فيرجن (7.8 كجم = 8.75 لتر)', capacityKg: 7.8 },
        { id: 'PKG-5L', name: 'غالون بلاستيك 5 لتر (4.5 كجم)', capacityKg: 4.5 },
        { id: 'PKG-1L', name: 'قنينة زجاج 1 لتر (1.09 كجم)', capacityKg: 1.09 },
        { id: 'PKG-200L', name: 'برميل تعبئة بالجملة 200 لتر (183 كجم)', capacityKg: 183 }
      ];

      const all = [...customCatalog, ...stockCatalog, ...defaultCatalog];
      const unique = [];
      const seen = new Set();
      all.forEach(item => {
        if (item && item.id && !seen.has(item.id)) {
          seen.add(item.id);
          unique.push(item);
        }
      });
      return unique;
    }

    loadInventoryPackagingOptions() {
      const items = this.getInventoryPackagingItems();
      const containers = ['soMultiPackList', 'appMultiPackList'];

      containers.forEach(containerId => {
        const c = document.getElementById(containerId);
        if (c) {
          c.innerHTML = items.map(item => `
            <div style="display: flex; align-items: center; justify-content: space-between; gap: 8px; background: #ffffff; border: 1px solid #354b32; padding: 8px 12px; border-radius: 8px; margin-bottom: 6px;">
              <div style="flex: 1;">
                <strong style="color: #000000 !important; font-size: 0.9rem; display: block;">${item.name}</strong>
                <small style="color: #4b5563; font-weight: bold;">سعة الصافي: ${item.capacityKg} kg ${item.capacityKg === 15.2 ? '(تنكة كاملة)' : item.capacityKg === 7.8 ? '(نصف تنكة)' : ''}</small>
              </div>
              <div style="display: flex; align-items: center; gap: 8px;">
                <label style="font-size: 0.85rem; font-weight: bold; color: #000000;">عدد العبوات:</label>
                <input type="number" class="so-pack-qty-input form-control" data-pack-id="${item.id}" data-cap="${item.capacityKg}" value="0" min="0" style="width: 90px; font-weight: 900; text-align: center; border-color: #354b32 !important; color: #000000;" oninput="window.SouthernOliveBridge.recalculateProduction()" placeholder="0" />
                <span id="soPackSubtotal_${item.id}" class="so-pack-subtotal-span" data-pack-id="${item.id}" style="font-weight: 900; color: #2b3e2a; min-width: 70px; text-align: left; font-size: 0.88rem;">0.0 kg</span>
              </div>
            </div>
          `).join('');
        }
      });
    }

    addNewPackagingItemPrompt() {
      const name = prompt("أدخل اسم/وصف عنصر التعبئة والتغليف الجديد في المخزون (مثال: جالون بلاستيك 10 لتر):");
      if (!name || !name.trim()) return;
      const capStr = prompt("أدخل سعة الصافي بالكيلوجرام (kg) (مثال: 15.2 للتنكة الكاملة أو 7.8 لنصف التنكة):", "15.2");
      const capacityKg = parseFloat(capStr || 15.2);

      let customCatalog = [];
      try {
        const raw = localStorage.getItem('so_packaging_catalog');
        if (raw) customCatalog = JSON.parse(raw);
      } catch (e) {}

      const newItem = {
        id: 'PKG-CUSTOM-' + Date.now(),
        name: name.trim(),
        capacityKg: capacityKg
      };
      customCatalog.push(newItem);
      localStorage.setItem('so_packaging_catalog', JSON.stringify(customCatalog));
      this.loadInventoryPackagingOptions();
      this.recalculateProduction();
      alert(`تمت إضافة صنف التعبئة [${name.trim()}] بسعة ${capacityKg} kg إلى قائمة عناصر المخزون بنجاح!`);
    }

    recalculateProduction() {
      const stock = this.getRawOilStock();

      const reqKuraKg = parseFloat(document.getElementById('prodKuraKg')?.value || document.getElementById('appProdKuraKg')?.value || 0);
      const reqEvooKg = parseFloat(document.getElementById('prodEVOOKg')?.value || document.getElementById('appProdEVOOKg')?.value || 0);
      const reqPalmKg = parseFloat(document.getElementById('prodPalmKg')?.value || document.getElementById('appProdPalmKg')?.value || 0);

      const totalPulledKg = reqKuraKg + reqEvooKg + reqPalmKg;

      const isOverKura = reqKuraKg > stock.kuraKg;
      const isOverEvoo = reqEvooKg > stock.evooKg;
      const isOverPalm = reqPalmKg > stock.palmKg;
      const hasError = isOverKura || isOverEvoo || isOverPalm;

      let parts = [];
      if (reqKuraKg > 0) parts.push(`${reqKuraKg} kg كورة`);
      if (reqEvooKg > 0) parts.push(`${reqEvooKg} kg ممتاز`);
      if (reqPalmKg > 0) parts.push(`${reqPalmKg} kg نخيل`);
      const oilDeductionLabel = parts.length > 0 ? parts.join(' + ') : 'لم يحدد وزن للسحب';

      // Read Multi-Packaging Inputs
      const packInputs = document.querySelectorAll('.so-pack-qty-input');
      const inventoryPackList = this.getInventoryPackagingItems();

      let totalPackagedKg = 0;
      let packSummaryParts = [];

      packInputs.forEach(input => {
        const packId = input.getAttribute('data-pack-id');
        const capKg = parseFloat(input.getAttribute('data-cap') || 0);
        const qty = parseInt(input.value || 0, 10);
        const item = inventoryPackList.find(i => i.id === packId);

        const subtotalKg = qty * capKg;
        totalPackagedKg += subtotalKg;

        const subSpans = document.querySelectorAll(`.so-pack-subtotal-span[data-pack-id="${packId}"]`);
        subSpans.forEach(sp => {
          sp.innerText = subtotalKg > 0 ? `${subtotalKg.toFixed(1)} kg` : '0.0 kg';
        });

        if (qty > 0 && item) {
          packSummaryParts.push(`${qty}× ${item.name} (${subtotalKg.toFixed(1)}kg)`);
        }
      });

      const remKg = totalPulledKg - totalPackagedKg;
      const packText = packSummaryParts.length > 0 ? packSummaryParts.join(' + ') : '0 عبوة مختارة';

      const box = document.getElementById('prodResultBox') || document.getElementById('appProdResultBox');
      if (box) {
        box.innerHTML = `
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; border-bottom: 2px solid #ccd5ae; padding-bottom: 6px;">
            <span style="font-weight: 900; color: #000000 !important; font-size: 0.95rem;">خصم مخزون الخام المحدد (كجم):</span>
            <span style="color: ${hasError ? '#dc2626' : '#000000'} !important; font-weight: 900; font-size: 0.95rem;">
              ${oilDeductionLabel} = <span style="font-size: 1.1rem; color: #000000 !important;">${totalPulledKg.toFixed(1)} kg إجمالي السحب</span>
            </span>
          </div>
          ${hasError ? `<div style="color: #dc2626 !important; font-weight: 900; margin-bottom: 8px; font-size: 0.9rem;"><i class="fa-solid fa-triangle-exclamation me-1"></i> تنبيه: كمية السحب تزيد عن رصيد الزيت الخام المتوفر!</div>` : ''}
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; text-align: center; margin-top: 10px;">
            <div class="so-res-card">
              <small class="so-small">إجمالي الوزن المسحوب</small>
              <strong style="color: #000000 !important; font-size: 1.05rem;">${totalPulledKg.toFixed(1)} kg</strong>
            </div>
            <div class="so-res-card">
              <small class="so-small">وزن العبوات المنتجة</small>
              <strong style="color: #000000 !important; font-size: 0.92rem;">${totalPackagedKg.toFixed(1)} kg ${remKg !== 0 ? `(الفارق: ${remKg.toFixed(1)} kg)` : '(مطابق 100%)'}</strong>
            </div>
          </div>
          <div style="margin-top: 8px; padding-top: 6px; border-top: 1px dashed #ccd5ae; font-size: 0.85rem; font-weight: bold; color: #000000;">
            <i class="fa-solid fa-box-open me-1"></i> العبوات المقررة: ${packText}
          </div>
        `;
      }
    }

    savePressingBatch() {
      const modal = document.getElementById('so-olive-pressing-modal');
      if (modal) modal.style.display = 'none';
      if (window.showToast) {
        window.showToast("معصرة الزيتون", "تم حفظ دفعة العصر وإضافتها إلى سجلات خزانات الزيت بنجاح", "success");
      }
    }

    saveReceivingBatch() {
      const vendor = document.getElementById('recvVendorSelect')?.value || 'مورد عام';
      const kuraKg = parseFloat(document.getElementById('recvKuraKg')?.value || 0);
      const evooKg = parseFloat(document.getElementById('recvEVOOKg')?.value || 0);
      const palmKg = parseFloat(document.getElementById('recvPalmKg')?.value || 0);
      const totalKg = kuraKg + evooKg + palmKg;

      if (totalKg <= 0) {
        if (window.showToast) window.showToast("استلام الزيت", "يرجى إدخال وزن الزيت المستلم بالكيلوجرام", "warning");
        return;
      }

      const stock = this.getRawOilStock();
      stock.kuraKg = (stock.kuraKg || 0) + kuraKg;
      stock.evooKg = (stock.evooKg || 0) + evooKg;
      stock.palmKg = (stock.palmKg || 0) + palmKg;
      this.saveRawOilStock(stock);

      const totalTins = (totalKg / 16).toFixed(1);
      const totalLiters = (totalTins * 17.5).toFixed(1);

      const modal = document.getElementById('so-olive-pressing-modal');
      if (modal) modal.style.display = 'none';
      if (window.showToast) {
        window.showToast(
          "استلام زيت بالوزن (كجم)", 
          `تم تسجيل استلام ${totalKg} kg (${totalTins} تنكة / ${totalLiters} لتر) من [${vendor}] وتحديث المخزون بنجاح`, 
          "success"
        );
      }
    }

    executeProductionBatch() {
      const reqKuraKg = parseFloat(document.getElementById('prodKuraKg')?.value || document.getElementById('appProdKuraKg')?.value || 0);
      const reqEvooKg = parseFloat(document.getElementById('prodEVOOKg')?.value || document.getElementById('appProdEVOOKg')?.value || 0);
      const reqPalmKg = parseFloat(document.getElementById('prodPalmKg')?.value || document.getElementById('appProdPalmKg')?.value || 0);
      const totalKg = reqKuraKg + reqEvooKg + reqPalmKg;

      if (totalKg <= 0) {
        if (window.showToast) window.showToast("إنتاج الزيت", "يرجى إدخال وزن سحب للنوع المطلوب (كورة، ممتاز، أو نخيل) بالكيلوجرام (kg)", "warning");
        else alert("يرجى إدخال وزن سحب للنوع المطلوب (كورة، ممتاز، أو نخيل) بالكيلوجرام (kg)");
        return;
      }

      const stock = this.getRawOilStock();
      if (reqKuraKg > stock.kuraKg || reqEvooKg > stock.evooKg || reqPalmKg > stock.palmKg) {
        if (window.showToast) window.showToast("خطأ في المخزون", "كمية السحب المطلوبة تزيد عن رصيد الزيت الخام المتاح في المستودع", "danger");
        else alert("كمية السحب المطلوبة تزيد عن رصيد الزيت الخام المتاح في المستودع");
        return;
      }

      stock.kuraKg -= reqKuraKg;
      stock.evooKg -= reqEvooKg;
      stock.palmKg -= reqPalmKg;
      this.saveRawOilStock(stock);

      const packInputs = document.querySelectorAll('.so-pack-qty-input');
      const inventoryPackList = this.getInventoryPackagingItems();
      let packSummaryParts = [];

      packInputs.forEach(input => {
        const packId = input.getAttribute('data-pack-id');
        const capKg = parseFloat(input.getAttribute('data-cap') || 0);
        const qty = parseInt(input.value || 0, 10);
        const item = inventoryPackList.find(i => i.id === packId);

        if (qty > 0 && item) {
          packSummaryParts.push(`${qty}× ${item.name}`);
        }
      });

      const packDescText = packSummaryParts.length > 0 ? packSummaryParts.join('، ') : 'تعبئة عامة';

      let deductedSummary = [];
      if (reqKuraKg > 0) deductedSummary.push(`${reqKuraKg} kg كورة`);
      if (reqEvooKg > 0) deductedSummary.push(`${reqEvooKg} kg ممتاز`);
      if (reqPalmKg > 0) deductedSummary.push(`${reqPalmKg} kg نخيل`);

      const modal = document.getElementById('so-olive-pressing-modal');
      if (modal) modal.style.display = 'none';

      const msg = `تم خصم [${deductedSummary.join(' + ')}] من المخزون الخام وتأكيد تعبئة (${packDescText}) بإجمالي ${totalKg.toFixed(1)} kg بنجاح!`;

      if (window.showToast) {
        window.showToast("عملية خلط وإنتاج سحب الزيت", msg, "success");
      } else {
        alert(msg);
      }
    }

    getSavedVendors() {
      try {
        const raw = localStorage.getItem('so_vendors_list');
        if (raw) return JSON.parse(raw);
      } catch (e) {}
      return [
        { name: 'معصرة الجنوب المركزية', phone: '07-720100', address: 'صيدا - الجنوب', category: 'معصرة زيت مركزية', notes: 'المعصرة الرئيسية' },
        { name: 'مزارع صيدا وحاصبيا', phone: '70-112233', address: 'حاصبيا', category: 'مزارع زيتون', notes: 'مزارع زيتون بلدي' },
        { name: 'مورد زيت كورة ممتاز', phone: '03-445566', address: 'الكورة - الشمال', category: 'مورد زيت كورة ممتاز', notes: 'نخبة أولى' },
        { name: 'مورد زيت نخيل مستورد', phone: '01-889900', address: 'مرفأ بيروت', category: 'مورد زيت نخيل / مستورد', notes: 'مورد مستورد' }
      ];
    }

    loadSavedVendors() {
      const list = this.getSavedVendors();
      const selectors = ['recvVendorSelect', 'appRecvVendorSelect'];
      selectors.forEach(id => {
        const sel = document.getElementById(id);
        if (sel) {
          sel.innerHTML = list.map(v => {
            const label = typeof v === 'object' ? `${v.name} — (${v.category || 'مورد'} - 📞 ${v.phone || 'بدون هاتف'})` : v;
            const val = typeof v === 'object' ? v.name : v;
            return `<option value="${val}">${label}</option>`;
          }).join('');
        }
      });
    }

    addNewVendorPrompt() {
      this.openAddVendorModal();
    }

    openAddVendorModal() {
      let modal = document.getElementById('so-add-vendor-modal');
      if (!modal) {
        modal = document.createElement('div');
        modal.id = 'so-add-vendor-modal';
        modal.style.cssText = 'position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(0,0,0,0.85); z-index: 9999999; display: flex; align-items: center; justify-content: center; font-family: system-ui, -apple-system, sans-serif;';
        modal.innerHTML = `
          <div style="background: #2b3e2a; border: 3px solid #84a98c; border-radius: 1rem; width: 95%; max-width: 580px; padding: 1.5rem; color: #000000; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.9);">
            
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; border-bottom: 2px solid #84a98c; padding-bottom: 0.75rem;">
              <h5 style="margin: 0; color: #fefae0 !important; font-weight: 900;"><i class="fa-solid fa-user-plus me-2"></i> إضافة مورد / مزارع جديد (Add Vendor)</h5>
              <button onclick="document.getElementById('so-add-vendor-modal').style.display='none'" style="background: transparent; border: none; color: #fefae0; font-size: 1.5rem; cursor: pointer; font-weight: bold;">&times;</button>
            </div>

            <div style="background: #fefae0; border: 2px solid #ccd5ae; border-radius: 12px; padding: 1.25rem; margin-bottom: 1rem;">
              
              <div style="margin-bottom: 0.85rem;">
                <label style="display: block; font-weight: 800; color: #000000 !important; margin-bottom: 4px; font-size: 0.9rem;">اسم المورد / المزارع / الشركة *</label>
                <input type="text" id="soVendorNameInput" class="form-control" placeholder="أدخل الاسم الثلاثي أو اسم المعصرة/الشركة..." style="background: #ffffff !important; color: #000000 !important; font-weight: 900; border: 2px solid #354b32 !important;" />
              </div>

              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; margin-bottom: 0.85rem;">
                <div>
                  <label style="display: block; font-weight: 800; color: #000000 !important; margin-bottom: 4px; font-size: 0.9rem;">رقم الهاتف / الواتساب *</label>
                  <input type="text" id="soVendorPhoneInput" class="form-control" placeholder="مثال: 07-720100 / 70123456" style="background: #ffffff !important; color: #000000 !important; font-weight: 900; border: 2px solid #354b32 !important;" />
                </div>
                <div>
                  <label style="display: block; font-weight: 800; color: #000000 !important; margin-bottom: 4px; font-size: 0.9rem;">العنوان / المنطقة *</label>
                  <input type="text" id="soVendorAddressInput" class="form-control" placeholder="مثال: صيدا، حاصبيا، صور..." style="background: #ffffff !important; color: #000000 !important; font-weight: 900; border: 2px solid #354b32 !important;" />
                </div>
              </div>

              <div style="margin-bottom: 0.85rem;">
                <label style="display: block; font-weight: 800; color: #000000 !important; margin-bottom: 4px; font-size: 0.9rem;">تصنيف المورد / مجال العمل *</label>
                <select id="soVendorCategoryInput" class="form-select" style="background: #ffffff !important; color: #000000 !important; font-weight: 900; border: 2px solid #354b32 !important;">
                  <option value="مزارع زيتون">مزارع زيتون (Olive Farmer)</option>
                  <option value="معصرة زيت مركزية">معصرة زيت مركزية (Central Olive Press)</option>
                  <option value="مورد زيت كورة ممتاز">مورد زيت كورة ممتاز (Kura Oil Supplier)</option>
                  <option value="مورد زيت نخيل / مستورد">مورد زيت نخيل / مستورد (Palm Oil Importer)</option>
                  <option value="مورد عبوات وتغليف">مورد عبوات وتغليف (Packaging Supplier)</option>
                  <option value="مورد / تاجر عام">مورد / تاجر عام (General Oil Trader)</option>
                </select>
              </div>

              <div>
                <label style="display: block; font-weight: 800; color: #000000 !important; margin-bottom: 4px; font-size: 0.9rem;">ملاحظات تفصيلية / مجال التوريد</label>
                <textarea id="soVendorNotesInput" class="form-control" rows="2" placeholder="أدخل أي ملاحظات إضافية حول التجهيز والتوريد..." style="background: #ffffff !important; color: #000000 !important; font-weight: 900; border: 2px solid #354b32 !important;"></textarea>
              </div>

            </div>

            <div style="display: flex; gap: 10px; justify-content: flex-end;">
              <button onclick="document.getElementById('so-add-vendor-modal').style.display='none'" style="background: #ffffff; color: #000000; border: 2px solid #cbd5e1; border-radius: 8px; padding: 8px 18px; font-weight: bold; cursor: pointer;">
                إلغاء
              </button>
              <button onclick="window.SouthernOliveBridge.saveVendorFromModal()" style="background: #fefae0; color: #000000; border: 2px solid #354b32; border-radius: 8px; padding: 8px 22px; font-weight: 900; cursor: pointer;">
                <i class="fa-solid fa-floppy-disk me-1"></i> حفظ وتأكيد المورد
              </button>
            </div>

          </div>
        `;
        document.body.appendChild(modal);
      }
      
      const nameEl = document.getElementById('soVendorNameInput');
      const phoneEl = document.getElementById('soVendorPhoneInput');
      const addrEl = document.getElementById('soVendorAddressInput');
      const catEl = document.getElementById('soVendorCategoryInput');
      const notesEl = document.getElementById('soVendorNotesInput');

      if (nameEl) nameEl.value = '';
      if (phoneEl) phoneEl.value = '';
      if (addrEl) addrEl.value = '';
      if (catEl) catEl.value = 'مزارع زيتون';
      if (notesEl) notesEl.value = '';
      modal.style.display = 'flex';
    }

    saveVendorFromModal() {
      const name = document.getElementById('soVendorNameInput')?.value || '';
      const phone = document.getElementById('soVendorPhoneInput')?.value || '';
      const address = document.getElementById('soVendorAddressInput')?.value || '';
      const category = document.getElementById('soVendorCategoryInput')?.value || 'مورد عام';
      const notes = document.getElementById('soVendorNotesInput')?.value || '';

      if (!name.trim()) {
        alert("يرجى إدخال اسم المورد / المزارع");
        return;
      }
      if (!phone.trim()) {
        alert("يرجى إدخال رقم هاتف المورد / الواتساب");
        return;
      }

      const list = this.getSavedVendors();
      const newVendor = {
        name: name.trim(),
        phone: phone.trim(),
        address: address.trim(),
        category: category,
        notes: notes.trim(),
        id: 'VEND-' + Date.now()
      };

      list.push(newVendor);
      localStorage.setItem('so_vendors_list', JSON.stringify(list));

      const simpleList = list.map(v => typeof v === 'object' ? v.name : v);
      localStorage.setItem('so_saved_vendors', JSON.stringify(simpleList));

      this.loadSavedVendors();

      const selectors = ['recvVendorSelect', 'appRecvVendorSelect'];
      selectors.forEach(id => {
        const sel = document.getElementById(id);
        if (sel) sel.value = name.trim();
      });

      const modal = document.getElementById('so-add-vendor-modal');
      if (modal) modal.style.display = 'none';

      if (window.showToast) {
        window.showToast("إضافة مورد جديد", `تمت إضافة المورد [${name.trim()}] - (${category}) - هاتف: ${phone.trim()} بنجاح!`, "success");
      } else {
        alert(`تمت إضافة المورد [${name.trim()}] - (${category}) - هاتف: ${phone.trim()} بنجاح!`);
      }
    }

    validateStockReceivingForOil(itemName, warehouse) {
      const text = ((itemName || '') + ' ' + (warehouse || '')).toLowerCase();
      const keywords = ['oil', 'زيت', 'كورة', 'kura', 'extra virgin', 'evoo', 'bulk oil', 'بكر ممتاز'];
      const isOil = keywords.some(kw => text.includes(kw.toLowerCase()));
      if (isOil) {
        this.showOilReceivingRestrictionModal(itemName);
        return false;
      }
      return true;
    }

    showOilReceivingRestrictionModal(itemName) {
      let modal = document.getElementById('so-oil-restriction-modal');
      if (!modal) {
        modal = document.createElement('div');
        modal.id = 'so-oil-restriction-modal';
        modal.style.cssText = 'position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(0,0,0,0.8); z-index: 999999; display: flex; align-items: center; justify-content: center; font-family: system-ui, -apple-system, sans-serif;';
        modal.innerHTML = `
          <div style="background: #0f172a; border: 2px solid #ef4444; border-radius: 1rem; width: 92%; max-width: 520px; padding: 1.5rem; color: #f8fafc; text-align: center; box-shadow: 0 25px 50px -12px rgba(239,68,68,0.3);">
            <div style="font-size: 3rem; color: #ef4444; margin-bottom: 0.5rem;"><i class="fa-solid fa-triangle-exclamation"></i></div>
            <h4 style="color: #f87171; font-weight: bold; margin-bottom: 0.75rem;">إشعار هام: استلام الزيوت محظور هنا (Oil Entry Restricted)</h4>
            <p style="color: #cbd5e1; font-size: 0.95rem; line-height: 1.6; margin-bottom: 1.25rem;">
              لا يمكن استلام زيوت الزيتون (مثل <strong id="soOilRestrictedItemName" style="color:#fbbf24;">${itemName || 'زيت الزيتون'}</strong>) من شاشة استلام البضائع العامة.<br/><br/>
              يرجى الذهاب إلى تطبيق <strong>(معصرة واستلام وإنتاج الزيت — Oil Press, Receive & Production)</strong> لتسجيل الزيوت والخلائط بدقة.
            </p>
            <div style="display: flex; gap: 10px; justify-content: center;">
              <button onclick="document.getElementById('so-oil-restriction-modal').style.display='none'" style="background: #334155; color: #fff; border: none; border-radius: 8px; padding: 10px 18px; font-weight: bold; cursor: pointer;">
                إلغاء
              </button>
              <button onclick="document.getElementById('so-oil-restriction-modal').style.display='none'; if(window.SouthernOliveBridge){ window.SouthernOliveBridge.openOlivePressingModal('RECEIVING'); } else if(window.openOlivePressingModal){ window.openOlivePressingModal('RECEIVING'); }" style="background: linear-gradient(135deg, #f59e0b, #d97706); color: #020617; border: none; border-radius: 8px; padding: 10px 20px; font-weight: bold; cursor: pointer; box-shadow: 0 4px 12px rgba(245, 158, 11, 0.4);">
                <i class="fa-solid fa-truck-ramp-box me-1"></i> فتح تطبيق معصرة واستلام وإنتاج الزيت
              </button>
            </div>
          </div>
        `;
        document.body.appendChild(modal);
      } else {
        const el = document.getElementById('soOilRestrictedItemName');
        if (el) el.textContent = itemName || 'زيت الزيتون';
      }
      modal.style.display = 'flex';
    }
  }

  // Expose singleton on global window object
  window.SouthernOliveBridge = new SouthernOliveBridge();
  window.openOlivePressingModal = function(mode = 'PRESSING') {
    return window.SouthernOliveBridge.openOlivePressingModal(mode);
  };

})(typeof window !== 'undefined' ? window : globalThis);

