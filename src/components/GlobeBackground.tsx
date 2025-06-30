import React, { useRef, useEffect } from 'react';
import Globe, { GlobeMethods } from 'react-globe.gl';

const GlobeBackground: React.FC = () => {
  const globeEl = useRef<GlobeMethods | null>(null);

  useEffect(() => {
    // Auto-rotate
    if (globeEl.current) {
      globeEl.current.controls().autoRotate = true;
      globeEl.current.controls().autoRotateSpeed = 0.1;
    }
  }, []);

  return (
    <div className="absolute inset-0 z-0 overflow-hidden">
      <Globe
        ref={globeEl as React.RefObject<GlobeMethods>}
        globeImageUrl="//unpkg.com/three-globe/example/img/earth-night.jpg"
        bumpImageUrl="//unpkg.com/three-globe/example/img/earth-topology.png"
        backgroundColor="rgba(0,0,0,0)" // Transparent background
        enablePointerInteraction={false}
      />
    </div>
  );
};

export default GlobeBackground;
