import EmptyState from "./EmptyState";

export default function ComingSoon({ persona, section }: { persona: string; section: string }) {
  return (
    <EmptyState
      title={`${section} isn't built yet for ${persona}`}
      description="This section will follow in a later session."
    />
  );
}
