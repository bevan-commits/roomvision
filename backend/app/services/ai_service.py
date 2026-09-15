import httpx
import base64
import json
import os
from dotenv import load_dotenv

load_dotenv()

OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")
MODEL = "nvidia/llama-nemotron-nano-8b-v1:free"

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
                    "type": "image_url",
                    "image_url": {"url": f"data:{media_type};base64,{b64}"}
                })

    if ref_image_paths:
        content.append({"type": "text", "text": "Here are reference/inspiration images:"})
        for path in ref_image_paths:
            full_path = os.path.join(upload_dir, os.path.basename(path))
            if os.path.exists(full_path):
                b64, media_type = image_to_base64(full_path)
                content.append({
                    "type": "image_url",
                    "image_url": {"url": f"data:{media_type};base64,{b64}"}
                })

    content.append({
        "type": "text",
        "text": f"""Analyze this room and generate a detailed redesign plan.

Room type: {project.room_type}
Desired style: {project.style}
Budget: KES {project.budget_kes:,}
Goals: {', '.join(project.goals) if project.goals else 'general improvement'}
Additional notes: {project.notes or 'none'}

Respond ONLY in this exact JSON format with no preamble or markdown:
{{
  "room_analysis": "2-3 sentences describing the current room",
  "style_match": "How reference images inform the design direction",
  "layout_recommendations": ["recommendation 1", "recommendation 2", "recommendation 3"],
  "furniture_changes": ["change 1", "change 2", "change 3"],
  "color_palette": ["primary color", "accent color", "neutral tone"],
  "budget_priorities": ["highest impact first", "second priority", "third priority"],
  "quick_wins": ["cheap improvement 1", "quick win 2"],
  "estimated_costs": {{"layout_changes": "KES X", "furniture": "KES X", "decor": "KES X"}},
  "overall_vibe": "One evocative sentence describing the transformed room"
}}"""
    })

    async with httpx.AsyncClient() as client:
        response = await client.post(
            "https://openrouter.ai/api/v1/chat/completions",
            headers={
                "Authorization": f"Bearer {OPENROUTER_API_KEY}",
                "Content-Type": "application/json",
                "HTTP-Referer": "https://roomvision-app.netlify.app",
                "X-Title": "RoomVision"
            },
            json={
                "model": MODEL,
                "messages": [
                    {
                        "role": "system",
                        "content": "You are an expert interior designer for the Kenyan market. Respond only in the JSON format requested."
                    },
                    {
                        "role": "user",
                        "content": content
                    }
                ],
                "max_tokens": 1500
            },
            timeout=60.0
        )
        result = response.json()

    if "choices" not in result:
        raise Exception(f"OpenRouter error: {result}")

    raw = result["choices"][0]["message"]["content"]
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