import { notFound } from 'next/navigation'
import { SUBSIDIARIES, getSubsidiary } from '../../../lib/subsidiaries'
import SubsidiaryDetailClient from '../../../components/SubsidiaryDetailClient'

export const dynamicParams = false

export function generateStaticParams() {
  return SUBSIDIARIES.map((s) => ({ slug: s.id }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const s = getSubsidiary(slug)
  if (!s) return {}
  return {
    title: `${s.name} — Xanadu`,
    description: s.description,
    alternates: { canonical: `/subsidiaries/${slug}` },
  }
}

export default async function SubsidiaryDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const s = getSubsidiary(slug)
  if (!s) notFound()
  return <SubsidiaryDetailClient id={slug} />
}
