import { Exporter } from "../Exporter"
import MapData, { Marker } from "../../maps/MapData"

interface EmoTrackerLocation {
  name?: string
  map_locations: Array<{
    map: string
    x: number
    y: number
  }>
  children?: EmoTrackerLocation[]
}

function markerToLocation(
  map: MapData,
  marker: Marker,
  otherMarkers?: Marker[],
): EmoTrackerLocation {
  return {
    name: marker.name,
    map_locations: [
      {
        map: map.name,
        x: marker.x,
        y: marker.y,
      },
    ],
    children: otherMarkers
      ?.filter((m) => m.parentId == marker.id)
      .map((m) => markerToLocation(map, m, otherMarkers)),
  }
}

const EmotrackerExporter: Exporter = {
  name: "Emotracker",
  exportMarker: function (map: MapData, marker: Marker): string {
    return JSON.stringify(markerToLocation(map, marker), null, 4)
  },
  exportMap: function (map: MapData, markers: Marker[]): string {
    return JSON.stringify(
      markers
        .filter((m) => !m.parentId)
        .map((marker) => markerToLocation(map, marker, markers)),
      null,
      4,
    )
  },
}

export default EmotrackerExporter
