import httpx
from app.config import settings
from typing import List, Dict, Any

async def get_all_products() -> List[Dict[str, Any]]:
    """Recupere tous les produits depuis CatalogService."""
    try:
        async with httpx.AsyncClient(timeout=5.0) as client:
            response = await client.get(f"{settings.catalog_service_url}/api/catalog/products")
            if response.status_code == 200:
                data = response.json()
                return data.get("data", [])
    except Exception as e:
        print(f"CatalogService indisponible: {e}")
    return []

async def search_products(keyword: str) -> List[Dict[str, Any]]:
    """Recherche des produits par mot-cle."""
    try:
        async with httpx.AsyncClient(timeout=5.0) as client:
            response = await client.get(
                f"{settings.catalog_service_url}/api/catalog/products/search",
                params={"keyword": keyword}
            )
            if response.status_code == 200:
                data = response.json()
                return data.get("data", [])
    except Exception as e:
        print(f"Erreur recherche CatalogService: {e}")
    return []

async def get_categories() -> List[Dict[str, Any]]:
    """Recupere toutes les categories."""
    try:
        async with httpx.AsyncClient(timeout=5.0) as client:
            response = await client.get(f"{settings.catalog_service_url}/api/catalog/categories")
            if response.status_code == 200:
                data = response.json()
                return data.get("data", [])
    except Exception as e:
        print(f"Erreur categories CatalogService: {e}")
    return []

def format_products_for_context(products: List[Dict[str, Any]]) -> str:
    """Formate les produits pour le contexte IA."""
    if not products:
        return "Aucun produit disponible actuellement."

    lines = []
    for p in products[:10]:
        price = p.get("price", 0)
        title = p.get("title", "Inconnu")
        condition = p.get("condition", "")
        category = p.get("categoryName", "")

        line = f"- {title} | Prix: {price} EUR | État: {condition}"
        if category:
            line += f" | Catégorie: {category}"
        lines.append(line)

    return "\n".join(lines)