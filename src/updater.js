const localVersion = require('./version.json').version

async function checkForUpdates() {
  try {
    const response = await fetch('https://raw.githubusercontent.com/koukyoukoku/ambasplit/main/version.json')
    if (!response.ok) {
      console.error('Failed to fetch version info:', response.statusText)
      return null
    }  
    const remoteVersionInfo = await response.json()
    if (remoteVersionInfo.version !== localVersion) {
      return remoteVersionInfo
    }
    return null
    } catch (error) {
        console.error('Error checking for updates:', error)
        return null
    }
}

module.exports = {
  checkForUpdates
}