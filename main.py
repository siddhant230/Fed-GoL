from pathlib import Path
from syftbox.lib import Client
import os
import json
import shutil
from datetime import datetime, timedelta, UTC
from typing import Tuple

from img_processor import remove_background

API_NAME = "game_of_life"


def network_participants(datasite_path: Path):
    """
    Retrieves a list of user directories (participants) in a given datasite path.

    Args:
        datasite_path (Path): The path to the datasite directory containing user subdirectories.

    Returns:
        list: A list of strings representing the names of the user directories present in the datasite path.

    Example:
        If the datasite_path contains the following directories:
        - datasite/user1/
        - datasite/user2/
        Then the function will return:
        ['user1', 'user2']
    """
    # Get all entries in the specified datasite path
    entries = os.listdir(datasite_path)

    # Initialize an empty list to store user directory names
    users = []

    # Iterate through each entry and add to users list if it's a directory
    for entry in entries:
        if Path(datasite_path / entry).is_dir():
            users.append(entry)

    # Return the list of user directories
    return users


def get_latest_images(
    datasites_path: Path, peers: list[str]
) -> Tuple[float, list[str]]:
    """
    Get the latest images from the specified peers.

    Args:
        datasites_path (Path): The path to the datasites directory.
        peers (list[str]): A list of peers to gather images from.

    Returns:
        Tuple[float, list[str]]: A tuple containing the execution time and a list of active peers.

    """
    active_peers = []
    # Iterate over each peer to gather any available images
    for peer in peers:
        # Construct the path to the folder where images are stored
        tracker_folder: Path = (
            datasites_path / peer / "api_data" / API_NAME / "images"
        )
        dest_path = "./images"

        # Skip if the tracker folder does not exist
        if not tracker_folder.exists():
            continue

        image_extensions = {".jpg", ".jpeg", ".png"}

        # Iterate over files in the tracker folder and select image files
        for file in tracker_folder.glob("*"):
            preprocessed_file = remove_background(file)
            if file.suffix.lower() in image_extensions:
                shutil.copy(preprocessed_file, Path(dest_path) / file.name)

    return active_peers


def should_run() -> bool:
    INTERVAL = 60  # 60 seconds
    timestamp_file = f"./script_timestamps/{API_NAME}_last_run"
    os.makedirs(os.path.dirname(timestamp_file), exist_ok=True)
    now = datetime.now().timestamp()
    time_diff = INTERVAL  # default to running if no file exists
    if os.path.exists(timestamp_file):
        try:
            with open(timestamp_file, "r") as f:
                last_run = int(f.read().strip())
                time_diff = now - last_run
        except (FileNotFoundError, ValueError):
            print(f"Unable to read timestamp file: {timestamp_file}")
    if time_diff >= INTERVAL:
        with open(timestamp_file, "w") as f:
            f.write(f"{int(now)}")
        return True
    return False


if __name__ == "__main__":
    if not should_run():
        print(f"Skipping {API_NAME}, not enough time has passed.")
        exit(0)

    client = Client.load()

    # Create input folder for the current user
    image_input_path = client.datasite_path / "api_data" / API_NAME / "images"
    os.makedirs(image_input_path, exist_ok=True)

    # Fetch all new added images
    peers = network_participants(client.datasite_path.parent)

    get_latest_images(client.datasite_path.parent, peers)
