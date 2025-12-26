interface SettingsProps {
  openApiKey?: string | null;
  setOpenApiKey?: (key: string | null) => void;
}

export default function Settings({}: SettingsProps) {
  return <div>Settings damn</div>;
}
