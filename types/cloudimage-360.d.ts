interface CloudImage360Options {
  container: HTMLElement;
  imageUrl: string;
  width?: string | number;
  height?: string | number;
  hotSpots?: Array<{
    pitch: number;
    yaw: number;
    type: string;
    text?: string;
    URL?: string;
  }>;
  autoRotate?: number;
  compass?: boolean;
  showFullscreenCtrl?: boolean;
  showZoomCtrl?: boolean;
  mouseZoom?: boolean;
  title?: string;
}

interface CloudImage360Instance {
  destroy: () => void;
}

declare global {
  interface Window {
    CloudImage360: {
      new (options: CloudImage360Options): CloudImage360Instance;
    };
  }
} 