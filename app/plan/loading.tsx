export default function Loading() {
  return (
    <main className="mx-auto max-w-[760px] px-5 pt-20" aria-busy="true" aria-label="Loading your plan">
      <div className="skeleton h-4 w-36" />
      <div className="skeleton mt-4 h-14 w-80 max-w-full" />
      <div className="skeleton mt-3 h-5 w-96 max-w-full" />
      {[0, 1, 2].map((i) => <div key={i} className="skeleton mt-6 h-56 w-full rounded-[22px]" />)}
    </main>
  );
}
