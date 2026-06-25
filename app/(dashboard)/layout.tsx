import { ReactNode } from "react";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";

interface DashboardLayoutProps {
    children: ReactNode;
}

export default async function layout({ children }: DashboardLayoutProps) {
    const session = await getServerSession(authOptions);

    if (!session) {
        redirect("/sign-in");
    } else return <>{children}</>;
}
