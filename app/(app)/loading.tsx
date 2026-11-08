export default function Loading() {
  return (
    <div aria-busy="true" aria-label="Loading">
      <div className="skeleton h-4 w-28" />
      <div className="skeleton mt-3 h-12 w-64" />
      <div className="skeleton mt-8 h-40 w-full rounded-[24px]" />
      <div className="mt-4 grid gap-4 sm:grid-cols-3">
        {[0, 1, 2].map((i) => <div key={i} className="skeleton h-24 rounded-[20px]" />)}
      </div>
      <div className="skeleton mt-4 h-48 w-full rounded-[20px]" />
    </div>
  );
}
