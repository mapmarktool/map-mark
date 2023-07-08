import { useEffect, useState } from "react"
import { AppStore, RootState, store } from "./app/store"
import Editor from "./features/editor/Editor"
import debounce from "debounce"
import { deserializeState, serializeState } from "./app/stateSerializer"
import { useStore } from "react-redux"
import ChangelogDialog from "./features/changelog/ChangelogDialog"

export const SAVE_KEY = "save-data"

async function saveState(store: AppStore) {
  const saveData = serializeState(store.getState())

  // Check if we have available space to save data
  const { quota, usage } = await navigator.storage.estimate()
  if (quota && usage && saveData.length >= quota - usage) {
    // TODO: Handle this by removing image data from save data
    console.warn("NOT ENOUGH SPACE TO SAVE DATA")
  }

  localStorage.setItem(SAVE_KEY, saveData)
}

function App() {
  const store: AppStore = useStore()

  useEffect(() => {
    let unsubscribe = store.subscribe(debounce(() => saveState(store), 500))

    return () => {
      unsubscribe()
    }
  }, [])

  return (
    <>
      <ChangelogDialog />
      <Editor />
    </>
  )
}

export default App
