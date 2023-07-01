export function copyToClipboard(data: string) {
  // TODO: Toast?
  navigator.clipboard.writeText(data)
}
