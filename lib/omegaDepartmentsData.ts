export interface DepartmentItem {
  ID: number;
  MENUIDBRANCHID: number;
  MENUDESC: string;
  SORTING: number;
  COLOR?: string;
  ACCOUNTDEP?: number | string;
  PICTURE?: string;
  BRANCH_RESTRICTIONS: string[];
  TOTALEXCEPTIONS?: number;
  CREATED_AT?: string;
}

export interface BranchOption {
  BRANCHID: string;
  BARANCHNAME: string;
}

export const OMEGA_BRANCHES: BranchOption[] = [
  { BRANCHID: 'allbranch', BARANCHNAME: 'All Branches' },
  { BRANCHID: '1', BARANCHNAME: 'Zeit w zaytoun ljanoub' }
];

export const INITIAL_OMEGA_DEPARTMENTS: DepartmentItem[] = [
  {
    ID: 13,
    MENUIDBRANCHID: 13,
    MENUDESC: 'Delivery',
    SORTING: 2,
    COLOR: '',
    ACCOUNTDEP: 0,
    PICTURE: '',
    BRANCH_RESTRICTIONS: [],
    TOTALEXCEPTIONS: 0,
    CREATED_AT: '2024-01-10 10:00:00'
  },
  {
    ID: 11,
    MENUIDBRANCHID: 11,
    MENUDESC: 'MAIN DEPARTMENT',
    SORTING: 1,
    COLOR: '',
    ACCOUNTDEP: 0,
    PICTURE: '',
    BRANCH_RESTRICTIONS: [],
    TOTALEXCEPTIONS: 0,
    CREATED_AT: '2024-01-01 08:30:00'
  },
  {
    ID: 12,
    MENUIDBRANCHID: 12,
    MENUDESC: 'Showroom',
    SORTING: 3,
    COLOR: '',
    ACCOUNTDEP: 0,
    PICTURE: '',
    BRANCH_RESTRICTIONS: [],
    TOTALEXCEPTIONS: 0,
    CREATED_AT: '2024-01-05 09:15:00'
  }
];

export const COLOR_PALETTE: string[][] = [
  ['#FF8080', '#FFFF80', '#80FF80', '#00FF80', '#80FFFF', '#0080FF', '#FF80C0', '#FF80FF'],
  ['#FF0000', '#FFFF00', '#80FF00', '#00FF40', '#00FFFF', '#0080C0', '#8080C0', '#FF00FF'],
  ['#804040', '#FF8040', '#00FF00', '#008080', '#004080', '#8080FF', '#800040', '#FF0080'],
  ['#800000', '#FF8000', '#008000', '#008040', '#0000FF', '#0000A0', '#800080', '#8000FF'],
  ['#400000', '#804000', '#004000', '#004040', '#000080', '#000040', '#400040', '#400080'],
  ['#000000', '#808000', '#808040', '#808080', '#408080', '#C0C0C0', '#400040', '#FFFFFF']
];
