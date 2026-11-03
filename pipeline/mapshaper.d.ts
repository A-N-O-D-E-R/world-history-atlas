declare module 'mapshaper' {
  const mapshaper: {
    applyCommands(
      commands: string,
      input: Record<string, string>,
    ): Promise<Record<string, Buffer | string>>
  }
  export default mapshaper
}
