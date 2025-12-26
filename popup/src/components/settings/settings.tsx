import { Button, Flex, Form, Input } from "antd";
import { useApiKeyContext } from "../../contexts/api-key-context";
import { useEffect } from "react";

export default function Settings() {
  const { openApiKey, setOpenApiKey } = useApiKeyContext();
  const [form] = Form.useForm();

  useEffect(() => {
    form.setFieldsValue({ openApiKey: openApiKey! });
  }, [openApiKey, form]);

  return (
    <Form
      form={form}
      initialValues={{ openApiKey: openApiKey! }}
      style={{ height: "100%" }}
      onFinish={(values) => {
        if (values.openApiKey) {
          setOpenApiKey?.(values.openApiKey);
        }
      }}
    >
      <Flex
        vertical
        gap={16}
        // justify="space-between"
        style={{ height: "100%" }}
      >
        <Form.Item label="OpenAI API Key" name="openApiKey">
          <Input.Password placeholder="OpenAI API Key" />
        </Form.Item>
        <Button type="primary" style={{ marginBottom: 20 }} htmlType="submit">
          Save
        </Button>
      </Flex>
    </Form>
  );
}
