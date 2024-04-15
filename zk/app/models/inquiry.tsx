import type { Club, Prisma, User } from '@prisma/client'
import { omit } from '~/lib/omit'

import { prisma } from '~/services/db.server'

// get all Inquiries
export async function getInquiries() {
  return prisma.inquiry.findMany()
}


// insert new Inquiry
export async function addNewInquiry(data: Prisma.InquiryCreateInput) {
  return prisma.inquiry.create({ data })
}