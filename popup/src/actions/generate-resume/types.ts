// Define the CV interface to match your JSON structure
export type Relevance = "high" | "medium" | "low";

export interface Contact {
  location: string;
  phone: string;
  email: string;
  linkedin: string;
}

export interface Role {
  title: string;
  start_date: string;
  end_date: string;
  responsibilities: string[];
  relevance?: Relevance;
}

export interface Experience {
  company: string;
  location: string;
  roles: Role[];
  relevance?: Relevance;
}

export interface Education {
  degree: string;
  institution: string;
  start_date: string;
  end_date: string;
  relevance?: Relevance;
}

export interface Certification {
  name: string;
  institution: string;
  date: string;
}

export interface CV {
  name: string;
  contact: Contact;
  title: string;
  summary: string;
  skills: string[];
  experience: Experience[];
  education: Education[];
  certifications: Certification[];
}
