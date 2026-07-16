export default function OfflinePage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 flex items-center justify-center p-6">
      <div className="text-center max-w-sm">
        <div className="text-8xl mb-6">😅</div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">Nuk ka internet</h1>
        <p className="text-gray-500 dark:text-gray-400 mb-2">Mos u dorëzo — provo përsëri kur të rikthehet lidhja.</p>
        <p className="text-gray-400 dark:text-gray-500 text-sm mb-8">
          Mësimet e fundit të cilat i ke parë mund të jenë ende të disponueshme.
        </p>
        <button onClick={() => window.location.reload()}
          className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl transition-colors">
          🔄 Provo sërish
        </button>
      </div>
    </div>
  );
}
