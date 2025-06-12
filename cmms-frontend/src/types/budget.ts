export interface Budget {
  id: string;
  year: number;
  month: number;
  quarter: number;
  category: string;
  department: string;
  allocated: number;
  spent: number;
  remaining: number;
  status: 'under_budget' | 'on_budget' | 'over_budget';
  lastUpdated: string;
} 