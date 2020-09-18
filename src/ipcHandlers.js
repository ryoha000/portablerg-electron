const os = require('os')
const { exec } = require('child_process');

module.exports.getPrivateIP = () => {
  const ips = getLocalAddress()
  if (ips.ipv4.length > 0) {
    return ips.ipv4[0].address
  }
  if (ips.ipv6.length > 0) {
    return ips.ipv6[0].address
  }
  throw 'there is no local address'
}

const getLocalAddress = () => {
  const ifacesObj = { ipv4: [], ipv6: [] }
  const interfaces = os.networkInterfaces();

  for (const dev in interfaces) {
    interfaces[dev].forEach(function(details){
      if (!details.internal) {
        switch(details.family){
          case "IPv4":
            ifacesObj.ipv4.push({ name:dev, address:details.address });
          break;
          case "IPv6":
            ifacesObj.ipv6.push({ name:dev, address:details.address })
          break;
        }
      }
    });
  }
  return ifacesObj;
}

module.exports.removePrevFireWall = (addr, port) => {
  exec(`netsh interface portproxy delete v4tov4 listenport=${port} listenaddr=${addr}`, (error, stdout, stderr) => {
    if (error) {
      console.error(`[ERROR] ${error}`);
      return;
    }
    console.log(`stdout: ${stdout}`);
    console.log(`stderr: ${stderr}`);
  });
  exec(`netsh advfirewall firewall delete rule name= rule name protocol=all localport=${port}`, (error, stdout, stderr) => {
    if (error) {
      console.error(`[ERROR] ${error}`);
      return;
    }
    console.log(`stdout: ${stdout}`);
    console.log(`stderr: ${stderr}`);
  });
}

module.exports.addNewFireWall = (addr, port) => {
  exec(`netsh interface portproxy add v4tov4 listenport=${port} listenaddr=${addr} connectport=${port} connectaddress=127.0.0.1`, (error, stdout, stderr) => {
    if (error) {
      console.error(`[ERROR] ${error}`);
      return;
    }
    console.log(`stdout: ${stdout}`);
    console.log(`stderr: ${stderr}`);
  });
  exec(`netsh advfirewall firewall add rule name= "Open Port ${port}" dir=in action=allow protocol=all localport=${port}`, (error, stdout, stderr) => {
    if (error) {
      console.error(`[ERROR] ${error}`);
      return;
    }
    console.log(`stdout: ${stdout}`);
    console.log(`stderr: ${stderr}`);
  });
}

module.exports.getSetting = async () => {
  const fs = require('fs');
  const path = require('path')

  const settingPath = path.join(__dirname, '../public/setting.json')
  try {
    const setting = await fs.promises.readFile(settingPath)
    return JSON.parse(setting)
  } catch (e) {
    const defaultSetting = {
      privateIP: this.getPrivateIP(),
      browserPort: 2401,
    }
    await fs.promises.writeFile(settingPath, JSON.stringify(defaultSetting));
    this.addNewFireWall(defaultSetting.privateIP, defaultSetting.browserPort)
    this.addNewFireWall(defaultSetting.privateIP, defaultSetting.browserPort + 1)
    return defaultSetting
  }
}

module.exports.updateSetting = async (newSetting) => {
  const fs = require('fs');
  const path = require('path')

  const settingPath = path.join(__dirname, '../public/setting.json')
  let prevSetting
  try {
    prevSetting = await fs.promises.readFile(settingPath)
  } catch (e) {
    prevSetting = {
      privateIP: this.getPrivateIP(),
      browserPort: 2401,
    }
  }
  await fs.promises.writeFile(settingPath, JSON.stringify(newSetting));
  this.removePrevFireWall(prevSetting.privateIP, prevSetting.browserPort)
  this.removePrevFireWall(prevSetting.privateIP, prevSetting.browserPort + 1)
  this.addNewFireWall(newSetting.privateIP, newSetting.browserPort)
  this.addNewFireWall(newSetting.privateIP, newSetting.browserPort + 1)
}

module.exports.resetSetting = async () => {
  const fs = require('fs');
  const path = require('path')

  const settingPath = path.join(__dirname, '../public/setting.json')
  const defaultSetting = {
    privateIP: this.getPrivateIP(),
    browserPort: 2401,
  }
  let prevSetting
  try {
    prevSetting = await fs.promises.readFile(settingPath)
  } catch (e) {
    prevSetting = defaultSetting
  }
  await fs.promises.writeFile(settingPath, JSON.stringify(defaultSetting));
  this.removePrevFireWall(prevSetting.privateIP, prevSetting.browserPort)
  this.removePrevFireWall(prevSetting.privateIP, prevSetting.browserPort + 1)
  this.addNewFireWall(defaultSetting.privateIP, defaultSetting.browserPort)
  this.addNewFireWall(defaultSetting.privateIP, defaultSetting.browserPort + 1)
}
