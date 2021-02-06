import type { CeramicApi } from '@ceramicnetwork/common'
import { IDX } from '@ceramicstudio/idx'

declare global {
  interface Window {
    idx?: IDX
  }
}

const aliases = {
  secretNotes: 'kjzl6cwe1jw14b03qkg5rl0dmq44yjayvku5yvca69fhokexzodwpbjb2zgqusj'
}

export function createIDX(ceramic: CeramicApi): IDX {
  const idx = new IDX({ ceramic, aliases })
  window.idx = idx
  return idx
}
