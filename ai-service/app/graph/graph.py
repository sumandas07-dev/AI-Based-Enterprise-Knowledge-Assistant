from langgraph.graph import StateGraph, START, END
from app.graph.state import RAGState
from app.graph.nodes import (
    retrieve_node,
    grade_documents_node,
    rewrite_query_node,
    generate_answer_node,
    build_sources_node,
    fallback_node,
)

from app.config.rag import MAX_REWRITE_ATTEMPTS

# Decide where to go after grading
def route_after_grading(state: RAGState) -> str:
    """
    Decide which node to visit next based on the
    is_relevant flag set by the grading node.
    """

    if state["is_relevant"]:
        return "generate"
    
    # Rewrite only while attempts are still available
    if state["rewrite_attempts"] < MAX_REWRITE_ATTEMPTS:
        return "rewrite"

    # Already reached maximum attempts
    return "fallback"

# Create Graph
builder = StateGraph(RAGState)

# Add Nodes
builder.add_node("retrieve", retrieve_node)
builder.add_node("grade", grade_documents_node)
builder.add_node("rewrite", rewrite_query_node)
builder.add_node("generate", generate_answer_node)
builder.add_node("build_sources", build_sources_node)
builder.add_node("fallback", fallback_node)

# Normal Edges
builder.add_edge(START, "retrieve")
builder.add_edge("retrieve", "grade")
builder.add_edge("rewrite", "retrieve")
builder.add_edge("generate", "build_sources")
builder.add_edge("build_sources", END)
builder.add_edge("fallback", END)

# Conditional routing after grading
builder.add_conditional_edges(
    "grade",
    route_after_grading,
    {
        "generate": "generate",
        "rewrite": "rewrite",
        "fallback": "fallback",
    }
)

#Compile the Graph
rag_graph = builder.compile()

'''
START
  ↓
retrieve
  ↓
grade
  │
  ├── relevant ─────────────→ generate
  │                              ↓
  │                         build_sources
  │                              ↓
  │                             END
  │
  └── not relevant
          ↓
     attempts < max?
       /       \
     yes        no
      ↓          ↓
   rewrite    fallback
      ↓          ↓
   retrieve     END
      ↓
    grade

MAX_REWRITE_ATTEMPTS: 1
retrieve → grade → rewrite → retrieve → grade → fallback
'''