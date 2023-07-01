import { Position } from "./MapCanvas"

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
