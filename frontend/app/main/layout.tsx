import Sidebar from "@/app/main/sidebar";

export default function MainLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="bg-background min-h-screen">
            <Sidebar/>
            <div className="">
                {children}
            </div>
        </div>
    );
}