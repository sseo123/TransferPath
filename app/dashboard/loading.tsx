export default function DashboardLoading() {
  return (
    <div className="w-full max-w-5xl mx-auto p-8 animate-pulse">
      <div className="flex justify-between items-start mb-12 border-b border-slate-100 pb-8">
        <div>
          <div className="h-10 w-64 bg-slate-200 rounded-xl mb-4" />
          <div className="h-6 w-48 bg-slate-100 rounded-lg" />
        </div>
        <div className="flex gap-4">
          <div className="h-10 w-32 bg-slate-100 rounded-xl" />
          <div className="h-10 w-32 bg-slate-100 rounded-xl" />
        </div>
      </div>

      <div className="space-y-6">
        <div className="h-64 w-full bg-slate-50 rounded-[32px] border border-slate-100" />
        <div className="h-64 w-full bg-slate-50 rounded-[32px] border border-slate-100" />
      </div>
    </div>
  );
}
