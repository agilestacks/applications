FROM python:3

WORKDIR /opt/webstream

RUN pip3 install flask numpy opencv-contrib-python imutils

COPY ./ ./

EXPOSE 8000/tcp

CMD python3 webstreaming.py --source video/test_video.mp4
