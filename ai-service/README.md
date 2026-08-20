Admin uploads PDF
       ↓
Node.js Backend
       ↓
Cloudinary
       ↓
Original PDF stored permanently
       ↓
MongoDB stores:
{
  _id,
  filename,
  cloudinary_url,
  ...
}
       ↓
Node calls Python AI service
       ↓
{
  document_id,
  filename,
  file_url
}
       ↓
Python downloads PDF from Cloudinary  ← async network I/O
       ↓
TEMPORARY local file
       ↓
PyPDFLoader
       ↓
Documents
       ↓
Chunking
       ↓
Embeddings
       ↓
Pinecone
       ↓
Delete temporary PDF



What is with?
    This is an important Python concept.
    with means roughly:
        Open/use some resource, and automatically clean it up when this block finishes.
    For example:
        with something() as x:
            # use x
    After leaving the indented block, Python performs the resource's cleanup.