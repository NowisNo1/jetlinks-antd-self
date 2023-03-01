export default (api, opts) => {
  api.onStart(({ serve, devServerPort }) => {
    let { getComponents } = require("./tools")
    getComponents();
  })
}
