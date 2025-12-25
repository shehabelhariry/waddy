import { JobData } from "../../types";

export default function JobCard({ jobData }: { jobData: JobData }) {
  return (
    <div className="job-card">
      <img src={jobData?.imageUrl} alt="Company Logo" className="job-logo" />
      <h2 className="job-title">{jobData?.title}</h2>
      <h3 className="company-name">{jobData?.company}</h3>
      <p className="job-location">Location: {jobData?.location}</p>
    </div>
  );
}
