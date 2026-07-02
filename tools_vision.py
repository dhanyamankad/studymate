"""
OWNER: Vanshi
PURPOSE: Expose a describe_image() tool for handwritten notes / diagrams.

CONTRACT (do not change without telling Dhanya):
    describe_image(image_path: str) -> str
    Returns a text description/transcription of the image content.
"""

# TODO: import groq client (vision-capable model) or another vision API
import base64

def encode_image(image_path: str) -> str:
    with open(image_path, "rb") as f:
        return base64.b64encode(f.read()).decode("utf-8")


def describe_image(image_path: str) -> str:
    """
    Send image to a vision-capable model, return a text transcription/description.
    Should extract any handwritten text or diagram labels as literally as possible.
    """
    # TODO: implement (Groq vision model, e.g. llama-3.2-vision or similar — check current model name)
    raise NotImplementedError


if __name__ == "__main__":
    print(describe_image("data/images/sample.jpg"))
