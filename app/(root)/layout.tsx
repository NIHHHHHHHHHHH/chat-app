
// This layout wraps all pages inside the (root) group
// It shows the sidebar on every page

import Sidebar from "@/components/sidebar/Sidebar";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (

    <div className="flex h-screen overflow-hidden">
      {/* Sidebar — fixed width on left */}
      <Sidebar />
      {/* Main content — takes remaining space */}
      <main className="flex-1 overflow-hidden">
        {children}
      </main>
    </div>
  );
}