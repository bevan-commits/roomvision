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

async def analyze_room(project, room_image_paths: list, ref_image_paths: list) -> dict:
    content = []

    upload_dir = os.getenv("UPLOAD_DIR", "./uploads")

    if room_image_paths:
        content.append({"type": "text", "text": "Here are photos of the current room:"})
        for path in room_image_paths:
            full_path = os.path.join(upload_dir, os.path.basename(path))
            if os.path.exists(full_path):
                b64, media_type = image_to_base64(full_path)
                content.append({
                    "type": "image",
                    "source": {"type": "base64", "media_type": media_type, "data": b64}
                })

    if ref_image_paths:
        content.append({"type": "text", "text": "Here are reference/inspiration images showing the style the user wants:"})
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
        "text": f"""Analyze this room and generate a detailed redesign plan.

Room type: {project.room_type}
Desired style: {project.style}
Budget: KES {project.budget_kes:,}
Goals: {', '.join(project.goals) if project.goals else 'general improvement'}
Additional notes: {project.notes or 'none'}

{"No room photo was uploaded — provide general advice based on room type and style." if not room_image_paths else ""}
{"Reference images have been provided above — use them to understand the user's taste." if ref_image_paths else ""}

Respond ONLY in this exact JSON format with no preamble or markdown:
{{
  "room_analysis": "2-3 sentences describing what you observe in the current room",
  "style_match": "How the reference images inform the design direction",
  "layout_recommendations": ["recommendation 1", "recommendation 2", "recommendation 3"],
  "furniture_changes": ["change 1", "change 2", "change 3"],
  "color_palette": ["primary color", "accent color", "neutral tone"],
  "budget_priorities": ["highest impact action first", "second priority", "third priority"],
  "quick_wins": ["cheap improvement 1", "quick win 2"],
  "estimated_costs": {{"layout_changes": "KES X", "furniture": "KES X", "decor": "KES X"}},
  "overall_vibe": "One evocative sentence describing the transformed room"
}}"""
    })

    response = client.messages.create(
        model="claude-sonnet-4-6",
        max_tokens=1500,
        system="You are an expert interior designer specializing in practical, budget-conscious room transformations for the Kenyan market. Respond only in the JSON format requested.",
        messages=[{"role": "user", "content": content}]
    )

    raw = response.content[0].text
    cleaned = raw.replace("```json", "").replace("```", "").strip()

    try:
        return json.loads(cleaned)
    except json.JSONDecodeError:
        return {
            "room_analysis": raw,
            "layout_recommendations": [],
            "furniture_changes": [],
            "color_palette": [],
            "budget_priorities": [],
            "overall_vibe": ""
        }