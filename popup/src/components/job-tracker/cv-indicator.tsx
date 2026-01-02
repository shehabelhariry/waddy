import { DeleteOutlined } from "@ant-design/icons";
import { Button, Space, Typography } from "antd";
import { removeCvFromStorage } from "../../storage";
import { CV } from "../../actions/generate-resume/types";

interface CvIndicatorProps {
  cvObject: CV | undefined;
  setCvObject: (cv: CV | undefined) => void;
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
      <Typography.Text>{cvObject?.name} CV.pdf</Typography.Text>
      <Button onClick={handleDelete} type="default" icon={<DeleteOutlined />} />
    </Space>
  );
}
