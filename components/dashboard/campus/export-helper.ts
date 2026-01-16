export const downloadCSV = (filename: string, headers: string[], rows: any[][]) => {
  const sanitize = (val: any) => {
    if (val === null || val === undefined) return "";
    const s = String(val).replace(/"/g, '""'); 
    return s.includes(",") || s.includes("\n") || s.includes('"') ? `"${s}"` : s;
  };

  const csvContent = [
    headers.join(","),
    ...rows.map(row => row.map(sanitize).join(","))
  ].join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement("a");
  if (link.download !== undefined) {
    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};