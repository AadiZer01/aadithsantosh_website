export default function Footer() {
  return (
    <footer className="bg-paper border-t border-line mt-auto">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-center">
        <p className="text-sm text-muted">
          &copy; {new Date().getFullYear()} Aadith Santosh | Disclaimer
        </p>
      </div>
    </footer>
  )
}
