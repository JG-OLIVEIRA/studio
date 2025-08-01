
import { redirect } from "next/navigation";

// This page just redirects to the login page.
export default function AdminRootPage() {
    redirect('/admin/login');
}
