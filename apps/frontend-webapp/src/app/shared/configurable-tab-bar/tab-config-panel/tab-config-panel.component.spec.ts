import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { TabConfigPanelComponent } from './tab-config-panel.component';
import type { SavedTabConfig, TabItem } from '../configurable-tab-bar.types';
import { ToastService } from '../../toast/toast.service';

type TestConfig = { filter: string };

function makeTab(id: string, title: string): TabItem<TestConfig> {
  return {
    id,
    title,
    autoTitle: false,
    config: { filter: title },
  };
}

function makeConfig(
  overrides: Partial<SavedTabConfig<TestConfig>> = {},
): SavedTabConfig<TestConfig> {
  return {
    id: 'cfg-1',
    name: 'Config 1',
    tabs: [makeTab('tab-1', 'Tab 1'), makeTab('tab-2', 'Tab 2')],
    activeTabId: 'tab-1',
    createdAt: 1,
    ...overrides,
  };
}

describe('TabConfigPanelComponent', () => {
  let fixture: ComponentFixture<TabConfigPanelComponent>;
  let component: TabConfigPanelComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TabConfigPanelComponent],
      providers: [
        {
          provide: ToastService,
          useValue: { show: jasmine.createSpy('show') },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(TabConfigPanelComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('showToasts', false);
    fixture.componentRef.setInput('savedConfigs', [
      makeConfig(),
      makeConfig({
        id: 'cfg-2',
        name: 'Config 2',
        tabs: [makeTab('tab-3', 'Tab 3')],
      }),
    ]);
    fixture.detectChanges();
  });

  function openLoadMenu(): void {
    component.showLoadMenu.set(true);
    fixture.detectChanges();
  }

  it('emits configLoad when the config name is clicked', () => {
    const loadSpy = spyOn(component.configLoad, 'emit');
    openLoadMenu();

    const name = fixture.nativeElement.querySelector(
      '.config-item-name',
    ) as HTMLElement;
    name.click();

    expect(loadSpy).toHaveBeenCalledOnceWith('cfg-1');
  });

  it('emits configDelete when the delete icon is clicked', () => {
    const deleteSpy = spyOn(component.configDelete, 'emit');
    openLoadMenu();

    const deleteButton = fixture.nativeElement.querySelector(
      'sh3-button-icon[icon="bin"] button',
    ) as HTMLButtonElement;
    expect(deleteButton).toBeTruthy();

    deleteButton.click();

    expect(deleteSpy).toHaveBeenCalledOnceWith('cfg-1');
  });

  it('emits configRename when the rename action is committed', () => {
    const renameSpy = spyOn(component.configRename, 'emit');
    openLoadMenu();

    component.startConfigRename('cfg-1', 'Config 1', new MouseEvent('click'));
    component.editConfigName = 'Renamed';
    fixture.detectChanges();

    component.commitConfigRename('cfg-1');

    expect(renameSpy).toHaveBeenCalledOnceWith({
      configId: 'cfg-1',
      name: 'Renamed',
    });
  });

  it('emits configTabMove when a move target is clicked in the submenu', () => {
    const moveSpy = spyOn(component.configTabMove, 'emit');
    openLoadMenu();

    component.expandedConfigId.set('cfg-1');
    component.moveMenuTabCtx.set({ configId: 'cfg-1', tabId: 'tab-1' });
    fixture.detectChanges();

    const moveTarget = fixture.nativeElement.querySelector(
      '.config-move-menu sh3-button button',
    ) as HTMLButtonElement;
    expect(moveTarget).toBeTruthy();

    moveTarget.click();

    expect(moveSpy).toHaveBeenCalledOnceWith({
      sourceConfigId: 'cfg-1',
      targetConfigId: 'cfg-2',
      tabId: 'tab-1',
    });
  });
});
