import { Explore, Add, AddCircle } from "@mui/icons-material"
import { Paper, Tabs, Tab, Button } from "@mui/material"
import { useState } from "react"
import { useAppDispatch, useAppSelector } from "../../app/hooks"
import { getCurrentMap, getMaps, selectMap } from "./editorSlice"

interface EditorTabsProps {
  onClickNew: () => void
}

const EditorTabs = ({ onClickNew }: EditorTabsProps) => {
  const dispatch = useAppDispatch()
  const maps = useAppSelector(getMaps)
  const currentMap = useAppSelector(getCurrentMap)

  const tabs = maps.map((map) => (
    <Tab
      key={map.id}
      value={map.id}
      label={map.name}
      icon={<Explore />}
      iconPosition="start"
    />
  ))

  return (
    <Paper
      elevation={8}
      sx={{
        marginTop: 8,
      }}
    >
      <Tabs
        value={currentMap?.id}
        onChange={(_e, value) => dispatch(selectMap(value))}
        variant="scrollable"
        indicatorColor="secondary"
        textColor="secondary"
        sx={{
          backgroundColor: "background.paper",
        }}
      >
        {tabs}
      </Tabs>
    </Paper>
  )
}

export default EditorTabs
