import { Moon, Sunrise, Sun, Sunset } from "lucide-react";

type TimeOfDay = "morning" | "afternoon" | "evening" | "night";

function getTimeOfDay(date: Date): TimeOfDay {
  const hour = date.getHours();
  if (hour < 5) return "night";
  if (hour < 12) return "morning";
  if (hour < 17) return "afternoon";
  if (hour < 21) return "evening";
  return "night";
}

const GREETING_TEXT: Record<TimeOfDay, string> = {
  morning: "Good Morning,",
  afternoon: "Good Afternoon,",
  evening: "Good Evening,",
  night: "Good Night,",
};

function GreetingIcon({ timeOfDay }: { timeOfDay: TimeOfDay }) {
  if (timeOfDay === "night") return <Moon size={18} color="#C7D2FE" fill="#C7D2FE" />;
  if (timeOfDay === "morning") return <Sunrise size={18} color="#FDE68A" />;
  if (timeOfDay === "afternoon") return <Sun size={18} color="#FDE68A" fill="#FDE68A" />;
  return <Sunset size={18} color="#FDBA74" />;
}

const WORKSPACE_LINE: Record<TimeOfDay, string> = {
  morning: "Here's where things stand today.",
  afternoon: "Here's how things are tracking.",
  evening: "Here's a look before you wrap up.",
  night: "Everything's quiet — here's the snapshot.",
};

export default function GreetingCard({ name }: { name: string }) {
  const timeOfDay = getTimeOfDay(new Date());

  return (
    <div
      className="
        flex h-full min-h-[5.5rem] w-full flex-col justify-between gap-1.5 rounded-[1rem]
        border border-white/10 bg-[var(--accent-solid)] p-[clamp(0.625rem,3.5cqi,0.875rem)]
      "
      style={{ boxShadow: "var(--card-shadow)", containerType: "inline-size" }}
    >
      <p className="flex items-center gap-1.5 text-[clamp(0.8125rem,4cqi,0.9375rem)] text-white/70">
        <GreetingIcon timeOfDay={timeOfDay} />
        {GREETING_TEXT[timeOfDay]}
      </p>
      <p className="text-[clamp(1.5rem,9cqi,2.125rem)] font-semibold leading-tight tracking-tight text-white">{name}</p>
      <p className="text-[clamp(0.75rem,4cqi,0.875rem)] text-white/60">{WORKSPACE_LINE[timeOfDay]}</p>
    </div>
  );
}
