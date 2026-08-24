import { useEffect } from "react";
import { useMap } from "react-leaflet";
import L from "leaflet";
import { temperatureColor, toLatLng } from "../../lib/geo";

export default function HeatmapLayer({ points, onSelect }) {
  const map = useMap();

  useEffect(() => {
    if (!points || !points.length) return;

    let currentZoom = map.getZoom();

    const getStyleOptions = (zoom, color) => {
      let radius = 30;
      let opacity = 0.4;
      if (zoom >= 11) {
        radius = 6;
        opacity = 0.9;
      } else if (zoom >= 7) {
        radius = 15;
        opacity = 0.6;
      }
      return { radius, opacity, color };
    };

    const layerGroup = L.layerGroup();
    map.addLayer(layerGroup);

    const geoJsonData = {
      type: "FeatureCollection",
      features: points.map(pt => {
        const loc = toLatLng(pt);
        return loc ? {
          type: "Feature",
          geometry: { type: "Point", coordinates: [loc.lng, loc.lat] },
          properties: { record: pt, color: temperatureColor(pt.surfaceTemperature) }
        } : null;
      }).filter(Boolean)
    };

    let geoJsonLayer;

    const renderLayer = (zoom) => {
      if (geoJsonLayer) {
        layerGroup.removeLayer(geoJsonLayer);
      }

      geoJsonLayer = L.geoJSON(geoJsonData, {
        pointToLayer: (feature, latlng) => {
          const { color, record } = feature.properties;
          const { radius, opacity } = getStyleOptions(zoom, color);
          
          if (zoom >= 11) {
            const marker = L.circleMarker(latlng, {
              color: "#ecfeff",
              fillColor: color,
              fillOpacity: opacity,
              weight: 1.5,
              opacity: 0.9,
              radius
            });
            marker.on('click', () => onSelect({ origin: { lat: latlng.lat, lng: latlng.lng }, source: "ocean", record }));
            return marker;
          } else {
            // Use a LayerGroup for the multi-circle heatmap effect
            const group = L.layerGroup();
            
            const outer = L.circleMarker(latlng, {
              color,
              fillColor: color,
              fillOpacity: opacity * 0.4,
              weight: 0,
              opacity: 0,
              radius
            });
            outer.on('click', () => onSelect({ origin: { lat: latlng.lat, lng: latlng.lng }, source: "ocean", record }));
            
            const inner = L.circleMarker(latlng, {
              color,
              fillColor: color,
              fillOpacity: opacity,
              weight: 0,
              opacity: 0,
              radius: radius * 0.45
            });
            inner.on('click', () => onSelect({ origin: { lat: latlng.lat, lng: latlng.lng }, source: "ocean", record }));
            
            group.addLayer(outer);
            group.addLayer(inner);
            return group;
          }
        }
      });
      
      layerGroup.addLayer(geoJsonLayer);
    };

    renderLayer(currentZoom);

    const onZoomEnd = () => {
      const newZoom = map.getZoom();
      if (newZoom !== currentZoom) {
        currentZoom = newZoom;
        renderLayer(currentZoom);
      }
    };

    map.on('zoomend', onZoomEnd);

    return () => {
      map.off('zoomend', onZoomEnd);
      map.removeLayer(layerGroup);
    };
  }, [points, map, onSelect]);

  return null;
}
