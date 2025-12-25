import { JobData } from "../../types";
import { Button } from "antd";

interface JobCardProps {
  jobData?: JobData | null;
}
export default function JobCard({ jobData }: JobCardProps) {
  if (!jobData) {
    return (
      <p>
        No job info is detected, please go to your LinkedIn Jobs Recommended
        page:
        <Button
          type="link"
          target="_blank"
          href="https://www.linkedin.com/jobs/collections/recommended"
        >
          Here
        </Button>
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
