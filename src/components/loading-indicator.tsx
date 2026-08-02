type LoadingIndicatorProps = {
  visible: boolean;
  label?: string;
};

export function LoadingIndicator({ visible, label = "Loading…" }: Readonly<LoadingIndicatorProps>) {
  if (!visible) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="flex items-center gap-3 rounded-2xl bg-white px-6 py-4 shadow-xl border border-black/10">
        <div className="h-5 w-5 animate-spin rounded-full border-[3px] border-orange-200 border-t-orange-500" />
        <p className="text-sm font-medium text-zinc-600">{label}</p>
      </div>
    </div>
  );
}
