import { createCeramic } from 'paid-backend-library'
import { createIDX } from 'paid-backend-library'
import { getProvider } from 'paid-backend-library'


interface SecretNotes {
  notes: any[]
}

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

const updateProfile = async () => {
  const name = (document.getElementById('name') as HTMLInputElement).value
  const description = (document.getElementById('description') as HTMLInputElement).value
  await window.idx?.set('basicProfile', { name, description })
}

const retrieveProfile = async () => {
  const getDID:any = await window.idx?.get('basicProfile')
  //const name = getDID.name
  //const description = getDID.description
  return await getDID


}

const createNote = async () => {
  const record = (await window.idx?.get('secretNotes')) as SecretNotes || { notes: [] }
  const recipient = (document.getElementById('recipient') as HTMLInputElement).value
  const note = (document.getElementById('note') as HTMLInputElement).value
  const noteData = { recipient, note }
  const recipients = [window.did?.id as string] // always make ourselves a recipient
  if (recipient) recipients.push(recipient)
  const encryptedNote = await window.did?.createDagJWE(noteData, recipients)
  record.notes.push(encryptedNote)
  await window.idx?.set('secretNotes', record)
}

const loadNotes = async () => {
  const noteContainer = document.getElementById('allNotes')
  // @ts-ignore
  noteContainer?.innerHTML = ''
  let user = (document.getElementById('user') as HTMLInputElement).value || window.did?.id
  if (user && !user.startsWith('did')) {
    user = await ethAddressToDID(user)
  }
  const record = (await window.idx?.get('secretNotes', user)) as SecretNotes

  record?.notes.map(async (encryptedNote, mapindex) => {
    try {
      const { recipient, note } = await window.did?.decryptDagJWE(encryptedNote) as Record<string, any>
      let noteEntry = '<p>'
      if (recipient) {
        noteEntry += '<b>Recipient:</b> ' + (recipient || '--') + `<span id="name${mapindex}"></span>`
        addNameToNote(recipient, 'name' + mapindex)
      }
      noteEntry += '<br /><b>Note:</b> ' + note + '</p><hr />'
      // @ts-ignore
      noteContainer?.innerHTML += noteEntry
    } catch (e) {}
  })
}

const addNameToNote = async (recipient: string, elemId: string): Promise<void> => {
  const { name } = await window.idx?.get('basicProfile', recipient) as any || {}
  if (name) {
    const nameContainer = document.getElementById(elemId)
    // @ts-ignore
    nameContainer?.innerHTML = `<br /><b>Recipient name:</b> ${name}`
  }
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
  // @ts-ignore
  document.getElementById('profileloading')?.style?.display = 'block';
  await updateProfile()
  // @ts-ignore
  document.getElementById('profileloading')?.style?.display = 'none';
})

document.getElementById('retrieveProfile')?.addEventListener('click', async () => {
  // @ts-ignore
  document.getElementById('retrieveProfile')?.style?.display = 'block';
  const getDID = await retrieveProfile();

  
  // @ts-ignore
  //document.getElementById('retrieveProfile').val

  document.getElementById('name')!.innerText = getDID.name;

  document.getElementById('description')!.innerText = getDID.description;

})

document.getElementById('loadNotes')?.addEventListener('click', async () => {
  // @ts-ignore
  document.getElementById('loadloading')?.style?.display = 'block';
  await loadNotes()
  // @ts-ignore
  document.getElementById('loadloading')?.style?.display = 'none';
})

document.getElementById('createNote')?.addEventListener('click', async () => {
  // @ts-ignore
  document.getElementById('createloading')?.style?.display = 'block';
  await createNote()
  // @ts-ignore
  document.getElementById('createloading')?.style?.display = 'none';
})
