function getGreeting(date: Date): string {
  const hour = date.getHours();
  if (hour < 12) return "Good Morning,";
  if (hour < 17) return "Good Afternoon,";
  return "Good Evening,";
}

export default function GreetingCard({ name }: { name: string }) {
  const greeting = getGreeting(new Date());

  return (
    <div
      className="
        flex h-[154px] w-full flex-col justify-center gap-2 rounded-[16px]
        border border-white/10 bg-[var(--icon-btn-navy)] p-[var(--card-pad)]
      "
      style={{ boxShadow: "var(--card-shadow)" }}
    >
      <p className="text-[length:var(--font-body)] text-white/70">{greeting}</p>
      <p className="text-2xl font-bold leading-tight text-white">{name}</p>
    </div>
  );
}
