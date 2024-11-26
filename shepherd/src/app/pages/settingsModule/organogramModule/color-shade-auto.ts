export class ColorShadeAuto {

  hexToHsl(hex: string): { h: number; s: number; l: number } {
    hex = hex.replace(/^#/, '');

    // Convertir en RGB
    const bigint = parseInt(hex, 16);
    const r = (bigint >> 16) & 255;
    const g = (bigint >> 8) & 255;
    const b = bigint & 255;

    // Convertir en HSL
    const rNorm = r / 255;
    const gNorm = g / 255;
    const bNorm = b / 255;

    const max = Math.max(rNorm, gNorm, bNorm);
    const min = Math.min(rNorm, gNorm, bNorm);
    const delta = max - min;

    let h = 0;
    let s = 0;
    const l = (max + min) / 2;

    if (delta !== 0) {
      s = delta / (1 - Math.abs(2 * l - 1));
      if (max === rNorm) {
        h = ((gNorm - bNorm) / delta + (gNorm < bNorm ? 6 : 0)) % 6;
      } else if (max === gNorm) {
        h = (bNorm - rNorm) / delta + 2;
      } else {
        h = (rNorm - gNorm) / delta + 4;
      }
      h = Math.round(h * 60);
    }

    s = Math.round(s * 100);
    const lPerc = Math.round(l * 100);

    return { h, s, l: lPerc };
  };

  hslToHex(h: number, s: number, l: number): string {
    const sNorm = s / 100;
    const lNorm = l / 100;

    const c = (1 - Math.abs(2 * lNorm - 1)) * sNorm;
    const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
    const m = lNorm - c / 2;

    let r = 0,
      g = 0,
      b = 0;

    if (h < 60) {
      r = c;
      g = x;
    } else if (h < 120) {
      r = x;
      g = c;
    } else if (h < 180) {
      g = c;
      b = x;
    } else if (h < 240) {
      g = x;
      b = c;
    } else if (h < 300) {
      r = x;
      b = c;
    } else {
      r = c;
      b = x;
    }

    r = Math.round((r + m) * 255);
    g = Math.round((g + m) * 255);
    b = Math.round((b + m) * 255);

    return `#${((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1)}`;
  };

  generateAdaptiveShades(baseColor: string, numChildren: number): string[] {
    const { h, s, l } = this.hexToHsl(baseColor);

    const minL = Math.max(0, l + 10); //avoids full black
    const maxL = Math.min(100, l + 40); //avoids full white

    const step = (maxL - minL) / Math.max(1, numChildren - 1);

    return Array.from({ length: numChildren }, (_, i) => {
      const newL = minL + i * step;
      return this.hslToHex(h, s, Math.round(newL));
    });
  };
}
