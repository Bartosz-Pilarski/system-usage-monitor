const os = require('node:os')
const colors = require("fluent-interface-colors")

function systemMonitor() {
  const colorizePercentage = (percentage) => {
    if(percentage < 25) return colors.bggreen.format(percentage+"%")
    if(percentage < 75) return colors.bgyellow.format(percentage+"%")
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
    const percentageFree = Math.round(100-(timesDeltas.idle/total)*100)

    return colorizePercentage(percentageFree)
  }
  /*
    Convert free RAM to from bytes to GBs and calculate % of free memory. 
    Returns both GBs of free RAM and the percentage
  */
  const calculateRAMUsage = (totalMem) => {
    const freeRam = Math.round(100*(os.freemem()/1073741824))/100
    const percentageUsed = Math.round(100*(freeRam/totalMem))
    return [freeRam, colorizePercentage(percentageUsed)]
  }

  const cpus = (interval) => {
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
    }, interval)
  }
  const memory = (interval) => {
    const totalRam = Math.round(100*(os.totalmem()/1073741824))/100

    return setInterval(() => {
      //Clear terminal window
      process.stdout.write('\x1b[2J\x1b[1;1H')
      const [freeRam, percentageFree] = calculateRAMUsage(totalRam)
      colors.bold.log(`Free RAM: ${percentageFree}, ${freeRam}/${totalRam} GB`)
    }, interval);
  }

  const monitor = (interval) => {
    
  }

  return () => {
    memory(1000)
    }
}

module.exports = systemMonitor()