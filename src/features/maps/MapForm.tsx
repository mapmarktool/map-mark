import {
  Box,
  Button,
  Dialog,
  Paper,
  Stack,
  TextField,
  Typography,
  imageListClasses,
} from "@mui/material"
import { Formik } from "formik"
import { useAppDispatch } from "../../app/hooks"
import { newMap } from "../editor/editorSlice"

interface MapFormProps {
  open: boolean
  onClose: () => void
}

interface MapFormData {
  name: string
  image?: string
}

type MapFormErrors = { [key in keyof MapFormData]?: string }

const MapForm = ({ open, onClose }: MapFormProps) => {
  const dispatch = useAppDispatch()
  function validate(values: MapFormData) {
    const errors: MapFormErrors = {}

    if (!values.name || values.name.length == 0) {
      errors.name = "Required"
    }

    if (!values.image) {
      errors.image = "Required"
    }

    return errors
  }

  async function handleImage(files: FileList) {
    if (!files[0]) {
      return
    }

    const file = files[0]
    const image = await new Promise<string>((resolve) => {
      const reader = new FileReader()

      reader.addEventListener("load", () => {
        resolve(reader.result as string)
      })

      reader.readAsDataURL(file)
    })

    return image
  }

  const initialValues: MapFormData = { name: "", image: undefined }

  return (
    <Dialog open={open} onClose={onClose} fullWidth>
      <Box p={8}>
        <Typography variant="h4" mb={3}>
          Create map
        </Typography>
        <Formik
          initialValues={initialValues}
          validate={validate}
          onSubmit={(values) => {
            if (values.image) {
              dispatch(
                newMap({
                  id: crypto.randomUUID(),
                  name: values.name,
                  image: values.image,
                }),
              )
            }
            onClose()
          }}
        >
          {({
            values,
            errors,
            touched,
            handleChange,
            handleBlur,
            handleSubmit,
            setValues,
            isSubmitting,
          }) => (
            <form onSubmit={handleSubmit}>
              <Stack gap={2}>
                {(values.image && (
                  <img
                    style={{ height: 300, objectFit: "contain" }}
                    src={values.image}
                  />
                )) || (
                  <Box
                    component="label"
                    height="300px"
                    border="1px dashed black"
                    borderColor={(errors.image && "red") || "primary"}
                    display="flex"
                    justifyContent="center"
                    alignItems="center"
                    color={(errors.image && "red") || "primary"}
                  >
                    <input
                      type="file"
                      name="image"
                      onChange={async (e) => {
                        if (!e.currentTarget.files) {
                          return
                        }
                        const image = await handleImage(e.currentTarget.files)
                        if (image) {
                          setValues({
                            ...values,
                            image,
                          })
                        }
                      }}
                      hidden
                    />
                    {errors.image || "Click to choose image"}
                  </Box>
                )}
                <TextField
                  id="outlined-basic"
                  label="Name"
                  variant="outlined"
                  name="name"
                  onChange={handleChange}
                  onBlur={handleBlur}
                  value={values.name}
                  error={(errors.name?.length != 0 && touched.name) ?? false}
                  helperText={errors.name && touched.name && errors.name}
                />
                <Button variant="contained" color={"primary"} type="submit">
                  Create
                </Button>
              </Stack>
            </form>
          )}
        </Formik>
      </Box>
    </Dialog>
  )
}

export default MapForm
