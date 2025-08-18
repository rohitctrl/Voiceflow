#!/usr/bin/env python3
"""
Local Whisper transcription service
Provides a simple HTTP server for transcribing audio files using local Whisper
"""

import os
import sys
import json
import tempfile
from http.server import HTTPServer, BaseHTTPRequestHandler
from urllib.parse import parse_qs
import cgi
import whisper
import torch

class WhisperHandler(BaseHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        # Load the Whisper model once when the handler is created
        if not hasattr(WhisperHandler, 'model'):
            print("Loading Whisper model (this may take a moment)...")
            # Use 'base' model for good balance of speed and accuracy
            # Options: tiny, base, small, medium, large
            WhisperHandler.model = whisper.load_model("base")
            print("Whisper model loaded successfully!")
        super().__init__(*args, **kwargs)
    
    def do_OPTIONS(self):
        """Handle CORS preflight requests"""
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()
    
    def do_POST(self):
        """Handle audio transcription requests"""
        try:
            # Handle CORS
            self.send_response(200)
            self.send_header('Access-Control-Allow-Origin', '*')
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            
            # Parse multipart form data
            content_type = self.headers['content-type']
            if not content_type.startswith('multipart/form-data'):
                self.send_error(400, "Expected multipart/form-data")
                return
            
            # Parse the form data
            form = cgi.FieldStorage(
                fp=self.rfile,
                headers=self.headers,
                environ={'REQUEST_METHOD': 'POST'}
            )
            
            if 'audio' not in form:
                response = {
                    "success": False,
                    "error": "No audio file provided",
                    "details": "Expected 'audio' field in form data"
                }
                self.wfile.write(json.dumps(response).encode())
                return
            
            audio_field = form['audio']
            if not audio_field.file:
                response = {
                    "success": False,
                    "error": "Invalid audio file",
                    "details": "Audio field is empty"
                }
                self.wfile.write(json.dumps(response).encode())
                return
            
            # Save uploaded file temporarily
            with tempfile.NamedTemporaryFile(delete=False, suffix='.audio') as temp_file:
                temp_file.write(audio_field.file.read())
                temp_file_path = temp_file.name
            
            try:
                # Transcribe with Whisper
                print(f"Transcribing audio file: {audio_field.filename}")
                result = self.model.transcribe(
                    temp_file_path,
                    word_timestamps=True,
                    fp16=torch.cuda.is_available()  # Use FP16 if CUDA is available
                )
                
                # Extract word-level timestamps if available
                words = []
                if 'segments' in result:
                    for segment in result['segments']:
                        if 'words' in segment:
                            for word in segment['words']:
                                words.append({
                                    'word': word.get('word', ''),
                                    'start': word.get('start', 0),
                                    'end': word.get('end', 0)
                                })
                
                # Prepare response
                response = {
                    "success": True,
                    "transcript": result['text'].strip(),
                    "language": result.get('language', 'en'),
                    "duration": None,  # Whisper doesn't provide duration directly
                    "words": words,
                    "word_count": len(result['text'].split()),
                    "confidence": None,  # Whisper doesn't provide confidence scores
                    "model": "whisper-base-local"
                }
                
                print(f"Transcription completed: {len(result['text'])} characters")
                
            except Exception as transcription_error:
                print(f"Transcription error: {str(transcription_error)}")
                response = {
                    "success": False,
                    "error": "Transcription failed",
                    "details": str(transcription_error)
                }
            
            finally:
                # Clean up temporary file
                try:
                    os.unlink(temp_file_path)
                except:
                    pass
            
            # Send response
            self.wfile.write(json.dumps(response).encode())
            
        except Exception as e:
            print(f"Server error: {str(e)}")
            response = {
                "success": False,
                "error": "Server error",
                "details": str(e)
            }
            self.wfile.write(json.dumps(response).encode())
    
    def do_GET(self):
        """Handle health check requests"""
        if self.path == '/health':
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            
            response = {
                "status": "healthy",
                "service": "local-whisper",
                "model": "base",
                "message": "Local Whisper service is running"
            }
            self.wfile.write(json.dumps(response).encode())
        else:
            self.send_error(404, "Endpoint not found")
    
    def log_message(self, format, *args):
        """Custom log format"""
        print(f"[{self.date_time_string()}] {format % args}")

def main():
    PORT = 8001
    
    print(f"""
🎙️  Local Whisper Transcription Service
========================================
Starting server on http://localhost:{PORT}
Model: Whisper Base (local)
Endpoints:
  POST / - Transcribe audio (multipart/form-data with 'audio' field)
  GET /health - Health check

Press Ctrl+C to stop
    """)
    
    try:
        server = HTTPServer(('localhost', PORT), WhisperHandler)
        server.serve_forever()
    except KeyboardInterrupt:
        print("\n\nShutting down Local Whisper service...")
        server.server_close()

if __name__ == '__main__':
    main()