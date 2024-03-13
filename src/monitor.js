const os = require('node:os')
const colors = require("fluent-interface-colors")

function systemMonitor() {
  const caluclateCPUUsage = (initialTimes, times) => {
    const timesDeltas = {
      user: times.user - initialTimes.user,
      nice: times.nice - initialTimes. nice,
      sys: times.sys - initialTimes.sys,
      idle: times.idle - initialTimes.idle,
      irq: times.irq - initialTimes.irq
    }
    const total = timesDeltas.user + timesDeltas.nice + timesDeltas.sys + timesDeltas.idle + timesDeltas.irq
    return(Math.round(100-(timesDeltas.idle/total)*100)+"%")
  }

  const cpus = (mode) => {
    let initialTimes = os.cpus().map((cpu) => cpu.times)

    setInterval(() => {
      const currentTimes = os.cpus().map((cpu) => cpu.times)

      //Clear terminal window
      process.stdout.write('\x1b[2J\x1b[1;1H')

      let count = 1
      initialTimes.map((cpu, index) => {
        const usage = caluclateCPUUsage(initialTimes[index], currentTimes[index])
        if(count%2 === 0) colors.yellow.log(`CPU${count}: `, usage)
        else colors.log(`CPU${count}: `, usage)
        
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