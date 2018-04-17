# main.py

from flask import Flask, render_template, Response
from camera import VideoCamera
from flask_socketio import SocketIO, emit

app = Flask(__name__)
socketio = SocketIO(app, async_mode='threading')

@app.route('/')
def index():
    return render_template('index.html')

def gen(camera):
    while True:
        frame = camera.get_frame()
        yield (b'--frame\r\n'
               b'Content-Type: image/jpeg\r\n\r\n' + frame + b'\r\n\r\n')

@socketio.on('client_connected')
def handle_client_connect_event(json):
    print('received json: {0}'.format(str(json)))

@socketio.on('capture')
def capture(dummy):
    assert(False)
    print("received")
    VideoCamera.capture()
    

@app.route('/video_feed')
def video_feed():
    return Response(gen(VideoCamera()),
                    mimetype='multipart/x-mixed-replace; boundary=frame')

    

if __name__ == '__main__':
    app.run(host='0.0.0.0', threaded=True, debug=True)

print("PROOF")
