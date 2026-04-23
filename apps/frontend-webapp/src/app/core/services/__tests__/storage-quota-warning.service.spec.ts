import { TestBed } from '@angular/core/testing';
import { HttpClient } from '@angular/common/http';
import { of, throwError } from 'rxjs';
import { StorageQuotaWarningService } from '../storage-quota-warning.service';
import { ApiURLService } from '../api-url.service';
import { ToastService } from '../../../shared/toast/toast.service';
import { NotificationService } from '../../notifications/notification.service';

type UsageItem = {
  resource: string;
  current: number;
  limit: number;
  bonus: number;
  effective_limit: number;
  period: string;
};

function makeUsage(current: number, effective_limit: number): UsageItem {
  return {
    resource: 'storage_bytes',
    current,
    limit: effective_limit,
    bonus: 0,
    effective_limit,
    period: 'forever',
  };
}

function setup() {
  const toast = { show: jest.fn() };
  const notifications = { push: jest.fn() };
  const http = { get: jest.fn() };
  const url = {
    apiProtectedRoute: jest.fn(() => ({
      build: jest.fn(() => 'https://api.sh3pherd.test/api/protected/quota'),
    })),
  };

  TestBed.configureTestingModule({
    providers: [
      StorageQuotaWarningService,
      { provide: HttpClient, useValue: http },
      { provide: ApiURLService, useValue: url },
      { provide: ToastService, useValue: toast },
      { provide: NotificationService, useValue: notifications },
    ],
  });

  return {
    service: TestBed.inject(StorageQuotaWarningService),
    toast,
    notifications,
    http,
  };
}

describe('StorageQuotaWarningService', () => {
  afterEach(() => TestBed.resetTestingModule());

  describe('evaluate (direct usage feed)', () => {
    it('fires nothing below the 80 % threshold', () => {
      const { service, toast, notifications } = setup();
      service.evaluate([makeUsage(700, 1000)]);
      expect(toast.show).not.toHaveBeenCalled();
      expect(notifications.push).not.toHaveBeenCalled();
    });

    it('fires the 80 % warning when usage crosses 0.8', () => {
      const { service, toast, notifications } = setup();
      service.evaluate([makeUsage(800, 1000)]);
      expect(toast.show).toHaveBeenCalledTimes(1);
      expect(toast.show.mock.calls[0][1]).toBe('warning');
      expect(notifications.push).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'warning' }),
      );
    });

    it('escalates to the 95 % error past 0.95', () => {
      const { service, toast } = setup();
      service.evaluate([makeUsage(970, 1000)]);
      expect(toast.show).toHaveBeenCalledTimes(1);
      expect(toast.show.mock.calls[0][1]).toBe('error');
    });

    it('deduplicates per threshold within a session', () => {
      const { service, toast } = setup();
      service.evaluate([makeUsage(800, 1000)]);
      service.evaluate([makeUsage(820, 1000)]);
      service.evaluate([makeUsage(850, 1000)]);
      expect(toast.show).toHaveBeenCalledTimes(1);
    });

    it('fires the 95 % warning after the 80 % one when usage continues to grow', () => {
      const { service, toast } = setup();
      service.evaluate([makeUsage(800, 1000)]);
      service.evaluate([makeUsage(960, 1000)]);
      expect(toast.show).toHaveBeenCalledTimes(2);
      expect(toast.show.mock.calls[0][1]).toBe('warning');
      expect(toast.show.mock.calls[1][1]).toBe('error');
    });

    it('ignores unlimited plans (effective_limit = -1)', () => {
      const { service, toast } = setup();
      service.evaluate([makeUsage(9_999_999, -1)]);
      expect(toast.show).not.toHaveBeenCalled();
    });

    it('ignores storage_bytes missing from the usage list', () => {
      const { service, toast } = setup();
      service.evaluate([{ ...makeUsage(800, 1000), resource: 'track_upload' }]);
      expect(toast.show).not.toHaveBeenCalled();
    });

    it('reset() re-arms the de-dup memory so the same threshold can fire again', () => {
      const { service, toast } = setup();
      service.evaluate([makeUsage(800, 1000)]);
      service.reset();
      service.evaluate([makeUsage(800, 1000)]);
      expect(toast.show).toHaveBeenCalledTimes(2);
    });
  });

  describe('check (HTTP round-trip)', () => {
    it('hits GET /quota/me and surfaces the warning', () => {
      const { service, http, toast } = setup();
      http.get.mockReturnValueOnce(
        of({ data: { plan: 'artist_free', usage: [makeUsage(900, 1000)] } }),
      );
      service.check();
      expect(http.get).toHaveBeenCalledWith(
        'https://api.sh3pherd.test/api/protected/quota/me',
      );
      expect(toast.show).toHaveBeenCalledTimes(1);
    });

    it('swallows HTTP errors so a quota check never blocks a mutation', () => {
      const { service, http, toast, notifications } = setup();
      http.get.mockReturnValueOnce(throwError(() => new Error('network')));
      service.check();
      expect(toast.show).not.toHaveBeenCalled();
      expect(notifications.push).not.toHaveBeenCalled();
    });
  });
});
