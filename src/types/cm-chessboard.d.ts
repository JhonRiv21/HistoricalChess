// Minimal typings for the parts of cm-chessboard this site uses (the package ships plain JS).
declare module 'cm-chessboard/src/Chessboard.js' {
  export interface ChessboardProps {
    position?: string;
    assetsUrl?: string;
    style?: {
      cssClass?: string;
      showCoordinates?: boolean;
      borderType?: 'none' | 'thin' | 'frame';
      pieces?: { file?: string };
      animationDuration?: number;
    };
    extensions?: { class: unknown; props?: Record<string, unknown> }[];
  }
  export class Chessboard {
    constructor(context: HTMLElement, props?: ChessboardProps);
    setPosition(fen: string, animated?: boolean): Promise<void>;
    destroy(): void;
    addMarker(type: unknown, square: string): void;
    removeMarkers(type?: unknown, square?: string): void;
    addArrow(type: unknown, from: string, to: string): void;
    removeArrows(type?: unknown, from?: string, to?: string): void;
  }
}
declare module 'cm-chessboard/src/extensions/markers/Markers.js' {
  export const MARKER_TYPE: Record<'frame' | 'square' | 'dot' | 'circle', { class: string; slice: string }>;
  export class Markers {}
}
declare module 'cm-chessboard/src/extensions/arrows/Arrows.js' {
  export const ARROW_TYPE: Record<'default' | 'success' | 'secondary' | 'warning' | 'info' | 'danger', { class: string }>;
  export class Arrows {}
}
declare module 'cm-chessboard/src/extensions/accessibility/Accessibility.js' {
  export class Accessibility {}
}
