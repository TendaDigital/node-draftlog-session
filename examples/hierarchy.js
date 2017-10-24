const Session = require('../')

const sleep = ms => new Promise((res, rej) => setTimeout(res, ms))

;(async () => {
  let session = new Session(5)

  session.step = 'Initializing'
  await sleep(100)

  session.step = 'Doing something'
  session.status = 'One thing...'
  await sleep(400)
  session.status = 'One more thing...'
  await sleep(400)

  session.step = 'Finishing up'
  session.skip()

  await subchild(session)

  session.step = 'Loading'
  let steps = 10
  session.startProgress(steps)
  while (steps--) {
    session.progress()
    await sleep(200)
  }

  session.step = 'Completed. Cleaning up'

  session.step = 'One more extra step...'

  session.finish()
})()


async function subchild(parent) {
  let steps = 4

  let session = new Session(steps, parent)
  session.log('Subchild')

  while(steps--) {
    session.step = 'Step #' + steps

    let dummy = 10
    session.startProgress(dummy)
    while(dummy--) {
      session.progress()
      await sleep(100)
    }
  }

  session.finish()
}