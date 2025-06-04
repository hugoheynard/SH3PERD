
export interface ITabDefinition<TData = any> {
  id: string;
  title: string;
  component: string;
  isActive: boolean;
  isConfigPending?: boolean;
  isEditing?: boolean;
  isDeletable?: boolean;
  isEditable?: boolean;
  isSearchable?: boolean;
  isSearchVisible?: boolean;
  searchValue?: string;
  default: boolean;
  configData?: TData;
}
