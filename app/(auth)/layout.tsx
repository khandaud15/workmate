export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="auth fixed inset-0 min-h-screen w-full bg-black">
      <div className="absolute inset-0 bg-gradient-to-br from-gray-900 to-black" />
      <div className="relative min-h-screen w-full flex items-center justify-center p-4">
        <div className="w-full max-w-[800px]">
          {children}
        </div>
      </div>
    </div>
  );
}
