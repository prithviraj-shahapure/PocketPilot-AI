export const exportService = {
  exportData(data: any[], filename: string, format: 'CSV' | 'JSON') {
    if (format === 'JSON') {
      const jsonStr = JSON.stringify(data, null, 2);
      this.triggerDownload(jsonStr, `${filename}.json`, 'application/json');
    } else {
      if (data.length === 0) return;
      const headers = Object.keys(data[0]).join(',');
      const rows = data.map((row) =>
        Object.values(row)
          .map((v) => `"${String(v ?? '').replace(/"/g, '""')}"`)
          .join(',')
      );
      const csvStr = [headers, ...rows].join('\n');
      this.triggerDownload(csvStr, `${filename}.csv`, 'text/csv');
    }
  },

  triggerDownload(content: string, filename: string, mimeType: string) {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }
};
