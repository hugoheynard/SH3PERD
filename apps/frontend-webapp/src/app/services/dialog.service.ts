import {
  ApplicationRef,
  ComponentRef, createComponent,
  Injectable,
  Injector,
  Type,
} from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class DialogService {
  constructor(
    private injector: Injector,
    private appRef: ApplicationRef
  ) {}

  open<T extends object>(component: Type<T>, props?: Partial<T>): ComponentRef<T> {
    const componentRef = createComponent(component, {
      environmentInjector: this.appRef.injector,
      elementInjector: this.injector,
    });

    if (props) {
      Object.assign(componentRef.instance, props);
    }

    this.appRef.attachView(componentRef.hostView);

    const domElem = componentRef.location.nativeElement;
    document.body.appendChild(domElem);

    return componentRef;
  };

  close<T>(componentRef: ComponentRef<T>): void {
    this.appRef.detachView(componentRef.hostView);
    componentRef.destroy();
  };
}
