
import { Terminal } from "lucide-react";
import { LoginForm } from "./login-form";
import { verifySession } from "@/lib/session";
import { redirect } from "next/navigation";

export default async function AdminLoginPage() {
    const session = await verifySession();
    if(session) {
        redirect('/admin/dashboard');
    }

    return (
        <main className="flex items-center justify-center h-screen">
            <div className="relative mx-auto flex w-full max-w-[400px] flex-col space-y-2.5 p-4 ">
                <div className="flex h-20 w-full items-end rounded-lg bg-primary p-3 md:h-36">
                    <div className="flex items-center gap-2 text-white">
                        <Terminal className="h-8 w-8" />
                        <h1 className="text-2xl font-bold">Admin CcompTeacherRate</h1>
                    </div>
                </div>
                <LoginForm />
            </div>
        </main>
    )
}
