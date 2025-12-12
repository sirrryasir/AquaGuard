import ReportForm from "@/components/report-form";
import { getWaterSources } from "@/lib/data";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function ReportPage() {
  const sources = await getWaterSources();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center py-6 px-4">
      <div className="w-full max-w-md w-full">
        <header className="mb-8 flex items-center">
          <Link
            href="/"
            className="mr-4 p-2 bg-white rounded-full text-gray-500 hover:text-blue-600 shadow-sm transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Report Issue</h1>
            <p className="text-gray-500 text-sm">
              Help your community by reporting water status.
            </p>
          </div>
        </header>

        <main className="bg-white p-6 rounded-3xl shadow-xl shadow-gray-100/50">
          <ReportForm sources={sources} />
        </main>

        <footer className="mt-8 text-center text-gray-400 text-xs">
          <p>AquaGuard Community Reporting Tool</p>
        </footer>
      </div>
    </div>
  );
}
