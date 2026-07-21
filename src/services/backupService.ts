export const backupService = {
  createBackup(allData: Record<string, any>) {
    const backupObj = {
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      payload: allData,
    };
    const str = JSON.stringify(backupObj, null, 2);
    const blob = new Blob([str], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `PocketPilotAI_Backup_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }
};
