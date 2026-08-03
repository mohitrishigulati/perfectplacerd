export const BRAND = {
  tagline: "Empowering ambition. Connecting talent.",
  established: "Est. 1992",
  yearsLabel: "30+ years",
  offices: "Noida · Mumbai · Chennai",
  email: "cv@perfectplacer.in",
  domain: "perfectplacer.in",
} as const;

export const OFFICES = [
  {
    city: "Noida",
    region: "Delhi NCR — Head Office",
    contact: "P.G. Ganesh",
    phone: "+91 8368 469 496",
    email: "pgganesh@perfectplacer.in",
    address:
      "D-925A Urbtech Trade Centre, Sector 132, Noida 201304",
  },
  {
    city: "Mumbai",
    region: "Maharashtra",
    contact: "P G Krishnan",
    phone: "+91 8657606116",
    email: "krishnan@perfectplacer.in",
  },
  {
    city: "Chennai",
    region: "Tamil Nadu",
    contact: "S. Ramachandran",
    phone: "+91 9884274028",
    email: "ramachandran@perfectplacer.in",
  },
] as const;

export const SERVICES = [
  {
    title: "Executive Search",
    description:
      "Result-oriented leaders for the pivotal, can't-get-it-wrong roles at the top of your organisation.",
  },
  {
    title: "HR Consulting",
    description:
      "The special, sensitive HR mandates that don't fit a template — handled by advisors who've seen them before.",
  },
  {
    title: "Training & Mentoring",
    description:
      "Because the right hire is a beginning. We help leaders land, settle, and move on to higher roles.",
  },
] as const;

export const CLIENT_NAMES = [
  "Reliance",
  "SRF",
  "Vedanta",
  "Honeywell",
  "Kotak Neo",
  "Murugappa",
  "IIFL Capital",
  "HDFC ERGO",
  "HDFC Securities",
  "Polyplex",
  "The Sanmar Group",
  "Omega Healthcare",
  "GMR",
  "Caterpillar",
  "Aditya Birla Group",
  "Novartis",
  "Bayer",
  "IBM",
  "Religare",
] as const;

export const CREDIBILITY_STATS = [
  { value: "30+", label: "Years in executive search", sub: BRAND.established },
  { value: "3", label: "Offices nationwide", sub: BRAND.offices },
  { value: "10+", label: "Years with many clients", sub: "Long-term retained relationships" },
] as const;
