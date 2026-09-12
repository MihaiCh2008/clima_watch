export function ErrorBanner({ message }: { message: string }) {
  return (
    <div className="bg-red-500/15 backdrop-blur-md border border-red-500/50 rounded-lg p-4 mb-6 text-red-300 pulse-danger animate-[fadeIn_0.3s_ease-in]">
      {message}
    </div>
  )
}
