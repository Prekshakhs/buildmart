export function Loader({ size = "md", text = "" }) {
  const sizes = { sm: "w-4 h-4 border-2", md: "w-8 h-8 border-2", lg: "w-12 h-12 border-3" };
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-12">
      <div className={`${sizes[size]} border-steel-700 border-t-amber-400 rounded-full animate-spin`} />
      {text && <p className="text-steel-400 text-sm font-body">{text}</p>}
    </div>
  );
}

export function PageLoader() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <Loader size="lg" text="Loading…" />
    </div>
  );
}

export function ErrorMessage({ message, onRetry }) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-16 text-center">
      <div className="w-12 h-12 bg-red-400/10 rounded-full flex items-center justify-center">
        <span className="text-red-400 text-xl">!</span>
      </div>
      <p className="text-steel-300 font-body">{message || "Something went wrong"}</p>
      {onRetry && (
        <button onClick={onRetry} className="btn-outline text-xs">Try Again</button>
      )}
    </div>
  );
}

export function EmptyState({ icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-20 text-center">
      <div className="w-16 h-16 bg-steel-800 rounded-full flex items-center justify-center text-3xl">
        {icon || "📦"}
      </div>
      <div>
        <h3 className="font-display font-700 text-xl text-steel-200 uppercase">{title}</h3>
        {description && <p className="text-steel-500 text-sm mt-1 font-body">{description}</p>}
      </div>
      {action}
    </div>
  );
}

export function SkeletonCard() {
  return (
    <div className="card p-0 overflow-hidden">
      <div className="skeleton h-48 w-full rounded-none" />
      <div className="p-4 space-y-3">
        <div className="skeleton h-4 w-3/4 rounded" />
        <div className="skeleton h-3 w-1/2 rounded" />
        <div className="skeleton h-6 w-1/3 rounded" />
      </div>
    </div>
  );
}
