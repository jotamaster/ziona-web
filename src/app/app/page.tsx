import { AppHomeDashboard } from "@/components/app/app-home-dashboard";
import { EmptyHomesState } from "@/components/homes/empty-homes-state";
import { getHomes } from "@/lib/homes/get-homes";

export default async function AppHomePage() {
  const homes = await getHomes();

  if (homes.length === 0) {
    return (
      <div className="flex min-h-[calc(100vh-8rem)] flex-col items-center justify-center px-2">
        <EmptyHomesState />
      </div>
    );
  }

  return <AppHomeDashboard />;
}
