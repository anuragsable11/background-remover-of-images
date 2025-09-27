document.addEventListener("DOMContentLoaded", () => {
  const dropZone = document.getElementById("dropZone");
  const input = document.getElementById("imageInput");
  const progress = document.getElementById("progress");
  const resultArea = document.getElementById("resultArea");
  const previewImage = document.getElementById("previewImage");
  const downloadLink = document.getElementById("downloadLink");
  const clearBtn = document.getElementById("clearBtn");
  const errorBox = document.getElementById("errorBox");

  let currentFile = null;

  // Drag & Drop
  dropZone.addEventListener("dragover", (e) => {
    e.preventDefault();
    dropZone.classList.add("dragover");
  });
  dropZone.addEventListener("dragleave", () => {
    dropZone.classList.remove("dragover");
  });
  dropZone.addEventListener("drop", (e) => {
    e.preventDefault();
    dropZone.classList.remove("dragover");
    if (e.dataTransfer.files.length > 0) {
      handleFile(e.dataTransfer.files[0]);
    }
  });

  // Browse button
  input.addEventListener("change", () => {
    if (input.files.length > 0) {
      handleFile(input.files[0]);
    }
  });

  clearBtn.addEventListener("click", () => {
    currentFile = null;
    input.value = "";
    resultArea.classList.add("d-none");
    errorBox.classList.add("d-none");
  });

  async function handleFile(file) {
    if (!file.type.startsWith("image/")) {
      showError("Please upload a valid image file.");
      return;
    }
    currentFile = file;
    await uploadFile(file);
  }

  async function uploadFile(file) {
    progress.classList.remove("d-none");
    resultArea.classList.add("d-none");
    errorBox.classList.add("d-none");

    const formData = new FormData();
    formData.append("image", file);

    try {
      const resp = await fetch("/remove", { method: "POST", body: formData });
      if (!resp.ok) {
        const err = await resp.json().catch(() => ({ error: "Unknown error" }));
        throw new Error(err.error || "Server error");
      }
      const blob = await resp.blob();
      const url = URL.createObjectURL(blob);
      previewImage.src = url;
      downloadLink.href = url;
      downloadLink.download = file.name.replace(/\.[^/.]+$/, "") + "_no_bg.png";
      resultArea.classList.remove("d-none");
    } catch (err) {
      showError("Failed to process image: " + err.message);
    } finally {
      progress.classList.add("d-none");
    }
  }

  function showError(msg) {
    errorBox.textContent = msg;
    errorBox.classList.remove("d-none");
  }
});
