import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/core/app/app.component';

bootstrapApplication(AppComponent, appConfig)
  .catch((err) => console.error(err));

(function() {
  const originalAddEventListener = EventTarget.prototype.addEventListener;
  EventTarget.prototype.addEventListener = function(type, listener, options) {
    if (['wheel', 'touchmove', 'pointermove'].includes(type) && options === undefined) {
      options = { passive: true };
    }
    originalAddEventListener.call(this, type, listener, options);
  };
})();
