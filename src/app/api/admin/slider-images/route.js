// src/app/api/admin/slider-images/route.js

import { authenticateAdmin } from "@/lib/api/authMiddleware";
import { successResponse, errorResponse } from "@/lib/api/apiResponse";
import dbConnect from "@/lib/db/connect";
import Slider from "@/lib/db/models/Slider";

// GET /api/admin/slider-images - Get all slider images
export async function GET(request) {
  try {
    await dbConnect();
    const { authenticated, response } = await authenticateAdmin(request);
    if (!authenticated) return response;

    const sliders = await Slider.find().sort({ _id: -1 });
    return successResponse(sliders);
  } catch (error) {
    console.error("Error fetching slider images:", error);
    return errorResponse("Failed to fetch slider images");
  }
}

// POST /api/admin/slider-images - Add new slider image
export async function POST(request) {
  try {
    await dbConnect();
    const { authenticated, response } = await authenticateAdmin(request);
    if (!authenticated) return response;

    const data = await request.json();

    // Validate required fields
    if (!data.title || !data.image) {
      return errorResponse("Title and image are required");
    }

    // Create new slider
    const slider = new Slider({
      title: data.title,
      description: data.description,
      image: data.image,
      link: data.link,
      isActive: data.isActive !== undefined ? data.isActive : true
    });

    await slider.save();
    return successResponse(slider, 201);
  } catch (error) {
    console.error("Error creating slider image:", error);
    return errorResponse("Failed to create slider image");
  }
}
