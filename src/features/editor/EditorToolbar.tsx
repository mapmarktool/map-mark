import { AddLocation, WrongLocation } from "@mui/icons-material"
import { Paper, ToggleButtonGroup, ToggleButton } from "@mui/material"
import { useState } from "react"

export type Tool = "add" | "remove"

interface EditorToolbarProps {}

const EditorToolbar = ({}: EditorToolbarProps) => {
  const [currentTool, setCurrentTool] = useState("add")

  return (
    <Paper
      elevation={2}
      sx={{
        borderRadius: 0,
        padding: 1,
        display: "flex",
        justifyContent: "center",
      }}
    >
      <ToggleButtonGroup
        value={currentTool}
        exclusive
        onChange={(_e, tool) => setCurrentTool(tool)}
        orientation="vertical"
        size="large"
      >
        <ToggleButton value="add" aria-label="Add">
          <AddLocation />
        </ToggleButton>
        <ToggleButton value="remove" aria-label="Remove">
          <WrongLocation />
        </ToggleButton>
      </ToggleButtonGroup>
    </Paper>
  )
}

export default EditorToolbar
