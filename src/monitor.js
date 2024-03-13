const os = require('node:os')
const colors = require("fluent-interface-colors")

function systemMonitor() {
  /*

    !-- UTILITIES --!
  
  */
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

  const osType = () => {
    const osName = os.type()
    switch (osName) {
      case 'Windows_NT':
        return colors.bold.blue.format("Windows")
      case 'Darwin':
        return colors.bold.cyan.format("MacOS")
      default:
        return colors.bold.green.format(osName)
    }
  }

  const uptime = () => {
    const upTime = os.uptime()
    const hours = Math.floor(upTime/3600)
    const minutes = Math.floor((upTime%3600)/60)
    return [hours, minutes]
  }

  /*

    !-- MONITORS --!

  */

  const memoryMonitor = (totalRam) => {
    const [freeRam, percentageFree] = calculateRAMUsage(totalRam)
    colors.bold.log(`Free RAM: ${percentageFree}, ${freeRam}/${totalRam} GB`)
  }

  const cpuMonitor = (cpuTimes, oldCpuTimes) => {
    const previousTimes = oldCpuTimes
    const currentTimes = cpuTimes

    let count = 1
    previousTimes.map((cpu, index) => {
      const usage = caluclateCPUUsage(previousTimes[index], currentTimes[index])
      colors.bold.log(`CPU${count}: `, usage)
      count+=1
    })
  }

  const osMonitor = (osName) => {
    const [hours, minutes] = uptime()

    console.log(`${osName}, running for ${hours} hours and ${minutes} minutes`)
  }

  const monitor = (interval) => {
    //Constants to avoid redundancy
    const totalRam = Math.round(100*(os.totalmem()/1073741824))/100
    const osName = osType()

    let oldCpuTimes = os.cpus().map((cpu) => cpu.times)
    setInterval(() => {
      let cpuTimes = os.cpus().map((cpu) => cpu.times)

      process.stdout.write('\x1b[2J\x1b[1;1H')
      colors.bold.bgmagenta.log("!--   CPU   --!")
      cpuMonitor(cpuTimes, oldCpuTimes)
      colors.bold.bgmagenta.log("!-- MEMORY  --!")
      memoryMonitor(totalRam)
      colors.bold.bgmagenta.log("!-- SYSTEM  --!")
      osMonitor(osName)
      
    }, interval);
  }

  return (interval = 1000) => {
    monitor(interval)
  }
}

module.exports = systemMonitor()