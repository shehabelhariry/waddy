import { useState } from "react";

import { InboxOutlined } from "@ant-design/icons";
import { Flex, Space, Spin, UploadProps } from "antd";
import Dragger from "antd/es/upload/Dragger";
import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf.mjs";
import pdfjsWorker from "pdfjs-dist/build/pdf.worker.mjs?url";
import { message } from "antd";
import { getCvJsonFromExtractedText } from "../../../actions";
import { setCvInStorage } from "../../../storage";
import { CvType } from "../../../baseCV";

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

interface UploadCvButtonProps {
  setCvObject: (cv: CvType) => void;
}

export default function UploadCVButton({ setCvObject }: UploadCvButtonProps) {
  const [cvUploadLoading, setCvUploadLoading] = useState(false);
  const props: UploadProps = {
    name: "file",
    multiple: true,
    beforeUpload: () => {
      return false;
    },
    async onChange(info) {
      const { status } = info.file;

      if (status !== "uploading") {
        setCvUploadLoading(true);
        const file = info.fileList[0]?.originFileObj;

        if (!file) return;
        const arrayBuffer = await file.arrayBuffer();
        const uint8Array = new Uint8Array(arrayBuffer);

        // Load the PDF
        const loadingTask = pdfjsLib.getDocument({
          data: uint8Array,
        });

        const pdfDocument = await loadingTask.promise;

        // Extract text from all pages
        let fullText = "";

        for (let pageNum = 1; pageNum <= pdfDocument.numPages; pageNum++) {
          const page = await pdfDocument.getPage(pageNum);
          const textContent = await page.getTextContent();
          // @ts-ignore
          const pageText = textContent.items.map((item) => item.str).join(" ");
          fullText += pageText + "\n\n";
        }

        const cv = await getCvJsonFromExtractedText(fullText);
        // Setting CV in memory
        setCvObject(cv);

        await setCvInStorage(cv);
        setCvUploadLoading(false);
      }
      if (status === "done") {
        console.log(info.file);
        // await summarizeCV({ formData: e.dataTransfer.files[0] });
        message.success(`${info.file.name} file uploaded successfully.`);
      } else if (status === "error") {
        message.error(`${info.file.name} file upload failed.`);
      }
    },
    async onDrop(e) {
      console.log("Dropped files", e.dataTransfer.files);
    },
    showUploadList: false,
  };

  return (
    <Dragger {...props}>
      <p className="ant-upload-drag-icon">
        <InboxOutlined />
      </p>

      {cvUploadLoading ? (
        <Flex justify="center" align="center">
          <Space>
            <Spin />
            <p>Preparing Your CV</p>
          </Space>
        </Flex>
      ) : (
        <>
          <p className="ant-upload-text">Upload your CV</p>
          <p className="ant-upload-hint">
            Upload your CV here to get Started and Waddy!
          </p>
        </>
      )}
    </Dragger>
  );
}
