interface MediaDevices {
  getDesktopSources: () => Promise<Electron.DesktopCapturerSource[]>
}
