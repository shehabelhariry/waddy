// Define the CV interface to match your JSON structure
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
}

export interface Experience {
  company: string;
  location: string;
  roles: Role[];
}

export interface Education {
  degree: string;
  institution: string;
  start_date: string;
  end_date: string;
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
