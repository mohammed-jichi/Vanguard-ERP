import React, { useState } from 'react';

interface SalesByItemsByGroupTemplateProps {
  hideToolbar?: boolean;
  dynamicPeriodText?: string;
  executionDate?: string;
}

export const SalesByItemsByGroupTemplate: React.FC<SalesByItemsByGroupTemplateProps> = ({
  hideToolbar = false,
  dynamicPeriodText,
  executionDate
}) => {
  const [isFiltered, setIsFiltered] = useState(true);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [reportType, setReportType] = useState('Sales by Items');
  const [filterPeriod, setFilterPeriod] = useState('This Month');
  const [branch, setBranch] = useState('All Branches');
  const [category, setCategory] = useState('All Categories');
  const [division, setDivision] = useState('All Divisions');
  const [group, setGroup] = useState('All Groups');
  const [removeGrouping, setRemoveGrouping] = useState(false);
  const [showRemark, setShowRemark] = useState(false);
  
  // Lists generated from user's explicit request
  const reportTypes = [
    "Sales by Items",
    "Sales by Items (Group by Mode)",
    "Sales by Item by Salesman",
    "Sales By Items (service items only)",
    "Sales by Items by Customer",
    "Sales by Item by Size by Color"
  ];
  
  const datePeriods = [
    "Today",
    "Yesterday",
    "This Month",
    "Last Month",
    "First Quarter",
    "Second Quarter",
    "Third Quarter",
    "Fourth Quarter",
    "This Year",
    "Last Year",
    "Date Range",
    "EOD Date",
    "Year"
  ];
  
  const categoriesList = [
    "All Categories",
    "Raw Materials",
    "Wholesale",
    "Promotions",
    "Retail",
    "Standard Product Grade 1Standard Product"
  ];
  
  const divisionsList = [
    "All Divisions",
    "Distillates & Molasses Retail",
    "Local Pantry Retail",
    "Olives Retail",
    "KgStandard Product Standard Product Retail",
    "Jams Retail",
    "Honey Retail",
    "Standard ProductKgStandard Product Standard Product Retail",
    "Distillates & Molasses Wholesale",
    "Local Pantry Wholesale",
    "Olives Wholesale",
    "KgStandard Product Standard Product Wholesale",
    "Honey Wholesale",
    "Bulk Kg Wholesale",
    "Standard ProductKgStandard Product Standard Product Wholesale",
    "Jams Wholesale",
    "Spices Retail",
    "Chilled Dairy",
    "Dried Goods",
    "Standard Product",
    "Oils Retail",
    "Roasted Nuts Retail",
    "Oils Wholesale",
    "Labneh Balls Retail",
    "Labneh Balls Wholesale",
    "Promotions",
    "Bulk Kg Retail",
    "Jar",
    "Jars",
    "Bottles",
    "Sprout",
    "Demijohns",
    "SERVICES",
    "Main Materials",
    "Assembled Items",
    "Plastic"
  ];
  
  const groupsList = [
    "All Groups",
    "Bulk Grains",
    "Olive Oil Retail 1L",
    "Olive Oil Virgin Retail",
    "Oil Standard ProductKgStandard Product Standard Product Standard Product Retail",
    "Distillates Retail 250ml",
    "Standard Product",
    "Olives Green Retail",
    "KgStandard Product Standard Product Retail",
    "Jams Retail",
    "Honey Retail",
    "Standard ProductKgStandard Product Standard Product Retail",
    "Oil Standard ProductKgStandard Product Standard Product Standard Product Wholesale",
    "Local Pantry Wholesale",
    "Olives Wholesale",
    "KgStandard Product Standard Product Wholesale",
    "Honey Wholesale",
    "Bulk Kg Wholesale",
    "Standard ProductKgStandard Product Standard Product Wholesale",
    "Jams Wholesale",
    "Standard Product Standard Product",
    "Standard Product Spices",
    "Spices g",
    "Standard Product",
    "Standard Product Standard Product",
    "Standard Product KgStandard Product",
    "Standard Product Standard ProductgStandard Product",
    "Standard Product KgStandard Product.",
    "Standard Product Standard ProductgStandard Product.",
    "Standard Product Standard Product Standard Product",
    "Standard Product Retail",
    "Labneh Balls Cow Retail",
    "Olive Oil Khodair Wholesale",
    "Olive Oil KgStandard Product Wholesale",
    "Olive Oil Virgin Wholesale",
    "Molasses Retail 509",
    "Olives Black Retail",
    "Labneh Balls Standard Product Retail",
    "Standard Product Standard Product",
    "Distillates Wholesale",
    "Molasses Wholesale",
    "Standard Product Retail",
    "Olives Black Wholesale",
    "Olives Green Wholesale",
    "Labneh Balls Cow Wholesale",
    "Labneh Balls Standard Product Wholesale",
    "Standard Product Standard Product",
    "Standard Product",
    "Promotions",
    "Standard Product Promotions",
    "Standard Product Standard ProductKgStandard Product",
    "Distillates & Molasses gStandard Product",
    "Distillates Retail 500ml",
    "Molasses Retail 510",
    "Distillates 1 Liters",
    "Shelf Products",
    "509 Jar",
    "Bulk Kg Retail",
    "Jar 510",
    "Jar 507",
    "JAR",
    "Bottles",
    "Demijohn",
    "SERVICES",
    "Main materials",
    "Plastic Gallon",
    "Assembled Items Per 1",
    "Plastic Bottles",
    "CLASSIC-C/R",
    "CLASSIC-R/R"
  ];

  const getDateDisplay = () => {
    switch (filterPeriod) {
      case 'Today': return '29-Aug-2026';
      case 'Yesterday': return '28-Aug-2026';
      case 'This Month': return 'Aug, 2026';
      default: return 'Aug, 2026';
    }
  };

  // Exact 5-page matrix
  const pagesData = [
    {
        "page": 1,
        "rows": [
            {"type": "branch", "text": "Branch: Southern Olive Oil Products S.A.R.L"},
            {"type": "division", "text": "Division: Distillates Standard ProductJams Retail"},
            {"type": "group", "text": "Group: Distillates Retail 500ml"},
            {"type": "item", "desc": "White Vinegar 500ml", "bar": "5281234123528", "qty": "3.00", "total": "210,000.00", "remark": ""},
            {"type": "item", "desc": "Rose Water 500ml", "bar": "5281234123597", "qty": "1.00", "total": "90,000.00", "remark": ""},
            {"type": "item", "desc": "Standard Product Standard Product 500ml", "bar": "5281234123573", "qty": "2.00", "total": "180,000.00", "remark": ""},
            {"type": "item", "desc": "Molasses Pomegranate Molasses 500 ml", "bar": "5281234123979", "qty": "4.00", "total": "480,000.00", "remark": ""},
            {"type": "item", "desc": "Standard Product Standard Product 500ml", "bar": "5281234123634", "qty": "2.00", "total": "180,000.00", "remark": ""},
            {"type": "item", "desc": "Standard Product Standard Product Local 500ml", "bar": "5281234123535", "qty": "6.00", "total": "1,080,000.00", "remark": ""},
            {"type": "group_total", "text": "Total by Group: Distillates Retail 500ml", "qty": "18.00", "total": "2,220,000.00"},
            {"type": "div_total", "text": "Total by Division: Distillates Standard ProductJams Retail", "qty": "18.00", "total": "2,220,000.00"},
            {"type": "division", "text": "Division: Local Pantry Retail"},
            {"type": "group", "text": "Group: Bulk Grains"},
            {"type": "item", "desc": "Rice Standard ProductKgStandard Product", "bar": "10661", "qty": "2.00", "total": "180,000.00", "remark": ""},
            {"type": "item", "desc": "Vermicelli", "bar": "10675", "qty": "2.00", "total": "180,000.00", "remark": ""},
            {"type": "item", "desc": "Coarse Brown Bulgur", "bar": "10706", "qty": "7.60", "total": "760,000.00", "remark": ""},
            {"type": "item", "desc": "Fine Brown Bulgur", "bar": "10707", "qty": "6.00", "total": "720,000.00", "remark": ""},
            {"type": "item", "desc": "Rice Basmati Rice Manas", "bar": "101062", "qty": "3.50", "total": "525,000.00", "remark": ""},
            {"type": "group_total", "text": "Total by Group: Bulk Grains", "qty": "21.10", "total": "2,365,000.00"},
            {"type": "group", "text": "Group: Standard Product"},
            {"type": "item", "desc": "Standard Product Standard Product Standard ProductKgStandard Product 800 g", "bar": "5285001190171", "qty": "2.00", "total": "510,000.00", "remark": ""},
            {"type": "group_total", "text": "Total by Group: Standard Product", "qty": "2.00", "total": "510,000.00"},
            {"type": "group", "text": "Group: Standard Product Standard Product"},
            {"type": "item", "desc": "Sweetened Condensed Milk 370g", "bar": "5601001120503", "qty": "1.00", "total": "300,000.00", "remark": ""},
            {"type": "item", "desc": "Standard Product Standard Product Standard Product 400 g MEZA", "bar": "5285012170025", "qty": "3.00", "total": "180,000.00", "remark": ""},
            {"type": "group_total", "text": "Total by Group: Standard Product Standard Product", "qty": "4.00", "total": "480,000.00"},
            {"type": "group", "text": "Group: Standard Product Standard ProductKgStandard Product"},
            {"type": "item", "desc": "Rice Basmati Al-Bustan 720g", "bar": "8904049651341", "qty": "1.00", "total": "120,000.00", "remark": ""},
            {"type": "group_total", "text": "Total by Group: Standard Product Standard ProductKgStandard Product", "qty": "1.00", "total": "120,000.00"},
            {"type": "group", "text": "Group: Shelf Products"},
            {"type": "item", "desc": "mlStandard Product 200 g", "bar": "11050", "qty": "2.00", "total": "480,000.00", "remark": ""},
            {"type": "item", "desc": "Standard Product Standard Product", "bar": "6210201379629", "qty": "1.00", "total": "270,000.00", "remark": ""},
            {"type": "group_total", "text": "Total by Group: Shelf Products", "qty": "3.00", "total": "750,000.00"}
        ]
    },
    {
        "page": 2,
        "rows": [
            {"type": "div_total", "text": "Total by Division: Local Pantry Retail", "qty": "31.10", "total": "4,225,000.00"},
            {"type": "division", "text": "Division: Jams Retail"},
            {"type": "group", "text": "Group: Jams Retail"},
            {"type": "item", "desc": "Jar Jam Fig Standard Product Standard Product Sesame Standard Product Walnut 800g", "bar": "11262", "qty": "1.00", "total": "360,000.00", "remark": ""},
            {"type": "item", "desc": "Jar Jam Standard Product Standard Product 380g", "bar": "101069", "qty": "1.00", "total": "180,000.00", "remark": ""},
            {"type": "item", "desc": "Jar Jam Fig Standard Product Standard Product Sesame Standard Product Walnut 380g", "bar": "101080", "qty": "2.00", "total": "450,000.00", "remark": ""},
            {"type": "group_total", "text": "Total by Group: Jams Retail", "qty": "4.00", "total": "990,000.00"},
            {"type": "div_total", "text": "Total by Division: Jams Retail", "qty": "4.00", "total": "990,000.00"},
            {"type": "division", "text": "Division: Honey Retail"},
            {"type": "group", "text": "Group: Honey Retail"},
            {"type": "item", "desc": "Honey Summer Flower Honey 1Kg", "bar": "5281234123399", "qty": "1.00", "total": "1,080,000.00", "remark": ""},
            {"type": "item", "desc": "Honey Citrus Blossom Honey 1Kg", "bar": "5281234123405", "qty": "1.00", "total": "1,080,000.00", "remark": ""},
            {"type": "item", "desc": "Honey Standard Product Standard Product Grade 1 1Kg", "bar": "5281234123443", "qty": "2.00", "total": "4,500,000.00", "remark": ""},
            {"type": "item", "desc": "Honey KgStandard Product 1Kg", "bar": "5281234123467", "qty": "1.00", "total": "1,260,000.00", "remark": ""},
            {"type": "item", "desc": "Honey Mountain Wildflower Honey 1Kg", "bar": "5281234123474", "qty": "1.00", "total": "1,440,000.00", "remark": ""},
            {"type": "item", "desc": "Bee Pollen 360g", "bar": "11308", "qty": "0.00", "total": "0.00", "remark": ""},
            {"type": "group_total", "text": "Total by Group: Honey Retail", "qty": "6.00", "total": "9,360,000.00"},
            {"type": "div_total", "text": "Total by Division: Honey Retail", "qty": "6.00", "total": "9,360,000.00"},
            {"type": "division", "text": "Division: Spices Retail"},
            {"type": "group", "text": "Group: Spices g"},
            {"type": "item", "desc": "Dried Mint Bulk Kg", "bar": "10912", "qty": "1.01", "total": "454,500.00", "remark": ""},
            {"type": "item", "desc": "Fine Coriander Bulk Kg", "bar": "10809", "qty": "0.09", "total": "63,000.00", "remark": ""},
            {"type": "item", "desc": "Standard Product Standard Product Bulk Kg", "bar": "10821", "qty": "0.22", "total": "165,000.00", "remark": ""},
            {"type": "item", "desc": "Standard Product Standard Product Bulk Kg", "bar": "10827", "qty": "0.10", "total": "75,000.00", "remark": ""},
            {"type": "item", "desc": "Standard Product Standard ProductKgStandard Product Bulk Kg", "bar": "10892", "qty": "0.50", "total": "400,000.00", "remark": ""},
            {"type": "item", "desc": "Basil Leaves Bulk Kg", "bar": "10896", "qty": "0.10", "total": "75,000.00", "remark": ""},
            {"type": "item", "desc": "Senna Herb Bulk Kg", "bar": "10900", "qty": "0.10", "total": "90,000.00", "remark": ""},
            {"type": "item", "desc": "Standard ProductKgStandard Product Standard Product Bulk Kg", "bar": "10908", "qty": "0.20", "total": "160,000.00", "remark": ""},
            {"type": "item", "desc": "Standard ProductKg Standard Product Bulk Kg", "bar": "10776", "qty": "0.10", "total": "75,000.00", "remark": ""},
            {"type": "item", "desc": "Standard Product Standard Product Bulk Kg", "bar": "10799", "qty": "0.20", "total": "220,000.00", "remark": ""},
            {"type": "item", "desc": "Seven Spices Bulk Kg", "bar": "10839", "qty": "0.10", "total": "75,000.00", "remark": ""},
            {"type": "item", "desc": "KgStandard Product Standard Product Bulk Kg", "bar": "10833", "qty": "0.10", "total": "80,000.00", "remark": ""},
            {"type": "item", "desc": "Standard Product Standard Product Bulk Kg", "bar": "10841", "qty": "0.13", "total": "97,500.00", "remark": ""},
            {"type": "item", "desc": "Standard Product Standard Product Bulk Kg", "bar": "10849", "qty": "1.50", "total": "1,125,000.00", "remark": ""},
            {"type": "item", "desc": "Standard Product Standard Product Bulk Kg", "bar": "10866", "qty": "0.10", "total": "75,000.00", "remark": ""},
            {"type": "item", "desc": "Standard Product KgStandard Product", "bar": "11258", "qty": "0.20", "total": "220,000.00", "remark": ""}
        ]
    },
    {
        "page": 3,
        "rows": [
            {"type": "item", "desc": "KgStandard Product Bulk Kg", "bar": "101013", "qty": "0.20", "total": "120,000.00", "remark": ""},
            {"type": "group_total", "text": "Total by Group: Spices g", "qty": "4.95", "total": "3,570,000.00"},
            {"type": "div_total", "text": "Total by Division: Spices Retail", "qty": "4.95", "total": "3,570,000.00"},
            {"type": "division", "text": "Division: Chilled Dairy"},
            {"type": "group", "text": "Group: Standard Product Standard Product Standard Product"},
            {"type": "item", "desc": "Standard Product Standard ProductKgStandard Product Local", "bar": "10942", "qty": "0.29", "total": "156,600.00", "remark": ""},
            {"type": "item", "desc": "Standard Product Standard ProductKgStandard Product Standard Product", "bar": "11329", "qty": "0.58", "total": "174,000.00", "remark": ""},
            {"type": "item", "desc": "Standard Product Standard ProductgStandard Product Local", "bar": "11330", "qty": "0.40", "total": "216,000.00", "remark": ""},
            {"type": "group_total", "text": "Total by Group: Standard Product Standard Product Standard Product", "qty": "1.27", "total": "546,600.00"},
            {"type": "div_total", "text": "Total by Division: Chilled Dairy", "qty": "1.27", "total": "546,600.00"},
            {"type": "division", "text": "Division: Dried Goods"},
            {"type": "group", "text": "Group: Standard Product KgStandard Product"},
            {"type": "item", "desc": "Dried Kiwi", "bar": "10746", "qty": "1.00", "total": "725,000.00", "remark": ""},
            {"type": "group_total", "text": "Total by Group: Standard Product KgStandard Product", "qty": "1.00", "total": "725,000.00"},
            {"type": "div_total", "text": "Total by Division: Dried Goods", "qty": "1.00", "total": "725,000.00"},
            {"type": "division", "text": "Division: Oils Retail"},
            {"type": "group", "text": "Group: Olive Oil Retail 1L"},
            {"type": "item", "desc": "Tin Olive Oil Khodair Local 17.5 Liters (16 Bulk Kg)", "bar": "11101", "qty": "9.00", "total": "113,400,000.00", "remark": ""},
            {"type": "item", "desc": "Half Tin Olive Oil Khodair Local 8.5 Liters (8 Bulk Kg)", "bar": "11100", "qty": "6.00", "total": "37,800,000.00", "remark": ""},
            {"type": "item", "desc": "Local Olive Oil 1L", "bar": "11102", "qty": "60.72", "total": "49,183,200.00", "remark": ""},
            {"type": "item", "desc": "Glass Bottle Olive Oil Khodair Local 250 ml", "bar": "9780201379662", "qty": "4.00", "total": "1,080,000.00", "remark": ""},
            {"type": "item", "desc": "Glass Bottle Olive Oil Khodair Local 500 ml", "bar": "9780201379679", "qty": "1.00", "total": "540,000.00", "remark": ""},
            {"type": "item", "desc": "Glass Bottle Olive Oil Khodair Local 750 ml", "bar": "9780201379686", "qty": "2.00", "total": "1,440,000.00", "remark": ""},
            {"type": "item", "desc": "Glass Bottle Olive Oil Khodair Local 2850 ml", "bar": "9780201379709", "qty": "2.00", "total": "5,040,000.00", "remark": ""},
            {"type": "item", "desc": "Glass Bottle Olive Oil Khodair Local 1000 ml", "bar": "101017", "qty": "5.00", "total": "4,950,000.00", "remark": ""},
            {"type": "group_total", "text": "Total by Group: Olive Oil Retail 1L", "qty": "89.72", "total": "213,433,200.00"},
            {"type": "group", "text": "Group: Olive Oil Virgin Retail"},
            {"type": "item", "desc": "Extra Virgin Olive Oil Tin 17.5L (16 Bulk Kg)", "bar": "11234", "qty": "45.00", "total": "405,000,000.00", "remark": ""},
            {"type": "item", "desc": "Glass Bottle Olive Oil Virgin 1500 ml", "bar": "11269", "qty": "0.00", "total": "0.00", "remark": ""},
            {"type": "item", "desc": "Glass Bottle Olive Oil Virgin 250 ml", "bar": "11268", "qty": "6.00", "total": "1,350,000.00", "remark": ""},
            {"type": "item", "desc": "Glass Bottle Olive Oil Virgin 2850 ml", "bar": "11270", "qty": "2.00", "total": "3,600,000.00", "remark": ""},
            {"type": "item", "desc": "Glass Bottle Olive Oil Virgin 500 ml", "bar": "11271", "qty": "1.00", "total": "400,000.00", "remark": ""},
            {"type": "item", "desc": "Glass Bottle Olive Oil Virgin 750 ml", "bar": "11272", "qty": "1.00", "total": "600,000.00", "remark": ""},
            {"type": "item", "desc": "Half Tin Olive Oil Virgin Local 8.75 Liters (8 Bulk Kg)", "bar": "11302", "qty": "24.00", "total": "108,000,000.00", "remark": ""},
            {"type": "item", "desc": "Glass Bottle Olive Oil Virgin 1000 ml", "bar": "101016", "qty": "7.00", "total": "5,040,000.00", "remark": ""}
        ]
    },
    {
        "page": 4,
        "rows": [
            {"type": "item", "desc": "Extra Virgin Olive Oil 1L", "bar": "101052", "qty": "70.75", "total": "44,572,500.00", "remark": ""},
            {"type": "group_total", "text": "Total by Group: Olive Oil Virgin Retail", "qty": "156.75", "total": "568,562,500.00"},
            {"type": "div_total", "text": "Total by Division: Oils Retail", "qty": "246.47", "total": "781,995,700.00"},
            {"type": "division", "text": "Division: Roasted Nuts Retail"},
            {"type": "group", "text": "Group: Alkaline & Cleaners Retail"},
            {"type": "item", "desc": "Pine Almonds", "bar": "11276", "qty": "0.25", "total": "393,750.00", "remark": ""},
            {"type": "group_total", "text": "Total by Group: Alkaline & Cleaners Retail", "qty": "0.25", "total": "393,750.00"},
            {"type": "div_total", "text": "Total by Division: Roasted Nuts Retail", "qty": "0.25", "total": "393,750.00"},
            {"type": "division", "text": "Division: Dairy Labneh Wholesale"},
            {"type": "group", "text": "Group: Goat Labneh Wholesale"},
            {"type": "item", "desc": "Box Goat Labneh Labneh Balls Plain 12*600g", "bar": "10995", "qty": "0.00", "total": "0.00", "remark": ""},
            {"type": "group_total", "text": "Total by Group: Goat Labneh Wholesale", "qty": "0.00", "total": "0.00"},
            {"type": "div_total", "text": "Total by Division: Dairy Labneh Wholesale", "qty": "0.00", "total": "0.00"},
            {"type": "division", "text": "Division: Promotions"},
            {"type": "group", "text": "Group: Promotions"},
            {"type": "item", "desc": "Special Promo Offer", "bar": "11218", "qty": "32.00", "total": "288,000,000.00", "remark": ""},
            {"type": "item", "desc": "Standard Product Standard ProductKgStandard Product", "bar": "11301", "qty": "16.00", "total": "194,400,000.00", "remark": ""},
            {"type": "item", "desc": "Box Wooden Travel Box*1", "bar": "101268", "qty": "2.00", "total": "3,600,000.00", "remark": ""},
            {"type": "item", "desc": "Fixed Offer", "bar": "101293", "qty": "24.00", "total": "248,400,000.00", "remark": ""},
            {"type": "group_total", "text": "Total by Group: Promotions", "qty": "74.00", "total": "734,400,000.00"},
            {"type": "div_total", "text": "Total by Division: Promotions", "qty": "74.00", "total": "734,400,000.00"},
            {"type": "division", "text": "Division: Bulk Kg Retail"},
            {"type": "group", "text": "Group: Bulk Kg Retail"},
            {"type": "item", "desc": "Local Zaatar", "bar": "11020", "qty": "1.20", "total": "1,620,000.00", "remark": ""},
            {"type": "item", "desc": "Green Jordanian Zaatar", "bar": "11026", "qty": "2.00", "total": "900,000.00", "remark": ""},
            {"type": "item", "desc": "Sumac", "bar": "11032", "qty": "0.50", "total": "495,000.00", "remark": ""},
            {"type": "item", "desc": "KgStandard ProductKg Local Grade 1", "bar": "10970", "qty": "1.00", "total": "1,350,000.00", "remark": ""},
            {"type": "item", "desc": "Olives Green Local Grade 2", "bar": "11042", "qty": "16.20", "total": "5,346,000.00", "remark": ""},
            {"type": "item", "desc": "Olives Black Local", "bar": "11043", "qty": "7.75", "total": "2,557,500.00", "remark": ""},
            {"type": "item", "desc": "Olives Green Local Grade 1", "bar": "11048", "qty": "4.25", "total": "1,402,500.00", "remark": ""},
            {"type": "item", "desc": "Standard Product Standard Product Standard ProductgStandard Product", "bar": "10932", "qty": "2.00", "total": "330,000.00", "remark": ""},
            {"type": "item", "desc": "Chili Paste Sweet", "bar": "10980", "qty": "1.00", "total": "130,000.00", "remark": ""},
            {"type": "item", "desc": "Bulk Kg Makdous", "bar": "10946", "qty": "1.00", "total": "330,000.00", "remark": ""},
            {"type": "item", "desc": "Chili Paste Spicy Local", "bar": "11361", "qty": "0.50", "total": "130,000.00", "remark": ""},
            {"type": "item", "desc": "Chili Paste Sweet Local", "bar": "11367", "qty": "0.50", "total": "130,000.00", "remark": ""},
            {"type": "group_total", "text": "Total by Group: Bulk Kg Retail", "qty": "37.90", "total": "14,721,000.00"}
        ]
    },
    {
        "page": 5,
        "rows": [
            {"type": "div_total", "text": "Total by Division: Bulk Kg Retail", "qty": "37.90", "total": "14,721,000.00"},
            {"type": "division", "text": "Division: Jar"},
            {"type": "group", "text": "Group: Jar 509"},
            {"type": "item", "desc": "Jar Makdous 650g", "bar": "5281234567209", "qty": "2.00", "total": "540,000.00", "remark": ""},
            {"type": "item", "desc": "Jar Labneh Cow Labneh Balls Plain 600g", "bar": "5281234123009", "qty": "2.00", "total": "800,000.00", "remark": ""},
            {"type": "item", "desc": "Jar Goat Labneh Labneh Balls Plain 600g", "bar": "5281234123054", "qty": "1.00", "total": "600,000.00", "remark": ""},
            {"type": "item", "desc": "Jar Labneh Cow Labneh Balls in Olive Oil 600g", "bar": "5281234123009", "qty": "4.00", "total": "2,160,000.00", "remark": ""},
            {"type": "item", "desc": "Jar Goat Labneh Labneh Balls in Olive Oil 600g", "bar": "5281234123733", "qty": "3.00", "total": "2,400,000.00", "remark": ""},
            {"type": "item", "desc": "Jar French Grape Leaves 350g", "bar": "5281234123177", "qty": "3.00", "total": "570,000.00", "remark": ""},
            {"type": "item", "desc": "Jar Molasses Carob Molasses 800g", "bar": "5281234124259", "qty": "1.00", "total": "315,000.00", "remark": ""},
            {"type": "item", "desc": "Jar Olives Black Local 350g", "bar": "5281234123245", "qty": "1.00", "total": "165,000.00", "remark": ""},
            {"type": "item", "desc": "Jar Labneh Cow Labneh Balls Standard ProductKgStandard Product 600g", "bar": "5281234123023", "qty": "1.00", "total": "400,000.00", "remark": ""},
            {"type": "group_total", "text": "Total by Group: Jar 509", "qty": "18.00", "total": "7,950,000.00"},
            {"type": "group", "text": "Group: Jar 510"},
            {"type": "item", "desc": "Jar Makdous 1000g", "bar": "5281234124174", "qty": "1.00", "total": "450,000.00", "remark": ""},
            {"type": "item", "desc": "Jar Tahini Sesame 1000g", "bar": "5281234123948", "qty": "1.00", "total": "540,000.00", "remark": ""},
            {"type": "item", "desc": "Jar Olives Green Local Grade 1 650g", "bar": "5281234124389", "qty": "6.00", "total": "1,620,000.00", "remark": ""},
            {"type": "group_total", "text": "Total by Group: Jar 510", "qty": "8.00", "total": "2,610,000.00"},
            {"type": "group", "text": "Group: Jar 507"},
            {"type": "item", "desc": "Jar Olives Green Stuffed Arizona 230g", "bar": "101093", "qty": "1.00", "total": "120,000.00", "remark": ""},
            {"type": "item", "desc": "Jar Olives Green Local Grade 1 230g", "bar": "101094", "qty": "2.00", "total": "250,000.00", "remark": ""},
            {"type": "item", "desc": "Jar Olives Black Local 230g", "bar": "101095", "qty": "4.00", "total": "280,000.00", "remark": ""},
            {"type": "item", "desc": "Jar Wild Cucumbers Standard Product KgStandard ProductmlStandard Product 210g", "bar": "101099", "qty": "1.00", "total": "75,000.00", "remark": ""},
            {"type": "group_total", "text": "Total by Group: Jar 507", "qty": "8.00", "total": "725,000.00"},
            {"type": "div_total", "text": "Total by Division: Jar", "qty": "34.00", "total": "11,285,000.00"},
            {"type": "division", "text": "Division: Plastic"},
            {"type": "group", "text": "Group: Plastic Gallon"},
            {"type": "item", "desc": "P Blue Gallon 20 Litres", "bar": "", "qty": "47.00", "total": "0.00", "remark": ""},
            {"type": "item", "desc": "P Blue Gallon 10 Litres", "bar": "", "qty": "23.00", "total": "0.00", "remark": ""},
            {"type": "group_total", "text": "Total by Group: Plastic Gallon", "qty": "70.00", "total": "0.00"},
            {"type": "div_total", "text": "Total by Division: Plastic", "qty": "70.00", "total": "0.00"},
            {"type": "branch_total", "text": "Total by Branch: Southern Olive Oil Products S.A.R.L", "qty": "528.94", "total": "1,564,432,050.00"}
        ]
    }
  ];

  return (
    <div className="w-full flex flex-col items-center bg-white min-h-screen">
      
      {/* FILTERS */}
      <div className="w-full max-w-[1400px] bg-slate-50 border border-slate-200 rounded-lg p-3 mb-6 print:hidden shadow-sm mt-2">
        <div className="flex flex-col gap-3">
          
          {/* Row 1 */}
          <div className="flex flex-wrap items-center gap-3 w-full">
            <select 
              className="force-black border border-slate-400 rounded p-1.5 text-[13px] min-w-[250px]"
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
            >
              {reportTypes.map((rt, i) => <option key={i} value={rt}>{rt}</option>)}
            </select>
            
            <select 
              className="force-black border border-slate-400 rounded p-1.5 text-[13px] min-w-[200px]"
              value={filterPeriod}
              onChange={(e) => setFilterPeriod(e.target.value)}
            >
              {datePeriods.map((dp, i) => <option key={i} value={dp}>{dp}</option>)}
            </select>
            
            <input type="text" value={getDateDisplay()} readOnly className="force-black border border-slate-400 rounded p-1.5 text-[13px] w-[250px]" />
            
            <div className="flex items-center gap-2 ml-auto">
              <button onClick={() => setIsFiltered(true)} className="px-10 py-1.5 bg-[#475569] text-white rounded font-bold hover:bg-slate-700 text-[13px]">Filter Report</button>
            </div>
          </div>

          {/* Row 2 */}
          <div className="flex flex-wrap items-center gap-3 w-full">
            <div className="flex flex-col">
              <span className="text-[11px] font-bold text-slate-500 mb-0.5">Branch</span>
              <select 
                className="force-black border border-slate-400 rounded p-1.5 text-[13px] min-w-[200px]"
                value={branch}
                onChange={(e) => setBranch(e.target.value)}
              >
                <option value="All Branches">All Branches</option>
                <option value="Southern Olive Oil Products S.A.R.L">Southern Olive Oil Products S.A.R.L</option>
              </select>
            </div>
            
            <div className="flex flex-col">
              <span className="text-[11px] font-bold text-slate-500 mb-0.5">Category</span>
              <select 
                className="force-black border border-slate-400 rounded p-1.5 text-[13px] min-w-[200px]"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                {categoriesList.map((c, i) => <option key={i} value={c}>{c}</option>)}
              </select>
            </div>
            
            <div className="flex flex-col">
              <span className="text-[11px] font-bold text-slate-500 mb-0.5">Division</span>
              <select 
                className="force-black border border-slate-400 rounded p-1.5 text-[13px] min-w-[200px]"
                value={division}
                onChange={(e) => setDivision(e.target.value)}
              >
                {divisionsList.map((d, i) => <option key={i} value={d}>{d}</option>)}
              </select>
            </div>
          </div>

          {/* Row 3 */}
          <div className="flex flex-wrap items-center gap-3 w-full mt-1">
            <div className="flex flex-col">
              <span className="text-[11px] font-bold text-slate-500 mb-0.5">Group</span>
              <select 
                className="force-black border border-slate-400 rounded p-1.5 text-[13px] min-w-[200px]"
                value={group}
                onChange={(e) => setGroup(e.target.value)}
              >
                {groupsList.map((g, i) => <option key={i} value={g}>{g}</option>)}
              </select>
            </div>

            <div className="flex items-center gap-6 mt-4 ml-4">
              <label className="flex items-center gap-1.5 text-[13px] font-bold cursor-pointer">
                <input 
                  type="checkbox" 
                  className="w-4 h-4 cursor-pointer"
                  checked={removeGrouping}
                  onChange={(e) => setRemoveGrouping(e.target.checked)} 
                />
                Remove Grouping
              </label>
              
              <label className="flex items-center gap-1.5 text-[13px] font-bold cursor-pointer">
                <input 
                  type="checkbox" 
                  className="w-4 h-4 cursor-pointer"
                  checked={showRemark}
                  onChange={(e) => setShowRemark(e.target.checked)} 
                />
                Show Remark
              </label>
            </div>
            
            <div className="flex items-center gap-2 ml-auto mt-auto">
              <button onClick={() => setIsFiltered(false)} className="px-10 py-1.5 bg-[#5e3b3b] text-white rounded font-bold hover:bg-red-900 text-[13px]">Reset Filters</button>
            </div>
          </div>
        </div>
      </div>

      <div className="w-full max-w-[1400px] flex justify-between items-center mb-2 print:hidden">
        <h2 className="font-bold text-[16px]">Sales by Items</h2>
        <div className="flex items-center gap-2 shrink-0">
          <button onClick={() => setZoomLevel(p => Math.min(p + 0.1, 1.5))} className="p-2 bg-emerald-700 text-white rounded" title="Zoom In">
             <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" /></svg>
          </button>
          <button onClick={() => setZoomLevel(p => Math.max(p - 0.1, 0.5))} className="p-2 bg-emerald-700 text-white rounded" title="Zoom Out">
             <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM13 10H7" /></svg>
          </button>
          <button onClick={() => window.print()} className="px-4 py-1.5 bg-slate-700 text-white rounded text-[13px] font-bold flex items-center gap-2">
            Print Report
          </button>
        </div>
      </div>

      {!isFiltered ? (
        <div className="w-full max-w-[1400px] py-20 flex flex-col items-center border-2 border-dashed border-slate-300 rounded-lg bg-slate-50 print:hidden mt-4">
           <div className="text-[40px] mb-3 opacity-40">📊</div>
           <p className="text-slate-600 font-bold text-[15px]">Select filters and click "Filter Report" to view.</p>
        </div>
      ) : (
        <div className="w-full font-sans text-black bg-slate-100 print:bg-white py-6 print:py-0 flex flex-col items-center gap-8 print:gap-0">
          
          {pagesData.map((pageData) => {
            // Apply Remove Grouping logic per page
            const visibleRows = pageData.rows.filter(row => {
              if (removeGrouping) {
                return !['division', 'group', 'div_total', 'group_total'].includes(row.type);
              }
              return true;
            });

            const colSpanCount = showRemark ? 5 : 4;

            return (
              <div 
                key={pageData.page} 
                className="report-wrapper relative flex flex-col bg-white p-8 shadow-lg border border-slate-300 print:shadow-none print:border-none print:p-0 print:m-0 w-[794px] min-h-[1123px] page-break-after-always" 
                style={{ transform: `scale(${zoomLevel})`, transformOrigin: 'top center' }}
              >
                
                {/* Report Title (Page 1) */}
                {pageData.page === 1 && (
                  <div className="w-full text-center mb-4 relative">
                    <div className="text-blue-700 font-bold text-[12px] text-left absolute top-0 left-0">Southern Olive Oil Products S.A.R.L</div>
                    <h3 className="font-bold text-[14px]">Sales by Items By Group</h3>
                  </div>
                )}

                {/* Page Header */}
                <div className="flex justify-between items-end text-[11px] font-bold w-full border-b-2 border-black pb-1 mb-2 mt-4">
                  <div className="w-[150px] text-left">29-Aug-26</div>
                  <div className="flex-1 text-center">Year: 2026 - Month: 8</div>
                  <div className="w-[150px] text-right">Page {pageData.page} of 5</div>
                </div>

                {/* Table */}
                <table className="w-full text-[11px] text-left border-collapse">
                  <thead>
                    <tr className="border-b-2 border-black">
                      <th className="py-1 px-1 font-bold normal-case w-1/2">Description</th>
                      <th className="py-1 px-1 font-bold normal-case">Barcode</th>
                      {showRemark && <th className="py-1 px-1 font-bold normal-case">Remark</th>}
                      <th className="py-1 px-1 font-bold normal-case text-right">Qty</th>
                      <th className="py-1 px-1 font-bold normal-case text-right">Total Amount</th>
                    </tr>
                  </thead>
                  <tbody className="text-[11px]">
                    {visibleRows.map((row, idx) => {
                      if (row.type === 'branch') return (
                        <tr key={idx}>
                          <td colSpan={colSpanCount} className="font-bold py-1 px-1">{row.text}</td>
                        </tr>
                      );
                      if (row.type === 'division') return (
                        <tr key={idx} className="border-t border-dashed border-black">
                          <td colSpan={colSpanCount} className="font-bold py-1 px-1 pt-2">{row.text}</td>
                        </tr>
                      );
                      if (row.type === 'group') return (
                        <tr key={idx}>
                          <td colSpan={colSpanCount} className="font-bold py-1 px-1">{row.text}</td>
                        </tr>
                      );
                      if (row.type === 'item') return (
                        <tr key={idx} className="leading-none">
                          <td className={`py-[2px] px-1 font-normal ${removeGrouping ? '' : 'pl-4'}`}>{row.desc}</td>
                          <td className="py-[2px] px-1 font-normal">{row.bar}</td>
                          {showRemark && <td className="py-[2px] px-1 font-normal text-slate-500">{row.remark || '-'}</td>}
                          <td className="py-[2px] px-1 font-normal text-right">{row.qty}</td>
                          <td className="py-[2px] px-1 font-normal text-right">{row.total}</td>
                        </tr>
                      );
                      if (row.type === 'group_total') return (
                        <tr key={idx} className="font-bold">
                          <td colSpan={showRemark ? 3 : 2} className="py-1 px-1">{row.text}</td>
                          <td className="py-1 px-1 text-right">{row.qty}</td>
                          <td className="py-1 px-1 text-right">{row.total}</td>
                        </tr>
                      );
                      if (row.type === 'div_total') return (
                        <tr key={idx} className="font-bold border-b border-dashed border-black pb-2">
                          <td colSpan={showRemark ? 3 : 2} className="py-1 px-1">{row.text}</td>
                          <td className="py-1 px-1 text-right">{row.qty}</td>
                          <td className="py-1 px-1 text-right">{row.total}</td>
                        </tr>
                      );
                      if (row.type === 'branch_total') return (
                        <tr key={idx} className="font-bold">
                          <td colSpan={showRemark ? 3 : 2} className="py-4 px-1">{row.text}</td>
                          <td className="py-4 px-1 text-right">{row.qty}</td>
                          <td className="py-4 px-1 text-right">{row.total}</td>
                        </tr>
                      );
                      return null;
                    })}
                  </tbody>
                </table>

                {/* Footer (Only Page 5) */}
                {pageData.page === 5 && (
                  <div className="mt-auto w-full border-t border-black pt-2 pb-4 flex justify-between items-center text-[10px] font-bold text-black">
                    <div className="text-left w-1/3">REP_S_00191</div>
                    <div className="text-center w-1/3">Copyright © 2026 Vanguard ERP. All Rights Reserved.</div>
                    <div className="text-right w-1/3 text-blue-700">www.vanguarderp.com</div>
                  </div>
                )}
              </div>
            );
          })}
          
        </div>
      )}
    </div>
  );
};
