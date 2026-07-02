"""
OWNER: Vanshi
PURPOSE: Gradio UI. Wires together PDF upload -> ingest.py, image upload -> tools_vision,
question box -> agent.py, and displays answer + sources + reasoning trace.
"""

import gradio as gr

# TODO: from agent import build_agent
# TODO: from ingest import load_and_chunk_pdfs, build_vectorstore


def handle_pdf_upload(files):
    # TODO: call ingest pipeline, return status message
    raise NotImplementedError


def handle_question(question, history):
    # TODO: call agent, return answer with sources
    raise NotImplementedError


with gr.Blocks(title="StudyMate") as demo:
    gr.Markdown("# 📚 StudyMate — Hybrid AI Study Companion")

    with gr.Row():
        pdf_upload = gr.File(label="Upload lecture PDFs", file_count="multiple", file_types=[".pdf"])
        image_upload = gr.Image(label="Upload photo of notes", type="filepath")

    chatbot = gr.Chatbot(label="StudyMate")
    question_box = gr.Textbox(label="Ask a question")
    # TODO: wire event handlers (pdf_upload.upload(...), question_box.submit(...))
    # TODO: add an Accordion for "reasoning trace" / sources shown

if __name__ == "__main__":
    demo.launch(share=True)
