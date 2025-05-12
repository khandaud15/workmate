export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="fixed inset-0 bg-gradient-to-br from-gray-900 to-black -z-10" />
      <div className="w-full max-w-[800px] p-4">
        {children}
      </div>
    </div>
  );
}
