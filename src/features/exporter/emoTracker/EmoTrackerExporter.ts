import { Exporter } from "../Exporter"
import MapData, { Location } from "../../maps/MapData"

interface EmoTrackerLocation {
  name?: string
  map_locations: Array<{
    map: string
    x: number
    y: number
  }>
  children?: EmoTrackerLocation[]
}

function dataToLocation(
  maps: MapData[],
  location: Location,
  otherMarkers?: Location[],
): EmoTrackerLocation {
  return {
    name: location.name,
    map_locations: [
      {
        map: maps.find((m) => m.id == location.map)?.name ?? "UNKNOWN",
        x: location.x,
        y: location.y,
      },
    ],
    children: otherMarkers
      ?.filter((m) => m.parentId == location.id)
      .map((m) => dataToLocation(maps, m, otherMarkers)),
  }
}

const EmotrackerExporter: Exporter = {
  name: "Emotracker",
  exportLocation: function (maps: MapData[], location: Location): string {
    return JSON.stringify(dataToLocation(maps, location), null, 4)
  },
  exportLocations: function (maps: MapData[], locations: Location[]): string {
    return JSON.stringify(
      locations
        .filter((m) => !m.parentId)
        .map((location) => dataToLocation(maps, location, locations)),
      null,
      4,
    )
  },
}

export default EmotrackerExporter
