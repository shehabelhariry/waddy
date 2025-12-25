import { DeleteOutlined } from "@ant-design/icons";
import { CvType } from "../../baseCV";
import { Button, Space, Typography } from "antd";
import { removeCvFromStorage } from "../../storage";

interface CvIndicatorProps {
  cvObject: CvType | undefined;
  setCvObject: (cv: CvType | undefined) => void;
}
export default function CvIndicator({
  cvObject,
  setCvObject,
}: CvIndicatorProps) {
  const handleDelete = () => {
    setCvObject(undefined);
    removeCvFromStorage();
  };
  return (
    <Space>
      <Typography.Text strong>{cvObject?.name} CV.pdf</Typography.Text>
      <Button onClick={handleDelete} type="default" icon={<DeleteOutlined />} />
    </Space>
  );
}
