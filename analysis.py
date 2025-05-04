import os
import cv2
import wave
import pyaudio
import librosa
import threading
import subprocess
import numpy as np
import speech_recognition as sr
import noisereduce as nr
import scipy.io.wavfile as wavfile
from datetime import datetime
import time
import json

# === Audio Settings ===
FORMAT = pyaudio.paInt16
CHANNELS = 1
RATE = 44100
CHUNK = 1024
RECORD_SECONDS = 10

# === Reference Phrases ===
reference_texts = {
    "a.mp4": "a",
    "b.mp4": "b",
    "c.mp4": "c",
    "apple.mp4": "apple",

}

# === Record Video ===
def record_video(video_path, stop_event):
    print("📹 Recording video...")
    cap = cv2.VideoCapture(0)
    width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
    height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
    fourcc = cv2.VideoWriter_fourcc(*'XVID')
    out = cv2.VideoWriter(video_path, fourcc, 20.0, (width, height))

    while not stop_event.is_set():
        ret, frame = cap.read()
        if not ret:
            break
        out.write(frame)
        cv2.imshow('Recording... Press Q to quit.', frame)
        if cv2.waitKey(1) & 0xFF == ord('q'):
            break

    cap.release()
    out.release()
    cv2.destroyAllWindows()
    print(f"✅ Video saved to: {video_path}")

# === Record Audio ===
def record_audio(raw_audio_path):
    print("🎤 Recording audio...")
    audio = pyaudio.PyAudio()
    stream = audio.open(format=FORMAT, channels=CHANNELS, rate=RATE, input=True, frames_per_buffer=CHUNK)
    frames = []

    for i in range(int(RATE / CHUNK * RECORD_SECONDS)):
        data = stream.read(CHUNK)
        frames.append(data)
        print(f"⏱ Audio Progress: {i+1}/{int(RATE / CHUNK * RECORD_SECONDS)} seconds", end='\r')

    stream.stop_stream()
    stream.close()
    audio.terminate()

    with wave.open(raw_audio_path, 'wb') as wf:
        wf.setnchannels(CHANNELS)
        wf.setsampwidth(audio.get_sample_size(FORMAT))
        wf.setframerate(RATE)
        wf.writeframes(b''.join(frames))
    print(f"\n✅ Audio saved to: {raw_audio_path}")

# === Reduce Noise ===
def reduce_noise(input_path, output_path):
    print("🔇 Reducing noise in audio...")
    rate, data = wavfile.read(input_path)
    reduced_noise = nr.reduce_noise(y=data, sr=rate)
    wavfile.write(output_path, rate, reduced_noise.astype(data.dtype))
    print(f"✅ Cleaned audio saved to: {output_path}")

# === Extract Audio from Reference Video ===
def extract_audio_from_video(video_path, audio_output_path):
    print(f"⚠ Extracting audio from video: {video_path}")
    cmd = ["ffmpeg", "-i", video_path, "-vn", "-acodec", "pcm_s16le", "-ar", "44100", "-ac", "1", audio_output_path]
    subprocess.run(cmd, check=True)
    print(f"✅ Extracted audio to: {audio_output_path}")

def clip_mistakes_from_video(video_path, error_times, output_folder, timestamp):
    print("✂ Clipping mismatches...")

    mistakes_folder = os.path.join(output_folder, "mistakes")
    os.makedirs(mistakes_folder, exist_ok=True)

    if len(error_times) == 0:
        print("ℹ No error times to clip.")
        return None

def clip_mistakes_from_video(video_path, error_times, output_folder, timestamp):
    print("✂ Clipping mismatches...")

    mistakes_folder = os.path.join(output_folder, "mistakes")
    os.makedirs(mistakes_folder, exist_ok=True)

    # Calculate total time range covering all mistakes
    if len(error_times) == 0:
        print("ℹ No error times to clip.")
        return

    start_time = max(min(error_times) - 0.5, 0)
    end_time = max(error_times) + 0.5
    duration = end_time - start_time

    clip_path = os.path.join(mistakes_folder, f"mistake_{timestamp}.mp4")
    cmd = [
        "ffmpeg",
        "-ss", str(start_time),
        "-i", video_path,
        "-t", str(duration),
        "-c", "copy",
        clip_path,
        "-y"
    ]
    subprocess.run(cmd, check=True)
    print(f"🔴 Combined mistake clip saved: {clip_path}")

# === Analyze Timestamp for Mismatches ===
def analyze_timestamp(reference_video_name, user_audio_path, video_path, output_folder, timestamp):
    print("⏱ Analyzing mismatched timestamps...")
    try:
        ref_audio_path = os.path.join("static","reference_videos", reference_video_name.replace(".mp4", ".wav"))
        if not os.path.exists(ref_audio_path):
            extract_audio_from_video(os.path.join("static","reference_videos", reference_video_name), ref_audio_path)

        ref_audio, _ = librosa.load(ref_audio_path, sr=None)
        user_audio, _ = librosa.load(user_audio_path, sr=None)

        ref_mfcc = librosa.feature.mfcc(y=ref_audio, sr=RATE, n_mfcc=13)
        user_mfcc = librosa.feature.mfcc(y=user_audio, sr=RATE, n_mfcc=13)

        min_len = min(ref_mfcc.shape[1], user_mfcc.shape[1])
        differences = np.mean(np.abs(ref_mfcc[:, :min_len] - user_mfcc[:, :min_len]), axis=0)

        threshold = np.percentile(differences, 90)
        error_times = np.where(differences > threshold)[0]
        times = error_times / 100

        if error_times.size > 0:
            print("🔴 Potential mismatches at:", ", ".join(f"{t:.2f}s" for t in times))
            mistake_clip = clip_mistakes_from_video(video_path, times, output_folder, timestamp)
            return mistake_clip
        else:
            print("✅ No significant mismatches found.")
            return None
    except Exception as e:
        print("⚠ Timestamp analysis failed:", e)

# === Compare Transcription to Expected ===
def compare_transcription(transcribed_text, reference_video_name, cleaned_audio_path, video_path, output_folder, timestamp):
    if not reference_video_name.endswith(".mp4"):
        reference_video_name += ".mp4"
    expected_text = reference_texts.get(reference_video_name)
    if not expected_text:
        print(f"⚠ No reference found for {reference_video_name}")
        return

    expected = expected_text.lower().strip()
    transcribed_words = transcribed_text.lower().strip().split()

    print(f"\n🔍 Expected: {expected_text}")
    print(f"🧾 You Said: {transcribed_text}")

    mismatch_clip_path = None
    if expected in transcribed_words:
        print("✅ Match: Your speech contains the correct word/letter!")
    else:
        print("❌ Mismatch: Please try again.")
        mismatch_clip_path = analyze_timestamp(reference_video_name, cleaned_audio_path, video_path, output_folder, timestamp)

    return mismatch_clip_path

# === Transcribe Audio and Compare ===
def transcribe_audio(path, reference_video_name, cleaned_audio_path, video_path, output_folder, timestamp):
    print("📝 Transcribing audio...")
    recognizer = sr.Recognizer()

    try:
        with sr.AudioFile(path) as source:
            audio_data = recognizer.record(source)
            text = recognizer.recognize_google(audio_data)  # Removed the timeout argument

            print(f"🗣 Transcribed Text:\n{text}")
            mismatch_clip_path = compare_transcription(text, reference_video_name, cleaned_audio_path, video_path, output_folder, timestamp)

            # Save mismatch or match paths to JSON
            result_data = {
                "reference_video": reference_video_name,
                "transcribed_text": text,
                "mismatch_clip": mismatch_clip_path
            }
            json_result_path = os.path.join(output_folder, f"result.json")
            with open(json_result_path, 'w') as json_file:
                json.dump(result_data, json_file, indent=4)
            print(f"✅ Results saved to: {json_result_path}")
        
           

        # Example command to run in terminal
        command = ["ls", "-l"]

        # Run the command and capture output
        result = subprocess.run(command, capture_output=True, text=True)

        # Convert to JSON format
        output_json = json.dumps({
        "stdout": result.stdout,
        "stderr": result.stderr,
        "returncode": result.returncode
        })

        # Optionally, write to a file or serve it with Flask
        print(output_json)

        

    except sr.UnknownValueError:
        print("⚠ Could not understand audio.")
    except sr.RequestError as e:
        print(f"⚠ Request failed: {e}")
    except Exception as e:
        print(f"⚠ An error occurred while transcribing: {e}")

# === Main Pipeline ===
def run_pipeline(reference_video_name="a.mp4"):
    print("⌛ Starting in:")
    for i in range(3, 0, -1):
        print(f"{i}...", end='', flush=True)
        time.sleep(1)
    print("\n🎬 Starting Recording!\n")

    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    output_folder = "output"
    os.makedirs(output_folder, exist_ok=True)

    video_path = os.path.join(output_folder, f"video_{timestamp}.avi")
    raw_audio_path = os.path.join(output_folder, f"audio_{timestamp}.wav")
    cleaned_audio_path = os.path.join(output_folder, f"cleaned_audio_{timestamp}.wav")

    stop_event = threading.Event()

    audio_thread = threading.Thread(target=record_audio, args=(raw_audio_path,))
    video_thread = threading.Thread(target=record_video, args=(video_path, stop_event))

    audio_thread.start()
    video_thread.start()

    audio_thread.join()
    stop_event.set()
    video_thread.join()

    reduce_noise(raw_audio_path, cleaned_audio_path)
    transcribe_audio(cleaned_audio_path, reference_video_name, cleaned_audio_path, video_path, output_folder, timestamp)

# === Entry Point ===
if __name__ == "__main__":
    run_pipeline("apple.mp4")
