// Omega ERP Live Fixtures & Simulation Data
// Extracted from Customer 22901 (Southern Olive Oil Products / زيتون وزيت)

export interface OmegaScreenItem {
  LABELNUMBER: number;
  LABELNAME: string;
  STATUS: number;
  COLOR: string;
  PIC: string | null;
  PRODUCTID: number;
  VBRED: number;
  VBGREEN: number;
  VBBLUE: number;
  SCREEN_DET_ID: number;
}

export interface OmegaGroup {
  GRIDBRANCHID: number;
  GROUPNAME: string;
  GRPICTURE: string | null;
}

export interface OmegaScreen {
  ID: number;
  SCRBRANCHID: number;
  BRAND_ID: number;
  BRANCHID: number;
  SCREENNUMBER: number;
  SCREENNAME: string;
  SCPICTURE: string;
  TOTALEXCEPTIONS: number;
  sd_screens_branch_exception: { BRANCHID: number; BRANCHNAME: string }[];
}

export interface OmegaPredefinedCategory {
  id: number;
  name: string;
  imageurl: string;
}

export const OMEGA_COLORS: string[] = [
  "#F9EBEA",
  "#F2D7D5",
  "#E6B0AA",
  "#D98880",
  "#CD6155",
  "#C0392B",
  "#A93226",
  "#922B21",
  "#7B241C",
  "#641E16",
  "#FDEDEC",
  "#FADBD8",
  "#F5B7B1",
  "#F1948A",
  "#EC7063",
  "#E74C3C",
  "#CB4335",
  "#B03A2E",
  "#943126",
  "#78281F",
  "#F5EEF8",
  "#EBDEF0",
  "#D7BDE2",
  "#C39BD3",
  "#AF7AC5",
  "#9B59B6",
  "#884EA0",
  "#76448A",
  "#633974",
  "#512E5F",
  "#F4ECF7",
  "#E8DAEF",
  "#D2B4DE",
  "#BB8FCE",
  "#A569BD",
  "#8E44AD",
  "#7D3C98",
  "#6C3483",
  "#5B2C6F",
  "#4A235A",
  "#EAF2F8",
  "#D4E6F1",
  "#A9CCE3",
  "#7FB3D5",
  "#5499C7",
  "#2980B9",
  "#2471A3",
  "#1F618D",
  "#1A5276",
  "#154360",
  "#EBF5FB",
  "#D6EAF8",
  "#AED6F1",
  "#85C1E9",
  "#5DADE2",
  "#3498DB",
  "#2E86C1",
  "#2874A6",
  "#21618C",
  "#1B4F72",
  "#E8F8F5",
  "#D1F2EB",
  "#A3E4D7",
  "#76D7C4",
  "#48C9B0",
  "#1ABC9C",
  "#17A589",
  "#148F77",
  "#117864",
  "#0E6251",
  "#E8F6F3",
  "#D0ECE7",
  "#A2D9CE",
  "#73C6B6",
  "#45B39D",
  "#16A085",
  "#138D75",
  "#117A65",
  "#0E6655",
  "#0B5345",
  "#E9F7EF",
  "#D4EFDF",
  "#A9DFBF",
  "#7DCEA0",
  "#52BE80",
  "#27AE60",
  "#229954",
  "#1E8449",
  "#196F3D",
  "#145A32",
  "#EAFAF1",
  "#D5F5E3",
  "#ABEBC6",
  "#82E0AA",
  "#58D68D",
  "#2ECC71",
  "#28B463",
  "#239B56",
  "#1D8348",
  "#186A3B",
  "#FEF9E7",
  "#FCF3CF",
  "#F9E79F",
  "#F7DC6F",
  "#F4D03F",
  "#F1C40F",
  "#D4AC0D",
  "#B7950B",
  "#9A7D0A",
  "#7D6608",
  "#FEF5E7",
  "#FDEBD0",
  "#FAD7A0",
  "#F8C471",
  "#F5B041",
  "#F39C12",
  "#D68910",
  "#B9770E",
  "#9C640C",
  "#7E5109",
  "#FDF2E9",
  "#FAE5D3",
  "#F5CBA7",
  "#F0B27A",
  "#EB984E",
  "#E67E22",
  "#CA6F1E",
  "#AF601A",
  "#935116",
  "#784212",
  "#FBEEE6",
  "#F6DDCC",
  "#EDBB99",
  "#E59866",
  "#DC7633",
  "#D35400",
  "#BA4A00",
  "#A04000",
  "#873600",
  "#6E2C00",
  "#FDFEFE",
  "#E5E8E8",
  "#CCD1D1",
  "#B2BABB",
  "#99A3A4",
  "#7F8C8D",
  "#707B7C",
  "#616A6B",
  "#515A5A",
  "#424949",
  "#EBEDEF",
  "#D6DBDF",
  "#AEB6BF",
  "#85929E",
  "#5D6D7E",
  "#2E4053",
  "#273746",
  "#212F3D",
  "#1C2833",
  "#17202A"
];

export const OMEGA_INITIAL_SCREENS: OmegaScreen[] = [
  {
    ID: 7351,
    SCRBRANCHID: 1,
    BRAND_ID: 9606,
    BRANCHID: 1,
    SCREENNUMBER: 1,
    SCREENNAME: 'MAIN',
    SCPICTURE: '',
    TOTALEXCEPTIONS: 0,
    sd_screens_branch_exception: []
  },
  {
    ID: 7352,
    SCRBRANCHID: 2,
    BRAND_ID: 9606,
    BRANCHID: 1,
    SCREENNUMBER: 2,
    SCREENNAME: 'أجبان وألبان',
    SCPICTURE: '',
    TOTALEXCEPTIONS: 0,
    sd_screens_branch_exception: []
  },
  {
    ID: 7353,
    SCRBRANCHID: 3,
    BRAND_ID: 9606,
    BRANCHID: 1,
    SCREENNUMBER: 3,
    SCREENNAME: 'زيتون ومخللات',
    SCPICTURE: '',
    TOTALEXCEPTIONS: 1,
    sd_screens_branch_exception: [{ BRANCHID: 2, BRANCHNAME: '002 - Beirut' }]
  },
  {
    ID: 7354,
    SCRBRANCHID: 4,
    BRAND_ID: 9606,
    BRANCHID: 1,
    SCREENNUMBER: 4,
    SCREENNAME: 'عسل ومربيات',
    SCPICTURE: '',
    TOTALEXCEPTIONS: 0,
    sd_screens_branch_exception: []
  },
  {
    ID: 7355,
    SCRBRANCHID: 5,
    BRAND_ID: 9606,
    BRANCHID: 1,
    SCREENNUMBER: 5,
    SCREENNAME: 'مقطرات ومدبسات غالون',
    SCPICTURE: '',
    TOTALEXCEPTIONS: 0,
    sd_screens_branch_exception: []
  }
];

export const OMEGA_GROUPS: OmegaGroup[] = [
  {
    "GRIDBRANCHID": 65,
    "GROUPNAME": "509 مرطبان",
    "GRPICTURE": null
  },
  {
    "GRIDBRANCHID": 75,
    "GROUPNAME": "Assembled Items Per 1",
    "GRPICTURE": null
  },
  {
    "GRIDBRANCHID": 70,
    "GROUPNAME": "Bottles",
    "GRPICTURE": null
  },
  {
    "GRIDBRANCHID": 77,
    "GROUPNAME": "CLASSIC-C/R",
    "GRPICTURE": null
  },
  {
    "GRIDBRANCHID": 78,
    "GROUPNAME": "CLASSIC-R/R",
    "GRPICTURE": null
  },
  {
    "GRIDBRANCHID": 71,
    "GROUPNAME": "Demijohn",
    "GRPICTURE": null
  },
  {
    "GRIDBRANCHID": 69,
    "GROUPNAME": "JAR",
    "GRPICTURE": null
  },
  {
    "GRIDBRANCHID": 73,
    "GROUPNAME": "Main materials",
    "GRPICTURE": null
  },
  {
    "GRIDBRANCHID": 76,
    "GROUPNAME": "Plastic Bottles",
    "GRPICTURE": null
  },
  {
    "GRIDBRANCHID": 74,
    "GROUPNAME": "Plastic Gallon",
    "GRPICTURE": null
  },
  {
    "GRIDBRANCHID": 72,
    "GROUPNAME": "SERVICES",
    "GRPICTURE": null
  },
  {
    "GRIDBRANCHID": 35,
    "GROUPNAME": "أجبان و ألبان",
    "GRPICTURE": null
  },
  {
    "GRIDBRANCHID": 49,
    "GROUPNAME": "بزورات مفرق",
    "GRPICTURE": null
  },
  {
    "GRIDBRANCHID": 27,
    "GROUPNAME": "بهارات غ",
    "GRPICTURE": null
  },
  {
    "GRIDBRANCHID": 6,
    "GROUPNAME": "تمور",
    "GRPICTURE": null
  },
  {
    "GRIDBRANCHID": 30,
    "GROUPNAME": "جبنة مطبوخة",
    "GRPICTURE": null
  },
  {
    "GRIDBRANCHID": 1,
    "GROUPNAME": "حبوب فلت",
    "GRPICTURE": null
  },
  {
    "GRIDBRANCHID": 59,
    "GROUPNAME": "حبوب مكيسة",
    "GRPICTURE": null
  },
  {
    "GRIDBRANCHID": 56,
    "GROUPNAME": "حلوى",
    "GRPICTURE": null
  },
  {
    "GRIDBRANCHID": 64,
    "GROUPNAME": "رف",
    "GRPICTURE": null
  },
  {
    "GRIDBRANCHID": 15,
    "GROUPNAME": "زيت اوكراني دوار الشمس جملة",
    "GRPICTURE": null
  },
  {
    "GRIDBRANCHID": 4,
    "GROUPNAME": "زيت اوكراني دوار الشمس مفرق",
    "GRPICTURE": null
  },
  {
    "GRIDBRANCHID": 40,
    "GROUPNAME": "زيت زيتون خضير جملة",
    "GRPICTURE": null
  },
  {
    "GRIDBRANCHID": 2,
    "GROUPNAME": "زيت زيتون خضير مفرق",
    "GRPICTURE": null
  },
  {
    "GRIDBRANCHID": 42,
    "GROUPNAME": "زيت زيتون فرجين جملة",
    "GRPICTURE": null
  },
  {
    "GRIDBRANCHID": 3,
    "GROUPNAME": "زيت زيتون فرجين مفرق",
    "GRPICTURE": null
  },
  {
    "GRIDBRANCHID": 41,
    "GROUPNAME": "زيت زيتون كورة جملة",
    "GRPICTURE": null
  },
  {
    "GRIDBRANCHID": 51,
    "GROUPNAME": "زيتون اخضر جملة",
    "GRPICTURE": null
  },
  {
    "GRIDBRANCHID": 50,
    "GROUPNAME": "زيتون اسود جملة",
    "GRPICTURE": null
  },
  {
    "GRIDBRANCHID": 57,
    "GROUPNAME": "عروض",
    "GRPICTURE": null
  },
  {
    "GRIDBRANCHID": 20,
    "GROUPNAME": "عسل جملة",
    "GRPICTURE": null
  },
  {
    "GRIDBRANCHID": 10,
    "GROUPNAME": "عسل مفرق",
    "GRPICTURE": null
  },
  {
    "GRIDBRANCHID": 25,
    "GROUPNAME": "علبة بهارات",
    "GRPICTURE": null
  },
  {
    "GRIDBRANCHID": 32,
    "GROUPNAME": "علبة صغيرة",
    "GRPICTURE": null
  },
  {
    "GRIDBRANCHID": 31,
    "GROUPNAME": "علبة كبيرة",
    "GRPICTURE": null
  },
  {
    "GRIDBRANCHID": 22,
    "GROUPNAME": "فواكه مجففه جملة",
    "GRPICTURE": null
  },
  {
    "GRIDBRANCHID": 11,
    "GROUPNAME": "فواكه مجففه مفرق",
    "GRPICTURE": null
  },
  {
    "GRIDBRANCHID": 38,
    "GROUPNAME": "قلوبات مفرق",
    "GRPICTURE": null
  },
  {
    "GRIDBRANCHID": 55,
    "GROUPNAME": "قلوبات ني",
    "GRPICTURE": null
  },
  {
    "GRIDBRANCHID": 19,
    "GROUPNAME": "كبيس ومخللات جملة",
    "GRPICTURE": null
  },
  {
    "GRIDBRANCHID": 21,
    "GROUPNAME": "كيلو جملة",
    "GRPICTURE": null
  },
  {
    "GRIDBRANCHID": 66,
    "GROUPNAME": "كيلو مفرق",
    "GRPICTURE": null
  },
  {
    "GRIDBRANCHID": 48,
    "GROUPNAME": "مدبسات جملة",
    "GRPICTURE": null
  },
  {
    "GRIDBRANCHID": 23,
    "GROUPNAME": "مربيات جملة",
    "GRPICTURE": null
  },
  {
    "GRIDBRANCHID": 9,
    "GROUPNAME": "مربيات مفرق",
    "GRPICTURE": null
  },
  {
    "GRIDBRANCHID": 28,
    "GROUPNAME": "مرتديلا",
    "GRPICTURE": null
  },
  {
    "GRIDBRANCHID": 24,
    "GROUPNAME": "مرشة بهار",
    "GRPICTURE": null
  },
  {
    "GRIDBRANCHID": 68,
    "GROUPNAME": "مرطبان 507",
    "GRPICTURE": null
  },
  {
    "GRIDBRANCHID": 67,
    "GROUPNAME": "مرطبان 510",
    "GRPICTURE": null
  },
  {
    "GRIDBRANCHID": 46,
    "GROUPNAME": "معلبات أخرى",
    "GRPICTURE": null
  },
  {
    "GRIDBRANCHID": 63,
    "GROUPNAME": "مقطرات 1 ليتر",
    "GRPICTURE": null
  },
  {
    "GRIDBRANCHID": 47,
    "GROUPNAME": "مقطرات جملة",
    "GRPICTURE": null
  },
  {
    "GRIDBRANCHID": 5,
    "GROUPNAME": "مقطرات مفرق 250مل",
    "GRPICTURE": null
  },
  {
    "GRIDBRANCHID": 61,
    "GROUPNAME": "مقطرات مفرق 500مل",
    "GRPICTURE": null
  },
  {
    "GRIDBRANCHID": 60,
    "GROUPNAME": "مقطرات ومدبسات غالون",
    "GRPICTURE": null
  },
  {
    "GRIDBRANCHID": 52,
    "GROUPNAME": "مكعزلة بقر جملة",
    "GRPICTURE": null
  },
  {
    "GRIDBRANCHID": 53,
    "GROUPNAME": "مكعزلة معزة جملة",
    "GRPICTURE": null
  },
  {
    "GRIDBRANCHID": 17,
    "GROUPNAME": "مونة بلدية جملة",
    "GRPICTURE": null
  }
];

export const OMEGA_INITIAL_SHOWLABELS_SCREEN1: OmegaScreenItem[] = [
  {
    "LABELNUMBER": 1,
    "LABELNAME": "مرطبان خيار زهرة حبة كاملة 650غ",
    "STATUS": -1,
    "COLOR": "15395833",
    "PIC": null,
    "PRODUCTID": 109,
    "VBRED": 249,
    "VBGREEN": 235,
    "VBBLUE": 234,
    "SCREEN_DET_ID": 1
  },
  {
    "LABELNUMBER": 2,
    "LABELNAME": "بهار أبيض حب كيلو",
    "STATUS": -1,
    "COLOR": "15395833",
    "PIC": null,
    "PRODUCTID": 453,
    "VBRED": 249,
    "VBGREEN": 235,
    "VBBLUE": 234,
    "SCREEN_DET_ID": 1
  },
  {
    "LABELNUMBER": 3,
    "LABELNAME": "كيلو زيتون اخضر بلدي",
    "STATUS": -1,
    "COLOR": "15395833",
    "PIC": null,
    "PRODUCTID": 79,
    "VBRED": 249,
    "VBGREEN": 235,
    "VBBLUE": 234,
    "SCREEN_DET_ID": 1
  },
  {
    "LABELNUMBER": 4,
    "LABELNAME": "كيلو زيتون أسود بلدي",
    "STATUS": -1,
    "COLOR": "15395833",
    "PIC": null,
    "PRODUCTID": 82,
    "VBRED": 249,
    "VBGREEN": 235,
    "VBBLUE": 234,
    "SCREEN_DET_ID": 1
  },
  {
    "LABELNUMBER": 5,
    "LABELNAME": "كيلو زيتون أسود زهرة",
    "STATUS": -1,
    "COLOR": "15395833",
    "PIC": null,
    "PRODUCTID": 103,
    "VBRED": 249,
    "VBGREEN": 235,
    "VBBLUE": 234,
    "SCREEN_DET_ID": 1
  },
  {
    "LABELNUMBER": 6,
    "LABELNAME": "كيلو زيتون أسود مقطع",
    "STATUS": -1,
    "COLOR": "15395833",
    "PIC": null,
    "PRODUCTID": 94,
    "VBRED": 249,
    "VBGREEN": 235,
    "VBBLUE": 234,
    "SCREEN_DET_ID": 1
  },
  {
    "LABELNUMBER": 7,
    "LABELNAME": "كيلو زيتون اخضر بو شوكة",
    "STATUS": -1,
    "COLOR": "15395833",
    "PIC": null,
    "PRODUCTID": 85,
    "VBRED": 249,
    "VBGREEN": 235,
    "VBBLUE": 234,
    "SCREEN_DET_ID": 1
  },
  {
    "LABELNUMBER": 8,
    "LABELNAME": "كيلو زيتون اخضر مقطع",
    "STATUS": -1,
    "COLOR": "15395833",
    "PIC": null,
    "PRODUCTID": 91,
    "VBRED": 249,
    "VBGREEN": 235,
    "VBBLUE": 234,
    "SCREEN_DET_ID": 1
  },
  {
    "LABELNUMBER": 9,
    "LABELNAME": "مرطبان زيتون اخضر بلدي 350غ",
    "STATUS": -1,
    "COLOR": "15395833",
    "PIC": null,
    "PRODUCTID": 77,
    "VBRED": 249,
    "VBGREEN": 235,
    "VBBLUE": 234,
    "SCREEN_DET_ID": 1
  },
  {
    "LABELNUMBER": 10,
    "LABELNAME": "مرطبان زيتون اخضر بو شوكة 650غ",
    "STATUS": -1,
    "COLOR": "15395833",
    "PIC": null,
    "PRODUCTID": 83,
    "VBRED": 249,
    "VBGREEN": 235,
    "VBBLUE": 234,
    "SCREEN_DET_ID": 1
  },
  {
    "LABELNUMBER": 11,
    "LABELNAME": "مرطبان زيتون اخضر زهرة 650غ",
    "STATUS": -1,
    "COLOR": "15395833",
    "PIC": null,
    "PRODUCTID": 99,
    "VBRED": 249,
    "VBGREEN": 235,
    "VBBLUE": 234,
    "SCREEN_DET_ID": 1
  },
  {
    "LABELNUMBER": 12,
    "LABELNAME": "مرطبان زيتون اخضر مشوي 350غ",
    "STATUS": -1,
    "COLOR": "15395833",
    "PIC": null,
    "PRODUCTID": 613,
    "VBRED": 249,
    "VBGREEN": 235,
    "VBBLUE": 234,
    "SCREEN_DET_ID": 1
  },
  {
    "LABELNUMBER": 13,
    "LABELNAME": "مرطبان زيتون اخضر مفرغ 350غ",
    "STATUS": -1,
    "COLOR": "15395833",
    "PIC": null,
    "PRODUCTID": 614,
    "VBRED": 249,
    "VBGREEN": 235,
    "VBBLUE": 234,
    "SCREEN_DET_ID": 1
  },
  {
    "LABELNUMBER": 14,
    "LABELNAME": "مرطبان زيتون اخضر مقطع 650غ",
    "STATUS": -1,
    "COLOR": "15395833",
    "PIC": null,
    "PRODUCTID": 90,
    "VBRED": 249,
    "VBGREEN": 235,
    "VBBLUE": 234,
    "SCREEN_DET_ID": 1
  },
  {
    "LABELNUMBER": 15,
    "LABELNAME": "كيلو زيتون أسود مقطع جملة",
    "STATUS": -1,
    "COLOR": "15395833",
    "PIC": null,
    "PRODUCTID": 263,
    "VBRED": 249,
    "VBGREEN": 235,
    "VBBLUE": 234,
    "SCREEN_DET_ID": 1
  },
  {
    "LABELNUMBER": 16,
    "LABELNAME": "خل أبيض 250مل",
    "STATUS": -1,
    "COLOR": "15395833",
    "PIC": null,
    "PRODUCTID": 15,
    "VBRED": 249,
    "VBGREEN": 235,
    "VBBLUE": 234,
    "SCREEN_DET_ID": 1
  },
  {
    "LABELNUMBER": 17,
    "LABELNAME": "خل احمر 250مل",
    "STATUS": -1,
    "COLOR": "15395833",
    "PIC": null,
    "PRODUCTID": 432,
    "VBRED": 249,
    "VBGREEN": 235,
    "VBBLUE": 234,
    "SCREEN_DET_ID": 1
  },
  {
    "LABELNUMBER": 18,
    "LABELNAME": "AGT حمص 8مم",
    "STATUS": -1,
    "COLOR": "15395833",
    "PIC": null,
    "PRODUCTID": 666,
    "VBRED": 249,
    "VBGREEN": 235,
    "VBBLUE": 234,
    "SCREEN_DET_ID": 1
  },
  {
    "LABELNUMBER": 19,
    "LABELNAME": "أرز امريكي",
    "STATUS": -1,
    "COLOR": "15395833",
    "PIC": null,
    "PRODUCTID": 661,
    "VBRED": 249,
    "VBGREEN": 235,
    "VBBLUE": 234,
    "SCREEN_DET_ID": 1
  },
  {
    "LABELNUMBER": 20,
    "LABELNAME": "أرز ايطالي Baldo",
    "STATUS": -1,
    "COLOR": "15395833",
    "PIC": null,
    "PRODUCTID": 577,
    "VBRED": 249,
    "VBGREEN": 235,
    "VBBLUE": 234,
    "SCREEN_DET_ID": 1
  },
  {
    "LABELNUMBER": 21,
    "LABELNAME": "جبنة شلل حلو",
    "STATUS": -1,
    "COLOR": "15395833",
    "PIC": null,
    "PRODUCTID": 1055,
    "VBRED": 249,
    "VBGREEN": 235,
    "VBBLUE": 234,
    "SCREEN_DET_ID": 1
  },
  {
    "LABELNUMBER": 22,
    "LABELNAME": "جبنة بركة اسطنبولي",
    "STATUS": -1,
    "COLOR": "15395833",
    "PIC": null,
    "PRODUCTID": 922,
    "VBRED": 249,
    "VBGREEN": 235,
    "VBBLUE": 234,
    "SCREEN_DET_ID": 1
  },
  {
    "LABELNUMBER": 23,
    "LABELNAME": "جبنة بلغاري بلدي",
    "STATUS": -1,
    "COLOR": "15395833",
    "PIC": null,
    "PRODUCTID": 923,
    "VBRED": 249,
    "VBGREEN": 235,
    "VBBLUE": 234,
    "SCREEN_DET_ID": 1
  },
  {
    "LABELNUMBER": 24,
    "LABELNAME": "جبنة حلوم",
    "STATUS": -1,
    "COLOR": "15395833",
    "PIC": null,
    "PRODUCTID": 1,
    "VBRED": 249,
    "VBGREEN": 235,
    "VBBLUE": 234,
    "SCREEN_DET_ID": 1
  },
  {
    "LABELNUMBER": 25,
    "LABELNAME": "جبنة حلوم بلدي",
    "STATUS": -1,
    "COLOR": "15395833",
    "PIC": null,
    "PRODUCTID": 919,
    "VBRED": 249,
    "VBGREEN": 235,
    "VBBLUE": 234,
    "SCREEN_DET_ID": 1
  },
  {
    "LABELNUMBER": 26,
    "LABELNAME": "جبنة دوبل كريم",
    "STATUS": -1,
    "COLOR": "15395833",
    "PIC": null,
    "PRODUCTID": 439,
    "VBRED": 249,
    "VBGREEN": 235,
    "VBBLUE": 234,
    "SCREEN_DET_ID": 1
  },
  {
    "LABELNUMBER": 27,
    "LABELNAME": "جبنة رول نابلسية",
    "STATUS": -1,
    "COLOR": "15395833",
    "PIC": null,
    "PRODUCTID": 598,
    "VBRED": 249,
    "VBGREEN": 235,
    "VBBLUE": 234,
    "SCREEN_DET_ID": 1
  },
  {
    "LABELNUMBER": 28,
    "LABELNAME": "جبنة شلل",
    "STATUS": -1,
    "COLOR": "15395833",
    "PIC": null,
    "PRODUCTID": 430,
    "VBRED": 249,
    "VBGREEN": 235,
    "VBBLUE": 234,
    "SCREEN_DET_ID": 1
  },
  {
    "LABELNUMBER": 29,
    "LABELNAME": "جبنة عكاوي بلدي",
    "STATUS": -1,
    "COLOR": "15395833",
    "PIC": null,
    "PRODUCTID": 327,
    "VBRED": 249,
    "VBGREEN": 235,
    "VBBLUE": 234,
    "SCREEN_DET_ID": 1
  },
  {
    "LABELNUMBER": 30,
    "LABELNAME": "جبنة عكاوي تشيكي بقر",
    "STATUS": -1,
    "COLOR": "15395833",
    "PIC": null,
    "PRODUCTID": 927,
    "VBRED": 249,
    "VBGREEN": 235,
    "VBBLUE": 234,
    "SCREEN_DET_ID": 1
  },
  {
    "LABELNUMBER": 31,
    "LABELNAME": "جبنة فيتا",
    "STATUS": -1,
    "COLOR": "15395833",
    "PIC": null,
    "PRODUCTID": 589,
    "VBRED": 249,
    "VBGREEN": 235,
    "VBBLUE": 234,
    "SCREEN_DET_ID": 1
  },
  {
    "LABELNUMBER": 32,
    "LABELNAME": "جبنة مجدولة",
    "STATUS": -1,
    "COLOR": "15395833",
    "PIC": null,
    "PRODUCTID": 1054,
    "VBRED": 249,
    "VBGREEN": 235,
    "VBBLUE": 234,
    "SCREEN_DET_ID": 1
  },
  {
    "LABELNUMBER": 33,
    "LABELNAME": "جبنة مدعبلة بلدي",
    "STATUS": -1,
    "COLOR": "15395833",
    "PIC": null,
    "PRODUCTID": 918,
    "VBRED": 249,
    "VBGREEN": 235,
    "VBBLUE": 234,
    "SCREEN_DET_ID": 1
  },
  {
    "LABELNUMBER": 34,
    "LABELNAME": "جبنة مسنرة",
    "STATUS": -1,
    "COLOR": "15395833",
    "PIC": null,
    "PRODUCTID": 920,
    "VBRED": 249,
    "VBGREEN": 235,
    "VBBLUE": 234,
    "SCREEN_DET_ID": 1
  },
  {
    "LABELNUMBER": 35,
    "LABELNAME": "لبنة  معزة كيلو",
    "STATUS": -1,
    "COLOR": "15395833",
    "PIC": null,
    "PRODUCTID": 915,
    "VBRED": 249,
    "VBGREEN": 235,
    "VBBLUE": 234,
    "SCREEN_DET_ID": 1
  },
  {
    "LABELNUMBER": 36,
    "LABELNAME": "لبنة  معزة مكعزلة",
    "STATUS": -1,
    "COLOR": "15395833",
    "PIC": null,
    "PRODUCTID": 669,
    "VBRED": 249,
    "VBGREEN": 235,
    "VBBLUE": 234,
    "SCREEN_DET_ID": 1
  },
  {
    "LABELNUMBER": 37,
    "LABELNAME": "لبنة اكسترا",
    "STATUS": -1,
    "COLOR": "15395833",
    "PIC": null,
    "PRODUCTID": 615,
    "VBRED": 249,
    "VBGREEN": 235,
    "VBBLUE": 234,
    "SCREEN_DET_ID": 1
  },
  {
    "LABELNUMBER": 38,
    "LABELNAME": "لبنة بقر مكعزلة",
    "STATUS": -1,
    "COLOR": "15395833",
    "PIC": null,
    "PRODUCTID": 610,
    "VBRED": 249,
    "VBGREEN": 235,
    "VBBLUE": 234,
    "SCREEN_DET_ID": 1
  },
  {
    "LABELNUMBER": 39,
    "LABELNAME": "لبنة بلدية",
    "STATUS": -1,
    "COLOR": "15395833",
    "PIC": null,
    "PRODUCTID": 2,
    "VBRED": 249,
    "VBGREEN": 235,
    "VBBLUE": 234,
    "SCREEN_DET_ID": 1
  },
  {
    "LABELNUMBER": 40,
    "LABELNAME": "لبنة كريمة",
    "STATUS": -1,
    "COLOR": "15395833",
    "PIC": null,
    "PRODUCTID": 924,
    "VBRED": 249,
    "VBGREEN": 235,
    "VBBLUE": 234,
    "SCREEN_DET_ID": 1
  }
];

export const OMEGA_PREDEFINED_CATEGORIES: OmegaPredefinedCategory[] = [
  {
    "id": 127,
    "name": "Alcoholic Drinks",
    "imageurl": "https://s3.eu-central-1.amazonaws.com/act.omegapos.com/OmegaCloud/menu_categories/alcohol-drink_1.png"
  },
  {
    "id": 57,
    "name": "Appetizers",
    "imageurl": "https://s3.eu-central-1.amazonaws.com/act.omegapos.com/OmegaCloud/menu_categories/appetizers.png"
  },
  {
    "id": 182,
    "name": "Arak",
    "imageurl": "https://s3.eu-central-1.amazonaws.com/act.omegapos.com/OmegaCloud/menu_categories/arak_1.png"
  },
  {
    "id": 137,
    "name": "Bagels",
    "imageurl": "https://s3.eu-central-1.amazonaws.com/act.omegapos.com/OmegaCloud/menu_categories/bagels1_1.png"
  },
  {
    "id": 128,
    "name": "Baguette",
    "imageurl": "https://s3.eu-central-1.amazonaws.com/act.omegapos.com/OmegaCloud/menu_categories/baguette_3.png"
  },
  {
    "id": 129,
    "name": "Baked Potato",
    "imageurl": "https://s3.eu-central-1.amazonaws.com/act.omegapos.com/OmegaCloud/menu_categories/bakedpotato_1.png"
  },
  {
    "id": 130,
    "name": "Balila",
    "imageurl": "https://s3.eu-central-1.amazonaws.com/act.omegapos.com/OmegaCloud/menu_categories/balila_1.png"
  },
  {
    "id": 60,
    "name": "Beef",
    "imageurl": "https://s3.eu-central-1.amazonaws.com/act.omegapos.com/OmegaCloud/menu_categories/beef.png"
  },
  {
    "id": 132,
    "name": "Beer",
    "imageurl": "https://s3.eu-central-1.amazonaws.com/act.omegapos.com/OmegaCloud/menu_categories/beer_1.png"
  },
  {
    "id": 184,
    "name": "Beklawa",
    "imageurl": "https://s3.eu-central-1.amazonaws.com/act.omegapos.com/OmegaCloud/menu_categories/beklawa.png"
  },
  {
    "id": 201,
    "name": "Bottles",
    "imageurl": "https://s3.eu-central-1.amazonaws.com/act.omegapos.com/OmegaCloud/menu_categories/bottle-of-water_1.png"
  },
  {
    "id": 209,
    "name": "Bread and Dips",
    "imageurl": "https://s3.eu-central-1.amazonaws.com/act.omegapos.com/OmegaCloud/menu_categories/bread-and-dips.png"
  },
  {
    "id": 58,
    "name": "Breakfast",
    "imageurl": "https://s3.eu-central-1.amazonaws.com/act.omegapos.com/OmegaCloud/menu_categories/breakfast.png"
  },
  {
    "id": 62,
    "name": "Broasted",
    "imageurl": "https://s3.eu-central-1.amazonaws.com/act.omegapos.com/OmegaCloud/menu_categories/broasted.png"
  },
  {
    "id": 186,
    "name": "Burger Combo",
    "imageurl": "https://s3.eu-central-1.amazonaws.com/act.omegapos.com/OmegaCloud/menu_categories/burger-combo.png"
  },
  {
    "id": 63,
    "name": "Burgers",
    "imageurl": "https://s3.eu-central-1.amazonaws.com/act.omegapos.com/OmegaCloud/menu_categories/burgers.png"
  },
  {
    "id": 203,
    "name": "Burrito",
    "imageurl": "https://s3.eu-central-1.amazonaws.com/act.omegapos.com/OmegaCloud/menu_categories/burrito.png"
  },
  {
    "id": 133,
    "name": "Cake",
    "imageurl": "https://s3.eu-central-1.amazonaws.com/act.omegapos.com/OmegaCloud/menu_categories/cake_1.png"
  },
  {
    "id": 187,
    "name": "Calzone",
    "imageurl": "https://s3.eu-central-1.amazonaws.com/act.omegapos.com/OmegaCloud/menu_categories/calzone.png"
  },
  {
    "id": 220,
    "name": "Canapees",
    "imageurl": "https://s3.eu-central-1.amazonaws.com/act.omegapos.com/OmegaCloud/menu_categories/canapee.png"
  },
  {
    "id": 134,
    "name": "Champagne",
    "imageurl": "https://s3.eu-central-1.amazonaws.com/act.omegapos.com/OmegaCloud/menu_categories/champagne_1.png"
  },
  {
    "id": 229,
    "name": "Cheese",
    "imageurl": "https://s3.eu-central-1.amazonaws.com/act.omegapos.com/OmegaCloud/menu_categories/cheese_1.png"
  },
  {
    "id": 213,
    "name": "Cheese Rolls",
    "imageurl": "https://s3.eu-central-1.amazonaws.com/act.omegapos.com/OmegaCloud/menu_categories/rkakat.png"
  },
  {
    "id": 64,
    "name": "Chicken",
    "imageurl": "https://s3.eu-central-1.amazonaws.com/act.omegapos.com/OmegaCloud/menu_categories/chicken_1.png"
  },
  {
    "id": 188,
    "name": "Chicken Burger",
    "imageurl": "https://s3.eu-central-1.amazonaws.com/act.omegapos.com/OmegaCloud/menu_categories/chicken-burger.png"
  },
  {
    "id": 228,
    "name": "Chocolat",
    "imageurl": "https://s3.eu-central-1.amazonaws.com/act.omegapos.com/OmegaCloud/menu_categories/chocolate.png"
  },
  {
    "id": 146,
    "name": "Chocolate Fondant",
    "imageurl": "https://s3.eu-central-1.amazonaws.com/act.omegapos.com/OmegaCloud/menu_categories/fondantauchocolate_1.png"
  },
  {
    "id": 221,
    "name": "Cigar",
    "imageurl": "https://s3.eu-central-1.amazonaws.com/act.omegapos.com/OmegaCloud/menu_categories/cigar.png"
  },
  {
    "id": 67,
    "name": "Club Sandwiches",
    "imageurl": "https://s3.eu-central-1.amazonaws.com/act.omegapos.com/OmegaCloud/menu_categories/club.png"
  },
  {
    "id": 65,
    "name": "Cocktail",
    "imageurl": "https://s3.eu-central-1.amazonaws.com/act.omegapos.com/OmegaCloud/menu_categories/cocktail1.png"
  },
  {
    "id": 135,
    "name": "Combo",
    "imageurl": "https://s3.eu-central-1.amazonaws.com/act.omegapos.com/OmegaCloud/menu_categories/combo_1.png"
  },
  {
    "id": 136,
    "name": "Cottonmaki",
    "imageurl": "https://s3.eu-central-1.amazonaws.com/act.omegapos.com/OmegaCloud/menu_categories/cottonmaki_1.png"
  },
  {
    "id": 68,
    "name": "Crepes",
    "imageurl": "https://s3.eu-central-1.amazonaws.com/act.omegapos.com/OmegaCloud/menu_categories/crepe.png"
  },
  {
    "id": 106,
    "name": "Crispy Uramaki",
    "imageurl": "https://s3.eu-central-1.amazonaws.com/act.omegapos.com/OmegaCloud/menu_categories/crispyuramaki-done-no-trans.png"
  },
  {
    "id": 190,
    "name": "Croissant",
    "imageurl": "https://s3.eu-central-1.amazonaws.com/act.omegapos.com/OmegaCloud/menu_categories/croissant_1.png"
  },
  {
    "id": 179,
    "name": "Cucumber Maki",
    "imageurl": "https://s3.eu-central-1.amazonaws.com/act.omegapos.com/OmegaCloud/menu_categories/cucumbermaki_1.png"
  },
  {
    "id": 163,
    "name": "Daily Platter",
    "imageurl": "https://s3.eu-central-1.amazonaws.com/act.omegapos.com/OmegaCloud/menu_categories/plat-du-jour_1.png"
  },
  {
    "id": 191,
    "name": "Dessert Pizza",
    "imageurl": "https://s3.eu-central-1.amazonaws.com/act.omegapos.com/OmegaCloud/menu_categories/dessert-pizza.png"
  },
  {
    "id": 61,
    "name": "Desserts",
    "imageurl": "https://s3.eu-central-1.amazonaws.com/act.omegapos.com/OmegaCloud/menu_categories/deserts.png"
  },
  {
    "id": 139,
    "name": "Diet",
    "imageurl": "https://s3.eu-central-1.amazonaws.com/act.omegapos.com/OmegaCloud/menu_categories/diet_1.png"
  }
];

export function hexToRgb(hex: string): [number, number, number] {
  const cleanHex = hex.replace('#', '');
  const r = parseInt(cleanHex.substring(0, 2), 16) || 0;
  const g = parseInt(cleanHex.substring(2, 4), 16) || 0;
  const b = parseInt(cleanHex.substring(4, 6), 16) || 0;
  return [r, g, b];
}

export function isDarkColor(hexOrRgb: string): boolean {
  if (hexOrRgb.startsWith('#')) {
    const [r, g, b] = hexToRgb(hexOrRgb);
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance < 0.5;
  }
  const match = hexOrRgb.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
  if (match) {
    const r = parseInt(match[1], 10);
    const g = parseInt(match[2], 10);
    const b = parseInt(match[3], 10);
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance < 0.5;
  }
  return false;
}
