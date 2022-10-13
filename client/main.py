import grequests
import json
import utils
import sys
import numpy as np

def main(argv):
  ## Parse input arguments
  args = utils.parseArgs(argv)
  x_min = args["x_min"]
  x_max = args["x_max"]
  y_min = args["y_min"]
  y_max = args["y_max"]
  max_n = args["max_n"]
  num_x = args["x"]
  num_y = args["y"]
  dim = args["dim"]
  servers = args["servers"]

  ## Create list to hold pixels
  pixels = [0] * num_x * num_y

  # List of pixel coordinates for x- & y-axis
  x_coords = np.linspace(x_min, x_max, num_x, endpoint=True)
  y_coords = np.linspace(y_min, y_max, num_y, endpoint=True)

  for row in range(0, num_y, dim):
    nr_servers = len(servers)
    print(f'Starting row: {row}')
    for col in range(0, num_x, dim * nr_servers):

      # Adjust number or servers for the last cycle
      if utils.isLastCycle(col, num_x, dim, nr_servers):
        nr_servers = num_x % nr_servers
      
      # Build a list of urls, distributed over our list of servers
      urls = utils.buildUrls(x_coords, y_coords, row, col, servers, nr_servers, dim, max_n)

      # Create a set of unsent requests
      rs = (grequests.get(u) for u in urls)

      # Send them all at the same time
      resp_json = grequests.map(rs)

      res_dicts = []
      for r in resp_json:
        res_dicts.append(json.loads(r.content))

      # Merge all subsets of data with pixels
      for i in range(nr_servers):
        utils.addSubdata(pixels, num_x, row, col + i*dim, dim, res_dicts[i])

  utils.genPGMImage(pixels, num_x, num_y)

if __name__ == '__main__':
  sys.exit(main(sys.argv[1:]))
