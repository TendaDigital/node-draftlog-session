const chalk = require('chalk')
const draftlog = require('draftlog').into(console)

module.exports = class DraftlogSession {
  constructor(steps, parent) {
    this.steps = steps
    this.stepName = ''
    this.stepNumber = 0

    // Step Draft
    this.stepText = ''
    this.stepDraft = null

    // Status Draft
    this.statusText = ''
    this.statusDraft = null

    // Start time
    this.timeStart = Date.now()

    // Find out how "deep" this child is
    this.parent = parent
    this.childIndex = 0
    while(parent){
      this.childIndex++
      parent = parent.parent
    }
  }

  get indentation() {
    return this._indentation || (this._indentation = '  '.repeat(this.childIndex))
  }

  finish() {
    let duration = Math.round((Date.now() - this.timeStart) / 10) / 100
    this.status = `${this.indentation}Done in ${duration}s.`
  }

  totalStepStr() {
    return this.stepNumber + (this.steps ? `/${this.steps}` : '')
  }

  updateStep(status, n = null) {
    if (!n && this.stepName != status) {
      this.stepNumber ++
    } else {
      this.stepNumber = n
    }

    // Increase step if exceeded
    if (this.steps < this.stepNumber) {
      this.steps = this.stepNumber
    }

    // Update drafts
    this.stepDraft = this.statusDraft || console.draft()
    this.statusText = null
    this.statusDraft = null

    // Build and Update text
    this.stepText = status
    this.stepDraft(chalk.dim(`${this.indentation}[${this.totalStepStr()}] ✓ `) + this.stepText)
  }

  updateStatus(status) {
    this.statusDraft = this.statusDraft || console.draft()
    this.statusDraft(status)
  }

  skip() {
    this.stepDraft(chalk.dim(`${this.indentation}[${this.totalStepStr()}] ✗ `) + chalk.dim(this.stepText + ' (skipped)'))
  }

  set step(name) {
    this.updateStep(name)
  }

  set status(status) {
    this.updateStatus(status)
  }

  log(str, ...args) {
    console.log(`${this.indentation}${str}`, ...args)
  }

  startProgress(total, msg) {
    this.progressStep = this.stepNumber
    this.progressMsg = msg || ''
    this.progressTotal = total
    this.progressCurrent = 0
    this.progress(0)
  }

  progress(current, total, msg) {
    msg = (msg !== undefined ? msg : this.progressMsg ) || ''
    total = (total !== undefined ? total : this.progressTotal )
    current = (current !== undefined ? current : (this.progressCurrent + 1) )

    
    // Save for posterior defaults
    this.progressMsg = msg
    this.progressTotal = total
    this.progressCurrent = current

    // Filter total/current
    total = total ? total : '?'
    current = current ? current : '?'
    current = current < 0 ? 0 : current
    current = current > total ? total : current

    // Get terminal width
    let width = process.stdout.columns

    // Status Text
    let statusText = ` ${current}/${total}`

    // Compute bar width
    let barWidth = (width - msg.length -  statusText.length - this.indentation.length - 2)
    let barFill = Math.floor(barWidth * (current / total)) || 0
    let barEmpty = barWidth - barFill

    // Build final bar
    let bar = this.indentation + msg + '' + chalk.green('█'.repeat(barFill)) + chalk.dim('░'.repeat(barEmpty)) + chalk.yellow(statusText)

    // Update bar
    this.status = bar
  }
}