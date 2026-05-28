export default function HomeLoading() {
  return (
    <div className="flex h-screen items-center justify-center bg-rose-50">
      <div className="flex flex-col items-center gap-3">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-rose-200 border-t-rose-600" />
        <p className="text-sm text-rose-600">Loading calendar…</p>
      </div>
    </div>
  );
}
