import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { ConfigurableTabBarComponent } from './configurable-tab-bar.component';
import { TAB_HANDLERS, type TabHandlers } from './tab-event.helpers';
import type { SavedTabConfig, TabItem } from './configurable-tab-bar.types';
import { ToastService } from '../toast/toast.service';

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
    tabs: [makeTab('tab-1', 'Tab 1')],
    activeTabId: 'tab-1',
    createdAt: 1,
    ...overrides,
  };
}

@Component({
  standalone: true,
  imports: [ConfigurableTabBarComponent],
  template: `
    <sh3-configurable-tab-bar
      [tabs]="tabs"
      [activeTabId]="activeTabId"
      [savedConfigs]="savedConfigs"
    />
  `,
})
class HostComponent {
  tabs = [makeTab('tab-1', 'Tab 1')];
  activeTabId = 'tab-1';
  savedConfigs = [makeConfig(), makeConfig({ id: 'cfg-2', name: 'Config 2' })];
}

describe('ConfigurableTabBarComponent', () => {
  let fixture: ComponentFixture<HostComponent>;
  let handlers: jasmine.SpyObj<TabHandlers<TestConfig>>;

  beforeEach(async () => {
    handlers = jasmine.createSpyObj<TabHandlers<TestConfig>>('handlers', [
      'tabSelect',
      'tabAdd',
      'tabClose',
      'tabRename',
      'tabReorder',
      'tabColorChange',
      'configSave',
      'configNew',
      'configLoad',
      'configDelete',
      'configRename',
      'configTabRemove',
      'configTabRename',
      'configTabMove',
      'tabMoveToConfig',
    ]);

    await TestBed.configureTestingModule({
      imports: [HostComponent],
      providers: [
        { provide: TAB_HANDLERS, useValue: handlers },
        {
          provide: ToastService,
          useValue: { show: jasmine.createSpy('show') },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
  });

  it('dispatches configLoad from the load dropdown to TAB_HANDLERS', () => {
    const panel = fixture.debugElement
      .query(By.directive(ConfigurableTabBarComponent))
      .query(By.css('sh3-tab-config-panel')).componentInstance as any;

    panel.showLoadMenu.set(true);
    fixture.detectChanges();

    const configName = fixture.nativeElement.querySelector(
      '.config-item-name',
    ) as HTMLElement;
    configName.click();

    expect(handlers.configLoad).toHaveBeenCalledOnceWith('cfg-1');
  });

  it('dispatches configDelete from the load dropdown to TAB_HANDLERS', () => {
    const panel = fixture.debugElement.query(By.css('sh3-tab-config-panel'))
      .componentInstance as any;

    panel.showLoadMenu.set(true);
    fixture.detectChanges();

    const deleteButton = fixture.nativeElement.querySelector(
      'sh3-button-icon[icon="bin"] button',
    ) as HTMLButtonElement;
    deleteButton.click();

    expect(handlers.configDelete).toHaveBeenCalledOnceWith('cfg-1');
  });
});
