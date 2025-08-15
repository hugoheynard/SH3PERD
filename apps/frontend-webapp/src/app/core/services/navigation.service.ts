import { Injectable, signal, type WritableSignal } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class NavigationService {
  readonly pageName: WritableSignal<string> = signal<string>('Dashboard');

  constructor(private router: Router, private route: ActivatedRoute) {
    this.router.events
      .pipe(filter(e => e instanceof NavigationEnd))
      .subscribe(() => {
        const leaf = this.getLeafRoute(this.route);
        const name = leaf?.snapshot.data?.['pageName'] ?? 'Dashboard';
        this.pageName.set(name);
      });
  };

  private getLeafRoute(r: ActivatedRoute): ActivatedRoute | null {
    let current: ActivatedRoute | null = r;
    while (current?.firstChild) current = current.firstChild;
    return current;
  };
}
