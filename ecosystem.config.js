module.exports = {
  apps : [{
    name   : "fixers-server",
    script : "./dist/index.js",
    env_production: {
      NODE_ENV: "production"
    }
  }]
}
