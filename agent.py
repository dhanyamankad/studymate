"""
OWNER: Vanshi
PURPOSE: Build the LangGraph ReAct agent that routes between RAG, vision, and web search tools.

Imports Dhanya's search_documents from tools_rag.py once it's implemented.
"""

# TODO: from langgraph.prebuilt import create_react_agent
# TODO: from langchain_groq import ChatGroq
# TODO: from langchain_community.tools import DuckDuckGoSearchRun, WikipediaQueryRun
# TODO: from tools_rag import search_documents
# TODO: from tools_vision import describe_image

SYSTEM_PROMPT = """
You are StudyMate, a study assistant.
Rules:
1. ALWAYS try search_documents first for questions about the student's own material.
2. Use describe_image only when the user references an uploaded photo/diagram.
3. Use web search ONLY when the answer isn't in the documents or requires current info.
4. ALWAYS cite your source (document+page, image, or web link) in the answer.
5. If you don't know, say so explicitly. Never fabricate an answer.
"""


def build_agent():
    """Construct and return the compiled LangGraph agent with all tools bound."""
    # TODO: implement
    raise NotImplementedError


if __name__ == "__main__":
    agent = build_agent()
    # TODO: quick manual test with a hardcoded question
