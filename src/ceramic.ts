import type { CeramicApi } from '@ceramicnetwork/common'
import Ceramic from '@ceramicnetwork/http-client'

declare global {
  interface Window {
    ceramic?: CeramicApi
  }
}

export async function createCeramic(): Promise<CeramicApi> {
  const ceramic = new Ceramic('https://dev-ceramic-node.paidnetwork.com');
  window.ceramic = ceramic;
  return Promise.resolve(ceramic as CeramicApi);
}
