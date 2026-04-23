import { TestBed } from '@angular/core/testing';
import { of, Subject, throwError } from 'rxjs';
import { MusicLibraryStateService } from './music-library-state.service';
import { MusicLibraryApiService } from './music-library-api.service';
import { ToastService } from '../../../shared/toast/toast.service';
import { ContractStore } from '../../contracts/services/contract.store';
import type { LibraryEntry } from '../music-library-types';

function entry(id: string): LibraryEntry {
  return {
    id,
    owner_id: 'user_1',
    reference: { id: `ref_${id}`, title: id, originalArtist: 'A' },
    versions: [],
  } as unknown as LibraryEntry;
}

function setup(
  overrides: {
    libraryApi?: Partial<MusicLibraryApiService>;
    contractStore?: Partial<ContractStore>;
  } = {},
) {
  const toast = { show: jest.fn() };

  const libraryApi = {
    getMyLibrary: jest.fn(() =>
      of({ entries: [] as unknown[], totalEntries: 0, totalVersions: 0 }),
    ),
    getTabConfigs: jest.fn(() => of(null)),
    saveTabConfigs: jest.fn(() => of(true)),
    getCrossLibrary: jest.fn(() => of({ members: [], results: [] })),
    ...overrides.libraryApi,
  };

  const contractStore = {
    favoriteContract: () => null,
    contracts: () => [],
    ...overrides.contractStore,
  };

  TestBed.configureTestingModule({
    providers: [
      MusicLibraryStateService,
      { provide: MusicLibraryApiService, useValue: libraryApi },
      { provide: ToastService, useValue: toast },
      { provide: ContractStore, useValue: contractStore },
    ],
  });

  const service = TestBed.inject(MusicLibraryStateService);
  return { service, libraryApi, toast, contractStore };
}

describe('MusicLibraryStateService', () => {
  afterEach(() => TestBed.resetTestingModule());

  describe('initial state', () => {
    it('exposes a default "repertoire_me" tab and empty entries', () => {
      const { service } = setup();
      const lib = service.library();
      expect(lib.entries).toEqual([]);
      expect(lib.tabs).toHaveLength(1);
      expect(lib.tabs[0].id).toBe('repertoire_me');
      expect(lib.activeTabId).toBe('repertoire_me');
    });
  });

  describe('loadLibrary', () => {
    it('fetches entries from the API and writes them to state', () => {
      const { service, libraryApi } = setup({
        libraryApi: {
          getMyLibrary: jest.fn(() =>
            of({
              entries: [entry('e1'), entry('e2')],
              totalEntries: 2,
              totalVersions: 0,
            }),
          ),
        },
      });
      service.loadLibrary();
      expect(libraryApi.getMyLibrary).toHaveBeenCalledTimes(1);
      expect(service.library().entries.map((e) => e.id)).toEqual(['e1', 'e2']);
    });

    it('is idempotent — a second call does not re-fetch', () => {
      const { service, libraryApi } = setup();
      service.loadLibrary();
      service.loadLibrary();
      expect(libraryApi.getMyLibrary).toHaveBeenCalledTimes(1);
    });

    it('surfaces a toast and allows a retry after a failure', () => {
      const fail = jest.fn(() => throwError(() => new Error('boom')));
      const { service, libraryApi, toast } = setup({
        libraryApi: { getMyLibrary: fail },
      });
      service.loadLibrary();
      expect(toast.show).toHaveBeenCalledWith(
        'Failed to load repertoire',
        'error',
      );

      // Swap to success and retry: the "loaded" guard must have been cleared
      const ok = jest.fn(() =>
        of({ entries: [entry('e1')], totalEntries: 1, totalVersions: 0 }),
      );
      libraryApi.getMyLibrary = ok;
      service.loadLibrary();
      expect(ok).toHaveBeenCalledTimes(1);
      expect(service.library().entries).toHaveLength(1);
    });

    it('toasts when getTabConfigs fails', () => {
      const { service, toast } = setup({
        libraryApi: {
          getMyLibrary: jest.fn(() =>
            of({ entries: [], totalEntries: 0, totalVersions: 0 }),
          ),
          getTabConfigs: jest.fn(() => throwError(() => new Error('boom'))),
        },
      });
      service.loadLibrary();
      expect(toast.show).toHaveBeenCalledWith(
        'Failed to load tab configs',
        'error',
      );
    });
  });

  describe('tabState proxy', () => {
    it('reads the tab slice out of the full state', () => {
      const { service } = setup();
      const slice = service.tabState();
      expect(slice.activeTabId).toBe('repertoire_me');
      expect(slice.tabs).toHaveLength(1);
      expect(slice.savedTabConfigs).toEqual([]);
    });

    it('writes back through the slice updater', () => {
      const { service } = setup();
      service.tabState.update((s) => ({
        ...s,
        activeTabId: 'repertoire_me',
        tabs: [...s.tabs, { ...s.tabs[0], id: 'extra', title: 'Extra' }],
      }));
      expect(service.library().tabs.map((t) => t.id)).toEqual([
        'repertoire_me',
        'extra',
      ]);
    });
  });

  describe('scheduleTabSave', () => {
    it('debounces successive triggers and sends one snapshot', (done) => {
      const save$ = new Subject<boolean>();
      const saveTabConfigs = jest.fn(() => save$.asObservable());
      const { service } = setup({ libraryApi: { saveTabConfigs } });

      service.scheduleTabSave();
      service.scheduleTabSave();
      service.scheduleTabSave();

      setTimeout(() => {
        expect(saveTabConfigs).toHaveBeenCalledTimes(1);
        save$.next(true);
        save$.complete();
        done();
      }, 1100);
    }, 2000);

    it('surfaces a toast when the save returns false', (done) => {
      const saveTabConfigs = jest.fn(() => of(false));
      const { service, toast } = setup({ libraryApi: { saveTabConfigs } });

      service.scheduleTabSave();
      setTimeout(() => {
        expect(toast.show).toHaveBeenCalledWith(
          'Failed to save tab config',
          'error',
        );
        done();
      }, 1100);
    }, 2000);
  });

  describe('refreshEntries', () => {
    it('always re-fetches and writes to state, even after loadLibrary', (done) => {
      const fresh = jest.fn(() =>
        of({
          entries: [entry('new1'), entry('new2')],
          totalEntries: 2,
          totalVersions: 0,
        }),
      );
      const { service, libraryApi } = setup();
      service.loadLibrary();
      libraryApi.getMyLibrary = fresh;
      service.refreshEntries().subscribe((entries) => {
        expect(entries.map((e) => e.id)).toEqual(['new1', 'new2']);
        expect(service.library().entries.map((e) => e.id)).toEqual([
          'new1',
          'new2',
        ]);
        done();
      });
    });
  });
});
