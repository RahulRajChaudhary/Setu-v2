export type Persona = "founder" | "engineering-lead" | "compliance-officer";

export type PersonaConfig = {
  id: Persona;
  label: string;
  routeBase: string;
  identity: {
    name: string;
    role: string;
    initials: string;
  };
};

export const PERSONAS: Record<Persona, PersonaConfig> = {
  founder: {
    id: "founder",
    label: "Founder",
    routeBase: "/founder",
    identity: {
      name: "Dhruv Singla",
      role: "Founder",
      initials: "DS",
    },
  },
  "engineering-lead": {
    id: "engineering-lead",
    label: "Engineering Lead",
    routeBase: "/engineering-lead",
    identity: {
      name: "Priyanka Rao",
      role: "Engineering Lead",
      initials: "PR",
    },
  },
  "compliance-officer": {
    id: "compliance-officer",
    label: "Compliance Officer",
    routeBase: "/compliance-officer",
    identity: {
      name: "Neha Kapoor",
      role: "Compliance Officer",
      initials: "NK",
    },
  },
};

export const PERSONA_LIST: PersonaConfig[] = Object.values(PERSONAS);

const DEFAULT_PERSONA: Persona = "founder";

export function personaFromPathname(pathname: string | null | undefined): Persona {
  if (!pathname) return DEFAULT_PERSONA;
  const segment = pathname.split("/")[1];
  if (segment === "engineering-lead" || segment === "compliance-officer") return segment;
  return DEFAULT_PERSONA;
}

export function personaConfigFromPathname(pathname: string | null | undefined): PersonaConfig {
  return PERSONAS[personaFromPathname(pathname)];
}
