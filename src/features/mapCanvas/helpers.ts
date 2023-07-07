import { FormatTextdirectionRToL } from "@mui/icons-material"
import { Position } from "../../app/types"
import { Location } from "../maps/MapData"
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

export function findHoveredMarker(markers: Location[], mouse: MouseState) {
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

// Adapted from https://stackoverflow.com/a/36805543
export function drawLineArrow(
  ctx: CanvasRenderingContext2D,
  from: Position,
  to: Position,
  radius: number,
  offset: number,
) {
  const vector: Position = { x: from.x - to.x, y: from.y - to.y }
  const mag = Math.sqrt(Math.pow(vector.x, 2) + Math.pow(vector.y, 2))
  const normal: Position = { x: vector.x / mag, y: vector.y / mag }

  const toMod = {
    x: to.x + normal.x * (offset + radius / 2),
    y: to.y + normal.y * (offset + radius / 2),
  }

  const xCenter = toMod.x - normal.x * (radius / 2)
  const yCenter = toMod.y - normal.y * (radius / 2)

  let angle
  let x
  let y

  ctx.beginPath()
  ctx.moveTo(from.x, from.y)
  ctx.lineTo(toMod.x, toMod.y)
  ctx.stroke()
  ctx.closePath()

  ctx.beginPath()

  angle = Math.atan2(toMod.y - from.y, toMod.x - from.x)
  x = radius * Math.cos(angle) + xCenter
  y = radius * Math.sin(angle) + yCenter

  ctx.moveTo(x, y)

  angle += (1 / 3) * (2 * Math.PI)
  x = radius * Math.cos(angle) + xCenter
  y = radius * Math.sin(angle) + yCenter

  ctx.lineTo(x, y)

  angle += (1 / 3) * (2 * Math.PI)
  x = radius * Math.cos(angle) + xCenter
  y = radius * Math.sin(angle) + yCenter

  ctx.lineTo(x, y)

  ctx.closePath()

  ctx.fill()
}
