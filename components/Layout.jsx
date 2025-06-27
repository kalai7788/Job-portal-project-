export default function Layout({ children }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-2xl">
        {children}
      </div>
    </div>
  );
}
