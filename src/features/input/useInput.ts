import { RefObject, useEffect, useState } from "react"
import {
  MouseButton,
  MouseState,
  initialMouseState,
  mouseHandler,
} from "./mouseState"
import { Position } from "../../app/types"
import {
  InputKey,
  KeyboardState,
  initialKeyboardState,
  keyboardHandler,
} from "./keyboardState"

interface UseMouseSettings {
  parent: RefObject<HTMLElement>
  worldPositionTransform: (pos: Position) => Position
}

function useMouse({ parent, worldPositionTransform }: UseMouseSettings) {
  const [mouseState, setMouseState] = useState<MouseState>(initialMouseState)
  const [keyboardState, setKeyboardState] = useState<KeyboardState>(
    initialKeyboardState(),
  )

  // Keyboard input
  useEffect(() => {
    function onKeyDownHandler(ev: KeyboardEvent) {
      const key = ev.key.toLowerCase() as InputKey

      if (!ev.repeat && Object.values(InputKey).indexOf(key) >= 0) {
        setKeyboardState(keyboardHandler.press(keyboardState, key))
      }
    }

    function onKeyUpHandler(ev: KeyboardEvent) {
      const key = ev.key.toLowerCase() as InputKey

      if (!ev.repeat && Object.values(InputKey).indexOf(key) >= 0) {
        setKeyboardState(keyboardHandler.release(keyboardState, key))
      }
    }

    window.addEventListener("keydown", onKeyDownHandler)
    window.addEventListener("keyup", onKeyUpHandler)

    return () => {
      window.removeEventListener("keydown", onKeyDownHandler)
      window.removeEventListener("keyup", onKeyUpHandler)
    }
  }, [])

  function updateKeyboard() {
    setKeyboardState(keyboardHandler.update(keyboardState))
  }

  // Mouse Input
  useEffect(() => {
    function mouseMoveHandler(ev: MouseEvent) {
      const pos = { x: ev.offsetX, y: ev.offsetY }

      setMouseState(
        mouseHandler.move(
          mouseState,
          worldPositionTransform ? worldPositionTransform(pos) : pos,
          pos,
          { x: ev.movementX, y: ev.movementY },
        ),
      )
    }

    function mouseClickHandler(ev: MouseEvent) {
      ev.preventDefault()

      switch (ev.button) {
        case 0:
          setMouseState(mouseHandler.click(mouseState, MouseButton.Left))
          return
        case 1:
          setMouseState(mouseHandler.click(mouseState, MouseButton.Middle))
          return
        case 2:
          setMouseState(mouseHandler.click(mouseState, MouseButton.Right))
          return
      }
    }

    function mouseClickReleaseHandler(ev: MouseEvent) {
      ev.preventDefault()

      switch (ev.button) {
        case 0:
          setMouseState(mouseHandler.release(mouseState, MouseButton.Left))
          return
        case 1:
          setMouseState(mouseHandler.release(mouseState, MouseButton.Middle))
          return
        case 2:
          setMouseState(mouseHandler.release(mouseState, MouseButton.Right))
          return
      }
    }

    function mouseWheelHandler(ev: WheelEvent) {
      if (!parent.current) {
        return
      }
      setMouseState({
        ...mouseState,
        wheelMovement: ev.deltaY,
      })
      ev.preventDefault()
    }

    function contextMenuHandler(ev: MouseEvent) {
      ev.preventDefault()
    }
    function mouseLeaveHandler(ev: MouseEvent) {
      setMouseState({
        ...mouseState,
        position: undefined,
        screenPosition: undefined,
      })
    }

    parent.current?.addEventListener("mousemove", mouseMoveHandler, false)
    parent.current?.addEventListener("mousedown", mouseClickHandler, false)
    parent.current?.addEventListener("mouseup", mouseClickReleaseHandler, false)
    parent.current?.addEventListener("mouseleave", mouseLeaveHandler, false)
    parent.current?.addEventListener("wheel", mouseWheelHandler, false)
    parent.current?.addEventListener("contextmenu", contextMenuHandler, false)

    return () => {
      parent.current?.removeEventListener("mousemove", mouseMoveHandler)
      parent.current?.removeEventListener("mousedown", mouseClickHandler)
      parent.current?.removeEventListener("mouseup", mouseClickReleaseHandler)
      parent.current?.removeEventListener("mouseleave", mouseLeaveHandler)
      parent.current?.removeEventListener("wheel", mouseWheelHandler)
      parent.current?.removeEventListener("contextmenu", contextMenuHandler)
    }
  }, [parent, worldPositionTransform, mouseState])

  function updateMouse() {
    setMouseState(mouseHandler.update(mouseState))
  }

  return {
    mouseState,
    updateMouse,
    keyboardState,
    updateKeyboard,
  }
}

export default useMouse
