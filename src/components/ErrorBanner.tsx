export function ErrorBanner({ message }: { message: string }) {
  return (
    <div className="bg-[#f6dcd4] border border-[#a8432a]/40 rounded-lg p-4 mb-6 text-[#8c3a24] pulse-danger animate-[fadeIn_0.3s_ease-in]">
      {message}
    </div>
  )
}
