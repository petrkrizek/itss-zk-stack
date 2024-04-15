import { json } from '@remix-run/node'
import { ZodSchema } from 'zod'

export async function getFormData(request: Request) {
  const formPayload = Object.fromEntries(await request.formData())
  return formPayload
}

export async function getValidatedFormData(
  request: Request,
  schema: ZodSchema,
  
) {
  const formPayload = await getFormData(request)

  const { success, data, error } = schema.safeParse(formPayload)

  return { success, data, error }
}

export const getJsonErrors = (
  errors: Record<string, any>,
  status: number = 400
) => {
  return json(
    {
      errors,
      success: false,
    },
    { status }
  )
}
