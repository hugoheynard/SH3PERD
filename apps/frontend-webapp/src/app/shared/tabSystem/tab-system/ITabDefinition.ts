// tab with configurator
export type TabWithConfigurator<T = any> = {
  hasConfigurator: true;
  configMode: boolean; //true = edit mode (should open config component)
  configComponentKey: string; // e.g., 'music-tab-configurator', used as a key to load the component dynamically
  displayComponentKey: string;
  configuratorData?: T; // data to be passed to the configurator component
};

// tab without configurator (direct display of data)
export type TabWithoutConfigurator = {
  hasConfigurator: false;
  displayComponentKey: string;
};


// shared properties for both types of tabs
export type TabBase = {
  id: string;
  title: string;
  isActive: boolean;
  isDeletable?: boolean;
  default?: boolean;

  isSearchable?: boolean;
  isSearchVisible?: boolean;
  searchValue?: string;

  isTitleEditable?: boolean;
  isEditingTitle?: boolean;
};

// final type
export type ITabDefinition<T = any> = TabBase & (TabWithConfigurator<T> | TabWithoutConfigurator);
