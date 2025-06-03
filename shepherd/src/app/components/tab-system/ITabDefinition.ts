
export interface TabDefinition<TData = any> {
  id: string;
  title: string;
  component: string;
  data?: TData;
  isActive: boolean;
  isEditing?: boolean;
  isDeletable?: boolean;
  isEditable?: boolean;
  isSearchable?: boolean;
  isSearchVisible?: boolean;
  search: string;
  default: boolean;
}
