import { Backdrop, Box, Button } from "@mui/material"
import { useEffect, useState } from "react"
import ChromePicker from "react-color/lib/components/chrome/Chrome"

interface ColorPickerProps {
  color: string
  width?: number
  height?: number
  onChange?: (hex: string) => void
}

const ColorPicker = ({ color, onChange, width, height }: ColorPickerProps) => {
  const [newColor, setNewColor] = useState(color)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    setNewColor(color)
  }, [color])

  return (
    <>
      <Box
        width={width ?? 64}
        height={height ?? 64}
        sx={{ backgroundColor: newColor, cursor: "pointer" }}
        onClick={() => setOpen(true)}
      ></Box>
      {open && (
        <Box sx={{ position: "fixed", zIndex: 20 }}>
          <Box
            sx={{
              position: "fixed",
              top: 0,
              bottom: 0,
              left: 0,
              right: 0,
            }}
            onClick={() => {
              setOpen(false)
              if (onChange) {
                onChange(newColor)
              }
            }}
          ></Box>
          <ChromePicker
            color={newColor}
            onChange={(c) => {
              setNewColor(c.hex)
            }}
          />
        </Box>
      )}
    </>
  )
}

export default ColorPicker
