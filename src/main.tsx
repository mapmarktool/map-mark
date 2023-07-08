import React from "react"
import ReactDOM from "react-dom/client"
import { Provider } from "react-redux"
import { RootState, store } from "./app/store"
import App, { SAVE_KEY } from "./App"
import "./index.css"
import { ThemeProvider } from "@mui/material"
import theme from "./app/theme"
import { deserializeState } from "./app/stateSerializer"

function loadState(): RootState | undefined {
  console.log("Restoring state...")
  const data = localStorage.getItem(SAVE_KEY)
  if (data) {
    const saveData = deserializeState(data)
    const state: RootState = {
      editor: {
        maps: saveData.maps,
        currentMap: saveData.maps.length > 0 ? saveData.maps[0].id : null,
        locations: saveData.locations,
      },
      ui: {
        changelog: {
          open: false,
          checksum: saveData.changelogChecksum,
        },
      },
    }
    return state
  } else {
    console.log("No data to restore!")
  }
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <Provider store={store(loadState())}>
      <ThemeProvider theme={theme}>
        <App />
      </ThemeProvider>
    </Provider>
  </React.StrictMode>,
)
