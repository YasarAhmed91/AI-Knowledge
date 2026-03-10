import { useRef } from "react";
import { booksAPI } from "../api/api";

export default function UploadZone() {
  const fileInput = useRef();

  const handleClick = () => {
    fileInput.current.click();
  };

  const handleFile = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await booksAPI.upload(formData);
      alert("Upload successful!");
      console.log(res);
    } catch (err) {
      console.error(err);
      alert("Upload failed");
    }
  };

  return (
    <>
      <input
        type="file"
        accept="application/pdf"
        ref={fileInput}
        style={{ display: "none" }}
        onChange={handleFile}
      />

      <div
        className="upload-zone glass"
        onClick={handleClick}
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: 280,
          cursor: "pointer",
        }}
      >
        <div style={{ fontSize: 40, marginBottom: 12 }}>📤</div>
        <div style={{ fontWeight: 700, marginBottom: 4 }}>Upload PDF</div>
        <div style={{ fontSize: 12, color: "var(--text-muted)" }}>
          Click to upload
        </div>
        <div style={{ marginTop: 12 }} className="badge badge-cyan">
          AI processing in ~30s
        </div>
      </div>
    </>
  );
}