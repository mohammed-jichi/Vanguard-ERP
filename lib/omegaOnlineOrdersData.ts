/**
 * Omega ERP / Vanguard ERP - Online Orders Models & Live Seed Data
 * Module: Online Orders Control Center (ID: 343, Parent: 1)
 * Branch: 22901 - Zeit w zaytoun ljanoub
 */

export interface OmegaOnlineOrderItem {
  item_id: number;
  name: string;
  quantity: number;
  price: number;
  note?: string;
  issent?: number; // -1 = sent/received, -2 = error/pending
  linked_items?: Array<{
    item_id: number;
    name: string;
    quantity: number;
    price: number;
    issent?: number;
  }>;
}

export interface OmegaOnlineOrder {
  id: number;
  orderid: string; // Order No. e.g. "ORD-92841"
  orderdate: string; // e.g. "2026-09-09 19:45:00"
  delivery_time: string; // e.g. "2026-09-09 20:30:00"
  customer_fname: string;
  customer_lname: string;
  customer_phone: string;
  customer_email?: string;
  customer_city: string;
  customer_street: string;
  customer_address: string;
  customer_postcode?: string;
  platform: 'Toters' | 'Talabat' | 'OMENU' | 'Web Store' | 'WhatsApp';
  totalamount: number;
  discount_amount?: number;
  delivery_charge?: number;
  payment_id: number; // 1 = Cash on Delivery, 2 = Paid Online
  status: number; // -1 = Fully Received, -2 = Partially Received, -3 = Fully Received and Accepted, 0 = Not Received Yet
  order_status?: number; // 100 = Cancelled, 2 = Add-on, 0 = Normal
  zonename: string;
  branchname: string;
  branchid: number;
  order_type: number; // 1 = External Orders, 2 = Omenu Orders
  remark?: string;
  items: OmegaOnlineOrderItem[];
}

export interface OmegaOnlineOrdersStatistics {
  total_orders: number;
  fully_received: number;
  partialy_received: number;
  not_received: number;
  omenu_total_orders: number;
  omenu_fully_received: number;
  omenu_partialy_received: number;
  omenu_not_received: number;
}

export const INITIAL_ONLINE_ORDERS: OmegaOnlineOrder[] = [
  {
    id: 101,
    orderid: 'ORD-98412',
    orderdate: '2026-09-09 20:14:00',
    delivery_time: '2026-09-09 21:00:00',
    customer_fname: 'Hassan',
    customer_lname: 'Kassir',
    customer_phone: '+961 70 541 228',
    customer_email: 'hassan.kassir@gmail.com',
    customer_city: 'Saida',
    customer_street: 'Riad El Solh St.',
    customer_address: 'Al-Amine Bldg, 3rd Floor, Near Municipal Garden',
    customer_postcode: '1600',
    platform: 'Toters',
    totalamount: 38.50,
    discount_amount: 3.50,
    delivery_charge: 3.00,
    payment_id: 1, // Cash on Delivery
    status: 0, // Not Received Yet
    zonename: 'South Lebanon - Saida & Coastal',
    branchname: 'Zeit w zaytoun ljanoub',
    branchid: 1,
    order_type: 1, // External
    remark: 'Ring bell twice, customer is on terrace.',
    items: [
      {
        item_id: 201,
        name: 'Extra Virgin Olive Oil 1L (Harvest 2026)',
        quantity: 2,
        price: 14.50,
        note: 'Fresh cold press dark glass bottle'
      },
      {
        item_id: 305,
        name: 'Pomegranate Molasses 500ml',
        quantity: 1,
        price: 6.50
      },
      {
        item_id: 410,
        name: 'Wild Green Thyme (Zaatar Baladi) 500g',
        quantity: 1,
        price: 3.50
      }
    ]
  },
  {
    id: 102,
    orderid: 'ORD-98410',
    orderdate: '2026-09-09 19:30:00',
    delivery_time: '2026-09-09 20:15:00',
    customer_fname: 'Nour',
    customer_lname: 'Saad',
    customer_phone: '+961 03 892 411',
    customer_email: 'nour.saad@outlook.com',
    customer_city: 'Tyre',
    customer_street: 'Corniche El Bahr',
    customer_address: 'Port Residence, Apt 4B',
    platform: 'Talabat',
    totalamount: 52.00,
    discount_amount: 0.00,
    delivery_charge: 4.00,
    payment_id: 2, // Paid Online
    status: -2, // Partially Received
    zonename: 'South Lebanon - Tyre & Nabatieh',
    branchname: 'Zeit w zaytoun ljanoub',
    branchid: 1,
    order_type: 1, // External
    remark: 'Contactless delivery requested, please leave at door.',
    items: [
      {
        item_id: 104,
        name: 'Organic Green Olives Jar 1kg',
        quantity: 2,
        price: 8.50,
        issent: -1
      },
      {
        item_id: 205,
        name: 'Extra Virgin Bulk Tin 5L',
        quantity: 1,
        price: 35.00,
        issent: -2 // Pending POS item deduction
      }
    ]
  },
  {
    id: 103,
    orderid: 'ORD-98399',
    orderdate: '2026-09-09 18:05:00',
    delivery_time: '2026-09-09 18:50:00',
    customer_fname: 'Fadi',
    customer_lname: 'Mroueh',
    customer_phone: '+961 71 339 802',
    customer_email: 'fadi.mroueh@gmail.com',
    customer_city: 'Beirut',
    customer_street: 'Bliss Street',
    customer_address: 'Hamra Plaza, Block C',
    platform: 'OMENU',
    totalamount: 45.00,
    discount_amount: 5.00,
    delivery_charge: 0.00,
    payment_id: 1,
    status: -1, // Fully Received
    zonename: 'Beirut & Suburbs',
    branchname: 'Zeit w zaytoun ljanoub',
    branchid: 1,
    order_type: 2, // Omenu
    items: [
      {
        item_id: 202,
        name: 'Family Olive Oil Pack (3x 1L Glass Bottles)',
        quantity: 1,
        price: 40.00,
        issent: -1,
        linked_items: [
          { item_id: 2021, name: 'Extra Virgin Glass 1L', quantity: 3, price: 0, issent: -1 },
          { item_id: 2022, name: 'Natural Soap Bar 150g', quantity: 1, price: 0, issent: -1 }
        ]
      },
      {
        item_id: 312,
        name: 'Pickled Black Olives Jar 650g',
        quantity: 1,
        price: 5.00,
        issent: -1
      }
    ]
  },
  {
    id: 104,
    orderid: 'ORD-98380',
    orderdate: '2026-09-09 16:20:00',
    delivery_time: '2026-09-09 17:10:00',
    customer_fname: 'Ahmad',
    customer_lname: 'Zein',
    customer_phone: '+961 76 112 045',
    customer_city: 'Choueifat',
    customer_street: 'Main Commercial Ave',
    customer_address: 'Near Old Press Facility',
    platform: 'Web Store',
    totalamount: 89.00,
    payment_id: 2,
    status: -3, // Fully Received and Accepted
    zonename: 'Mount Lebanon - South Suburbs',
    branchname: 'Zeit w zaytoun ljanoub',
    branchid: 1,
    order_type: 1,
    items: [
      {
        item_id: 210,
        name: 'Culinary Harvest Extra Virgin Tin 16L',
        quantity: 1,
        price: 89.00,
        issent: -1
      }
    ]
  },
  {
    id: 105,
    orderid: 'ORD-98365',
    orderdate: '2026-09-09 14:10:00',
    delivery_time: '2026-09-09 15:00:00',
    customer_fname: 'Samar',
    customer_lname: 'Ghadban',
    customer_phone: '+961 03 671 294',
    customer_city: 'Saida',
    customer_street: 'Haret Saida Blvd',
    customer_address: 'Jannat Al-Janoub Residence',
    platform: 'Toters',
    totalamount: 22.00,
    payment_id: 1,
    status: 0,
    order_status: 100, // Cancelled
    zonename: 'South Lebanon - Saida & Coastal',
    branchname: 'Zeit w zaytoun ljanoub',
    branchid: 1,
    order_type: 1,
    remark: 'Cancelled by customer before dispatch.',
    items: [
      {
        item_id: 301,
        name: 'Cold Pressed Virgin Olive Oil 500ml',
        quantity: 2,
        price: 8.00
      },
      {
        item_id: 401,
        name: 'Apple Vinegar 250ml',
        quantity: 2,
        price: 3.00
      }
    ]
  }
];

export const ONLINE_ORDER_BRANCHES = [
  { BRANCHID: -1, OMEGA_CUSTID: -1, BARANCHNAME: 'All Branches' },
  { BRANCHID: 1, OMEGA_CUSTID: 22901, BARANCHNAME: 'Zeit w zaytoun ljanoub' },
  { BRANCHID: 2, OMEGA_CUSTID: 22902, BARANCHNAME: 'Beirut Distribution Hub' },
  { BRANCHID: 3, OMEGA_CUSTID: 22903, BARANCHNAME: 'Saida Showroom Depot' },
  { BRANCHID: 4, OMEGA_CUSTID: 22904, BARANCHNAME: 'Tyre Coastal Center' }
];

export const ONLINE_ORDER_STATUSES = [
  { id: 'all', description: 'All Statuses' },
  { id: -1, description: 'Fully Received' },
  { id: -2, description: 'Partially Received' },
  { id: 0, description: 'Not Received Yet' },
  { id: 100, description: 'Cancelled' }
];
