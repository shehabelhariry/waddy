import { AutoComplete, Button, Flex, Form, Input, Typography } from "antd";
import { useApiKeyContext } from "../../contexts/api-key-context";
import { useEffect } from "react";
import { AVAILABLE_MODELS } from "../../llm/models";

export default function Settings() {
  const { apiKey, setApiKey, modelId, setModelId } = useApiKeyContext();
  const [form] = Form.useForm();

  useEffect(() => {
    form.setFieldsValue({ apiKey: apiKey!, modelId });
  }, [apiKey, modelId, form]);

  return (
    <Form
      form={form}
      initialValues={{ apiKey: apiKey!, modelId }}
      style={{ height: "100%", padding: "20px 16px" }}
      onFinish={(values) => {
        if (values.apiKey) {
          setApiKey?.(values.apiKey);
        }
        if (values.modelId) {
          setModelId?.(values.modelId);
        }
      }}
    >
      <Flex vertical gap={16} style={{ height: "100%" }}>
        <Form.Item
          label="OpenRouter API Key"
          name="apiKey"
          extra={
            <Typography.Text type="secondary" style={{ fontSize: 12 }}>
              Get one at{" "}
              <a
                href="https://openrouter.ai/keys"
                target="_blank"
                rel="noreferrer"
              >
                openrouter.ai/keys
              </a>
            </Typography.Text>
          }
        >
          <Input.Password placeholder="OpenRouter API Key" />
        </Form.Item>

        <Form.Item
          label="Model"
          name="modelId"
          extra={
            <Typography.Text type="secondary" style={{ fontSize: 12 }}>
              Pick one or type any OpenRouter model id
            </Typography.Text>
          }
        >
          <AutoComplete
            placeholder="Select or type a model id"
            // Pick from the shortlist, or type any valid OpenRouter model id.
            options={AVAILABLE_MODELS.map((m) => ({
              value: m.id,
              label: `${m.label} — ${m.id}`,
            }))}
            filterOption={(input, option) =>
              (option?.value ?? "")
                .toString()
                .toLowerCase()
                .includes(input.toLowerCase()) ||
              (option?.label ?? "")
                .toString()
                .toLowerCase()
                .includes(input.toLowerCase())
            }
          />
        </Form.Item>

        <Button type="primary" style={{ marginBottom: 20 }} htmlType="submit">
          Save
        </Button>
      </Flex>
    </Form>
  );
}
