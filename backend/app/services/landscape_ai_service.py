import httpx
import base64
import json
import os
from dotenv import load_dotenv

load_dotenv()

GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")
MODEL = "gemini-2.5-flash"

def image_to_base64(image_path: str) -> tuple[str, str]:
    with open(image_path, "rb") as f:
        data = base64.standard_b64encode(f.read()).decode("utf-8")
    ext = image_path.split(".")[-1].lower()
    media_type_map = {
        "jpg": "image/jpeg",
        "jpeg": "image/jpeg",
        "png": "image/png",
        "webp": "image/webp",
    }
    media_type = media_type_map.get(ext, "image/jpeg")
    return data, media_type

async def analyze_landscape(project, plot_image_paths: list, ref_image_paths: list) -> dict:
    parts = []
    upload_dir = os.getenv("UPLOAD_DIR", "./uploads")

    if plot_image_paths:
        parts.append({"text": "Here are photos of the current plot or garden:"})
        for path in plot_image_paths:
            full_path = os.path.join(upload_dir, os.path.basename(path))
            if os.path.exists(full_path):
                b64, media_type = image_to_base64(full_path)
                parts.append({
                    "inline_data": {"mime_type": media_type, "data": b64}
                })

    if ref_image_paths:
        parts.append({"text": "Here are reference/inspiration images:"})
        for path in ref_image_paths:
            full_path = os.path.join(upload_dir, os.path.basename(path))
            if os.path.exists(full_path):
                b64, media_type = image_to_base64(full_path)
                parts.append({
                    "inline_data": {"mime_type": media_type, "data": b64}
                })

    parts.append({
        "text": f"""Analyze this outdoor space and generate a detailed landscape design plan.

Plot type: {project.plot_type}
Desired style: {project.style}
Budget: KES {project.budget_kes:,}
Goals: {', '.join(project.goals) if project.goals else 'general improvement'}
Climate zone: {project.climate_zone or 'Kenya (tropical/semi-arid)'}
Additional notes: {project.notes or 'none'}

{"No plot photo was uploaded — provide general advice based on plot type and style." if not plot_image_paths else ""}

Respond ONLY in this exact JSON format with no preamble or markdown:
{{
  "plot_analysis": "2-3 sentences describing the current space",
  "zone_plan": [
    {{"zone": "zone name", "description": "what this area is for", "location": "where in the plot"}}
  ],
  "plant_recommendations": [
    {{"name": "plant name", "type": "tree/shrub/groundcover/grass", "reason": "why it suits this space", "water_needs": "low/medium/high", "local_availability": "easily found in Kenya"}}
  ],
  "hardscape_suggestions": ["suggestion 1", "suggestion 2", "suggestion 3"],
  "budget_priorities": ["highest impact first", "second priority", "third priority"],
  "maintenance_tips": ["tip 1", "tip 2", "tip 3"],
  "overall_vision": "One evocative sentence describing the transformed outdoor space"
}}"""
    })

    async with httpx.AsyncClient() as client:
        response = await client.post(
            f"https://generativelanguage.googleapis.com/v1beta/models/{MODEL}:generateContent?key={GOOGLE_API_KEY}",
            headers={"Content-Type": "application/json"},
            json={
                "contents": [{"parts": parts}],
                "systemInstruction": {
                    "parts": [{"text": "You are an expert landscape architect specializing in Kenyan gardens, indigenous plants, and affordable outdoor transformations. Respond only in the JSON format requested."}]
                }
            },
            timeout=60.0
        )
        result = response.json()

    if "candidates" not in result:
        raise Exception(f"Google API error: {result}")

    raw = result["candidates"][0]["content"]["parts"][0]["text"]
    cleaned = raw.replace("```json", "").replace("```", "").strip()

    try:
        return json.loads(cleaned)
    except json.JSONDecodeError:
        return {
            "plot_analysis": raw,
            "zone_plan": [],
            "plant_recommendations": [],
            "hardscape_suggestions": [],
            "budget_priorities": [],
            "maintenance_tips": [],
            "overall_vision": ""
        }