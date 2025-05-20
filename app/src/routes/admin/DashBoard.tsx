import InfoBox from "@/components/admin/InfoBox.tsx";
import ChartBox from "@/components/admin/ChartBox.tsx";
import CommunityBanner from "@/components/admin/CommunityBanner.tsx";

function DashBoard() {
  return (
    <div className={`dashboard`}>
      <CommunityBanner />
      <InfoBox />
      <ChartBox />
    </div>
  );
}

export default DashBoard;
