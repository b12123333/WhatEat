const { defineConfig } = require('@vue/cli-service')
module.exports = defineConfig({
  transpileDependencies: true
})
const fs = require('fs')
module.exports = {
  devServer: {
    https: {
      key: fs.readFileSync('C:/Users/user0001/Desktop/api/src/assets/localhost-key.pem'),
      cert: fs.readFileSync('C:/Users/user0001/Desktop/api/src/assets/localhost.pem')
    }
  }
}
