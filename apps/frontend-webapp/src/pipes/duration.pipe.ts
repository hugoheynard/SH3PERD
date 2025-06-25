import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  standalone: true,
  name: 'duration'
})
export class DurationPipe implements PipeTransform {
  transform(ms: number): string {
    if (typeof ms !== 'number' || ms < 0) {
      return '00:00'
    }

    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;

    return `${this.pad(minutes)}:${this.pad(seconds)}`;
  }

  private pad(value: number): string {
    return value < 10 ? '0' + value : value.toString();
  }
}
