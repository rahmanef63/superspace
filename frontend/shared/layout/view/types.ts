import type { ReactNode } from "react";

export type ViewMode = "table" | "card" | "details";

export type RowId = string | number;

export interface Column<T> {
  id: string;
  header: ReactNode;
  accessor?: keyof T | ((row: T) => ReactNode);
  cell?: (row: T) => ReactNode;
  className?: string;
  width?: number | string;
  hideOnCard?: boolean;
}

export interface RowAction<T> {
  id: string;
  label: string;
  icon?: ReactNode;
  onClick: (row: T) => void | Promise<void>;
  visible?: (row: T) => boolean;
}

export interface CardConfig<T> {
  title?: (row: T) => ReactNode;
  subtitle?: (row: T) => ReactNode;
  avatar?: (row: T) => ReactNode;
  extra?: (row: T) => ReactNode;
}

export interface DetailsConfig<T> {
  fields?: Array<{
    label: ReactNode;
    value: (row: T) => ReactNode;
  }>;
}

export interface ViewConfig<T> {
  columns: Array<Column<T>>;
  actions?: Array<RowAction<T>>;
  getId: (row: T) => RowId;
  card?: CardConfig<T>;
  details?: DetailsConfig<T>;
  searchFn?: (row: T, query: string) => boolean;
}

export interface ViewToolbarProps {
  mode: ViewMode;
  setMode: (m: ViewMode) => void;
  query: string;
  setQuery: (q: string) => void;
  searchable?: boolean;
  className?: string;
}
