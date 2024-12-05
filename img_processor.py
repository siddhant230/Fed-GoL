import os
from pathlib import Path
from rembg import remove
from PIL import Image
import time


def remove_background(file_path):
    # processing the image
    file_name = file_path.name.split('.')[0] + '.png'
    input_image = Image.open(file_path)

    # print("removing the background from the given Image")
    output = remove(input_image)

    # print("saving the image in the given path")
    dest_path = Path(file_path.parent) / f"rembg_{file_name}"
    output.save(dest_path)
    return dest_path


# if __name__ == "__main__":

#     for img_name in os.listdir("images"):

#         img_path = Path(f"images/{img_name}")
#         start = time.time()
#         out_path = remove_background(img_path)
#         end = time.time()
#         print(f"{start-end:0.2f}s")
