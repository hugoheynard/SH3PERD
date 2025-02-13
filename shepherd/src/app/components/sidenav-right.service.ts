import {ChangeDetectorRef, Injectable, Type} from '@angular/core';
import {MatSidenav} from '@angular/material/sidenav';

@Injectable({
  providedIn: 'root'
})
export class SidenavRightService {
  private rightSidenavContent: Type<any> | null = null;
  private sidenavRef: any;
  private inputs: any = {};

  private cdr!: ChangeDetectorRef;
  setChangeDetector(cdr: ChangeDetectorRef) {
    this.cdr = cdr;
  }

  updateSidenav() {
    if (this.cdr) {
      setTimeout(() => this.cdr.detectChanges(), 50);  // ✅ Force Angular à détecter les inputs
    }
  }



  setSidenav(sidenav: MatSidenav): void {
    this.sidenavRef = sidenav;
  };

  openRightSidenav(): void {
    if (this.sidenavRef) {
      this.sidenavRef.open();
    }
  };

  closeRightSidenav(): void {
    this.rightSidenavContent = null;
    if (this.sidenavRef) {
      this.sidenavRef.close();
    }
  };

  //NEW TENTATIVE
  private openComponentFn!: (component: Type<any>, inputs?: any) => void;

  setOpenComponentFunction(fn: (component: Type<any>, inputs?: any) => void): void {
    this.openComponentFn = fn;
  };

  openComponent(component: Type<any>, inputs?: any): void {
    if (!component) {
      console.error("🚨 ERREUR : Le composant à injecter est `undefined` !");
      return;
    }

    if (!this.openComponentFn) {
      console.error("🚨 ERREUR : `openComponentFn` n'a pas été défini !");
      return
    }
    this.openComponentFn(component, inputs);
  };
}
