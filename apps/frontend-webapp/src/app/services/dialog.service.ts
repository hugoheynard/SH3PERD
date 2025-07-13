import {
  ApplicationRef,
  ComponentRef, createComponent, EventEmitter,
  Injectable,
  Injector,
  Type,
} from '@angular/core';


/**
 * A lightweight dialog service for dynamically creating and displaying Angular components as dialogs.
 *
 * Supports optional property injection, CSS class assignment, manual closing,
 * and subscribing to component @Output events.
 */
@Injectable({
  providedIn: 'root'
})
export class DialogService {
  constructor(
    private injector: Injector,
    private appRef: ApplicationRef
  ) {};

  /**
   * Dynamically creates and displays a component as a dialog.
   *
   * @template T - The component type to instantiate.
   * @param component - The component class to render.
   * @param props - (Optional) Partial input properties to assign to the component instance.
   * @param cssClass - (Optional) CSS class to apply to the dialog wrapper element.
   * @returns The created ComponentRef instance.
   */
  open<T extends object>(component: Type<T>, props?: Partial<T>, cssClass?: string): ComponentRef<T> {
    const componentRef = createComponent(component, {
      environmentInjector: this.appRef.injector,
      elementInjector: this.injector,
    });

    if (props) {
      Object.assign(componentRef.instance, props);
    }

    const domElem = componentRef.location.nativeElement;

    if (cssClass) {
      domElem.classList.add(cssClass);
    }
    this.appRef.attachView(componentRef.hostView);
    document.body.appendChild(domElem);
    console.log('DOM element:', domElem);
    console.log('ClassList:', domElem.classList);

    return componentRef;
  };

  /**
   * Closes and destroys a previously opened dialog component.
   *
   * @template T - The component type to destroy.
   * @param componentRef - The ComponentRef instance to destroy.
   */
  close<T>(componentRef: ComponentRef<T>): void {
    this.appRef.detachView(componentRef.hostView);
    componentRef.destroy();
    return;
  };

  /**
   * Subscribes to an @Output EventEmitter on the provided component instance.
   *
   * @template T - The component type.
   * @template K - The name of the @Output property to subscribe to.
   * @param componentRef - The ComponentRef instance of the dialog component.
   * @param outputKey - The property key of the @Output EventEmitter to subscribe to.
   * @param callback - A callback to invoke with the emitted value.
   * @throws Will throw an error if the outputKey does not exist or is not an EventEmitter.
   */
  outputToObserver<T, K extends keyof T>(
    componentRef: ComponentRef<T>,
    outputKey: K,
    callback: (value: any) => void
  ): void {
    const output = componentRef.instance[outputKey];

    if (!(output instanceof EventEmitter)) {
      throw new Error(
        `Property '${String(outputKey)}' is not an EventEmitter or is missing on component`
      );

    }
    output.subscribe(callback);
    return;
  };
}
