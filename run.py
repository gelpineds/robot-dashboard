from app import create_app, socketio
import sys

try:
    app = create_app()
    print("[App] Flask app created successfully")
    print("[App] Starting Socket.IO server on 0.0.0.0:5000")
    socketio.run(app, host="0.0.0.0", port=5000, debug=True, use_reloader=False)
except Exception as e:
    print(f"[App] FATAL ERROR: {str(e)}", file=sys.stderr)
    import traceback
    traceback.print_exc()
    sys.exit(1)
