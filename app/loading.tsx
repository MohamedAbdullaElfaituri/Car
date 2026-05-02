export default function Loading() {
  return (
    <div className="pointer-events-none fixed inset-x-0 top-0 z-50 h-1 overflow-hidden bg-red-100">
      <div className="h-full w-1/2 animate-pulse rounded-l-full bg-brand-red" />
    </div>
  );
}
