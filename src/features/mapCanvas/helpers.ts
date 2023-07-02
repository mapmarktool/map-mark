import { Position } from "../../app/types"
import { Marker } from "../maps/MapData"
import { MouseState } from "../mouse/mouseState"
import { MARKER_SIZE } from "./render"

export function distance(pos1: Position, pos2: Position) {
  return Math.sqrt(Math.pow(pos2.x - pos1.x, 2) + Math.pow(pos2.y - pos1.y, 2))
}

export function center(pos1: Position, pos2: Position): Position {
  return {
    x: (pos1.x + pos2.x) / 2,
    y: (pos1.y + pos2.y) / 2,
  }
}

export function rounded(pos: Position): Position {
  return {
    x: Math.round(pos.x),
    y: Math.round(pos.y),
  }
}

export function duration(start: number) {
  return Date.now() - start
}

export function findHoveredMarker(markers: Marker[], mouse: MouseState) {
  const halfMarker = MARKER_SIZE / 2
  const hover = [...markers]
    .reverse()
    .find(
      (m) =>
        mouse.position &&
        mouse.position.x > m.x - halfMarker &&
        mouse.position.x < m.x + halfMarker &&
        mouse.position.y > m.y - halfMarker &&
        mouse.position.y < m.y + halfMarker,
    )
  return hover
}

export function screenToWorldPosition(
  pos: Position,
  cameraPos: Position,
  zoom: number,
) {
  return {
    x: (pos.x - cameraPos.x) / zoom,
    y: (pos.y - cameraPos.y) / zoom,
  }
}
