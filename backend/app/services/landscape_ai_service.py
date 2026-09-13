import anthropic
import base64
import json
import os
from dotenv import load_dotenv

load_dotenv()

client = anthropic.Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))

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
    content = []

    upload_dir = os.getenv("UPLOAD_DIR", "./uploads")

    if plot_image_paths:
        content.append({"type": "text", "text": "Here are photos of the current plot or garden:"})
        for path in plot_image_paths:
            full_path = os.path.join(upload_dir, os.path.basename(path))
            if os.path.exists(full_path):
                b64, media_type = image_to_base64(full_path)
                content.append({
                    "type": "image",
                    "source": {"type": "base64", "media_type": media_type, "data": b64}
                })

    if ref_image_paths:
        content.append({"type": "text", "text": "Here are reference/inspiration images of landscapes the user loves:"})
        for path in ref_image_paths:
            full_path = os.path.join(upload_dir, os.path.basename(path))
            if os.path.exists(full_path):
                b64, media_type = image_to_base64(full_path)
                content.append({
                    "type": "image",
                    "source": {"type": "base64", "media_type": media_type, "data": b64}
                })

    content.append({
        "type": "text",
        "text": f"""Analyze this outdoor space and generate a detailed landscape design plan.

Plot type: {project.plot_type}
Desired style: {project.style}
Budget: KES {project.budget_kes:,}
Goals: {', '.join(project.goals) if project.goals else 'general improvement'}
Climate zone: {project.climate_zone or 'Kenya (tropical/semi-arid)'}
Additional notes: {project.notes or 'none'}

{"No plot photo was uploaded — provide general advice based on plot type and style." if not plot_image_paths else ""}
{"Reference images have been provided — use them to understand the user's aesthetic taste." if ref_image_paths else ""}

You are an expert landscape architect specializing in Kenyan gardens and outdoor spaces.
Consider: local climate, drought-tolerant plants, water conservation, soil types in Kenya,
indigenous plants, and affordable local materials.

Respond ONLY in this exact JSON format with no preamble or markdown:
{{
  "plot_analysis": "2-3 sentences describing what you observe about the current space",
  "zone_plan": [
    {{"zone": "zone name", "description": "what this area is for", "location": "where in the plot"}}
  ],
  "plant_recommendations": [
    {{"name": "plant name", "type": "tree/shrub/groundcover/grass", "reason": "why it suits this space", "water_needs": "low/medium/high", "local_availability": "easily found in Kenya"}}
  ],
  "hardscape_suggestions": ["suggestion 1", "suggestion 2", "suggestion 3"],
  "budget_priorities": ["highest impact action first", "second priority", "third priority"],
  "maintenance_tips": ["tip 1", "tip 2", "tip 3"],
  "overall_vision": "One evocative sentence describing the transformed outdoor space"
}}"""
    })

    response = client.messages.create(
        model="claude-sonnet-4-6",
        max_tokens=2000,
        system="You are an expert landscape architect specializing in Kenyan gardens, indigenous plants, and affordable outdoor transformations. Respond only in the JSON format requested.",
        messages=[{"role": "user", "content": content}]
    )

    raw = response.content[0].text
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