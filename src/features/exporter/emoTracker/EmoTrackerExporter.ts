import { Exporter } from "../Exporter"
import MapData, { Marker } from "../../maps/MapData"

function markerToLocation(map: MapData, marker: Marker) {
  return {
    name: marker.name,
    map_locations: [
      {
        map: map.name,
        x: marker.x,
        y: marker.y,
      },
    ],
  }
}

const EmotrackerExporter: Exporter = {
  name: "Emotracker",
  exportMarker: function (map: MapData, marker: Marker): string {
    return JSON.stringify(markerToLocation(map, marker), null, 4)
  },
  exportMap: function (map: MapData, markers: Marker[]): string {
    return JSON.stringify(
      markers.map((marker) => markerToLocation(map, marker)),
      null,
      4,
    )
  },
}

export default EmotrackerExporter
