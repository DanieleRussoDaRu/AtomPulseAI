from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import couchdb
import uuid

app = FastAPI()

# CORS configuration to allow React (both local and GithHub Pages) to access the FastAPI backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Porte tipiche di React/Vite
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# -- CouchDb configuration --
COUCHDB_URL = "http://admin:admin@87.106.219.74:5984/"

try:
    couch = couchdb.Server(COUCHDB_URL)
    db_name = "products_list"

    if db_name in couch:
        db = couch[db_name]
        print("Successfully connected to CouchDb database")
    else:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Database '{db_name}' not found in CouchDb server"
        )
            
except HTTPException as e:
    db = None
    raise
except Exception as e:
    print("Error during CouchDb connection:", str(e))
    db = None
    
# -- DataModels (Pyndantic) --
class Product(BaseModel):
    partition: str
    client_code: str
    ap_code: str
    description: str
    last_update: str
    category: str

# -- Routes --
@app.get("/")
def home():
    return {"status": "Python backend working", "database_connected": db is not None}

@app.get("/api/partition/{partition_name}")
def get_all_docs(partition_name: str):
    if db is None:
        raise HTTPException(status_code=500, detail="Database connection not established")
    try:
        results = db.find({"selector": {"_id": {"$regex": f"^{partition_name}:"}}})
        products = [doc for doc in results]
        print(f"Retrieved {len(products)} documents from partition '{partition_name}'")
        return products
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving documents: {str(e)}")
    
@app.get("/api/partitions")
def get_all_partitions():
    if db is None:
        raise HTTPException(status_code=500, detail="Database connection not established")
    
    try:
        results = db.view("parts/partitions", group=True)
        partitions = [row['key'] for row in results if row['key'] is not None]
        return {"partitions": partitions}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving partitions: {str(e)}")

@app.post("/api/insert_product")
def insert_product(doc: Product):
    if db is None:
        raise HTTPException(status_code=500, detail="Database connection not established")
    try:
        document_uuid = uuid.uuid4().hex
        partitioned_id = f"{doc.partition}:{document_uuid}"
        data = {
            "_id": partitioned_id,
            "client_code": doc.client_code,
            "ap_code": doc.ap_code,
            "description": doc.description,
            "last_update": doc.last_update,
            "category": doc.category
        }
        # Usando db.save(), CouchDB vedrà che l' _id è già presente 
        # e userà quello invece di generarne uno non partizionato.
        doc_id, doc_rev = db.save(data)
        return {"status": "successo", "id": doc_id, "rev": doc_rev}
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Errore durante l'inserimento del prodotto: {str(e)}")
    
@app.get("/api/get_products")
def get_products(partition: str):
    if db is None:
        raise HTTPException(status_code=500, detail="Database connection not established")
    try:
        # Query per ottenere tutti i documenti della partizione specificata
        query = f"partition:{partition}"
        results = db.find({"selector": {"_id": {"$regex": f"^{partition}:"}}})
        products = [doc for doc in results]
        return {"status": "successo", "products": products}
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error during product retrieval: {str(e)}")