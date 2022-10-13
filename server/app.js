const express = require("express")
const app = express()
const utils = require("./utils")

const REQUEST_PATH = "/mandelbrot/:x_min/:y_min/:x_max/:y_max/:x_num/:y_num/:n_lim"

const args = utils.parseArgs(process.argv)

/**
 * This is the main entry point on the server side. It expects a small subset
 * of neighboring coordinates for which to compute if they lie in the Mandelbrot
 * set or not. If a coordinate (x,y) lies in the set, the mandelbrot function will
 * return a value of n_lim, otherwise it'll return the number of iterations it took
 * for the modulus of the function f(), associated with that coordinate, to grow
 * larger than 2. (See utils.mandelbrot function description for more details.)
 * Finally each number of iteration is mapped to a number between [0,255],
 * where 0 represents the pixel color black, and 255 represents white.
 * These pixel values are sent back to the client.
 */
app.get(REQUEST_PATH, (req, res) => {
  p = utils.parseReqParams(req.params)

  const data = new Uint8Array(p.x_num * p.y_num)

  const x_coords = utils.createEqualRange(p.x_min, p.x_max, p.x_num - 1)
  const y_coords = utils.createEqualRange(p.y_min, p.y_max, p.y_num - 1)

  let ind = 0
  for (const y of y_coords) {
    for (const x of x_coords) {
      let iter = utils.mandelbrot(x, y, p.n_lim)
      data[ind] = utils.iterationsToPixel(iter, p.n_lim)
      ind++
    }
  }
  res.send(data)
})

app.use((req, res) => {
  console.log(`Uh oh.. Your request needs to be of this format: http://<ip-address>/${REQUEST_PATH}`)
})

app.listen(args.port, args.ip, () => {
  console.log(`Listening on endpoint: ${args.ip}:${args.port}`);
})
