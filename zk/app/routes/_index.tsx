import { isRouteErrorResponse, useRouteError } from '@remix-run/react'
import type { ActionFunctionArgs } from '@remix-run/node'
import type { LoaderFunctionArgs } from '@remix-run/node'
import type { MetaFunction } from '@remix-run/node'
import { json, useActionData, useLoaderData } from '@remix-run/react'
import { addNewInquiry, getInquiries } from '~/models/inquiry'
import { z } from 'zod'
import { getValidatedFormData } from '~/utils.server'
import { useFetcher } from '@remix-run/react'

// meta informace pro stranku = nezajima nas
export const meta: MetaFunction = () => {
  return [
    { title: 'New Remix App' },
  ]
}

// schema pro validace
const inquirySchema = z.object({
  email: z.string().email(),
  // zde pripadne doplnit regex pro validaci telefonu podle zkousky
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
        // regexp pro validace
        /^[A-ZÁČĎÉĚÍŇÓŘŠŤÚŮÝŽ]{1}[a-záčďéěíňóřšťůúýž]+$/.test(value ?? ''),
      'Jmeno musi zacinat velkym pismenem a obsahovat pouze pismena ceske abecedy.'
    ),
})

// zpracuje data z formulare
export const action = async ({ request }: ActionFunctionArgs) => {
  // zprasruje data z formu
  const validated = await getValidatedFormData(request, inquirySchema)

  if (validated.success) {
    // prida data do DB
    await addNewInquiry(validated.data)
  }

  // vraci vse, vcetne chyb
  return json(validated)
}

// nacte data pri normalnim zobrazni stranky
export const loader = async ({ request }: LoaderFunctionArgs) => {
  // ziskani dat z DB
  const inquiries = await getInquiries()

  return { inquiries }
}

// tohle renderuje stranku
export default function Index() {
  // pouzit data z loaderu
  const { inquiries } = useLoaderData<typeof loader>()

  // fetcher pro odeslani formulare
  const fetcher = useFetcher<typeof action>()
  const actionData = fetcher.data

  return (
    <div className="prose">
      <h1>Welcome to Remix</h1>

      <h2>All inquiries</h2>

      <ul>
        {/* vypsani vsech dat */}
        {inquiries.map((inquiry) => (
          <li key={inquiry.id}>
            {inquiry.name}&nbsp;
            {inquiry.surname}
            &nbsp;|&nbsp;
            {inquiry.email}
            &nbsp;|&nbsp;
            {inquiry.phone}
          </li>
        ))}
      </ul>

      <h2>add inquiry</h2>

      {/* formular na pridani dat */}
      <fetcher.Form method="post" action="?index">
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
          <button className="btn btn-primary" type="submit">
            Submit
          </button>

          {/* zobrazeni ze byl success */}
          {actionData?.success && (
            <p className="text-green-500">Inquiry added successfully</p>
          )}

          {/* zobrazeni ze  byla chyba */}
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
