export interface CalculatorInput {
  name: string;
  label: string;
  unit: string;
  type: 'number' | 'select';
  options?: { value: string; label: string }[];
  placeholder?: string;
  required?: boolean;
}

export interface CalculatorFAQ {
  question: string;
  answer: string;
}

export interface CalculatorFormula {
  expression: string;
  steps: string[];
}

export interface CalculatorExample {
  scenario: string;
  values: Record<string, number | string>;
  result: string;
}

export interface CalculatorData {
  title: string;
  h1: string;
  description: string;
  category: string;
  slug: string;
  keywords: string[];
  calculator: {
    component: string;
    inputs: CalculatorInput[];
  };
  formula: CalculatorFormula;
  example: CalculatorExample;
  tips: string[];
  faq: CalculatorFAQ[];
  related: string[];
}

export interface CategoryData {
  slug: string;
  name: string;
  description: string;
  icon: string;
  calculators: string[];
}

export interface CalcResultItem {
  label: string;
  value: string | number;
  unit: string;
}
