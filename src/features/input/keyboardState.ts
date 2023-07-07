export enum InputKey {
  Shift = "shift",
  Delete = "delete",
}

export interface KeyState {
  pressed: boolean
  justPressed: boolean
  justReleased: boolean
  holdStart: number
}

export interface KeyboardState {
  keys: {
    [key in InputKey]: KeyState
  }
}

const initialKeyState = (): KeyState => ({
  pressed: false,
  justPressed: false,
  justReleased: false,
  holdStart: 0,
})

export const initialKeyboardState = (): KeyboardState => ({
  keys: {
    delete: initialKeyState(),
    shift: initialKeyState(),
  },
})

export const keyboardHandler = {
  press(state: KeyboardState, key: InputKey) {
    const newKeys = {
      ...state.keys,
    }

    newKeys[key].justPressed = true
    newKeys[key].justReleased = false
    newKeys[key].pressed = true
    newKeys[key].holdStart = Date.now()

    return {
      ...state,
      keys: newKeys,
    }
  },
  release(state: KeyboardState, key: InputKey) {
    const newKeys = {
      ...state.keys,
    }

    newKeys[key].justPressed = false
    newKeys[key].justReleased = true
    newKeys[key].pressed = false
    newKeys[key].justReleased = true

    return {
      ...state,
      keys: newKeys,
    }
  },
  update(state: KeyboardState) {
    Object.keys(state.keys).forEach((key) => {
      state.keys[key as InputKey].justPressed = false
      state.keys[key as InputKey].justReleased = false
    })

    // Important: Unlike other handlers we return the same state instance, and not a new instance,
    // to make sure this doesn't trigger an infinite loop in effects that depends on KeyboardState
    return state
  },
}
