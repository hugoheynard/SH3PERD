
export interface ITabDefinition<TData = any> {
  id: string;

  // component mapping properties
  hasConfigurator: boolean; // indicates if the tab uses a configuration component
  userCanAccessConfig?: boolean; // indicates if the user can access the configuration of the tab to change the query settings
  configComponentKey?: string; // e.g., 'music-tab-configurator', used as a key to load the component dynamically
  displayComponentKey?: string; // optional, used to specify a different component for displaying data

  // title properties
  isTitleEditable?: boolean;
  isEditingTitle?: boolean;
  title: string;

  //allows user to delete the tab
  isDeletable?: boolean;

  //allows to filter the tab content based on a search input
  isSearchable?: boolean;
  isSearchVisible?: boolean; // indicates if the search input visibility status
  searchValue?: string; // the search input value to filter the tab content

  //display properties
  default: boolean; // indicates if the tab is a default tab
  isActive: boolean; // indicates if the tab is currently active
  configMode: boolean; //used as trigger between config and data mode

  configData?: TData;
}
