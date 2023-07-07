import { Box } from "@mui/material"
import { useAppDispatch, useAppSelector } from "../../app/hooks"
import {
  addLocation,
  getCurrentMap,
  getLocations,
  getMaps,
  removeLocation,
  setActiveLocation,
  setLocationParent,
  setSelectedLocations,
  updateLocationPosition,
} from "../editor/editorSlice"
import { useEffect, useRef, useState } from "react"
import {
  distance,
  duration,
  findHoveredMarker,
  screenToWorldPosition,
} from "./helpers"
import { Position } from "../../app/types"
import render, { MARKER_SIZE } from "./render"
import useInput from "../input/useInput"

interface MapCanvasProps {}

const ZOOM_STEP = 0.25
const DRAG_THRESHOLD = 300

const MapCanvas = ({}: MapCanvasProps) => {
  const [windowDimension, setWindowDimensions] = useState({
    height: window.innerHeight,
    width: window.innerWidth,
  })
  const [cameraPos, setCameraPos] = useState<Position>({ x: 0, y: 0 })
  const [image, setImage] = useState<HTMLImageElement>()
  const [cameraZoom, setCameraZoom] = useState<number>(1)
  const [hoverMarker, setHoverMarker] = useState<string | undefined>()
  const [startedDragOnMarker, setStartedDragOnMarker] = useState(false)
  const [draggingMarkers, setDraggingMarkers] = useState(false)
  const dispatch = useAppDispatch()
  const maps = useAppSelector(getMaps)
  const currentMap = useAppSelector(getCurrentMap)
  const locations = useAppSelector(getLocations)
  const canvas = useRef<HTMLCanvasElement>(null)
  const {
    mouseState: mouse,
    updateMouse,
    keyboardState: keyboard,
    updateKeyboard,
  } = useInput({
    parent: canvas,
    worldPositionTransform: (pos: Position) =>
      screenToWorldPosition(pos, cameraPos, cameraZoom),
  })
  const imageData = currentMap?.image
  const visibleLocations = locations.filter((l) => l.map == currentMap?.id)

  useEffect(() => {
    function handleResize() {
      setWindowDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
      })
      if (!canvas.current) {
        return
      }
      canvas.current.style.width = "0px"
    }

    window.addEventListener("resize", handleResize)

    return () => {
      window.removeEventListener("resize", handleResize)
    }
  })

  useEffect(() => {
    if (!imageData) {
      return
    }

    const image = new Image()
    image.src = imageData

    image.onload = () => {
      setImage(image)

      if (canvas?.current) {
        setCameraPos({
          x: (canvas.current.clientWidth - image.width) / 2 / cameraZoom,
          y: (canvas.current.clientHeight - image.height) / 2 / cameraZoom,
        })
      }
    }
  }, [imageData, canvas])

  useEffect(() => {
    if (!canvas.current || !image) {
      return
    }

    render({
      canvas: canvas.current,
      image,
      cameraPos,
      cameraZoom,
      mouseState: mouse,
      map: currentMap,
      maps,
      locations,
      hoverMarker,
      draggingMarkers,
    })
  }, [
    canvas,
    image,
    windowDimension, // Not actually used, just used to force re-render when browser is resized
    cameraPos,
    cameraZoom,
    mouse,
    locations,
    currentMap?.activeLocation,
    currentMap?.selectedLocations,
    draggingMarkers,
    hoverMarker,
  ])

  // Controls
  useEffect(() => {
    if (!mouse.position) {
      updateMouse()
      return
    }

    if (mouse.wheelMovement) {
      const delta = mouse.wheelMovement < 0 ? ZOOM_STEP : -ZOOM_STEP
      setCameraZoom(Math.max(cameraZoom + delta, 0.1))
    }

    // Check if hovering marker
    if (visibleLocations) {
      setHoverMarker(findHoveredMarker(visibleLocations, mouse)?.id)
    }

    if (
      mouse.buttons.left.pressed &&
      startedDragOnMarker &&
      duration(mouse.buttons.left.holdStart) >= DRAG_THRESHOLD
    ) {
      setDraggingMarkers(true)
    }

    if (mouse.buttons.left.justReleased && draggingMarkers && mouse.position) {
      if (currentMap?.activeLocation) {
        dispatch(updateLocationPosition(mouse.position))
      }
      setStartedDragOnMarker(false)
      setDraggingMarkers(false)
    }

    if (hoverMarker) {
      if (mouse.buttons.left.justPressed) {
        setStartedDragOnMarker(true)
        dispatch(setActiveLocation(hoverMarker))
      }
      if (
        mouse.buttons.right.justReleased &&
        duration(mouse.buttons.right.holdStart) <= 300
      ) {
        dispatch(removeLocation(hoverMarker))
        dispatch(setSelectedLocations(undefined))
      }
    } else {
      if (
        (mouse.buttons.right.pressed || mouse.buttons.middle.pressed) &&
        mouse.movement
      ) {
        setCameraPos({
          x: cameraPos.x + mouse.movement.x,
          y: cameraPos.y + mouse.movement.y,
        })
      }

      if (
        mouse.buttons.right.justReleased &&
        duration(mouse.buttons.right.holdStart) < 300
      ) {
        dispatch(setActiveLocation(undefined))
      }

      if (
        mouse.buttons.left.justReleased &&
        mouse.buttons.left.startClickPos &&
        duration(mouse.buttons.left.holdStart) < 300 &&
        distance(mouse.buttons.left.startClickPos, mouse.position) < MARKER_SIZE
      ) {
        // Create a new marker
        const id = crypto.randomUUID()

        dispatch(
          addLocation({
            id,
            ...mouse.position,
          }),
        )

        // If shift is held, automatically parent it to previous marker
        if (keyboard.keys.shift.pressed && currentMap?.activeLocation) {
          dispatch(setLocationParent({ id, parent: currentMap.activeLocation }))
        }

        dispatch(setActiveLocation(id))
      }

      if (
        !startedDragOnMarker &&
        mouse.buttons.left.justReleased &&
        mouse.buttons.left.startClickPos &&
        distance(mouse.buttons.left.startClickPos, mouse.position) > MARKER_SIZE
      ) {
        const startPos = {
          x: Math.min(mouse.buttons.left.startClickPos.x, mouse.position.x),
          y: Math.min(mouse.buttons.left.startClickPos.y, mouse.position.y),
        }
        const endPos = {
          x: Math.max(mouse.buttons.left.startClickPos.x, mouse.position.x),
          y: Math.max(mouse.buttons.left.startClickPos.y, mouse.position.y),
        }
        const selected = visibleLocations
          ?.filter(
            (m) =>
              m.x > startPos.x &&
              m.x < endPos.x &&
              m.y > startPos.y &&
              m.y < endPos.y,
          )
          .map((m) => m.id)
        dispatch(setSelectedLocations(selected))
      }
    }

    if (keyboard.keys.delete.justPressed) {
      currentMap?.selectedLocations?.forEach((id) => {
        dispatch(removeLocation(id))
      })
    }

    updateMouse()
    updateKeyboard()
  }, [
    mouse,
    updateMouse,
    keyboard,
    updateKeyboard,
    visibleLocations,
    hoverMarker,
    currentMap?.activeLocation,
    currentMap?.selectedLocations,
  ])

  return (
    <Box
      ref={canvas}
      component={"canvas"}
      sx={{
        flexGrow: 5,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: currentMap?.bgColor,
      }}
    ></Box>
  )
}

export default MapCanvas
