import { Maximize } from "@mui/icons-material"
import { Position } from "../../app/types"
import MapData, { Marker } from "../maps/MapData"
import Camera from "./Camera"
import { center, distance, drawLineArrow, duration, rounded } from "./helpers"
import { MouseState } from "../input/mouseState"

interface RenderData {
  canvas: HTMLCanvasElement
  image: HTMLImageElement
  cameraPos: Position
  cameraZoom: number
  mouseState: MouseState
  map?: MapData
  markers?: Marker[]
  hoverMarker?: string
  draggingMarkers: boolean
}

export const MARKER_SIZE = 8

export default function render({
  canvas,
  image,
  cameraPos,
  cameraZoom,
  mouseState: mouse,
  map,
  markers,
  hoverMarker,
  draggingMarkers,
}: RenderData) {
  const ctx = canvas.getContext("2d")

  if (!ctx) {
    return
  }

  const camera = new Camera(cameraPos, cameraZoom)

  canvas.width = canvas.clientWidth
  canvas.height = canvas.clientHeight

  ctx.clearRect(0, 0, canvas.width, canvas.height)

  ctx.translate(camera.position.x, camera.position.y)
  ctx.scale(camera.zoom, camera.zoom)

  ctx.drawImage(image as CanvasImageSource, 0, 0, image.width, image.height)

  if (mouse.position) {
    ctx.fillStyle = "rgba(0,0,0,0.25)"
    ctx.fillRect(
      Math.round(mouse.position.x),
      Math.round(mouse.position.y),
      1,
      1,
    )

    // Rectangle select
    if (
      !draggingMarkers &&
      mouse.buttons.left.startClickPos &&
      mouse.buttons.left.pressed
    ) {
      const startClickPos = mouse.buttons.left.startClickPos
      ctx.strokeStyle = "rgba(255,255,255,0.8)"
      ctx.strokeRect(
        Math.min(startClickPos.x, mouse.position.x),
        Math.min(startClickPos.y, mouse.position.y),
        Math.abs(startClickPos.x - mouse.position.x),
        Math.abs(startClickPos.y - mouse.position.y),
      )
    }
  }

  // Draw relationships
  markers?.forEach((m) => {
    if (m.parentId) {
      const parent = markers.find((p) => m.parentId == p.id)
      if (parent) {
        // Handle line targets in cases where one of the markers are being dragged
        const markerPos: Position =
          draggingMarkers && m.id == map?.activeMarker && mouse.position
            ? mouse.position
            : { x: m.x, y: m.y }
        const parentPos: Position =
          draggingMarkers && parent.id == map?.activeMarker && mouse.position
            ? mouse.position
            : { x: parent.x, y: parent.y }

        ctx.strokeStyle =
          m.id == map?.activeMarker || m.parentId == map?.activeMarker
            ? "white"
            : "rgba(255, 255, 255, 0.25)"
        ctx.fillStyle = ctx.strokeStyle
        drawLineArrow(ctx, parentPos, markerPos, 4, MARKER_SIZE + 2)
      }
    }
  })

  markers?.forEach((m) => {
    const selected =
      map?.selectedMarkers && map?.selectedMarkers?.indexOf(m.id) >= 0
    ctx.shadowColor = "black"
    ctx.shadowBlur = 10

    if (map?.activeMarker == m.id) {
      ctx.fillStyle = "#00ff33"
    } else if (hoverMarker == m.id) {
      ctx.fillStyle = "white"
    } else if (selected) {
      ctx.fillStyle = "yellow"
    } else {
      ctx.fillStyle = "red"
    }

    ctx.strokeStyle = selected ? "#fff" : "#333"

    const pos =
      draggingMarkers && selected && mouse.position
        ? rounded(mouse.position)
        : {
            x: m.x,
            y: m.y,
          }

    ctx.fillRect(
      pos.x - MARKER_SIZE / 2,
      pos.y - MARKER_SIZE / 2,
      MARKER_SIZE,
      MARKER_SIZE,
    )
    ctx.shadowBlur = 0
    ctx.strokeRect(
      pos.x - MARKER_SIZE / 2,
      pos.y - MARKER_SIZE / 2,
      MARKER_SIZE,
      MARKER_SIZE,
    )
  })
}
