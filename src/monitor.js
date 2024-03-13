const os = require('node:os')
const colors = require("fluent-interface-colors")

function systemMonitor() {
  const colorizePercentage = (percentage) => {
    if(percentage < 25) return colors.bggreen.format(percentage+"%")
    if(percentage < 60) return colors.bgyellow.format(percentage+"%")
    return colors.bgred.format(percentage+"%")
  }

  /*
    Calculate the difference between miliseconds spent in various cpu modes between initialTimes and times,
    then calculate percentage of idle vs non-idle distribution in those deltas
  */
  const caluclateCPUUsage = (initialTimes, times) => {
    const timesDeltas = {
      user: times.user - initialTimes.user,
      nice: times.nice - initialTimes. nice,
      sys: times.sys - initialTimes.sys,
      idle: times.idle - initialTimes.idle,
      irq: times.irq - initialTimes.irq
    }

    const total = timesDeltas.user + timesDeltas.nice + timesDeltas.sys + timesDeltas.idle + timesDeltas.irq
    const percentageUsed = Math.round(100-(timesDeltas.idle/total)*100)

    return colorizePercentage(percentageUsed)
  }

  const cpus = (mode) => {
    let initialTimes = os.cpus().map((cpu) => cpu.times)

    return setInterval(() => {
      const currentTimes = os.cpus().map((cpu) => cpu.times)

      //Clear terminal window
      process.stdout.write('\x1b[2J\x1b[1;1H')

      let count = 1
      initialTimes.map((cpu, index) => {
        const usage = caluclateCPUUsage(initialTimes[index], currentTimes[index])
        colors.bold.log(`CPU${count}: `, usage)
        count+=1
      })

      initialTimes = currentTimes
    }, 1000)
  }


  return () => {
      cpus()
    }
}

module.exports = systemMonitor()