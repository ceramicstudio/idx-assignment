import type { DID } from 'dids'
import type { IDX } from '@ceramicstudio/idx'
import type { CeramicApi } from '@ceramicnetwork/common'

import { createCeramic } from './ceramic'
import { createIDX } from './idx'
import { getProvider } from './wallet'

declare global {
  interface Window {
    did?: DID
    idx?: IDX
    ceramic?: CeramicApi
    SECRET_NOTES_DEFINITION?: string
  }
}

interface SecretNotes {
  notes: any[]
}

const SECRET_NOTES_DEFINITION = 'kjzl6cwe1jw14b03qkg5rl0dmq44yjayvku5yvca69fhokexzodwpbjb2zgqusj'
window.SECRET_NOTES_DEFINITION = SECRET_NOTES_DEFINITION

const ceramicPromise = createCeramic()

const authenticate = async (): Promise<string> => {
  const [ceramic, provider] = await Promise.all([ceramicPromise, getProvider()])
  await ceramic.setDIDProvider(provider)
  const idx = createIDX(ceramic)
  window.did = ceramic.did
  return idx.id
}

const ethAddressToDID = async (address: string): Promise<string> => {
  const caip10Doc = await window.ceramic?.createDocument('caip10-link', {
    metadata: {
      family: 'caip10-link',
      controllers: [address.toLowerCase() + '@eip155:1']
    }
  })
  return caip10Doc?.content
}

document.getElementById('bauth')?.addEventListener('click', () => {
  // @ts-ignore
  document.getElementById('authloading')?.style?.display = 'block';

  authenticate().then(
    (id) => {
      console.log('Connected with DID:', id)
      // @ts-ignore
      document.getElementById('authloading')?.style.display = 'none';
      // @ts-ignore
      document.getElementById('main')?.style.display = 'block';
      (document.getElementById('bauth') as HTMLInputElement).disabled = true
    },
    (err) => {
      console.error('Failed to authenticate:', err)
      // @ts-ignore
      document.getElementById('authloading')?.style.display = 'none'
    }
  )
})


document.getElementById('updateProfile')?.addEventListener('click', async () => {
  const name = (document.getElementById('name') as HTMLInputElement).value
  const description = (document.getElementById('description') as HTMLInputElement).value
  await window.idx?.set('basicProfile', { name, description })
  console.log('Basic Profile set for', name)
})

document.getElementById('loadNotes')?.addEventListener('click', async () => {
  const noteContainer = document.getElementById('allNotes')
  // @ts-ignore
  noteContainer?.innerHTML = ''
  // @ts-ignore
  document.getElementById('loadloading')?.style?.display = 'block';
  let user = (document.getElementById('user') as HTMLInputElement).value || window.did?.id
  if (user && !user.startsWith('did')) {
    user = await ethAddressToDID(user)
  }
  const record = (await window.idx?.get(SECRET_NOTES_DEFINITION, user)) as SecretNotes

  record?.notes.map(async encryptedNote => {
    try {
      const { recipient, note } = await window.did?.decryptDagJWE(encryptedNote) as Record<string, any>
      let noteEntry = '<p>'
      if (recipient) {
        noteEntry += '<b>Recipient:</b> ' + recipient || '--'
        const { name } = await window.idx?.get('basicProfile', recipient) as any || {}
        if (name) {
          noteEntry += '<br /><b>Recipient name:</b> ' + name + '<br />'
        }
      }
      noteEntry += '<br /><b>Note:</b> ' + note + '</p><hr />'
      // @ts-ignore
      noteContainer?.innerHTML += noteEntry
    } catch (e) {}
  })
  // @ts-ignore
  document.getElementById('loadloading')?.style?.display = 'none';
})

document.getElementById('createNote')?.addEventListener('click', async () => {
  // @ts-ignore
  document.getElementById('createloading')?.style?.display = 'block';
  const record = (await window.idx?.get(SECRET_NOTES_DEFINITION)) as SecretNotes || { notes: [] }
  const recipient = (document.getElementById('recipient') as HTMLInputElement).value
  const note = (document.getElementById('note') as HTMLInputElement).value
  const noteData = { recipient, note }
  const recipients = [window.did?.id as string] // always make ourselves a recipient
  if (recipient) recipients.push(recipient)
  const encryptedNote = await window.did?.createDagJWE(noteData, recipients)
  record.notes.push(encryptedNote)
  await window.idx?.set(SECRET_NOTES_DEFINITION, record)
  // @ts-ignore
  document.getElementById('createloading')?.style?.display = 'none';
})
