from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import engine, Base
from routers import gstin, invoices, ims, auth

Base.metadata.create_all(bind=engine)

app = FastAPI(title="CleariFy GST API", version="1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(
    auth.router, prefix="/api", tags=["Auth"]
)
app.include_router(
    gstin.router, prefix="/api", tags=["GSTIN"]
)
app.include_router(
    invoices.router, prefix="/api", tags=["Invoices"]
)
app.include_router(
    ims.router, prefix="/api", tags=["IMS"]
)

@app.get("/")
def root():
    return {"message": "CleariFy Backend Running ✅"}
