import { InsuranceForm } from "@/components/insurance-form";
import { Header } from "@/components/header";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Header />
        <div className="mt-8">
          <InsuranceForm />
        </div>
      </div>
    </div>
  );
}
