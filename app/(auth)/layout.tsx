export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-[100dvh] w-full overflow-x-hidden bg-gradient-to-br from-gray-900 to-black">
      <div className="min-h-[100dvh] flex items-center justify-center w-full">
        <div className="w-full max-w-[800px] p-4">
          {children}
        </div>
      </div>
    </div>
  );
}
