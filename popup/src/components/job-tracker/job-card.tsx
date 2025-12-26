import { JobData } from "../../types";

interface JobCardProps {
  jobData?: JobData | null;
}
export default function JobCard({ jobData }: JobCardProps) {
  if (!jobData) {
    return (
      <p>
        No job info is detected, please go to your:
        <a
          type="link"
          target="_blank"
          className="link-primary"
          href="https://www.linkedin.com/jobs/collections/recommended"
        >
          LinkedIn recommended jobs page
        </a>
      </p>
    );
  }

  return (
    <div className="job-card">
      <img src={jobData?.imageUrl} alt="Company Logo" className="job-logo" />
      <h2 className="job-title">{jobData?.title}</h2>
      <h3 className="company-name">{jobData?.company}</h3>
      <p className="job-location">Location: {jobData?.location}</p>
    </div>
  );
}
