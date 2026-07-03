export function downloadASCFile(filename, text) {
  const blob = new Blob([text], { type: "text/plain" });

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename.endsWith(".asc") ? filename : filename + ".asc";

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);
}
