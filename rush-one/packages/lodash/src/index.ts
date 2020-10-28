import showMessage from '@test/project-one'

export const get = () => {
  showMessage()
  throw new Error('stonks')
}
