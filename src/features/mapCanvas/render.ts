import { Position } from "../../app/types"
import MapData, { Location } from "../maps/MapData"
import Camera from "./Camera"
import { drawLineArrow, rounded } from "./helpers"
import { MouseState } from "../input/mouseState"

interface RenderData {
  canvas: HTMLCanvasElement
  image: HTMLImageElement
  cameraPos: Position
  cameraZoom: number
  mouseState: MouseState
  map?: MapData
  maps?: MapData[]
  locations?: Location[]
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
  maps,
  locations,
  hoverMarker,
  draggingMarkers,
}: RenderData) {
  const ctx = canvas.getContext("2d")

  if (!ctx) {
    return
  }

  const visibleLocations = locations?.filter((l) => map && l.map == map.id)

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
  locations?.forEach((l) => {
    if (l.parentId) {
      ctx.strokeStyle =
        l.id == map?.activeLocation || l.parentId == map?.activeLocation
          ? "white"
          : "rgba(255, 255, 255, 0.25)"
      ctx.fillStyle = ctx.strokeStyle

      const parent = locations?.find((p) => l.parentId == p.id)
      if (parent && parent.map == l.map && l.map == map?.id) {
        // Handle line targets in cases where one of the markers are being dragged
        const markerPos: Position =
          draggingMarkers && l.id == map?.activeLocation && mouse.position
            ? mouse.position
            : { x: l.x, y: l.y }
        const parentPos: Position =
          draggingMarkers && parent.id == map?.activeLocation && mouse.position
            ? mouse.position
            : { x: parent.x, y: parent.y }

        drawLineArrow(ctx, parentPos, markerPos, 4, MARKER_SIZE + 2)
      } else if (parent && (parent.map == map?.id || l.map == map?.id)) {
        const parentOnOtherMap = parent.map != map?.id
        const originPos = parentOnOtherMap
          ? { x: l.x, y: l.y }
          : { x: parent.x, y: parent.y }

        // Handle line targets in cases where one of the markers are being dragged
        const markerPos: Position =
          draggingMarkers &&
          (parentOnOtherMap
            ? l.id == map?.activeLocation
            : parent.id == map?.activeLocation) &&
          mouse.position
            ? mouse.position
            : originPos
        const parentPos: Position = {
          x: markerPos.x,
          y: parentOnOtherMap
            ? markerPos.y - MARKER_SIZE * 2
            : markerPos.y + MARKER_SIZE * 2.5,
        }
        drawLineArrow(
          ctx,
          parentOnOtherMap ? parentPos : markerPos,
          parentOnOtherMap ? markerPos : parentPos,
          4,
          MARKER_SIZE + 2,
        )

        if (l.id == map?.activeLocation || parent.id == map?.activeLocation) {
          const loc = parentOnOtherMap ? parent : l
          const map = maps?.find((m) => m.id == loc.map)
          const name = loc.name ?? `${loc.x}, ${loc.y}`
          ctx.textAlign = "center"
          ctx.font = "6px sans-serif"
          ctx.fillText(
            `${map?.name} (${name})`,
            parentPos.x,
            parentPos.y + (parentOnOtherMap ? -4 : 2),
          )
        }
      }
    }
  })

  visibleLocations?.forEach((m) => {
    const selected =
      map?.selectedLocations && map?.selectedLocations?.indexOf(m.id) >= 0
    ctx.shadowColor = "black"
    ctx.shadowBlur = 10

    if (map?.activeLocation == m.id) {
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
