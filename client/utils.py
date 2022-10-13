from os import path
from datetime import datetime

ROOT_PATH = f'{path.dirname(path.abspath(__file__))}/..'
IMAGE_DIR = f'{ROOT_PATH}/images'
MAX_PIXEL_VAL = 255


def parseArgs(argv):
  if (len(argv) >= 9):
    return {"x_min":   float(argv[0]),
            "y_min":   float(argv[1]),
            "x_max":   float(argv[2]),
            "y_max":   float(argv[3]),
            "max_n":   int(argv[4]),
            "x":       int(argv[5]),
            "y":       int(argv[6]),
            "dim":    int(argv[7]),
            "servers": argv[8:]}
  return {"x_min": -1.5, "y_min": -1, "x_max": 0.5, "y_max": 1,
          "max_n": 1024, "x": 600, "y": 600, "dim": 4, "servers": ["localhost:3000"]}


## Insert received subdata of pixels in the total pixel data list
#  that will eventually be used to generate our PGM image
def addSubdata(data, max_cols, row, col, dim, sub_data):
  i = 0
  j = 0
  for y in range(row, row + dim):
    for x in range(col, col + dim):
      data[x + y * max_cols] = sub_data[str(i + j * dim)]
      i += 1
    i = 0
    j += 1


## Build the urls needed for distributing our calculations to the
#  given servers. Each server gets a dim*dim subset of coordinates
#  to evaluate, all subsets adjacent to eachother in the x-direction
def buildUrls(x_c, y_c, row, col, server_list, n_servers, dim, max_n):
  y_min = y_c[row]
  y_max = y_c[row + (dim-1)]
  urls = []
  for s in range(n_servers):
    x_min = x_c[col + s*dim]
    x_max = x_c[col + (s+1)*dim-1]
    urls.append(f'http://{server_list[s]}/mandelbrot/{x_min}/{y_min}/{x_max}/{y_max}/{dim}/{dim}/{max_n}')
  return urls


## We need to know if we're on the last cycle of a row so that we can
#  adjust the number number of servers we distribute our workload to,
#  so as not to go out of bounds in x_coords
def isLastCycle(col, NUM_X, DIM, nr_servers):
  left_overs = NUM_X % nr_servers
  return (col == NUM_X - left_overs * DIM)


## Generate PGM text file from list of pixel values, ranging from [0,255]
def genPGMImage(data, width, height):
  now = datetime.now().strftime("%d-%m-%y_%H%M")
  img_name = f'{IMAGE_DIR}/mandelbrot_{width}x{height}_{now}.pgm'
  with open(img_name, "w") as f:
    f.write("P2\n")
    f.write(f"{width} {height}\n")
    f.write(f'{MAX_PIXEL_VAL}\n')
    for row in range(height):
      for col in range(width):
        pixel = data[col + width * row]
        f.write(f"{pixel}")
        if not col == width - 1:
          f.write(" ")
      f.write("\n")
