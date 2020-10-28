import { get } from 'lodash'

export default () => {
  console.info('here is project two, and now we are getting...')
  console.info(get({ foo: 'bar' }, 'foo'))
}
