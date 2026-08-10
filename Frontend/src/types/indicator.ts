export interface Indicator {
  id: number;
  name: string;
  value: string;
  description?: string;
  updatedAt?: string;
}

export interface IndicatorCreateInput {
  name: string;
  value: string;
  description?: string;
}

export interface IndicatorUpdateInput {
  name: string;
  value: string;
  description?: string;
}
