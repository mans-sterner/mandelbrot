const SIZE_OF_UINT8 = 256

/**
 * Returns the complex square of z
 * @param z A complex number
 */
function complexSquare(z) {
  return {
    x: Math.pow(z.x, 2) - Math.pow(z.y, 2),
    y: 2 * z.x * z.y
  }
}

/**
 * Returns the evaluated number of the function f_c(z) = z*z + c,
 * where both z and c are complex numbers
 * @param c A complex number, assumed to be constant
 * @param z A complex number
 */
function f_c(c, z) {
  let z2 = complexSquare(z)
  return {
    x: z2.x + c.x,
    y: z2.y + c.y
  }
}

/**
 * Iterates z_(n+1) = z_n*z_n + c, where n is the current iteration,
 * z_1 = 0, and c is a constant, until the absolute value (modulus)
 * of z_(n+1) is greater than 2, or the number of iterations reach n_lim.
 * Finally, n is returned.
 * @param x_in A float representing the real part of c
 * @param y_in A float representing the imaginary part of c
 * @param n_lim An integer designating the maximum number of iterations
 */
function mandelbrot(x_in, y_in, n_lim) {
  let z = { x: 0, y: 0 }
  let c = { x: x_in, y: y_in }
  let n = 0, abs = 0
  do {
    n++
    z = f_c(c, z)
    abs = Math.sqrt(Math.pow(z.x, 2) + Math.pow(z.y, 2))
  } while (abs <= 2 && n < n_lim)
  return n
}

/**
 * Maps a value between [1,max_iters] -> [0,255]
 * @param it The number to be converted
 * @param max_iters Higher end of [1,max_iters], assumed to be a multiple of 256
 */
function iterationsToPixel(it, max_iters) {
  const nr_buckets = SIZE_OF_UINT8
  const bucket_size = Math.floor(max_iters/nr_buckets)
  return Math.floor((it-1)/bucket_size)
}

/**
 * Returns an array of n evenly spaced floats between [min,max]
 * @param min A float designating the left-most point
 * @param max A float designating the right-most point
 * @param n An integer designating the number of desired points in the array
 */
function createEqualRange(min, max, n) {
  const delta = (max-min)/n
  arr = new Float32Array(n+1);
  for (let i = 0; i <= n; i++) {
    arr[i] = min + i * delta
  }
  return arr
}

function parseReqParams(params) {
  return {x_min: parseFloat(params.x_min),
          x_max: parseFloat(params.x_max),
          y_min: parseFloat(params.y_min),
          y_max: parseFloat(params.y_max),
          x_num: parseInt(params.x_num),
          y_num: parseInt(params.y_num),
          n_lim: parseInt(params.n_lim),
  }
}

/**
 * Returns an object {ip: IP, port: PORT}, either given default values or values
 * specified by the user
 * @param args An array of input arguments. Valid startup commands are:
 * > node app.js
 * > node app.js <PORT>
 * > node app.js <IP> <PORT>
 */
function parseArgs(args) {
  let endpoint = {}
  switch(args.length) {
    case 3:
      endpoint = {ip: "localhost", port: args[2]}
      break;
    case 4:
      endpoint = {ip: args[2], port: args[3]}
      break;
    default:
      endpoint = {ip: "localhost", port: 3000}
  }
  return endpoint
}

module.exports = {createEqualRange, mandelbrot, parseReqParams, parseArgs, iterationsToPixel}
