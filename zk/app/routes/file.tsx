import { isRouteErrorResponse, useRouteError } from '@remix-run/react'
import {
  unstable_createFileUploadHandler,
  unstable_createMemoryUploadHandler,
  unstable_parseMultipartFormData,
  type ActionFunctionArgs,
} from '@remix-run/node'
import type { LoaderFunctionArgs, NodeOnDiskFile } from '@remix-run/node'
import type { MetaFunction } from '@remix-run/node'
import { json, useActionData, useLoaderData } from '@remix-run/react'
import { addNewInquiry, getInquiries } from '~/models/inquiry'
import { z } from 'zod'
import { getValidatedFormData } from '~/utils.server'
import { useFetcher } from '@remix-run/react'
import { promises as fs } from 'fs'
import path from 'path'
import { withZod } from '@remix-validated-form/with-zod'

const FORM_KEY = 'file-upload-form'

export const meta: MetaFunction = () => {
  return [
    { title: 'New Remix App' },
    { name: 'description', content: 'Welcome to Remix!' },
  ]
}

// schema pro validace
const inquirySchema = z.object({
  email: z.string().email(),
  phone: z.string().min(9),
  // name: z.string(),
  name: z
    .string()
    .refine(
      (value) =>
        /^[A-ZÁČĎÉĚÍŇÓŘŠŤÚŮÝŽ]{1}[a-záčďéěíňóřšťůúýž]+$/.test(value ?? ''),
      'Jmeno musi zacinat velkym pismenem a obsahovat pouze pismena ceske abecedy.'
    ),
  // surname: z.string(),
  surname: z
    .string()
    .refine(
      (value) =>
        /^[A-ZÁČĎÉĚÍŇÓŘŠŤÚŮÝŽ]{1}[a-záčďéěíňóřšťůúýž]+$/.test(value ?? ''),
      'Jmeno musi zacinat velkym pismenem a obsahovat pouze pismena ceske abecedy.'
    ),
})
const validator = withZod(inquirySchema)

export const action = async ({ request }: ActionFunctionArgs) => {
  const requestClone = request.clone()
  const uploadHandler = unstable_createFileUploadHandler({
    maxPartSize: 500_000_000,
  })
  const formData = await unstable_parseMultipartFormData(request, uploadHandler)

  const file = formData.get('attachment') as NodeOnDiskFile
  let publicFilepath = ''
  if (file?.filepath) {
    console.log('!!!')
    publicFilepath = '/public/uploads/' + file.name

    const persistentFilepath = path.resolve(process.cwd(), '.' + publicFilepath)

    await fs.rename(file.filepath, persistentFilepath)
  }

  const validated = await getValidatedFormData(requestClone, inquirySchema)

  console.log('validated', validated)

  if (validated.success) {
    await addNewInquiry({ ...validated.data, attachment: publicFilepath })
  }

  return json(validated)
}

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const inquiries = await getInquiries()

  return { inquiries }
}

export default function FileUploadRoute() {
  const { inquiries } = useLoaderData<typeof loader>()
  const fetcher = useFetcher<typeof action>({ key: FORM_KEY })
  const actionData = fetcher.data

  return (
    <div className="prose">
      <h1>Welcome to Remix</h1>

      <h2>All inquiries</h2>

      <ul>
        {inquiries.map((inquiry) => (
          <li key={inquiry.id}>
            {inquiry.name}&nbsp;
            {inquiry.surname}
            &nbsp;|&nbsp;
            {inquiry.email}
            &nbsp;|&nbsp;
            {inquiry.phone}
            &nbsp;|&nbsp;
            {inquiry.attachment}
            {inquiry.attachment && <img src={inquiry.attachment} />}
          </li>
        ))}
      </ul>

      <h2>add inquiry</h2>

      <fetcher.Form
        key={FORM_KEY}
        method="post"
        action="?index"
        encType="multipart/form-data"
      >
        <div className="flex flex-col items-start">
          <label className="label">
            Name:
            <input type="text" name="name" className="input input-bordered" />
          </label>
          <label className="label">
            Surname:
            <input
              type="text"
              name="surname"
              className="input input-bordered"
            />
          </label>
          <label className="label">
            Email:
            <input type="text" name="email" className="input input-bordered" />
          </label>
          <label className="label">
            Phone:
            <input type="text" name="phone" className="input input-bordered" />
          </label>

          <label className="label">
            File:
            <input type="file" name="attachment" className="file-input " />
          </label>

          <button className="btn btn-primary" type="submit">
            Submit
          </button>

          {actionData?.success && (
            <p className="text-green-500">Inquiry added successfully</p>
          )}
          {actionData?.error && (
            <p className="text-red-500">
              Error adding inquiry
              {JSON.stringify(actionData?.error, null, 2)}
            </p>
          )}
        </div>
      </fetcher.Form>
    </div>
  )
}
