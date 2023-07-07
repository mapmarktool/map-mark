import { Position } from "../../app/types"

export enum MouseButton {
  Left = "left",
  Right = "right",
  Middle = "middle",
}

export interface MouseButtonState {
  startClickPos?: Position
  pressed: boolean
  justPressed: boolean
  justReleased: boolean
  holdStart: number
}

export interface MouseState {
  position?: Position
  screenPosition?: Position
  movement?: Position
  wheelMovement?: number
  buttons: {
    [key in MouseButton]: MouseButtonState
  }
}

const initialMouseButtonState: MouseButtonState = {
  pressed: false,
  justPressed: false,
  justReleased: false,
  holdStart: 0,
}

export const initialMouseState: MouseState = {
  buttons: {
    left: initialMouseButtonState,
    right: initialMouseButtonState,
    middle: initialMouseButtonState,
  },
}

export const mouseHandler = {
  move(
    state: MouseState,
    position: Position,
    screenPosition: Position,
    movement: Position,
  ): MouseState {
    return {
      ...state,
      position,
      screenPosition,
      movement,
    }
  },
  click(state: MouseState, btn: MouseButton): MouseState {
    const btnState = { ...state.buttons[btn] }

    btnState.justPressed = true
    btnState.pressed = true
    btnState.holdStart = Date.now()
    btnState.startClickPos = state.position

    state.buttons[btn] = btnState

    return { ...state }
  },

  release(state: MouseState, btn: MouseButton): MouseState {
    const btnState = { ...state.buttons[btn] }

    btnState.justReleased = true
    btnState.justPressed = false
    btnState.pressed = false

    state.buttons[btn] = btnState

    return { ...state }
  },

  update(state: MouseState): MouseState {
    Object.keys(state.buttons).forEach((btn) => {
      state.buttons[btn as MouseButton].justPressed = false
      state.buttons[btn as MouseButton].justReleased = false
    })
    state.movement = undefined
    state.wheelMovement = undefined

    // Important: Unlike other handlers we return the same state instance, and not a new instance,
    // to make sure this doesn't trigger an infinite loop in effects that depends on MouseState
    return state
  },
}
