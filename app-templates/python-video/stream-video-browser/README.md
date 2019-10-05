# Python Flask Video Streaming Application


## Scenario

This application uses OpenCV to stream video from a webcam to a web browser/HTML page using Flask and Python, and implements a basic motion detector.

It is based on the OpenCV streaming video [tutorial by Adrian Rosebrock](https://www.pyimagesearch.com/2019/09/02/opencv-stream-video-to-web-browser-html-page/).

## Local Deployment

Install required Python libraries:

```
pip install opencv flask numpy opencv-contrib-python imutils
```

The `webstreaming.py` file will use OpenCV to access our web camera, perform motion detection via SingleMotionDetector, and then serve the output frames to our web browser via the Flask web framework.

Start the app using the following command:

```
python webstreaming.py --ip 127.0.0.1 --port 8000
```

## Docker Deployment

This application can be run from Docker with the following steps:

```sh
docker build -t webstream .
docker run -ti -p 8000:8000 --rm webstream
```

It will default to showing the `test_video.mp4` but can be configured for any source, depending on platform. On Mac the local webcam cannot be easily passed to the container, but remote addresses or file paths to videos can be. Maybe try:

```sh
docker run -ti -p 8000:8000 --rm webstream python3 webstreaming.py --source http://131.173.8.23/mjpg/video.mjpg
```

## Result

View the webcam feed from the web browser:

<http://127.0.0.1:8000/>

After implementing the background subtractor, we combined it with the Flask web framework, enabling us to:

* Access frames from RPi camera module/USB webcam.
* Apply background subtraction/motion detection to each frame.
* Stream the results to a web page/web browser.
* Support multiple clients, browsers, or tabs.
