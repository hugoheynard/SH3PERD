import { Injectable, Type } from '@angular/core';
import {MatSidenav} from '@angular/material/sidenav';

@Injectable({
  providedIn: 'root'
})
export class SidenavRightService {
  private rightSidenavContent: Type<any> | null = null;
  private sidenavRef: any;
  private inputs: any = {};

  setSidenav(sidenav: MatSidenav): void {
    this.sidenavRef = sidenav;
  };

  setSidenavContent(contentComponent: Type<any> | null): void {
    this.rightSidenavContent = contentComponent;
  };

  setComponentInput(inputs: { [key: string]: any | null }): void {
    this.inputs = { ...this.inputs, ...inputs };
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

  getSidenavContent() {
    return this.rightSidenavContent;
  };

  getSidenavInputs() {
    return this.inputs;
  };
}
