export interface OmegaWorkstation {
  ID: number;
  WORKSTATIONID: number;
  BRAND_ID: number;
  BRANCHID: number;
  WORKSTATION_NB: number;
  WORKSTNAME: string;
  device_type: string;
  ip_address?: string;
  MENU: number;
  MODES: number;
  MAINSCREEN: number;
  CASHDRAWERPORT: string;
  SCALEPORT?: string;
  TICKETNMB: number;
  SKINSTYLE: number;
  is_pda?: boolean;
  is_omenu?: boolean;
  print_for_pda?: boolean;
  is_bitfood?: boolean;
  check_1_printer?: number;
  check_2_printer?: number;
  fast_food_1_printer?: number;
  fast_food_2_printer?: number;
  entrance_ticket_printer?: number;
  event_ticket_printer?: number;
}

export interface OmegaPhysicalPrinter {
  ID: number;
  BRAND_ID: number;
  BRANCHID: number;
  DESCRIPTION: string;
  TYPE_ID: number;
  PRINTER_TYPE: number; // 1: IP, 2: Windows Share/Driver
  PRINTER_IP: string | null;
  PRINTER_NAME: string | null;
  PRINTER_SERIES: number; // 1: Thermal, 2: Dot Matrix
  type: {
    id: number;
    description: string;
    active: number;
  };
}

export const INITIAL_WORKSTATIONS: OmegaWorkstation[] = [];

export const INITIAL_PHYSICAL_PRINTERS: OmegaPhysicalPrinter[] = [];

export const PRINTER_BRANDS = [
  { id: 1, description: 'Omega' },
  { id: 2, description: 'Epson' },
  { id: 3, description: 'Star Micronics' },
  { id: 4, description: 'Bixolon' },
  { id: 5, description: 'Xprinter' },
  { id: 6, description: 'Citizen' },
  { id: 7, description: 'Custom' }
];

export const WORKSTATION_MENUS = [
  { id: 11, description: 'Default Menu - POS Items' },
  { id: 12, description: 'Express Bar Menu' },
  { id: 13, description: 'Kitchen Prep Menu' }
];

export const WORKSTATION_SCREENS = [
  { id: 1, description: 'Screen 1 - POS Touch Terminal' },
  { id: 2, description: 'Screen 2 - Quick Order' },
  { id: 3, description: 'Screen 3 - Drive Thru' }
];

export const SKIN_STYLES = [
  { id: -1, description: 'Default Classical Skin' },
  { id: 14, description: 'Style 14 - High Contrast Modern POS' },
  { id: 15, description: 'Style 15 - Touch Compact' }
];

export const DRAWER_PORTS = ['Null', 'COM1', 'COM2', 'COM3', 'COM4', 'LPT1', 'Printer Driven (DK)'];
