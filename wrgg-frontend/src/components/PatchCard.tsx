type Patch = {
  patch_name: string;
  champion_name: string;
  change_details: string;
};

export default function PatchCard({ patch_name, champion_name, change_details }: Patch) {
  return (
    <div className="border rounded p-2 shadow">
      <div className="font-bold">{champion_name}（v{patch_name}）</div>
      <div>{change_details}</div>
    </div>
  );
}
