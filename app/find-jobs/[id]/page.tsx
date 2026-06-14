import { JobDetailsPageClient } from "@/components/job-details/JobDetailsPageClient";

export default async function JobDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <JobDetailsPageClient jobId={id} />;
}
