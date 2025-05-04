from flask import Flask, render_template, send_from_directory, request, redirect, url_for, flash, jsonify
from analysis import run_pipeline  # Assuming run_pipeline is imported correctly from the analysis module
import os
import json

app = Flask(__name__)
app.secret_key = 'your_secret_key_here'  # Required for flashing messages

# Homepage
@app.route('/')
def home():
    return render_template('index.html')

# Practice page
@app.route('/practice')
def practice():
    video_folder = os.path.join('static', 'reference_videos')
    videos = [f for f in os.listdir(video_folder) if f.endswith(('.mp4', '.webm', '.mov'))]
    return render_template('practice.html', videos=videos)

# Practice Details page (analysis logic and result saving)
@app.route("/practice_detail/<video_name>", methods=["GET", "POST"])
def practice_details(video_name):
    if request.method == "POST":
        try:
            # Run the analysis pipeline with the selected reference video
            result_data = run_pipeline(reference_video_name=video_name)

            # Save the result data to a JSON file for the result page to use
            result_path = os.path.join("static", "results", "latest_result.json")
            os.makedirs(os.path.dirname(result_path), exist_ok=True)
            with open(result_path, "w") as f:
                json.dump(result_data, f)

            flash("✅ Analysis completed successfully! Check result page for details.", "success")
            return redirect(url_for("result"))
        except Exception as e:
            flash(f"⚠ Error during analysis: {str(e)}", "danger")
            return redirect(url_for("practice"))

    return render_template("practice_details.html", word=video_name)

# Recording page (if separate for user interaction with media)
@app.route('/record')
def record():
    return render_template('record.html')

# Start processing pipeline (for submitting videos to start analysis)
@app.route('/start', methods=['POST'])
def start_pipeline():
    reference_video_name = request.form.get('video_name', 'a.mp4')  # Default video if none selected
    try:
        result_data = run_pipeline(reference_video_name)  # Running the pipeline

        result_path = os.path.join("output", "result.json")
        os.makedirs(os.path.dirname(result_path), exist_ok=True)
        with open(result_path, "w") as f:
            json.dump(result_data, f)

        flash("✅ Analysis started! Please check the result page shortly.", "success")
        return redirect(url_for('result'))
    except Exception as e:
        flash(f"⚠ Error starting analysis: {str(e)}", "danger")
        return redirect(url_for('practice'))

# Result page to display analysis results
@app.route('/result')
def result():
    result_path = os.path.join("output", f"result.json")
    try:
        with open(result_path, "r") as f:
            result_data = json.load(f)
            print(result_data)
    except Exception:
        result_data = {"error": "No result available or failed to load result."}

    # Ensure 'mistaken_part' is present when the result is not correct
    if not result_data.get('correct', True):  # if the result is not correct
        result_data['mistaken_part'] ="C:\\Users\\aishu_mt0cvt6\\speakitwebsite\\UI\\output\\mistakes\\mistake_20250504_090512.mp4"

    return render_template('result.html', result_data=result_data)


# Serve reference videos (for download or direct access)
@app.route('/reference_videos/<filename>')
def reference_videos(filename):
    return send_from_directory('reference_videos', filename)

# Optional pages like about, FAQ, and contact
@app.route('/about')
def about():
    return render_template('about.html')

@app.route('/faq')
def faq():
    return render_template('faq.html')

@app.route('/contact')
def contact():
    return render_template('contact.html')

# Main entry point to run the Flask app
if __name__ == '__main__':
    app.run(debug=True)
