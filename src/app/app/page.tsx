import { AppSpaceDashboard } from "@/components/app/app-space-dashboard";
import { EmptySpacesState } from "@/components/spaces/empty-spaces-state";
import { getSpaces } from "@/lib/spaces/get-spaces";

export default async function AppHomePage() {
  const spaces = await getSpaces();

  if (spaces.length === 0) {
    return (
      <div className="flex min-h-[calc(100vh-8rem)] flex-col items-center justify-center px-2">
        <EmptySpacesState />
      </div>
    );
  }

  return <AppSpaceDashboard />;
}
