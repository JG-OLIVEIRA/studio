
import { redirect } from "next/navigation";

// This page just redirects to the dashboard page.
export default function AdminRootPage() {
    redirect('/admin/dashboard');
}
