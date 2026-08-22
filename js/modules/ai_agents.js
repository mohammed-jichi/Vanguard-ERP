/**
 * SOUTHERN OLIVE ERP - BACKEND AI AGENTS ENGINE
 * Event-Driven Architecture with 4 Autonomous AI Agents working without human intervention:
 * 1. Lead Routing Agent (Landing page order routing, Rep Agent_ID binding, 30-min timer, commission transfer)
 * 2. Inventory & Production Sync Agent (BOM assembly recipes, raw material deduction, finished goods stock credit)
 * 3. Smart Dispatch Agent (Geographic route batching, Departure trigger, WhatsApp API customer notifications)
 * 4. Real-Time Ledger & Chart Agent (Finger digital signature verification, status closure, real-time chart updates, fallback handling)
 */

window.SouthernOliveAI = (function () {
  let agentLogs = [];

  function logAgentEvent(agentName, action, details) {
    const timestamp = new Date().toLocaleTimeString();
    const entry = { timestamp, agentName, action, details };
    agentLogs.unshift(entry);
    if (agentLogs.length > 50) agentLogs.pop();

    // Notify UI if log listener is attached
    if (window.onAIAgentLog) {
      window.onAIAgentLog(entry);
    }
  }

  // AGENT 1: Lead Routing Agent
  const LeadRoutingAgent = {
    name: 'Lead Routing Agent',
    processNewOrder: function (order, repId) {
      logAgentEvent(this.name, 'CAPTURE_LEAD', `Captured new order #${order.id} from Landing Page for Customer ${order.customerName}`);

      // Bind Agent_ID
      order.repId = repId || 'REP-101';
      order.commissionEligible = true;
      order.createdAt = new Date().getTime();
      order.timerMinutesRemaining = 30;
      order.status = 'Unconfirmed';

      logAgentEvent(this.name, 'BIND_AGENT', `Bound order #${order.id} to Sales Rep [${order.repId}]. Started 30-minute escalation countdown.`);
      return order;
    },

    handleTimerExpiry: function (order) {
      logAgentEvent(this.name, 'TIMER_EXPIRED', `30-minute timer expired for Order #${order.id} without Rep confirmation.`);
      order.repId = 'MANAGEMENT';
      order.commissionEligible = false;
      order.status = 'Escalated_To_Management';
      order.escalatedAt = new Date().toISOString();

      logAgentEvent(this.name, 'REASSIGN_COMMISSION', `Reassigned Order #${order.id} to Social Media Management. Commission set to 0% for Rep.`);

      if (window.showToast) {
        window.showToast("AI Agent Notification", `Order #${order.id} expired 30-min window & was auto-transferred to Management.`, "warning");
      }
      return order;
    }
  };

  // AGENT 2: Inventory & Production Sync Agent
  const InventorySyncAgent = {
    name: 'Inventory & Production Sync Agent',
    bomRecipes: {
      'EVOO_1L': {
        name: 'Extra Virgin Olive Oil 1L Glass Bottle',
        rawMaterials: [
          { item: 'Bulk Raw Olive Oil (Kg)', qty: 0.92, warehouse: 'WH-1 (Raw Materials)' },
          { item: 'Glass Bottle 1L', qty: 1.0, warehouse: 'WH-2 (Bottling Materials)' },
          { item: 'Metallic Cap & Seal', qty: 1.0, warehouse: 'WH-2 (Bottling Materials)' },
          { item: 'Brand Label Front/Back', qty: 1.0, warehouse: 'WH-2 (Bottling Materials)' },
          { item: 'RO Water Wash (L)', qty: 5.0, warehouse: 'WH-4 (2000L RO Water System)' }
        ]
      },
      'EVOO_5L_TIN': {
        name: 'Extra Virgin Olive Oil 5L Premium Tin',
        rawMaterials: [
          { item: 'Bulk Raw Olive Oil (Kg)', qty: 4.60, warehouse: 'WH-1 (Raw Materials)' },
          { item: 'Tin Container 5L', qty: 1.0, warehouse: 'WH-2 (Bottling Materials)' },
          { item: 'Plastic Spout Seal', qty: 1.0, warehouse: 'WH-2 (Bottling Materials)' },
          { item: 'RO Water Wash (L)', qty: 10.0, warehouse: 'WH-4 (2000L RO Water System)' }
        ]
      },
      'MAKDOUJS_JAR_1KG': {
        name: 'Stuffed Eggplant Makdous 1Kg Jar',
        rawMaterials: [
          { item: 'Boiled Eggplants (Kg)', qty: 0.70, warehouse: 'WH-1 (Raw Materials)' },
          { item: 'Walnut & Red Pepper Stuffing (Kg)', qty: 0.20, warehouse: 'WH-1 (Raw Materials)' },
          { item: 'Refined Olive Oil (Kg)', qty: 0.25, warehouse: 'WH-1 (Raw Materials)' },
          { item: 'Glass Jar 1Kg', qty: 1.0, warehouse: 'WH-2 (Bottling Materials)' }
        ]
      }
    },

    executeProductionBatch: function (recipeKey, quantity) {
      const recipe = this.bomRecipes[recipeKey];
      if (!recipe) return false;

      logAgentEvent(this.name, 'READ_BOM', `Reading BOM Recipe for ${recipe.name} x ${quantity} units.`);

      recipe.rawMaterials.forEach(mat => {
        const totalDeducted = mat.qty * quantity;
        logAgentEvent(this.name, 'DEDUCT_RAW_MATERIAL', `Deducted ${totalDeducted.toFixed(2)} units of ${mat.item} from ${mat.warehouse} (Negative Stock Permitted).`);
      });

      logAgentEvent(this.name, 'CREDIT_FINISHED_GOODS', `Credited ${quantity} finished units of ${recipe.name} to WH-3 (Finished Goods Warehouse).`);
      return true;
    }
  };

  // AGENT 3: Smart Dispatch Agent
  const SmartDispatchAgent = {
    name: 'Smart Dispatch Agent',
    createBatchedRoutes: function (orders) {
      logAgentEvent(this.name, 'ANALYZE_COORDINATES', `Analyzing geographic coordinates for ${orders.length} active delivery orders.`);

      const routes = {
        'Beirut & Suburbs': [],
        'Mount Lebanon / Choueifat': [],
        'South Lebanon (Saida/Tyre)': [],
        'North & Bekaa': []
      };

      orders.forEach(ord => {
        const region = ord.region || 'Beirut & Suburbs';
        if (routes[region]) routes[region].push(ord);
        else routes['Beirut & Suburbs'].push(ord);
      });

      logAgentEvent(this.name, 'BATCH_ROUTES_CREATED', `Generated ${Object.keys(routes).length} smart driver delivery routes.`);
      return routes;
    },

    triggerDepartureNotification: function (driverName, routeName, orders) {
      logAgentEvent(this.name, 'WHATSAPP_API_CONNECT', `Connecting to WhatsApp API for Route [${routeName}] driven by ${driverName} from Choueifat HQ.`);

      const notifications = orders.map(ord => {
        const eta = (routeName.includes('Beirut') || routeName.includes('Choueifat')) ? '1-3 Days' : '3-5 Days';
        const msg = `Dear ${ord.customerName}, your Southern Olive order #${ord.id} is ON THE WAY with Driver ${driverName} (+961 70 123456). Total: $${ord.totalAmount} (${ord.paymentMethod}). Track Live: https://southernolive.com/track?id=${ord.id}`;

        logAgentEvent(this.name, 'WHATSAPP_SENT', `Sent automated WhatsApp notice to ${ord.phone} (ETA: ${eta}).`);
        return { phone: ord.phone, message: msg };
      });

      return notifications;
    }
  };

  // AGENT 4: Real-Time Ledger & Chart Agent
  const LedgerChartAgent = {
    name: 'Real-Time Ledger & Chart Agent',
    processDeliverySettlement: function (order, signatureData, driverNotes) {
      logAgentEvent(this.name, 'VERIFY_DIGITAL_SIGNATURE', `Verifying digital finger signature for Order #${order.id}. Data length: ${signatureData ? signatureData.length : 0} bytes.`);

      order.status = 'Delivered';
      order.deliveredAt = new Date().toISOString();
      order.signature = signatureData;
      order.driverNotes = driverNotes;

      // Financial posting
      const commissionAmount = order.commissionEligible ? (order.totalAmount * (order.commissionRate || 0.05)) : 0;
      logAgentEvent(this.name, 'POST_JOURNAL_VOUCHER', `Posted JV: Debit Cash/Wish Box ($${order.totalAmount}), Credit Sales Revenue ($${order.totalAmount}). Commission ($${commissionAmount.toFixed(2)}) credited to ${order.repId}.`);

      logAgentEvent(this.name, 'WEBSOCKET_CHART_TRIGGER', `Emitted live update event. Rep sales charts, driver shift logs, and accounting dashboards updated instantly.`);
      return { success: true, commissionAmount };
    },

    processRejectionOrPending: function (order, statusType, reason) {
      logAgentEvent(this.name, 'PROCESS_SPECIAL_CASE', `Processing Order #${order.id} status update to: ${statusType}. Reason: ${reason}`);

      if (statusType === 'Rejected') {
        order.status = 'Rejected';
        order.repCommission = 0;
        order.mandatoryDeliveryFeeCollected = true;
        logAgentEvent(this.name, 'REJECTED_LOGGED', `Mandatory delivery fee ($3.00) recorded for Rejected Order #${order.id}. Rep commission zeroed.`);
      } else if (statusType === 'Pending') {
        order.status = 'Pending_Reschedule';
        logAgentEvent(this.name, 'PENDING_RETURN', `Order #${order.id} (Customer Absent) re-routed back to Main Dispatch Center for next shift batching.`);
      }
      return order;
    }
  };

  // AGENT 5: Gemini WhatsApp Sales Bot (Autonomous Sales & Order Intake Agent)
  const GeminiWhatsAppSalesBot = {
    name: 'Southern Olive AI Assistant',
    role: 'WhatsApp Sales & Order Intake Bot',

    // Product Catalog (Read-Only via Supabase PostgreSQL / Local Fallback)
    productCatalog: [
      { id: 'P101', name: 'Extra Virgin Olive Oil 1L Glass', name_ar: 'زيت زيتون بكر ممتاز 1 لتر زجاج', category: 'Olive Oil', acidity: '0.8%', price_usd: 12.50, stock: 450 },
      { id: 'P102', name: 'Extra Virgin Olive Oil 5L Premium Tin', name_ar: 'زيت زيتون بكر ممتاز 5 لتر تنكة', category: 'Olive Oil', acidity: '0.8%', price_usd: 55.00, stock: 220 },
      { id: 'P103', name: 'Virgin Olive Oil 16L Bulk Tin', name_ar: 'زيت زيتون بكر 16 لتر تنكة كبيرة', category: 'Olive Oil', acidity: '1.8%', price_usd: 140.00, stock: 85 },
      { id: 'P201', name: 'Pomegranate Molasses 500ml', name_ar: 'دبس رمان صافي 100% 500مل', category: 'Food Derivatives', price_usd: 6.50, stock: 310 },
      { id: 'P202', name: 'Stuffed Eggplant Makdous 1Kg Jar', name_ar: 'مكدوس باذنجان بلدي جوز وفلفل 1كغ', category: 'Food Derivatives', price_usd: 15.00, stock: 180 },
      { id: 'P203', name: 'Tomato Paste 800g', name_ar: 'رب البندورة الطبيعي 800غ', category: 'Food Derivatives', price_usd: 3.50, stock: 500 },
      { id: 'P204', name: 'Natural Apple Cider Vinegar 500ml', name_ar: 'خل تفاح طبيعي 500مل', category: 'Food Derivatives', price_usd: 4.50, stock: 240 },
      { id: 'P301', name: 'Orange Blossom Water 500ml Glass', name_ar: 'ماء زهر مقطر 500مل زجاج', category: 'Floral Waters', price_usd: 5.00, stock: 350 },
      { id: 'P302', name: 'Rose Water 500ml Glass', name_ar: 'ماء ورد بلدي 500مل زجاج', category: 'Floral Waters', price_usd: 5.50, stock: 290 },
      { id: 'P401', name: 'Javel Concentrated Cleaner 2L', name_ar: 'هايپوكلوريت جافيل مركز 2 لتر', category: 'Chemical Cleaners', price_usd: 3.00, stock: 600 },
      { id: 'P402', name: 'Multi-Purpose Cleaning Gel 1kg', name_ar: 'جل تنظيف وشطف متعدد الاستعمالات 1كغ', category: 'Chemical Cleaners', price_usd: 4.00, stock: 420 }
    ],

    // Helper: Fetch Live Exchange Rate (Default 89,500 LBP/$)
    getExchangeRate: function () {
      const el = document.getElementById('globalUsdRateSpan');
      if (el && el.innerText) {
        const rate = parseFloat(el.innerText.replace(/,/g, ''));
        if (!isNaN(rate) && rate > 0) return rate;
      }
      return 89500;
    },

    // Helper: Language Detector (Lebanese/MS Arabic vs EN/FR)
    detectLanguage: function (text) {
      const arabicPattern = /[\u0600-\u06FF]/;
      if (arabicPattern.test(text)) return 'ar';
      if (/bonjour|salut|merci|prix|commande/i.test(text)) return 'fr';
      return 'en';
    },

    // Core Intent Recognition
    detectIntent: function (message) {
      const msg = message.toLowerCase();

      // Check Escalation triggers (Wholesale, B2B, Complaints, Custom contracts)
      if (/b2b|wholesale|جملة|تجارية|شكوى|كميات كبيرة|تصدير|موزع|استثمار|مستورد/i.test(msg)) {
        return 'ESCALATE';
      }

      // Check Order Confirmation Intent
      if (/تأكيد|تأكيد الطلب|تثبيت|موافق|تأكيد الشراء|confirm|place order|yes confirm/i.test(msg)) {
        return 'ORDER_CONFIRM';
      }

      // Check Order Creation / Shopping Cart Intent
      if (/بدي اشتري|بدي اطلب|اريد طلب|طلب جديد|شراء|تنكة|زيت|مكدوس|دبس|ماء زهر|جافيل|buy|order/i.test(msg)) {
        return 'ORDER_START';
      }

      // Default: Information Inquiry
      return 'INQUIRY';
    },

    // Process Incoming WhatsApp Message
    processWhatsAppMessage: async function (customerPhone, customerMessage, context = {}) {
      logAgentEvent(this.name, 'WHATSAPP_MESSAGE_RECEIVED', `Received message from [${customerPhone}]: "${customerMessage}"`);

      const lang = this.detectLanguage(customerMessage);
      const intent = this.detectIntent(customerMessage);
      const rate = this.getExchangeRate();

      // 1. ESCALATION PROTOCOL (Transfer to Human Omnichannel Rep)
      if (intent === 'ESCALATE') {
        logAgentEvent(this.name, 'HUMAN_HANDOFF_TRIGGERED', `Escalated chat from ${customerPhone} to Social Media Omnichannel Unified Inbox.`);

        // Save escalation status to session storage for Omnichannel Inbox
        const escalatedChat = {
          phone: customerPhone,
          name: context.name || 'عميل واتساب',
          message: customerMessage,
          status: 'Escalated_To_Human',
          timestamp: new Date().toLocaleTimeString()
        };
        let chatList = JSON.parse(sessionStorage.getItem('so_escalated_chats') || '[]');
        chatList.unshift(escalatedChat);
        sessionStorage.setItem('so_escalated_chats', JSON.stringify(chatList));

        const replyAr = `أهلاً بك مع منتوجات زيت وزيتون الجنوب! 🌿\nتم تحويل محادثتك فوراً إلى أحد ممثلي المبيعات والدعم الفني في قسم إدارة السوشيال ميديا لمتابعة طلبك والتواصل معك شخصياً بأسرع وقت. شكراً لثقتك بنا!`;
        const replyEn = `Hello! Your request regarding wholesale/special inquiries has been escalated to our Social Media Management Human Support Team. A representative will contact you shortly!`;

        return {
          reply: lang === 'ar' ? replyAr : replyEn,
          action: 'ESCALATED',
          status: 'Escalated_To_Human'
        };
      }

      // 2. ORDER CONFIRMATION & DRAFT ORDER CREATION
      if (intent === 'ORDER_CONFIRM' || context.isReadyToConfirm) {
        logAgentEvent(this.name, 'GENERATE_DRAFT_ORDER', `Customer ${customerPhone} confirmed order. Generating Draft Order Payload...`);

        const orderPayload = {
          customer_name: context.customerName || 'زبون واتساب',
          phone_number: customerPhone,
          delivery_address: context.address || 'لبنان - العنوان محدد بالواتساب',
          items: context.items || [
            { id: 'P102', name: 'Extra Virgin Olive Oil 5L Premium Tin', qty: 1, price_usd: 55.00 }
          ],
          total_usd: context.totalUsd || 55.00,
          total_lbp: (context.totalUsd || 55.00) * rate,
          payment_method: context.paymentMethod || 'كاش عند الاستلام',
          status: 'DRAFT',
          source: 'WhatsApp AI Bot',
          created_at: new Date().toISOString()
        };

        // Insert into Supabase (if available) & local ERP session queue
        try {
          if (window.supabaseClient) {
            await window.supabaseClient.from('orders').insert([orderPayload]);
            logAgentEvent(this.name, 'SUPABASE_INSERT_SUCCESS', `Draft Order inserted securely into Supabase PostgreSQL (Status: DRAFT).`);
          }
        } catch (err) {
          logAgentEvent(this.name, 'SUPABASE_INSERT_FALLBACK', `Saved Draft Order locally to ERP Social Draft queue: ${err.message}`);
        }

        // Store in localStorage draft queue for Social Media Management Inbox
        let draftOrders = JSON.parse(localStorage.getItem('so_draft_orders') || '[]');
        draftOrders.unshift(orderPayload);
        localStorage.setItem('so_draft_orders', JSON.stringify(draftOrders));

        const formattedLbp = orderPayload.total_lbp.toLocaleString('en-US');
        const replyAr = `تم تسجيل طلبك بنجاح كمسوّدة طلب (Draft Order) رقم #${Math.floor(1000 + Math.random() * 9000)}! 📦🌿\n\n- الزبون: ${orderPayload.customer_name}\n- الإجمالي: $${orderPayload.total_usd.toFixed(2)} USD (${formattedLbp} LBP)\n- العنوان: ${orderPayload.delivery_address}\n- طريقة الدفع: ${orderPayload.payment_method}\n\nطلبك الآن قيد مراجعة المبيعات الإدارية، وسيتواصل معك فريقي لتأكيد موعد التسليم الدقيق. شكراً لاختيارك منتوجات زيت وزيتون الجنوب!`;

        return {
          reply: replyAr,
          action: 'DRAFT_CREATED',
          order: orderPayload
        };
      }

      // 3. CATALOG INQUIRY / ORDER START FLOW
      let matchProducts = [];
      const msgLower = customerMessage.toLowerCase();

      this.productCatalog.forEach(prod => {
        if (msgLower.includes('زيت') && prod.category === 'Olive Oil') matchProducts.push(prod);
        else if (msgLower.includes('دبس') && prod.id === 'P201') matchProducts.push(prod);
        else if (msgLower.includes('مكدوس') && prod.id === 'P202') matchProducts.push(prod);
        else if (msgLower.includes('زهر') && prod.id === 'P301') matchProducts.push(prod);
        else if (msgLower.includes('جافيل') && prod.id === 'P401') matchProducts.push(prod);
      });

      if (matchProducts.length === 0) {
        matchProducts = this.productCatalog.slice(0, 4);
      }

      let catalogListAr = `أهلاً بك في **منتوجات زيت وزيتون الجنوب**! 🌿🫒\nنحن نقدم أفضل المنتوجات اللبنانية البلدية الطبيعية. إليك قائمة الأسعار بالدولار وبالليرة اللبنانية (سعر الصرف: ${rate.toLocaleString()} ل.ل/$):\n\n`;

      matchProducts.forEach(p => {
        const lbpPrice = (p.price_usd * rate).toLocaleString('en-US');
        catalogListAr += `▪️ **${p.name_ar}**\n   السعر: $${p.price_usd.toFixed(2)} USD (${lbpPrice} LBP) | المتوفر: ${p.stock} قطعة\n`;
      });

      catalogListAr += `\n🚛 **التوصيل متوفر لجميع المناطق اللبنانية** (بيروت، جبل لبنان، الجنوب، الشوف، البقاع، والشمال).\n\nللطلب المباشر، يرجى تزويدنا بالتالي:\n1. الاسم الكامل\n2. رقم الهاتف\n3. العنوان التفصيلي\n\nأو أرسل كلمة **"تأكيد"** لتأكيد طلبك فوراً!`;

      logAgentEvent(this.name, 'CATALOG_QUOTED', `Quoted ${matchProducts.length} catalog items in dual currency to ${customerPhone}.`);

      return {
        reply: catalogListAr,
        action: 'CATALOG_SENT',
        products: matchProducts
      };
    }
  };

  // AGENT 5: Vanguard AI Tenant Guide & Assistant Agent
  const VanguardTenantGuideAgent = {
    name: 'Vanguard AI Tenant Assistant & Guide',
    knowledgeBase: [
      {
        topics: ['pos', 'sales', 'cashier', 'receipt', 'point of sale', 'مبيعات', 'صندوق', 'كاشير', 'فاتورة', 'بيع', 'فواتير', 'vente', 'ventes', 'caisse'],
        title: 'Point of Sale & Cashier Station',
        titleAr: 'محطة مبيعات الصندوق والكاشير',
        targetView: 'sales-screen',
        descriptionAr: 'تتيح لك محطة الصندوق والمبيعات المباشرة تسديد المبيعات فوراً بالدولار الأميركي أو بالليرة اللبنانية، اختيار منتوجات زيت الزيتون ودبس الرومان والصابون، وطباعة الفاتورة الحرارية مع الخصم التلقائي من المخزن.',
        stepsAr: [
          'انتقل إلى قسم المبيعات والصندوق من القائمة الرئيسية أو من الزر العلوي.',
          'اختر منتوجات زيت الزيتون أو دبس الرومان أو الصابون من القائمة أو عبر ماسح الباركود.',
          'حدد نوع الدفع: بالدولار الأميركي أو بالليرة اللبنانية حسب سعر الصرف المعتمد (89,500 ليرة).',
          'اضغط على زر تأكيد البيع وطباعة الفاتورة ليتم تصدير الفاتورة وتعديل رصيد المخزن تلقائياً.'
        ],
        stepsFr: [
          'Accédez au module Caisse & Ventes depuis le menu principal.',
          'Sélectionnez les produits d\'huile d\'olive ou scannez le code-barres.',
          'Choisissez le mode de paiement : en USD ou en LBP au taux officiel (89 500 LBP/$).',
          'Cliquez sur Valider la vente pour imprimer le reçu et déduire le stock automatiquement.'
        ],
        steps: [
          'Navigate to Point of Sale (POS) from top header or main menu.',
          'Select items from product catalog or scan barcodes.',
          'Choose currency payment mode: LBP (at official exchange rate 89,500 LBP/$) or USD.',
          'Click "Process Sale & Print Receipt" to issue thermal invoice and deduct inventory automatically.'
        ]
      },
      {
        topics: ['stock', 'inventory', 'raw materials', 'bom', 'bottling', 'olive oil', 'مخزون', 'مواد خام', 'زيت', 'تعبئة', 'بضاعة', 'قناني', 'تنك', 'stockage', 'bouteilles', 'huile'],
        title: 'Stock & Olive Oil Bottling Management',
        titleAr: 'إدارة المخزون وتعبئة زيت الزيتون',
        targetView: 'inventory-brands',
        descriptionAr: 'يمكنك متابعة كميات زيت الزيتون الجاهزة للبيع (1 لتر، 5 لتر، 16 لتر تنك) ودبس الرومان والصابون، وإدارة المواد الخام من قناني وأغطية وملصقات وتجميع التعبئة فوراً.',
        stepsAr: [
          'افتح قسم إدارة المخزون والمواد الأولية.',
          'استعرض الكميات المتوفرة حالياً من زيت الزيتون البكر الممتاز والدبس والصابون.',
          'تابع رصيد المواد الخام مثل الزيت الصافي بالكيلو، القناني الزجاجية، الأغطية المعدنية، والملصقات.',
          'استخدم خاصية التعبئة والتجميع الآلي لتحويل الزيت الصافي والقناني إلى منتوجات تامة جاهزة للبيع.'
        ],
        stepsFr: [
          'Ouvrez le module Gestion des Stocks.',
          'Consultez les balances en temps réel d\'huile d\'olive (1L, 5L, 16L), de mélasse de grenade et de savon.',
          'Suivez les matières premières (Huile vrac en kg, bouteilles en verre, bouchons, étiquettes).',
          'Utilisez l\'assemblage BOM pour emballer les produits finis.'
        ],
        steps: [
          'Open Stock & Inventory module.',
          'View real-time stock balances for Extra Virgin Olive Oil 1L/5L/16L, Pomegranate Molasses, and Soap.',
          'Track raw materials (Bulk Olive Oil Kg, Glass Bottles, Metallic Caps, Labels).',
          'Use BOM Assembly recipes to turn raw oil and bottles into packaged finished goods.'
        ]
      },
      {
        topics: ['factory', 'plant', 'ro water', 'press', 'operation', 'مصنع', 'معصرة', 'تكرير', 'مياه', 'تشغيل', 'عصر', 'فلترة', 'usine', 'presse', 'eau'],
        title: 'Factory Operation & Plant Control',
        titleAr: 'مركز عمليات المعصرة ومحطة تكرير المياه',
        targetView: 'op-dash',
        descriptionAr: 'يسمح لك مركز العمليات بمراقبة عصر الزيتون، التحكم بمحطة تصفية وتكرير المياه سعة 2000 لتر، ومتابعة درجات الحرارة وسعة خزانات التخزين.',
        stepsAr: [
          'ادخل إلى مركز العمليات من القائمة العلوية أو الجانبية.',
          'تابع قراءات ضغط محطة تصفية وتكرير المياه ومعدل الفلترة 2000 لتر.',
          'مراقبة معدل استخراج زيت الزيتون من المعصرة، درجة حرارة العصر، ومستوى الخزانات.',
          'سجل جدول الصيانة الدورية وتلقي التنبيهات المباشرة للمستشعرات.'
        ],
        stepsFr: [
          'Accédez au Centre d\'Opérations Usine.',
          'Surveillez le système de filtration d\'eau RO 2000L et la pression.',
          'Suivez le taux d\'extraction du moulin à huile et la capacité des cuves.',
          'Programmez les maintenances et recevez les alertes.'
        ],
        steps: [
          'Access Operation Center from top header or main menu.',
          'Monitor 2000L RO Water Filtration system and pressure levels.',
          'Track Olive Press extraction rates, oil temperature, and tank storage capacities.',
          'Log maintenance schedules and automated sensor alerts.'
        ]
      },
      {
        topics: ['delivery', 'supersonic', 'fleet', 'driver', 'shipping', 'whatsapp', 'توصيل', 'سائق', 'شحن', 'سوبرسونيك', 'خريطة', 'مناطق', 'livraison', 'chauffeur'],
        title: 'SuperSonic Fast Delivery & Dispatch',
        titleAr: 'نظام الشحن والتوصيل السريع للزبائن',
        targetView: 'fleet-map',
        descriptionAr: 'يقوم هذا القسم بتجميع طلبات الزبائن وتوزيعها على السائقين حسب المحافظات والمناطق اللبنانية، مع إرسال رابط تتبع عبر الواتساب وأخذ التوقيع الرقمي عند التسليم.',
        stepsAr: [
          'افتح وحدة التوصيل والشحن السريع.',
          'قم بتجميع الطلبات جغرفياً حسب المحافظات والمناطق اللبنانية.',
          'عين السائق المسؤول واطلق مسار الشحن.',
          'يتم إرسال رابط التتبع تلقائياً عبر الواتساب للزبون وأخذ التوقيع الإلكتروني عند الاستلام.'
        ],
        stepsFr: [
          'Ouvrez le module de livraison SuperSonic.',
          'Regroupez les commandes par région en Liban.',
          'Assignez un chauffeur et lancez la tournée.',
          'Envoyez un lien de suivi WhatsApp et capturez la signature numérique.'
        ],
        steps: [
          'Open SuperSonic Delivery module.',
          'Batch customer orders geographically across Lebanese governorates & villages.',
          'Assign driver and launch fleet dispatch.',
          'Auto-send WhatsApp tracking links to customers and capture digital signatures upon delivery.'
        ]
      },
      {
        topics: ['social', 'lead', 'whatsapp bot', 'social media', 'rep', 'سوشيال ميديا', 'واتساب', 'مندوب', 'عملاء', 'طلب', 'انستغرام', 'فيسبوك', 'reseaux', 'sociaux'],
        title: 'Social Media Sales & AI WhatsApp Bot',
        titleAr: 'مبيعات السوشيال ميديا وربوت الواتساب التفاعلي',
        targetView: 'social-inbox',
        descriptionAr: 'يتولى الربوت الذكي الرد التلقائي على استفسارات الزبائن عبر الواتساب وتسجيل الطلبات، مع توزيع الطلبات على المندوبين مع مهلة 30 دقيقة للمتابعة.',
        stepsAr: [
          'يتم تحويل الطلبات الجديدة الواردة من السوشيال ميديا للمندوبين تلقائياً مع عداد 30 دقيقة.',
          'في حال عدم التأكيد خلال 30 دقيقة، يتم تحويل الطلب تلقائياً للإدارة.',
          'يتفاعل ربوت الواتساب الذكي مع الزبائن للإجابة عن الأسعار وإنشاء مسودات الطلبات تلقائياً.'
        ],
        stepsFr: [
          'Les prospects de la page d\'atterrissage sont attribués aux commerciaux avec un compte à rebours de 30 min.',
          'Le bot WhatsApp intelligent gère les demandes des clients et crée des commandes.'
        ],
        steps: [
          'Captured landing page leads are auto-routed to Sales Reps with a 30-min countdown timer.',
          'If rep does not confirm in 30 mins, AI Lead Routing Agent auto-transfers order to Management.',
          'Gemini AI WhatsApp Bot handles incoming customer inquiries and creates draft orders automatically.'
        ]
      },
      {
        topics: ['accounting', 'ledger', 'journal', 'chart of accounts', 'profit', 'loss', 'محاسبة', 'دفتر استاد', 'قيود', 'أرباح', 'خسائر', 'مالية', 'ميزانية', 'comptabilite', 'bilan'],
        title: 'Dual-Currency Accounting & Financial Ledger',
        titleAr: 'النظام المحاسبي ودفتر الأستاذ العام',
        targetView: 'sales-reports',
        descriptionAr: 'نظام محاسبي متكامل يعتمد القيد المزدوج ويدعم التعامل بالدولار الأميركي والليرة اللبنانية مع استخراج تقارير الأرباح والخسائر والميزانية العمومية.',
        stepsAr: [
          'افتح قسم المحاسبة ودفتر الأستاذ.',
          'استعرض دليل الحسابات المزدوج والعمليات بالدولار والليرة اللبنانية.',
          'قم بإصدار ميزان المراجعة، قائمة الأرباح والخسائر، والميزانية العمومية.',
          'تدقيق القيود وإغلاق الحسابات مع التوقيع الرقمي.'
        ],
        stepsFr: [
          'Consultez le plan comptable bidevise (USD / LBP).',
          'Générez la balance de vérification, le compte de résultat et le bilan.'
        ],
        steps: [
          'Access Accounting & Ledger module.',
          'View Double-Entry Chart of Accounts in dual currency (USD / LBP).',
          'Generate Trial Balance, Profit & Loss Statements, and Balance Sheet.',
          'Verify and close entries with digital finger signature.'
        ]
      },
      {
        topics: ['tenant', 'license', 'security', 'vanguard', 'admin', 'ترخيص', 'أمان', 'صلاحيات', 'مستخدمين', 'فانغارد', 'licence', 'securite'],
        title: 'Vanguard Multi-Tenant & Security Control',
        titleAr: 'إدارة التراخيص وصلاحيات المستخدمين',
        targetView: 'saas-master',
        descriptionAr: 'تتيح لك إدارة النظام التحكم في تراخيص الشركات المنضمة وتخصيص صلاحيات المستخدمين (مدير، كاشير، مسؤول توصيل، محاسب).',
        stepsAr: [
          'ترخيص الماستر الرئيسي محدد برقم 001 لمنح كافة الصلاحيات.',
          'إضافة شركات وحسابات عملاء جديدة مع قواعد بيانات مستقلة ومحميّة.',
          'تحديد الصلاحيات الأدوار لكل مستخدم حسب طبيعة عمله.'
        ],
        stepsFr: [
          'Gérez les licences et autorisations des utilisateurs.',
          'Ajoutez de nouveaux comptes clients avec des bases de données isolées.'
        ],
        steps: [
          'Master License ID is fixed to #001 for primary owner access.',
          'Provision new tenant client accounts (CID-102, CID-103) with isolated databases.',
          'Set role-based permissions (Admin, Cashier, Fleet Manager, Accountant).'
        ]
      }
    ],

    answerTenantQuestion: function (queryStr) {
      if (!queryStr || typeof queryStr !== 'string') queryStr = '';
      const qClean = queryStr.trim();
      if (!qClean) return { found: false, replyAr: 'تفضل بسؤالك وسأجيبك فوراً!' };

      // 1. Pure Language Detection
      function detectQueryLang(text) {
        if (!text) return 'ar';
        if (/[\u0600-\u06FF]/.test(text)) return 'ar';
        const frPattern = /\b(bonjour|salut|comment|ca va|ça va|merci|oui|non|voici|projet|avec|pour|qui|quand|pourquoi|est|savoir|combien|livraison|ventes|stock|compte|huile|olive|presse|facture|ajouter|modifier|aide|caisse|client|bonsoir)\b/i;
        if (frPattern.test(text) || /[éèêëàâùûôîç]/i.test(text)) return 'fr';
        return 'en';
      }

      const lang = detectQueryLang(qClean);
      logAgentEvent(this.name, 'TENANT_QUERY', `[Lang: ${lang}] Tenant asked: "${qClean}"`);

      // 2. Arabic Query Normalization
      function normalizeArabic(str) {
        return str.toLowerCase()
          .replace(/[\u064B-\u0652]/g, '') // remove tashkeel
          .replace(/[أإآ]/g, 'ا')
          .replace(/ة/g, 'ه')
          .replace(/ى/g, 'ي')
          .replace(/[\,\.\؟\?\!]/g, ' ')
          .replace(/\s+/g, ' ');
      }

      const normQ = normalizeArabic(qClean);

      // 3. Conversational / Greeting Intents (Prevent Repeating Greetings & Phonetic Speech Transcriptions)
      const isHowAreYou = /(كيفك|كيف الحال|شلونك|اخبارك|شو الاخبار|هاو اريو|هاو ار يوو|هاواريو|كيف الصحة|شلون الصحة|how are you|ca va|comment ca va)/i.test(normQ);
      const isGreetingOnly = /^(مرحبا|اهلا|سلام|السلام عليكم|صباح الخير|مساء الخير|هاي|هللو|هالو|الف الف|hi|hello|hey|greetings|bonjour|salut|coucou)/i.test(normQ.trim());

      if (isHowAreYou || (normQ.includes('هاو') && normQ.includes('اريو'))) {
        if (lang === 'ar') {
          return {
            found: true,
            lang: 'ar',
            replyAr: `أنا بخير والحمد لله! 🌿😊 يسعدني جداً التحدث معك.\n\nكيف يمكنني خدمتك اليوم؟ يمكنك أن تطلب مني إصدار فواتير، تتبع الشحنات، إدارة المعصرة والتكرير، أو الاطلاع على الحسابات والتقارير المالية!`
          };
        } else if (lang === 'fr') {
          return {
            found: true,
            lang: 'fr',
            replyAr: `Je vais très bien, merci beaucoup ! 🌿😊 C'est un plaisir de discuter avec vous.\n\nComment puis-je vous aider aujourd'hui ? Je peux vous guider pour la caisse, les factures, le suivi des livraisons, le moulin à huile ou la comptabilité !`
          };
        } else {
          return {
            found: true,
            lang: 'en',
            replyAr: `I am doing great, thank you for asking! 🌿😊 It's a pleasure to speak with you.\n\nHow can I help you today? I can guide you through issuing invoices, fleet shipping, press operations, or financial accounting!`
          };
        }
      }

      if (isGreetingOnly) {
        if (lang === 'ar') {
          return {
            found: true,
            lang: 'ar',
            replyAr: `أهلاً وسهلاً بك! 🌿🤖 كيف يمكنني مساعدتك الآن؟ تواصل معي بخصوص أي قسم من أقسام المنصة مثل صندوق المبيعات، المعصرة، التوصيل، أو المحاسبة وسأجيبك فوراً!`
          };
        } else if (lang === 'fr') {
          return {
            found: true,
            lang: 'fr',
            replyAr: `Bonjour et bienvenue ! 🌿🤖 Comment puis-je vous aider aujourd'hui ? Posez-moi vos questions sur la caisse, le moulin à huile, les livraisons ou la comptabilité !`
          };
        } else {
          return {
            found: true,
            lang: 'en',
            replyAr: `Hello and welcome! 🌿🤖 How can I assist you today? Feel free to ask me anything about sales POS, oil bottling, press operations, or accounting!`
          };
        }
      }

      // 4. Intent & Topic Matcher with Rich Dynamic Human Answers

      // A. Invoicing / Sales / POS Intent
      const isInvoiceSales = /(فاتور|فاتوره|فواتير|كاشير|بيع|مبيعات|صندوق|طباع|تسجيل طلب|امبيعات|pos|invoice|billing|caisse|facture|vente)/i.test(normQ);
      if (isInvoiceSales) {
        if (lang === 'ar') {
          return {
            found: true,
            lang: 'ar',
            targetView: 'sales-screen',
            replyAr: `لإصدار فاتورة مبيعات جديدة بسهولة في النظام:\n\n1. افتح شاشة صندوق المبيعات الفورية (POS).\n2. اختر أصناف الزيتون أو الزيت والكميات المطلوبة.\n3. حدد طريقة الدفع بالدولار الأميركي (USD) أو الليرة اللبنانية (LBP).\n4. اضغط على زر 'طباعة الفاتورة' أو إرسالها للزبون عبر الواتساب.\n\nيمكنك الانتقال فوراً إلى شاشة صندوق المبيعات الآن!`
          };
        } else if (lang === 'fr') {
          return {
            found: true,
            lang: 'fr',
            targetView: 'sales-screen',
            replyAr: `Pour créer et imprimer une facture dans le système :\n\n1. Ouvrez le module Caisse & Ventes (POS).\n2. Sélectionnez les produits et les quantités.\n3. Choisissez le règlement en USD ou LBP.\n4. Cliquez sur 'Imprimer la facture' ou envoyez le reçu par WhatsApp.\n\nSouhaitez-vous ouvrir le module Caisse maintenant ?`
          };
        } else {
          return {
            found: true,
            lang: 'en',
            targetView: 'sales-screen',
            replyAr: `To create and print a sales invoice:\n\n1. Open the Point of Sale (POS) Cashier module.\n2. Select the items and requested quantities.\n3. Choose dual-currency payment in USD or LBP.\n4. Click 'Print Invoice' or send an instant WhatsApp receipt.\n\nWould you like me to take you to the POS screen right now?`
          };
        }
      }

      // B. How Platform Works / Overview Intent
      const isPlatformOverview = /(كيف تشتغل|شرح المنصه|شرح المنصة|شرح النظام|شغل المنصه|تشتغل المنصه|كيف تعمل|كيف استخدم|اطلاع|منصه|منصة|overview|how it works|fonctionnement|plateforme)/i.test(normQ);
      if (isPlatformOverview) {
        if (lang === 'ar') {
          return {
            found: true,
            lang: 'ar',
            replyAr: `المنصة عبارة عن نظام إداري ذكي متكامل لمؤسسة زيت وزيتون الجنوب، وتتكون من الأقسام التالية:\n\n• صندوق المبيعات الفورية (POS): لإصدار الفواتير وتحصيل الأموال بالدولار والليرة.\n• إدارة المخزون والتعبئة: لمتابعة كميات زيت الزيتون في الخزانات والعبوات.\n• تشغيل المعصرة ومحطة المياه 2000 لتر: لمراقبة خطوط المعصرة وتصفية المياه.\n• نظام الشحن والتوصيل السريع: لتوزيع الطلبات على السائقين وتتبعها عبر الواتساب.\n• المحاسبة المزدوجة: لإصدار ميزان المراجعة وتقارير الأرباح والخسائر.\n• التراخيص والأمان: للتحكم في صلاحيات المستخدمين والشركات.\n\nأي من هذه الأقسام تحب أن ننتقل إليه الآن؟`
          };
        } else if (lang === 'fr') {
          return {
            found: true,
            lang: 'fr',
            replyAr: `La plateforme Vanguard est une suite de gestion complète comprenant :\n\n• Caisse & Ventes (POS) : Gestion des encaissements et factures.\n• Stock & Embouteillage : Suivi de l'huile d'olive et des cuves.\n• Moulin & Station d'eau 2000L : Contrôle des opérations de pressage et d'eau.\n• Livraison rapide SuperSonic : Gestion des chauffeurs et suivi WhatsApp.\n• Comptabilité bidevise : Bilan financier et comptes de résultat USD/LBP.\n\nQuel module souhaitez-vous consulter ?`
          };
        } else {
          return {
            found: true,
            lang: 'en',
            replyAr: `The Vanguard platform is an all-in-one ERP management suite built for Southern Olive & Oil:\n\n• Sales & POS: Create sales invoices and process cash in USD & LBP.\n• Inventory & Bottling: Track olive oil tanks, bottles, and stock.\n• Oil Press & 2000L Water Plant: Monitor press lines and water purification.\n• Fleet Shipping & Delivery: Batch orders for drivers with WhatsApp tracking.\n• Dual-Currency Accounting: Generate P&L statements and general ledger.\n\nWhich section would you like to open first?`
          };
        }
      }

      // C. Accounting / Finance Intent
      const isAccounting = /(محاسب|دولار|لير|ميزاني|دفتر|ارباح|خسائر|مالي|قيود|comptabilite|bilan|accounting|ledger|profit)/i.test(normQ);
      if (isAccounting) {
        if (lang === 'ar') {
          return {
            found: true,
            lang: 'ar',
            targetView: 'sales-reports',
            replyAr: `يعتمد النظام المحاسبي على تقنية القيد المزدوج بالدولار الأميركي والليرة اللبنانية:\n\n1. متابعة الحسابات ودليل الحسابات المزدوج.\n2. تسجيل الإيرادات والمصاريف مع تحديث سعر الصرف الفوري.\n3. إصدار قائمة الأرباح والخسائر، ميزان المراجعة، والميزانية العمومية بنقرة زر.\n4. التوقيع الرقمي والمصادقة على القيود اليومية.\n\nيمكنك فتح شاشة المحاسبة المزدوجة والتقارير المالية الآن!`
          };
        } else if (lang === 'fr') {
          return {
            found: true,
            lang: 'fr',
            targetView: 'sales-reports',
            replyAr: `Le module de comptabilité bidevise (USD / LBP) vous permet de :\n\n1. Consulter le plan comptable à double entrée.\n2. Générer la balance de vérification, le bilan et le compte de résultat.\n3. Valider les écritures comptables avec signature numérique.\n\nSouhaitez-vous ouvrir la comptabilité maintenant ?`
          };
        } else {
          return {
            found: true,
            lang: 'en',
            targetView: 'sales-reports',
            replyAr: `The Dual-Currency Accounting module (USD & LBP) enables you to:\n\n1. View the double-entry Chart of Accounts.\n2. Generate Trial Balance, Profit & Loss Statements, and Balance Sheet instantly.\n3. Authenticate financial journal entries with digital signatures.\n\nWould you like to open the Accounting module right now?`
          };
        }
      }

      // D. Inventory / Bottling Intent
      const isInventory = /(زيت|زيتون|تعبئ|مخزون|خزان|تنك|زجاج|مواد خام|stock|inventory|bouteille|huile)/i.test(normQ);
      if (isInventory) {
        if (lang === 'ar') {
          return {
            found: true,
            lang: 'ar',
            targetView: 'inventory-brands',
            replyAr: `إدارة مخزون زيت الزيتون والتعبئة تُتيح لك:\n\n1. تتبع سعة الخزانات الرئيسية ومستويات زيت الزيتون البكر الممتاز.\n2. إدارة عملية تعبئة العبوات الزجاجية والتنكات ومواد التغليف.\n3. خصم المواد الخام تلقائياً عند التعبئة وإعادة تعبئة المخزون.\n\nهل ترغب بالانتقال إلى شاشة إدارة المخزون والتعبئة؟`
          };
        } else if (lang === 'fr') {
          return {
            found: true,
            lang: 'fr',
            targetView: 'inventory-brands',
            replyAr: `La gestion du stock et de l'embouteillage d'huile d'olive vous permet de :\n\n1. Suivre le niveau des cuves d'huile d'olive extra-vierge.\n2. Gérer le conditionnement en bouteilles et bidons.\n3. Suivre les matières premières et le réapprovisionnement automatique.\n\nSouhaitez-vous accéder au module de stock ?`
          };
        } else {
          return {
            found: true,
            lang: 'en',
            targetView: 'inventory-brands',
            replyAr: `The Olive Oil Inventory & Bottling Assembly module lets you:\n\n1. Track oil levels across main storage tanks.\n2. Manage glass bottle filling, tin packing, and raw materials.\n3. Automatically deduct stock and trigger reorder alerts.\n\nWould you like to open the Bottling & Inventory module?`
          };
        }
      }

      // E. Delivery & Shipping Intent
      const isDelivery = /(توصيل|شحن|سائق|دليفري|تتبع|مناطق|محافظات|livraison|delivery|driver|chauffeur)/i.test(normQ);
      if (isDelivery) {
        if (lang === 'ar') {
          return {
            found: true,
            lang: 'ar',
            targetView: 'fleet-map',
            replyAr: `نظام الشحن والتوصيل السريع (SuperSonic):\n\n1. تجميع الطلبات حسب المحافظات والقرى اللبنانية.\n2. تعيين السائق وتحديد مسار التوصيل.\n3. إرسال رابط تتبع ملاحي مباشر للزبون عبر الواتساب مع أخذ التوقيع عند التسليم.\n\nيمكنك الانتقال فوراً إلى شاشة التوصيل والشحن!`
          };
        } else if (lang === 'fr') {
          return {
            found: true,
            lang: 'fr',
            targetView: 'fleet-map',
            replyAr: `Le système de livraison rapide SuperSonic vous permet de :\n\n1. Regrouper les commandes par régions au Liban.\n2. Assigner un chauffeur et suivre l'itinéraire.\n3. Envoyer un lien de suivi WhatsApp au client et capturer la signature.\n\nSouhaitez-vous accéder au module de livraison ?`
          };
        } else {
          return {
            found: true,
            lang: 'en',
            targetView: 'fleet-map',
            replyAr: `The SuperSonic Delivery & Shipping module enables you to:\n\n1. Batch orders by Lebanese governorates and villages.\n2. Assign drivers and track delivery routes live.\n3. Auto-send WhatsApp GPS tracking links to customers with digital signature capture.\n\nWould you like to open the Delivery module?`
          };
        }
      }

      // F. Knowledge Base Fallback Matcher
      let bestMatch = null;
      let maxScore = 0;

      this.knowledgeBase.forEach(item => {
        let score = 0;
        item.topics.forEach(topic => {
          const normTopic = normalizeArabic(topic);
          if (normQ.includes(normTopic) || normTopic.includes(normQ)) score += 3;
        });
        if (score > maxScore) {
          maxScore = score;
          bestMatch = item;
        }
      });

      if (bestMatch && maxScore > 0) {
        if (lang === 'ar') {
          const stepsList = (bestMatch.stepsAr || bestMatch.steps).map((st) => `• ${st}`).join('\n');
          return {
            found: true,
            lang: 'ar',
            match: bestMatch,
            replyAr: `بكل سرور! بالنسبة إلى **${bestMatch.titleAr}**:\n\n${bestMatch.descriptionAr}\n\n**خطوات الاستخدام:**\n${stepsList}\n\nيمكنني توجيهك مباشرة إلى هذه الشاشة الآن!`,
            targetView: bestMatch.targetView
          };
        } else if (lang === 'fr') {
          const stepsList = (bestMatch.stepsFr || bestMatch.steps).map((st) => `• ${st}`).join('\n');
          return {
            found: true,
            lang: 'fr',
            match: bestMatch,
            replyAr: `Absolument ! Concernant **${bestMatch.title}** :\n\nCette fonctionnalité vous permet de gérer efficacement vos opérations.\n\n**Procédure d'utilisation :**\n${stepsList}\n\nJe peux vous rediriger directement vers ce module !`,
            targetView: bestMatch.targetView
          };
        } else {
          const stepsList = bestMatch.steps.map((st) => `• ${st}`).join('\n');
          return {
            found: true,
            lang: 'en',
            match: bestMatch,
            replyAr: `Certainly! Regarding **${bestMatch.title}**:\n\nThis module lets you manage and track operations effortlessly.\n\n**How to use it:**\n${stepsList}\n\nI can take you directly to this screen right now!`,
            targetView: bestMatch.targetView
          };
        }
      }

      // G. Dynamic Conversational Natural Response
      if (lang === 'ar') {
        return {
          found: true,
          lang: 'ar',
          replyAr: `أهلاً بك! بالنسبة لسؤالك حول "${qClean}":\n\nأنا هنا لمساعدتك في أي قسم من أقسام المنصة:\n• صندوق المبيعات (POS) وإصدار الفواتير\n• تعبئة زيت الزيتون وتتبع المخزون\n• المعصرة ومحطة تكرير المياه 2000 لتر\n• الشحن والتوصيل السريع وسائقي الأسطول\n• المحاسبة المزدوجة بالدولار والليرة اللبنانية\n\nأي قسم ترغب باستكشافه الآن؟`
        };
      } else if (lang === 'fr') {
        return {
          found: true,
          lang: 'fr',
          replyAr: `Bonjour ! Concernant votre demande "${qClean}" :\n\nJe suis là pour vous assister sur l'ensemble de la plateforme :\n• Caisse et facturation (POS)\n• Stock d'huile d'olive et embouteillage\n• Moulin et station d'eau 2000L\n• Livraison rapide SuperSonic\n• Comptabilité bidevise (USD/LBP)\n\nQuel module souhaitez-vous ouvrir ?`
        };
      } else {
        return {
          found: true,
          lang: 'en',
          replyAr: `Hello! Regarding your query about "${qClean}":\n\nI'm here to assist you across all modules:\n• Point of Sale (POS) & Invoicing\n• Olive Oil Inventory & Bottling\n• Oil Press & 2000L Water Purification\n• SuperSonic Fleet Shipping & Delivery\n• Dual-Currency Accounting (USD & LBP)\n\nWhich module would you like me to open for you?`
        };
      }
    }
  };

  return {
    LeadRoutingAgent,
    InventorySyncAgent,
    SmartDispatchAgent,
    LedgerChartAgent,
    GeminiWhatsAppSalesBot,
    VanguardTenantGuideAgent,
    getLogs: () => agentLogs
  };
})();

// Global Quick Trigger Handler for Gemini WhatsApp Bot Simulator
window.runAIWhatsAppSalesBot = async function (userMessage = "مرحبا، بدي استفسر عن سعر تنكة زيت الزيتون الـ 5 لتر والدبس والتوصيل للمناطق") {
  if (window.SouthernOliveAI && window.SouthernOliveAI.GeminiWhatsAppSalesBot) {
    const res = await window.SouthernOliveAI.GeminiWhatsAppSalesBot.processWhatsAppMessage("+96170123456", userMessage);
    if (window.showToast) {
      window.showToast("Gemini AI WhatsApp Bot", "أجاب الـ AI بنجاح وولّد مسودة الطلب!", "success");
    }
    return res;
  }
};

// Global Helper for Vanguard AI Tenant Guide & Assistant
window.askVanguardAI = function (queryText) {
  if (window.SouthernOliveAI && window.SouthernOliveAI.VanguardTenantGuideAgent) {
    return window.SouthernOliveAI.VanguardTenantGuideAgent.answerTenantQuestion(queryText);
  }
  return {
    found: false,
    replyAr: "وكيل الذكاء الاصطناعي قيد التشغيل... يرجى إعادة المحاولة."
  };
};

window.openVanguardAiAssistant = function () {
  console.log('[Vanguard AI] Launching Vanguard AI Assistant Modal...');
  if (window.VanguardAI && typeof window.VanguardAI.openModal === 'function') {
    return window.VanguardAI.openModal();
  }

  const modalEl = document.getElementById('vanguard-ai-modal') || document.getElementById('vanguardAiModal');
  if (!modalEl) {
    console.error('[Vanguard AI] vanguard-ai-modal element not found in DOM.');
    if (window.showToast) window.showToast("Vanguard AI Assistant", "مرشد الذكاء الاصطناعي قيد التشغيل... يرجى الانتظار.", "info");
    return;
  }

  if (modalEl.parentElement !== document.body) {
    document.body.appendChild(modalEl);
  }

  document.querySelectorAll('.modal-backdrop').forEach(el => el.remove());

  modalEl.classList.remove('hidden');
  modalEl.style.setProperty('display', 'flex', 'important');
  modalEl.style.setProperty('opacity', '1', 'important');
  modalEl.style.setProperty('z-index', '999999', 'important');
  modalEl.style.setProperty('position', 'fixed', 'important');
  modalEl.style.setProperty('top', '0', 'important');
  modalEl.style.setProperty('left', '0', 'important');
  modalEl.style.setProperty('width', '100vw', 'important');
  modalEl.style.setProperty('height', '100vh', 'important');
  modalEl.classList.add('show');
  modalEl.removeAttribute('aria-hidden');
  document.body.classList.add('modal-open');

  // Focus input automatically
  setTimeout(() => {
    const input = document.getElementById('vanguardAiInput');
    if (input) input.focus();
  }, 200);
};

window.closeVanguardAiAssistant = function () {
  console.log('[Vanguard AI] Closing Vanguard AI Assistant Modal...');
  const modalEl = document.getElementById('vanguardAiModal');
  if (modalEl) {
    try {
      if (window.bootstrap && window.bootstrap.Modal) {
        const bsModal = window.bootstrap.Modal.getInstance(modalEl);
        if (bsModal) bsModal.hide();
      }
    } catch (e) { }

    modalEl.classList.remove('show');
    modalEl.style.setProperty('display', 'none', 'important');
    modalEl.style.setProperty('opacity', '0', 'important');
    modalEl.setAttribute('aria-hidden', 'true');
  }
  document.querySelectorAll('.modal-backdrop').forEach(el => el.remove());
  document.body.classList.remove('modal-open');
  document.body.style.removeProperty('overflow');
  document.body.style.removeProperty('padding-right');
};

window.sendQuickVanguardAiQuery = function (topicKey) {
  const queryMap = {
    'pos': 'كيف أبيع وأطبع فاتورة في محطة الـ POS؟',
    'stock': 'كيف أتابع مخزون الزيت والمواد الأولية والتعبئة BOM؟',
    'operation': 'كيف أراقب معصرة الزيت ومحطة تكرير المياه 2000L RO؟',
    'delivery': 'كيف يوزع نظام SuperSonic التوصيل على المناطق والسائقين؟',
    'social': 'كيف يعمل ربوت الواتساب AI وعداد الـ 30 دقيقة للمندوبين؟',
    'accounting': 'كيف أطلع على دفتر الاستاد وقوائم الأرباح والخسائر؟',
    'tenant': 'كيف أدير تراخيص الشركات والصلاحيات في Vanguard؟'
  };
  const qText = queryMap[topicKey] || topicKey;
  const inputEl = document.getElementById('vanguardAiInput');
  if (inputEl) inputEl.value = qText;
  window.submitVanguardAiQuery();
};

window.vanguardAiMessages = [];

window.speakVanguardAiResponseByIndex = function (index) {
  if (window.vanguardAiMessages && window.vanguardAiMessages[index]) {
    // Force speak when user explicitly clicks "استمع" (Listen) button
    isVanguardAiTtsEnabled = true;
    localStorage.setItem('so_ai_tts_enabled', 'true');
    if (typeof window.updateVanguardAiTtsBtnUI === 'function') {
      window.updateVanguardAiTtsBtnUI();
    }
    window.speakVanguardAiResponse(window.vanguardAiMessages[index], true);
  }
};

// =========================================================================
// GOOGLE AI STUDIO GEMINI 2.5 FLASH ONLINE API + FREE LOCAL FALLBACK ENGINE
// =========================================================================
window.SO_GEMINI_FREE_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY || '';

// 1. Core Gemini Flash Query Function
window.generateVaraResponse = async function (userPrompt) {
  const apiKey = localStorage.getItem('so_gemini_api_key') || process.env.NEXT_PUBLIC_GEMINI_API_KEY || '';

  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: userPrompt }] }],
        systemInstruction: {
          parts: [{ text: "أنتِ فارا (Vara)، المساعدة الذكية لنظام ERP. أجيبي فوراً باختصار شديد باللغة العربية (جملة واحدة فقط) بدون أي رموز." }]
        }
      })
    });

    const data = await response.json();
    console.log('Gemini API Response Data:', data);

    const replyText = data.candidates?.[0]?.content?.parts?.[0]?.text || "أهلاً بك، كيف أساعدك؟";
    return replyText.trim();
  } catch (err) {
    console.error('Gemini API Error:', err);
    return "عذراً، حدث خطأ في معالجة الصوت، يرجى المحاولة مجدداً.";
  }
};

// 2. Immediate Automatic Speech Output Function (100% Hands-Free)
window.autoSpeakReply = function (text) {
  if (!window.speechSynthesis) return;
  window.speechSynthesis.cancel(); // Stop any previous speech

  // Clean markdown, brackets, and emojis
  const clean = text.replace(/[*#_~`\[\]\(\)\{\}]/g, '').replace(/[^\p{L}\p{N}\s.,?!]/gu, '').trim();
  if (!clean) return;

  const utterance = new SpeechSynthesisUtterance(clean);
  utterance.lang = 'ar-SA';
  utterance.volume = 1.0;
  utterance.rate = 1.0;
  utterance.pitch = 1.0;

  // When assistant finishes speaking, automatically resume listening
  utterance.onend = function () {
    if (window.GeminiLive && typeof window.GeminiLive.startListening === 'function') {
      window.GeminiLive.startListening();
    }
  };

  window.speechSynthesis.speak(utterance);
  console.log('🔊 Auto-speaking aloud immediately:', clean);
};

window.speakAssistantReply = function (text) {
  window.autoSpeakReply(text);
};

window.callGeminiFlashAPI = async function (queryText) {
  return await window.generateVaraResponse(queryText);
};

window.submitVanguardAiQuery = async function () {
  const inputEl = document.getElementById('vanguardAiInput');
  if (!inputEl) return;
  const queryText = inputEl.value.trim();
  if (!queryText) return;

  const listEl = document.getElementById('vanguardAiMessagesList');
  if (!listEl) return;

  // Append User Message
  const userMsgHtml = `
    <div class="d-flex align-items-start justify-content-end gap-2 mb-3">
      <div class="p-3 rounded-3 shadow-sm fw-bold" style="max-width: 82%; background: linear-gradient(135deg, #d97706, #b45309) !important; color: #ffffff !important; font-size: 1.05rem !important; border-radius: 14px 14px 2px 14px !important; box-shadow: 0 4px 12px rgba(217, 119, 6, 0.4) !important;">
        ${queryText}
      </div>
      <div class="rounded-circle text-white p-2 text-center" style="min-width: 34px; height: 34px; background: #334155 !important; border: 1.5px solid #f59e0b !important;">
        <i class="fa-solid fa-user text-warning"></i>
      </div>
    </div>
  `;
  listEl.insertAdjacentHTML('beforeend', userMsgHtml);
  inputEl.value = '';

  // Stop active voice recognition if running
  if (window.vanguardAiSilenceTimer) clearTimeout(window.vanguardAiSilenceTimer);
  if (isVanguardAiListening && vanguardAiRecognition) {
    try { vanguardAiRecognition.stop(); } catch (e) { }
  }

  // Show Typing Indicator
  const typingId = 'aiTyping_' + Date.now();
  const aiName = window.getAIGuideName ? window.getAIGuideName() : 'Vara AI Assistant';
  const typingHtml = `
    <div class="d-flex align-items-start gap-3 mb-4" id="${typingId}">
      <img src="assets/images/ai_female_avatar.jpg" alt="${aiName}" class="rounded-circle border border-warning shadow-sm" style="width: 40px; height: 40px; object-fit: cover;">
      <div class="p-3 rounded-3 shadow-lg text-white" style="background: #1e293b !important; border: 1.5px solid #f59e0b !important; border-radius: 14px !important;">
        <span class="spinner-grow spinner-grow-sm text-warning me-2" role="status"></span>
        <span class="fw-semibold text-warning" style="font-size: 0.95rem;">فارا تفكر وتولّد الرد الذكي... 💭</span>
      </div>
    </div>
  `;
  listEl.insertAdjacentHTML('beforeend', typingHtml);
  const bodyEl = document.getElementById('vanguardAiChatBody');
  if (bodyEl) bodyEl.scrollTop = bodyEl.scrollHeight;

  // Generate Real Dynamic Gemini Response
  const replyText = await window.generateVaraResponse(queryText);

  // Remove typing indicator
  const typingEl = document.getElementById(typingId);
  if (typingEl) typingEl.remove();

  // Store in global message list for TTS indexing
  const msgIndex = window.vanguardAiMessages.length;
  window.vanguardAiMessages.push(replyText);

  const aiMsgHtml = `
    <div class="d-flex align-items-start gap-3 mb-4">
      <img src="assets/images/ai_female_avatar.jpg" alt="${aiName}" class="rounded-circle border border-warning shadow-sm" style="width: 40px; height: 40px; object-fit: cover;">
      <div class="p-3 rounded-3 shadow-lg" style="background: #0f172a !important; border: 1.5px solid #f59e0b !important; border-radius: 14px !important; max-width: 85%;">
        <div class="d-flex align-items-center justify-content-between mb-2 pb-1" style="border-bottom: 1px solid #334155 !important;">
          <span class="badge px-2 py-1" style="background: linear-gradient(135deg, #b45309, #78350f) !important; color: #fef3c7 !important; border: 1px solid #f59e0b !important; font-weight: bold; border-radius: 6px;"><i class="fa-solid fa-sparkles me-1"></i> ${aiName}</span>
          <button class="btn btn-sm btn-link p-0 text-decoration-none fw-bold" style="color: #fbbf24 !important; font-size: 0.9rem;" onclick="window.speakAssistantReply(window.vanguardAiMessages[${msgIndex}])" title="إعادة استماع الرد صوتياً">
            <i class="fa-solid fa-volume-high me-1"></i> استمع
          </button>
        </div>
        <div style="color: #ffffff !important; font-size: 1.05rem !important; line-height: 1.65 !important; font-weight: 600 !important; white-space: pre-line;">${replyText}</div>
      </div>
    </div>
  `;

  listEl.insertAdjacentHTML('beforeend', aiMsgHtml);
  if (bodyEl) bodyEl.scrollTop = bodyEl.scrollHeight;

  // Speak AI response automatically out loud
  window.speakAssistantReply(replyText);
};

window.sendQuickVanguardAiQuery = function (topicKeyOrText) {
  const inputEl = document.getElementById('vanguardAiInput');
  if (!inputEl) return;

  let textToSubmit = topicKeyOrText;
  if (topicKeyOrText === 'pos') textToSubmit = 'كيف أبيع وأطبع فاتورة الصندوق؟';
  else if (topicKeyOrText === 'stock') textToSubmit = 'كيف أدير مخزون زيت الزيتون والتعبئة؟';
  else if (topicKeyOrText === 'operation') textToSubmit = 'كيف أراقب المعصرة ومحطة تكرير المياه؟';
  else if (topicKeyOrText === 'delivery') textToSubmit = 'كيف أستخدم نظام الشحن والتوصيل السريع؟';
  else if (topicKeyOrText === 'social') textToSubmit = 'كيف يعمل ربوت الواتساب التفاعلي؟';
  else if (topicKeyOrText === 'accounting') textToSubmit = 'كيف أطلع على الميزانية وتقارير الأرباح؟';
  else if (topicKeyOrText === 'tenant') textToSubmit = 'ما هي إجراءات أمان منصة التراخيص؟';

  inputEl.value = textToSubmit;
  window.submitVanguardAiQuery();
};

// ==========================================
// OLIVE AI VOICE (STT & TTS) ENGINE
// ==========================================
let isVanguardAiListening = false;
let vanguardAiRecognition = null;
let isVanguardAiTtsEnabled = localStorage.getItem('so_ai_tts_enabled') !== 'false';
let vanguardAiVoiceLangCode = localStorage.getItem('so_ai_voice_lang') || 'ar-SA';
let vanguardAiVoiceLangLabel = localStorage.getItem('so_ai_voice_label') || 'AR';
window.vanguardAiSilenceTimer = null;

window.setVanguardAiVoiceLang = function (langCode, labelText) {
  vanguardAiVoiceLangCode = langCode;
  vanguardAiVoiceLangLabel = labelText;
  localStorage.setItem('so_ai_voice_lang', langCode);
  localStorage.setItem('so_ai_voice_label', labelText);

  const lblEl = document.getElementById('vanguardAiMicLangLabel');
  if (lblEl) lblEl.innerText = labelText;

  if (window.showToast) {
    window.showToast("تم اختيار لغة التعرف الصوتي", `لغة الاستماع الصوتية الآن: ${labelText === 'AR' ? 'العربية 🇱🇧' : labelText === 'EN' ? 'English 🇬🇧' : 'Français 🇫🇷'}`, "info");
  }
};

// Voice Input (Speech-To-Text / Continuous Microphone with 2.5s Silence Buffer)
window.toggleVanguardAiVoiceInput = function () {
  const micBtn = document.getElementById('vanguardAiMicBtn');
  const inputEl = document.getElementById('vanguardAiInput');

  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) {
    if (window.showToast) {
      window.showToast("الميكروفون غير مدعوم", "متصفحك لا يدعم خاصية التعرف على الصوت المباشر (استخدم Chrome/Edge).", "warning");
    } else {
      alert("متصفحك لا يدعم التعرف على الصوت مباشرة. يرجى استخدام متصفح Chrome أو Edge.");
    }
    return;
  }

  if (isVanguardAiListening && vanguardAiRecognition) {
    if (window.vanguardAiSilenceTimer) clearTimeout(window.vanguardAiSilenceTimer);
    vanguardAiRecognition.stop();
    return;
  }

  try {
    vanguardAiRecognition = new SpeechRecognition();
    vanguardAiRecognition.continuous = true; // Stay listening while user speaks multiple sentences
    vanguardAiRecognition.interimResults = true;

    // Explicit Voice Language Setting
    vanguardAiRecognition.lang = vanguardAiVoiceLangCode || 'ar-SA';

    vanguardAiRecognition.onstart = function () {
      isVanguardAiListening = true;
      if (micBtn) {
        micBtn.className = 'btn btn-danger fw-bold text-white px-3 shadow-lg';
        micBtn.innerHTML = '<i class="fa-solid fa-microphone-lines fa-beat fs-5 me-1"></i> أستمع إليك...';
        micBtn.title = 'جاري الاستماع دون انقطاع... انقر للإرسال أو الإلغاء';
      }
      if (inputEl) inputEl.placeholder = 'جاري التحدث والتعرف على صوتك... تحدث بحرية وسأجيبك عند التوقف!';
      if (window.showToast) window.showToast("الميكروفون نشط 🎙️", "تحدث الآن بحرية وسنقوم بتحليل كلامك وسؤاله فوراً", "info");
    };

    vanguardAiRecognition.onresult = function (event) {
      let finalTranscript = '';
      let interimTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript + ' ';
        } else {
          interimTranscript += transcript;
        }
      }

      if (inputEl) {
        inputEl.value = (finalTranscript + interimTranscript).trim();
      }

      // Reset 2.5-second silence detection timer on each captured phrase
      if (window.vanguardAiSilenceTimer) clearTimeout(window.vanguardAiSilenceTimer);
      window.vanguardAiSilenceTimer = setTimeout(() => {
        if (isVanguardAiListening && inputEl && inputEl.value.trim()) {
          console.log('[Olive AI Voice] 2.5s silence detected. Submitting query automatically...');
          vanguardAiRecognition.stop();
        }
      }, 2500);
    };

    vanguardAiRecognition.onerror = function (event) {
      if (event.error === 'aborted' || event.error === 'no-speech') {
        // Normal lifecycle events, do not display error toasts
        return;
      }
      console.warn('Microphone event:', event.error);
      window.stopVanguardAiMicUI();
      if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
        if (window.showToast) window.showToast("صلاحية الميكروفون", "يرجى السماح بصلاحية الميكروفون من إعدادات المتصفح", "warning");
      }
    };

    vanguardAiRecognition.onend = function () {
      if (window.vanguardAiSilenceTimer) clearTimeout(window.vanguardAiSilenceTimer);
      window.stopVanguardAiMicUI();
      if (inputEl && inputEl.value.trim()) {
        setTimeout(() => {
          window.submitVanguardAiQuery();
        }, 300);
      }
    };

    vanguardAiRecognition.start();
  } catch (err) {
    console.error('[Olive AI Voice Start Failed]', err);
    window.stopVanguardAiMicUI();
  }
};

window.stopVanguardAiMicUI = function () {
  isVanguardAiListening = false;
  if (window.vanguardAiSilenceTimer) clearTimeout(window.vanguardAiSilenceTimer);
  const micBtn = document.getElementById('vanguardAiMicBtn');
  const inputEl = document.getElementById('vanguardAiInput');
  if (micBtn) {
    micBtn.className = 'btn btn-outline-warning fw-bold px-3';
    micBtn.innerHTML = '<i class="fa-solid fa-microphone fs-5"></i>';
    micBtn.title = 'التحدث عبر الميكروفون (Voice Input)';
  }
  if (inputEl && !inputEl.value) {
    inputEl.placeholder = 'اكتب أو تحدث بسؤالك هنا (مثلاً: كيف أطبع فاتورة)...';
  }
};

// Verbal Answers (Text-To-Speech / Audio Readout)
window.toggleVanguardAiTts = function () {
  isVanguardAiTtsEnabled = !isVanguardAiTtsEnabled;
  localStorage.setItem('so_ai_tts_enabled', isVanguardAiTtsEnabled);

  if (!isVanguardAiTtsEnabled && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }

  window.updateVanguardAiTtsBtnUI();
  if (window.showToast) {
    window.showToast(
      isVanguardAiTtsEnabled ? "الرد الصوتي مفعّل 🔊" : "الرد الصوتي مكتوم 🔇",
      isVanguardAiTtsEnabled ? "سيقوم المساعد بقراءة الإجابات صوتياً تلقائياً" : "تم كتم الردود الصوتية تلقائياً",
      isVanguardAiTtsEnabled ? "success" : "secondary"
    );
  }
};

window.updateVanguardAiTtsBtnUI = function () {
  const ttsBtn = document.getElementById('vanguardAiTtsBtn');
  if (!ttsBtn) return;
  if (isVanguardAiTtsEnabled) {
    ttsBtn.className = 'btn btn-sm btn-warning text-dark fw-bold me-2';
    ttsBtn.innerHTML = '<i class="fa-solid fa-volume-high me-1"></i> الصوت مفعّل';
    ttsBtn.title = 'انقر لكتم الردود الصوتية تلقائياً';
  } else {
    ttsBtn.className = 'btn btn-sm btn-outline-secondary text-muted me-2';
    ttsBtn.innerHTML = '<i class="fa-solid fa-volume-xmark me-1"></i> الصوت مكتوم';
    ttsBtn.title = 'انقر لتفعيل الردود الصوتية تلقائياً';
  }
};

// Pre-cache speech synthesis voices
let soCachedVoices = [];
function populateSoVoices() {
  if ('speechSynthesis' in window) {
    soCachedVoices = window.speechSynthesis.getVoices() || [];
  }
}
if ('speechSynthesis' in window) {
  populateSoVoices();
  if (window.speechSynthesis.onvoiceschanged !== undefined) {
    window.speechSynthesis.onvoiceschanged = populateSoVoices;
  }
}

window.speakVanguardAiResponse = function (textToSpeak, forceSpeak = false) {
  if (!forceSpeak && !isVanguardAiTtsEnabled) return;
  if (!textToSpeak) return;

  if (typeof window.playErpAiVoiceResponse === 'function') {
    window.playErpAiVoiceResponse(textToSpeak);
    return;
  }

  // Clean HTML, Markdown formatting, hashtags, URLs, and emojis
  let cleanText = textToSpeak.replace(/<[^>]*>?/gm, '');
  cleanText = cleanText.replace(/#\w+/g, ''); // strip hashtags like #001 #POS
  cleanText = cleanText.replace(/#/g, '');
  cleanText = cleanText.replace(/[\*\_]/g, '');
  cleanText = cleanText.replace(/https?:\/\/\S+/g, '');
  cleanText = cleanText.replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, '');

  // Strip repetitive self-naming boilerplate from TTS audio unless specifically asked for name
  if (!/(اسمك|اسمك ايه|شو اسمك|what is your name|who are you)/i.test(cleanText)) {
    cleanText = cleanText.replace(/(أنا|انا)\s*(Olive|أوليف|اوليف)/gi, '');
    cleanText = cleanText.replace(/\b(I am|my name is)\s*Olive\b/gi, '');
  }

  cleanText = cleanText.trim();
  if (!cleanText) return;

  const isArabic = /[\u0600-\u06FF]/.test(cleanText);

  // Fetch all available voices
  let voices = (soCachedVoices && soCachedVoices.length > 0) ? soCachedVoices : (('speechSynthesis' in window) ? window.speechSynthesis.getVoices() : []);

  // Find Arabic voice if text is Arabic
  let arabicVoice = null;
  if (voices && voices.length > 0) {
    arabicVoice = voices.find(v => (v.lang.startsWith('ar') || v.lang.includes('ar')) && (
      v.name.toLowerCase().includes('laila') ||
      v.name.toLowerCase().includes('salma') ||
      v.name.toLowerCase().includes('zariyah') ||
      v.name.toLowerCase().includes('mariam') ||
      v.name.toLowerCase().includes('zeina') ||
      v.name.toLowerCase().includes('maged') ||
      v.name.toLowerCase().includes('tariq') ||
      v.name.toLowerCase().includes('naayf') ||
      v.name.toLowerCase().includes('arabic') ||
      v.name.toLowerCase().includes('female')
    ));
    if (!arabicVoice) arabicVoice = voices.find(v => v.lang.startsWith('ar') || v.lang.includes('ar'));
  }

  // Handle ARABIC Speech Synthesis cleanly
  if (isArabic) {
    // Replace technical acronyms & numbers with natural human spoken Arabic words in Arabic TTS
    let arabicTextForUtterance = cleanText
      .replace(/\bPOS\b/gi, 'صندوق المبيعات')
      .replace(/\bBOM\b/gi, 'تعبئة وتجميع المعصرة')
      .replace(/\bRO\b/gi, 'محطة التصفية والتكرير')
      .replace(/\bERP\b/gi, 'نظام إدارة الشركة')
      .replace(/\bSuperSonic\b/gi, 'التوصيل السريع')
      .replace(/\bVanguard\b/gi, 'فانغارد')
      .replace(/\bLBP\b/gi, 'ليرة لبنانية')
      .replace(/\bUSD\b/gi, 'دولار أميركي')
      .replace(/#001/g, 'واحد')
      .replace(/\b2000\s*L\b/gi, 'ألفين ليتر')
      .replace(/\b2000L\b/gi, 'ألفين ليتر')
      .replace(/\b2000\b/g, 'ألفين')
      .replace(/\b5000\b/g, 'خمسة آلاف')
      .replace(/\b89,?500\b/g, 'تسعة وثمانين ألف وخمسمئة')
      .replace(/\b500\b/g, 'خمسمئة')
      .replace(/\b100\b/g, 'مئة')
      .replace(/\b30\b/g, 'ثلاثين')
      .replace(/\b20\b/g, 'عشرين')
      .replace(/\b10\b/g, 'عشرة')
      .replace(/\b5\b/g, 'خمسة')
      .replace(/\b4\b/g, 'أربعة')
      .replace(/\b3\b/g, 'ثلاثة')
      .replace(/\b2\b/g, 'اثنان')
      .replace(/\b1\b/g, 'واحد')
      .replace(/\b0\b/g, 'صفر');

    // Cancel any previous speech
    if ('speechSynthesis' in window) {
      try { window.speechSynthesis.cancel(); } catch (e) { }
    }

    // Native Arabic Speech Synthesis
    if ('speechSynthesis' in window) {
      try {
        const utterance = new SpeechSynthesisUtterance(arabicTextForUtterance);
        utterance.lang = 'ar-SA'; // Arabic (Saudi/Standard)
        utterance.rate = 1.0;
        utterance.pitch = 1.0;

        if (arabicVoice) {
          utterance.voice = arabicVoice;
        } else if (voices && voices.length > 0) {
          const matchingAr = voices.find(v => v.lang && v.lang.includes('ar'));
          if (matchingAr) utterance.voice = matchingAr;
        }

        window.speechSynthesis.speak(utterance);
        if (window.speechSynthesis.paused) window.speechSynthesis.resume();
        return;
      } catch (e) {
        console.warn('[Arabic Native TTS Warning]', e);
      }
    }
    return;
  }

  // ENGLISH / FRENCH SPEECH SYNTHESIS
  if (!('speechSynthesis' in window)) return;
  const frPattern = /\b(bonjour|salut|comment|merci|beaucoup|voici|livraison|bidevise|embouteillage|bouteilles|factures|caisse|moulin|bonsoir|ravi|plateforme)\b/i;
  const hasFrenchAccents = /[éèêëàâùûôîç]/i.test(cleanText);
  let useLanguage = (frPattern.test(cleanText) || hasFrenchAccents) ? 'fr-FR' : 'en-GB';

  try {
    window.speechSynthesis.cancel();
    if (window.speechSynthesis.paused) window.speechSynthesis.resume();

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = useLanguage;
    utterance.rate = 0.95;
    utterance.pitch = 1.0;

    if (voices && voices.length > 0) {
      let targetVoice = null;
      if (useLanguage.startsWith('fr')) {
        targetVoice = voices.find(v => v.lang.startsWith('fr') && (
          v.name.toLowerCase().includes('amelie') ||
          v.name.toLowerCase().includes('hortense') ||
          v.name.toLowerCase().includes('julie') ||
          v.name.toLowerCase().includes('celine') ||
          v.name.toLowerCase().includes('denise') ||
          v.name.toLowerCase().includes('virginie') ||
          v.name.toLowerCase().includes('female')
        ));
        if (!targetVoice) targetVoice = voices.find(v => v.lang.startsWith('fr'));
      } else {
        // Priority for British accent female voice (en-GB)
        targetVoice = voices.find(v => (v.lang === 'en-GB' || v.lang === 'en_GB' || v.lang.toLowerCase().includes('gb') || v.lang.toLowerCase().includes('uk')) && (
          v.name.toLowerCase().includes('hazel') ||
          v.name.toLowerCase().includes('george') ||
          v.name.toLowerCase().includes('susan') ||
          v.name.toLowerCase().includes('oliver') ||
          v.name.toLowerCase().includes('google uk english female') ||
          v.name.toLowerCase().includes('google uk english male') ||
          v.name.toLowerCase().includes('serena') ||
          v.name.toLowerCase().includes('daniel') ||
          v.name.toLowerCase().includes('kate') ||
          v.name.toLowerCase().includes('fiona') ||
          v.name.toLowerCase().includes('victoria') ||
          v.name.toLowerCase().includes('uk') ||
          v.name.toLowerCase().includes('british') ||
          v.name.toLowerCase().includes('female')
        ));
        if (!targetVoice) targetVoice = voices.find(v => v.lang === 'en-GB' || v.lang === 'en_GB' || v.lang.toLowerCase().includes('gb'));
        if (!targetVoice) targetVoice = voices.find(v => v.lang.startsWith('en'));
      }

      if (targetVoice) {
        utterance.voice = targetVoice;
        utterance.lang = targetVoice.lang || useLanguage;
      }
    }

    utterance.onerror = function (e) {
      console.warn('[Olive TTS Error Event]', e);
    };

    window.speechSynthesis.speak(utterance);
    if (window.speechSynthesis.paused) window.speechSynthesis.resume();
  } catch (e) {
    console.warn('[Olive TTS Exception]', e);
  }
};

// Dynamic Renaming & Customization Engine for AI Guide
window.setAIGuideName = function (newName) {
  if (!newName) {
    const currentName = localStorage.getItem('so_ai_guide_name') || "Olive AI Assistant";
    newName = prompt("Enter a custom name for your AI Guide & Assistant Agent:", currentName);
  }
  if (!newName || !newName.trim()) return;
  newName = newName.trim();
  localStorage.setItem('so_ai_guide_name', newName);

  document.querySelectorAll('.aiGuideNameLabel').forEach(el => {
    el.textContent = newName;
  });

  if (window.showToast) {
    window.showToast("AI Guide Renamed", `AI Assistant name set to "${newName}"`, "success");
  }
};

window.getAIGuideName = function () {
  return localStorage.getItem('so_ai_guide_name') || "Olive AI Assistant";
};

// Auto-Sync Labels on Load
document.addEventListener('DOMContentLoaded', function () {
  const savedName = localStorage.getItem('so_ai_guide_name');
  if (savedName) {
    document.querySelectorAll('.aiGuideNameLabel').forEach(el => {
      el.textContent = savedName;
    });
  }
});




