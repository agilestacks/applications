# Python Flask Video Streaming Application


## Scenario

This application uses OpenCV to stream video from a webcam to a web browser/HTML page using Flask and Python, and implements a basic motion detector.

It is based on the OpenCV streaming video [tutorial by Adrian Rosebrock](https://www.pyimagesearch.com/2019/09/02/opencv-stream-video-to-web-browser-html-page/).

## Local deployment

Install required Python libraries:

```
pip install flask numpy opencv-contrib-python imutils
```

The `webstreaming.py` file will use OpenCV to access our web camera, perform motion detection via SingleMotionDetector, and then serve the output frames to our web browser via the Flask web framework.

Start the app using the following command:

```
python webstreaming.py --ip 127.0.0.1 --port 8000
```

View the webcam feed from the web browser:

<http://127.0.0.1:8000/>

After implementing the background subtractor, we combined it with the Flask web framework, enabling us to:

* Access frames from RPi camera module/USB webcam.
* Apply background subtraction/motion detection to each frame.
* Stream the results to a web page/web browser.
* Support multiple clients, browsers, or tabs.
