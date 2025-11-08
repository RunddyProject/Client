/// <reference types="vite/client" />
// SVG → React (svgr)
declare module '*.svg?react' {
  import * as React from 'react';
  const Component: React.FC<React.SVGProps<SVGSVGElement>>;
  export default Component;
}

// SVG → raw string (DOM Marker)
declare module '*.svg?raw' {
  const content: string;
  export default content;
}
