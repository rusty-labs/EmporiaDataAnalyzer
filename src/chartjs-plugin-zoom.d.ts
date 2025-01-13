import { ChartOptions } from 'chart.js';

declare module 'chart.js' {
  interface ChartOptions {
    zoom?: {
      wheel?: {
        enabled?: boolean;
        modifierKey?: 'ctrl' | 'alt' | 'meta';
      };
      pinch?: {
        enabled?: boolean;
      };
      pan?: {
        enabled?: boolean;
        mode?: 'xy' | 'x' | 'y';
      };
    };
  }
}
