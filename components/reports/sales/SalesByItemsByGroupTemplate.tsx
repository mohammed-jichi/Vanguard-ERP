import React, { useState } from 'react';

export const SalesByItemsByGroupTemplate = () => {
  const [isFiltered, setIsFiltered] = useState(false);
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
    "جملة",
    "عروض",
    "مفرق",
    "مواد اولية"
  ];
  
  const divisionsList = [
    "All Divisions",
    "مقطرات ومدبسات مفرق",
    "مونة بلدية مفرق",
    "زيتون مفرق",
    "كبيس ومخللات مفرق",
    "مربيات مفرق",
    "عسل مفرق",
    "فواكه مجففه مفرق",
    "مقطرات ومدبسات جملة",
    "مونة بلدية جملة",
    "زيتون جملة",
    "كبيس ومخللات جملة",
    "عسل جملة",
    "كيلو جملة",
    "فواكه مجففه جملة",
    "مربيات جملة",
    "بهارات مفرق",
    "براد",
    "مجففات",
    "مقرمشات",
    "زيوت مفرق",
    "محمصة مفرق",
    "زيوت جملة",
    "مكعزلة مفرق",
    "مكعزلة جملة",
    "عروض",
    "كيلو مفرق",
    "مرطبان",
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
    "حبوب فلت",
    "زيت زيتون خضير مفرق",
    "زيت زيتون فرجين مفرق",
    "زيت اوكراني دوار الشمس مفرق",
    "مقطرات مفرق 250مل",
    "تمور",
    "زيتون اخضر مفرق",
    "كبيس ومخللات مفرق",
    "مربيات مفرق",
    "عسل مفرق",
    "فواكه مجففه مفرق",
    "زيت اوكراني دوار الشمس جملة",
    "مونة بلدية جملة",
    "زيتون جملة",
    "كبيس ومخللات جملة",
    "عسل جملة",
    "كيلو جملة",
    "فواكه مجففه جملة",
    "مربيات جملة",
    "مرشة بهار",
    "علبة بهارات",
    "بهارات غ",
    "مرتديلا",
    "جبنة مطبوخة",
    "علبة كبيرة",
    "علبة صغيرة",
    "علبة كبيرة.",
    "علبة صغيرة.",
    "أجبان و ألبان",
    "قلوبات مفرق",
    "مكعزلة بقر مفرق",
    "زيت زيتون خضير جملة",
    "زيت زيتون كورة جملة",
    "زيت زيتون فرجين جملة",
    "مدبسات مفرق 509",
    "زيتون اسود مفرق",
    "مكعزلة معزة مفرق",
    "معلبات أخرى",
    "مقطرات جملة",
    "مدبسات جملة",
    "بزورات مفرق",
    "زيتون اسود جملة",
    "زيتون اخضر جملة",
    "مكعزلة بقر جملة",
    "مكعزلة معزة جملة",
    "قلوبات ني",
    "حلوى",
    "عروض",
    "مراطبين عروض",
    "حبوب مكيسة",
    "مقطرات ومدبسات غالون",
    "مقطرات مفرق 500مل",
    "مدبسات مفرق 510",
    "مقطرات 1 ليتر",
    "رف",
    "509 مرطبان",
    "كيلو مفرق",
    "مرطبان 510",
    "مرطبان 507",
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
            {"type": "division", "text": "Division: مقطرات ومربيات مفرق"},
            {"type": "group", "text": "Group: مقطرات مفرق 500مل"},
            {"type": "item", "desc": "خل ابيض 500مل", "bar": "5281234123528", "qty": "3.00", "total": "210,000.00", "remark": ""},
            {"type": "item", "desc": "ماء ورد 500مل", "bar": "5281234123597", "qty": "1.00", "total": "90,000.00", "remark": ""},
            {"type": "item", "desc": "ماء زهر 500مل", "bar": "5281234123573", "qty": "2.00", "total": "180,000.00", "remark": ""},
            {"type": "item", "desc": "دبس رمان 500 مل", "bar": "5281234123979", "qty": "4.00", "total": "480,000.00", "remark": ""},
            {"type": "item", "desc": "خل حصرم 500مل", "bar": "5281234123634", "qty": "2.00", "total": "180,000.00", "remark": ""},
            {"type": "item", "desc": "خل تفاح بلدي 500مل", "bar": "5281234123535", "qty": "6.00", "total": "1,080,000.00", "remark": ""},
            {"type": "group_total", "text": "Total by Group: مقطرات مفرق 500مل", "qty": "18.00", "total": "2,220,000.00"},
            {"type": "div_total", "text": "Total by Division: مقطرات ومربيات مفرق", "qty": "18.00", "total": "2,220,000.00"},
            {"type": "division", "text": "Division: مونة بلدية مفرق"},
            {"type": "group", "text": "Group: حبوب فلت"},
            {"type": "item", "desc": "أرز امريكي", "bar": "10661", "qty": "2.00", "total": "180,000.00", "remark": ""},
            {"type": "item", "desc": "شعيرية", "bar": "10675", "qty": "2.00", "total": "180,000.00", "remark": ""},
            {"type": "item", "desc": "برغل اسمر خشن", "bar": "10706", "qty": "7.60", "total": "760,000.00", "remark": ""},
            {"type": "item", "desc": "برغل اسمر ناعم", "bar": "10707", "qty": "6.00", "total": "720,000.00", "remark": ""},
            {"type": "item", "desc": "أرز بسمتي Manas", "bar": "101062", "qty": "3.50", "total": "525,000.00", "remark": ""},
            {"type": "group_total", "text": "Total by Group: حبوب فلت", "qty": "21.10", "total": "2,365,000.00"},
            {"type": "group", "text": "Group: تمور"},
            {"type": "item", "desc": "تمور المدينة فاكيوم 800 غرام", "bar": "5285001190171", "qty": "2.00", "total": "510,000.00", "remark": ""},
            {"type": "group_total", "text": "Total by Group: تمور", "qty": "2.00", "total": "510,000.00"},
            {"type": "group", "text": "Group: معلبات أخرى"},
            {"type": "item", "desc": "نستله حليب مكثف محلى 370 غرام", "bar": "5601001120503", "qty": "1.00", "total": "300,000.00", "remark": ""},
            {"type": "item", "desc": "فول مدمس حب 400 غ MEZA", "bar": "5285012170025", "qty": "3.00", "total": "180,000.00", "remark": ""},
            {"type": "group_total", "text": "Total by Group: معلبات أخرى", "qty": "4.00", "total": "480,000.00"},
            {"type": "group", "text": "Group: حبوب مكيسة"},
            {"type": "item", "desc": "أرز بسمتي البستان 720غ", "bar": "8904049651341", "qty": "1.00", "total": "120,000.00", "remark": ""},
            {"type": "group_total", "text": "Total by Group: حبوب مكيسة", "qty": "1.00", "total": "120,000.00"},
            {"type": "group", "text": "Group: رف"},
            {"type": "item", "desc": "ملوخية 200 غرام", "bar": "11050", "qty": "2.00", "total": "480,000.00", "remark": ""},
            {"type": "item", "desc": "حلاوة شودية", "bar": "6210201379629", "qty": "1.00", "total": "270,000.00", "remark": ""},
            {"type": "group_total", "text": "Total by Group: رف", "qty": "3.00", "total": "750,000.00"}
        ]
    },
    {
        "page": 2,
        "rows": [
            {"type": "div_total", "text": "Total by Division: مونة بلدية مفرق", "qty": "31.10", "total": "4,225,000.00"},
            {"type": "division", "text": "Division: مربيات مفرق"},
            {"type": "group", "text": "Group: مربيات مفرق"},
            {"type": "item", "desc": "مرطبان مربي تين معقود مع سمسم و جوز 800غ", "bar": "11262", "qty": "1.00", "total": "360,000.00", "remark": ""},
            {"type": "item", "desc": "مرطبان مربي فريز حب 380غ", "bar": "101069", "qty": "1.00", "total": "180,000.00", "remark": ""},
            {"type": "item", "desc": "مرطبان مربي تين معقود مع سمسم و جوز 380غ", "bar": "101080", "qty": "2.00", "total": "450,000.00", "remark": ""},
            {"type": "group_total", "text": "Total by Group: مربيات مفرق", "qty": "4.00", "total": "990,000.00"},
            {"type": "div_total", "text": "Total by Division: مربيات مفرق", "qty": "4.00", "total": "990,000.00"},
            {"type": "division", "text": "Division: عسل مفرق"},
            {"type": "group", "text": "Group: عسل مفرق"},
            {"type": "item", "desc": "عسل صيفي 1ك", "bar": "5281234123399", "qty": "1.00", "total": "1,080,000.00", "remark": ""},
            {"type": "item", "desc": "عسل ليمون 1ك", "bar": "5281234123405", "qty": "1.00", "total": "1,080,000.00", "remark": ""},
            {"type": "item", "desc": "عسل سنديان خام باب أول 1ك", "bar": "5281234123443", "qty": "2.00", "total": "4,500,000.00", "remark": ""},
            {"type": "item", "desc": "عسل كينا 1ك", "bar": "5281234123467", "qty": "1.00", "total": "1,260,000.00", "remark": ""},
            {"type": "item", "desc": "عسل جردي 1ك", "bar": "5281234123474", "qty": "1.00", "total": "1,440,000.00", "remark": ""},
            {"type": "item", "desc": "حبوب اللقاح 360غ", "bar": "11308", "qty": "0.00", "total": "0.00", "remark": ""},
            {"type": "group_total", "text": "Total by Group: عسل مفرق", "qty": "6.00", "total": "9,360,000.00"},
            {"type": "div_total", "text": "Total by Division: عسل مفرق", "qty": "6.00", "total": "9,360,000.00"},
            {"type": "division", "text": "Division: بهارات مفرق"},
            {"type": "group", "text": "Group: بهارات غ"},
            {"type": "item", "desc": "نعنع يابس كيلو", "bar": "10912", "qty": "1.01", "total": "454,500.00", "remark": ""},
            {"type": "item", "desc": "كزبرة ناعم كيلو", "bar": "10809", "qty": "0.09", "total": "63,000.00", "remark": ""},
            {"type": "item", "desc": "بهار لحمة كيلو", "bar": "10821", "qty": "0.22", "total": "165,000.00", "remark": ""},
            {"type": "item", "desc": "بهار بطاطا كيلو", "bar": "10827", "qty": "0.10", "total": "75,000.00", "remark": ""},
            {"type": "item", "desc": "حبة البركة كيلو", "bar": "10892", "qty": "0.50", "total": "400,000.00", "remark": ""},
            {"type": "item", "desc": "حبق كيلو", "bar": "10896", "qty": "0.10", "total": "75,000.00", "remark": ""},
            {"type": "item", "desc": "عشرق كيلو", "bar": "10900", "qty": "0.10", "total": "90,000.00", "remark": ""},
            {"type": "item", "desc": "اكليل الجبل كيلو", "bar": "10908", "qty": "0.20", "total": "160,000.00", "remark": ""},
            {"type": "item", "desc": "سمك بالأعشاب كيلو", "bar": "10776", "qty": "0.10", "total": "75,000.00", "remark": ""},
            {"type": "item", "desc": "بذور الشيا كيلو", "bar": "10799", "qty": "0.20", "total": "220,000.00", "remark": ""},
            {"type": "item", "desc": "سبع بهارات كيلو", "bar": "10839", "qty": "0.10", "total": "75,000.00", "remark": ""},
            {"type": "item", "desc": "كمون ناعم كيلو", "bar": "10833", "qty": "0.10", "total": "80,000.00", "remark": ""},
            {"type": "item", "desc": "حر ناعم كيلو", "bar": "10841", "qty": "0.13", "total": "97,500.00", "remark": ""},
            {"type": "item", "desc": "بهار ماجي كيلو", "bar": "10849", "qty": "1.50", "total": "1,125,000.00", "remark": ""},
            {"type": "item", "desc": "بهار طاووق كيلو", "bar": "10866", "qty": "0.10", "total": "75,000.00", "remark": ""},
            {"type": "item", "desc": "بذر كتان", "bar": "11258", "qty": "0.20", "total": "220,000.00", "remark": ""}
        ]
    },
    {
        "page": 3,
        "rows": [
            {"type": "item", "desc": "كربونة كيلو", "bar": "101013", "qty": "0.20", "total": "120,000.00", "remark": ""},
            {"type": "group_total", "text": "Total by Group: بهارات غ", "qty": "4.95", "total": "3,570,000.00"},
            {"type": "div_total", "text": "Total by Division: بهارات مفرق", "qty": "4.95", "total": "3,570,000.00"},
            {"type": "division", "text": "Division: براد"},
            {"type": "group", "text": "Group: أجبان و ألبان"},
            {"type": "item", "desc": "جبنة عكاوي بلدي", "bar": "10942", "qty": "0.29", "total": "156,600.00", "remark": ""},
            {"type": "item", "desc": "جبنة بركة اسطنبولي", "bar": "11329", "qty": "0.58", "total": "174,000.00", "remark": ""},
            {"type": "item", "desc": "جبنة بلغاري بلدي", "bar": "11330", "qty": "0.40", "total": "216,000.00", "remark": ""},
            {"type": "group_total", "text": "Total by Group: أجبان و ألبان", "qty": "1.27", "total": "546,600.00"},
            {"type": "div_total", "text": "Total by Division: براد", "qty": "1.27", "total": "546,600.00"},
            {"type": "division", "text": "Division: مجففات"},
            {"type": "group", "text": "Group: علبة كبيرة"},
            {"type": "item", "desc": "كيوي حامض", "bar": "10746", "qty": "1.00", "total": "725,000.00", "remark": ""},
            {"type": "group_total", "text": "Total by Group: علبة كبيرة", "qty": "1.00", "total": "725,000.00"},
            {"type": "div_total", "text": "Total by Division: مجففات", "qty": "1.00", "total": "725,000.00"},
            {"type": "division", "text": "Division: زيوت مفرق"},
            {"type": "group", "text": "Group: زيت زيتون خضير مفرق"},
            {"type": "item", "desc": "تنكة زيت زيتون خضير بلدي 17.5 ليتر (16 كيلو)", "bar": "11101", "qty": "9.00", "total": "113,400,000.00", "remark": ""},
            {"type": "item", "desc": "نصف تنكة زيت زيتون خضير بلدي 8.5 ليتر (8 كيلو)", "bar": "11100", "qty": "6.00", "total": "37,800,000.00", "remark": ""},
            {"type": "item", "desc": "زيت زيتون خضير بلدي 1 ليتر", "bar": "11102", "qty": "60.72", "total": "49,183,200.00", "remark": ""},
            {"type": "item", "desc": "الفية زيت زيتون خضير بلدي 250 مل", "bar": "9780201379662", "qty": "4.00", "total": "1,080,000.00", "remark": ""},
            {"type": "item", "desc": "الفية زيت زيتون خضير بلدي 500 مل", "bar": "9780201379679", "qty": "1.00", "total": "540,000.00", "remark": ""},
            {"type": "item", "desc": "الفية زيت زيتون خضير بلدي 750 مل", "bar": "9780201379686", "qty": "2.00", "total": "1,440,000.00", "remark": ""},
            {"type": "item", "desc": "الفية زيت زيتون خضير بلدي 2850 مل", "bar": "9780201379709", "qty": "2.00", "total": "5,040,000.00", "remark": ""},
            {"type": "item", "desc": "الفية زيت زيتون خضير بلدي 1000 مل", "bar": "101017", "qty": "5.00", "total": "4,950,000.00", "remark": ""},
            {"type": "group_total", "text": "Total by Group: زيت زيتون خضير مفرق", "qty": "89.72", "total": "213,433,200.00"},
            {"type": "group", "text": "Group: زيت زيتون فرجين مفرق"},
            {"type": "item", "desc": "تنكة زيت زيتون فرجن بلدي 17.5 ليتر (16 كيلو)", "bar": "11234", "qty": "45.00", "total": "405,000,000.00", "remark": ""},
            {"type": "item", "desc": "الفية زيت زيتون فرجن 1500 مل", "bar": "11269", "qty": "0.00", "total": "0.00", "remark": ""},
            {"type": "item", "desc": "الفية زيت زيتون فرجن 250 مل", "bar": "11268", "qty": "6.00", "total": "1,350,000.00", "remark": ""},
            {"type": "item", "desc": "الفية زيت زيتون فرجن 2850 مل", "bar": "11270", "qty": "2.00", "total": "3,600,000.00", "remark": ""},
            {"type": "item", "desc": "الفية زيت زيتون فرجن 500 مل", "bar": "11271", "qty": "1.00", "total": "400,000.00", "remark": ""},
            {"type": "item", "desc": "الفية زيت زيتون فرجن 750 مل", "bar": "11272", "qty": "1.00", "total": "600,000.00", "remark": ""},
            {"type": "item", "desc": "نصف تنكة زيت زيتون فرجن بلدي 8.75 ليتر (8 كيلو)", "bar": "11302", "qty": "24.00", "total": "108,000,000.00", "remark": ""},
            {"type": "item", "desc": "الفية زيت زيتون فرجن 1000 مل", "bar": "101016", "qty": "7.00", "total": "5,040,000.00", "remark": ""}
        ]
    },
    {
        "page": 4,
        "rows": [
            {"type": "item", "desc": "زيت زيتون فرجن 1 ليتر", "bar": "101052", "qty": "70.75", "total": "44,572,500.00", "remark": ""},
            {"type": "group_total", "text": "Total by Group: زيت زيتون فرجين مفرق", "qty": "156.75", "total": "568,562,500.00"},
            {"type": "div_total", "text": "Total by Division: زيوت مفرق", "qty": "246.47", "total": "781,995,700.00"},
            {"type": "division", "text": "Division: محمصة مفرق"},
            {"type": "group", "text": "Group: قلويات مفرق"},
            {"type": "item", "desc": "لوز صنوبري", "bar": "11276", "qty": "0.25", "total": "393,750.00", "remark": ""},
            {"type": "group_total", "text": "Total by Group: قلويات مفرق", "qty": "0.25", "total": "393,750.00"},
            {"type": "div_total", "text": "Total by Division: محمصة مفرق", "qty": "0.25", "total": "393,750.00"},
            {"type": "division", "text": "Division: ممعزلة جملة"},
            {"type": "group", "text": "Group: ممعزلة معزة جملة"},
            {"type": "item", "desc": "صندوق لبنة معزة مكعزلة سادة 12*600غ", "bar": "10995", "qty": "0.00", "total": "0.00", "remark": ""},
            {"type": "group_total", "text": "Total by Group: ممعزلة معزة جملة", "qty": "0.00", "total": "0.00"},
            {"type": "div_total", "text": "Total by Division: ممعزلة جملة", "qty": "0.00", "total": "0.00"},
            {"type": "division", "text": "Division: عروض"},
            {"type": "group", "text": "Group: عروض"},
            {"type": "item", "desc": "عرض العطاء جديد", "bar": "11218", "qty": "32.00", "total": "288,000,000.00", "remark": ""},
            {"type": "item", "desc": "عرض الكرم", "bar": "11301", "qty": "16.00", "total": "194,400,000.00", "remark": ""},
            {"type": "item", "desc": "صندوق خشب للسفر*1", "bar": "101268", "qty": "2.00", "total": "3,600,000.00", "remark": ""},
            {"type": "item", "desc": "Fixed Offer", "bar": "101293", "qty": "24.00", "total": "248,400,000.00", "remark": ""},
            {"type": "group_total", "text": "Total by Group: عروض", "qty": "74.00", "total": "734,400,000.00"},
            {"type": "div_total", "text": "Total by Division: عروض", "qty": "74.00", "total": "734,400,000.00"},
            {"type": "division", "text": "Division: كيلو مفرق"},
            {"type": "group", "text": "Group: كيلو مفرق"},
            {"type": "item", "desc": "زعتر بلدي", "bar": "11020", "qty": "1.20", "total": "1,620,000.00", "remark": ""},
            {"type": "item", "desc": "زعتر اخضر أردني", "bar": "11026", "qty": "2.00", "total": "900,000.00", "remark": ""},
            {"type": "item", "desc": "سماق", "bar": "11032", "qty": "0.50", "total": "495,000.00", "remark": ""},
            {"type": "item", "desc": "كشك بلدي باب أول", "bar": "10970", "qty": "1.00", "total": "1,350,000.00", "remark": ""},
            {"type": "item", "desc": "زيتون اخضر بلدي ثاني", "bar": "11042", "qty": "16.20", "total": "5,346,000.00", "remark": ""},
            {"type": "item", "desc": "زيتون اسود بلدي", "bar": "11043", "qty": "7.75", "total": "2,557,500.00", "remark": ""},
            {"type": "item", "desc": "زيتون اخضر بلدي أول", "bar": "11048", "qty": "4.25", "total": "1,402,500.00", "remark": ""},
            {"type": "item", "desc": "حر قرن الغزال", "bar": "10932", "qty": "2.00", "total": "330,000.00", "remark": ""},
            {"type": "item", "desc": "شطة حلوة", "bar": "10980", "qty": "1.00", "total": "130,000.00", "remark": ""},
            {"type": "item", "desc": "كيلو مكدوس", "bar": "10946", "qty": "1.00", "total": "330,000.00", "remark": ""},
            {"type": "item", "desc": "شطة حارة بلدي", "bar": "11361", "qty": "0.50", "total": "130,000.00", "remark": ""},
            {"type": "item", "desc": "شطة حلوة بلدي", "bar": "11367", "qty": "0.50", "total": "130,000.00", "remark": ""},
            {"type": "group_total", "text": "Total by Group: كيلو مفرق", "qty": "37.90", "total": "14,721,000.00"}
        ]
    },
    {
        "page": 5,
        "rows": [
            {"type": "div_total", "text": "Total by Division: كيلو مفرق", "qty": "37.90", "total": "14,721,000.00"},
            {"type": "division", "text": "Division: مرطبان"},
            {"type": "group", "text": "Group: مرطبان 509"},
            {"type": "item", "desc": "مرطبان مكدوس 650غ", "bar": "5281234567209", "qty": "2.00", "total": "540,000.00", "remark": ""},
            {"type": "item", "desc": "مرطبان لبنة بقر مكعزلة سادة 600غ", "bar": "5281234123009", "qty": "2.00", "total": "800,000.00", "remark": ""},
            {"type": "item", "desc": "مرطبان لبنة معزة مكعزلة سادة 600غ", "bar": "5281234123054", "qty": "1.00", "total": "600,000.00", "remark": ""},
            {"type": "item", "desc": "مرطبان لبنة بقر مكعزلة بزيت الزيتون 600غ", "bar": "5281234123009", "qty": "4.00", "total": "2,160,000.00", "remark": ""},
            {"type": "item", "desc": "مرطبان لبنة معزة مكعزلة بزيت الزيتون 600غ", "bar": "5281234123733", "qty": "3.00", "total": "2,400,000.00", "remark": ""},
            {"type": "item", "desc": "مرطبان ورق عنب فرنسي 350غ", "bar": "5281234123177", "qty": "3.00", "total": "570,000.00", "remark": ""},
            {"type": "item", "desc": "مرطبان دبس خروب 800غ", "bar": "5281234124259", "qty": "1.00", "total": "315,000.00", "remark": ""},
            {"type": "item", "desc": "مرطبان زيتون اسود بلدي 350غ", "bar": "5281234123245", "qty": "1.00", "total": "165,000.00", "remark": ""},
            {"type": "item", "desc": "مرطبان لبنة بقر مكعزلة بالبابريكا 600غ", "bar": "5281234123023", "qty": "1.00", "total": "400,000.00", "remark": ""},
            {"type": "group_total", "text": "Total by Group: مرطبان 509", "qty": "18.00", "total": "7,950,000.00"},
            {"type": "group", "text": "Group: مرطبان 510"},
            {"type": "item", "desc": "مرطبان مكدوس 1000غ", "bar": "5281234124174", "qty": "1.00", "total": "450,000.00", "remark": ""},
            {"type": "item", "desc": "مرطبان طحينة سمسم 1000غ", "bar": "5281234123948", "qty": "1.00", "total": "540,000.00", "remark": ""},
            {"type": "item", "desc": "مرطبان زيتون اخضر بلدي اول 650غ", "bar": "5281234124389", "qty": "6.00", "total": "1,620,000.00", "remark": ""},
            {"type": "group_total", "text": "Total by Group: مرطبان 510", "qty": "8.00", "total": "2,610,000.00"},
            {"type": "group", "text": "Group: مرطبان 507"},
            {"type": "item", "desc": "مرطبان زيتون اخضر محشي اريزونا 230غ", "bar": "101093", "qty": "1.00", "total": "120,000.00", "remark": ""},
            {"type": "item", "desc": "مرطبان زيتون اخضر بلدي اول 230غ", "bar": "101094", "qty": "2.00", "total": "250,000.00", "remark": ""},
            {"type": "item", "desc": "مرطبان زيتون اسود بلدي 230غ", "bar": "101095", "qty": "4.00", "total": "280,000.00", "remark": ""},
            {"type": "item", "desc": "مرطبان مقتة حبة كاملة 210غ", "bar": "101099", "qty": "1.00", "total": "75,000.00", "remark": ""},
            {"type": "group_total", "text": "Total by Group: مرطبان 507", "qty": "8.00", "total": "725,000.00"},
            {"type": "div_total", "text": "Total by Division: مرطبان", "qty": "34.00", "total": "11,285,000.00"},
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
