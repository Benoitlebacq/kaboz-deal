/**
 * Layout passthrough : le chrome (barre + déconnexion) est fourni par
 * <AdminShell> côté pages authentifiées, pour que /admin/login reste nu.
 */
export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="min-h-dvh">{children}</div>;
}
