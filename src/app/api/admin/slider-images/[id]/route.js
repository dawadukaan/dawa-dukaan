// src/app/api/admin/slider-images/[id]/route.js

import { authenticateAdmin } from "@/lib/api/authMiddleware";
import { successResponse, errorResponse } from "@/lib/api/apiResponse";
import dbConnect from "@/lib/db/connect";
import Slider from "@/lib/db/models/Slider";
import mongoose from 'mongoose';

// GET /api/admin/slider-images/[id] - Get single slider
export async function GET(request, { params }) {
  try {
    await dbConnect();
    const { authenticated, response } = await authenticateAdmin(request);
    if (!authenticated) return response;

    const { id } = params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return errorResponse("Invalid slider ID", 400);
    }

    const slider = await Slider.findById(id);
    if (!slider) {
      return errorResponse("Slider not found", 404);
    }

    return successResponse(slider);
  } catch (error) {
    console.error("Error fetching slider:", error);
    return errorResponse("Failed to fetch slider");
  }
}

// PUT /api/admin/slider-images/[id] - Update slider
export async function PUT(request, { params }) {
  try {
    await dbConnect();
    const { authenticated, response } = await authenticateAdmin(request);
    if (!authenticated) return response;

    const { id } = params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return errorResponse("Invalid slider ID", 400);
    }

    const data = await request.json();

    // Validate required fields
    if (!data.title || !data.image) {
      return errorResponse("Title and image are required");
    }

    const slider = await Slider.findByIdAndUpdate(
      id,
      {
        title: data.title,
        description: data.description,
        image: data.image,
        link: data.link,
        isActive: data.isActive
      },
      { new: true }
    );

    if (!slider) {
      return errorResponse("Slider not found", 404);
    }

    return successResponse(slider);
  } catch (error) {
    console.error("Error updating slider:", error);
    return errorResponse("Failed to update slider");
  }
}

// DELETE /api/admin/slider-images/[id] - Delete slider
export async function DELETE(request, { params }) {
  try {
    await dbConnect();
    const { authenticated, response } = await authenticateAdmin(request);
    if (!authenticated) return response;

    const { id } = params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return errorResponse("Invalid slider ID", 400);
    }

    const slider = await Slider.findByIdAndDelete(id);
    if (!slider) {
      return errorResponse("Slider not found", 404);
    }

    return successResponse({ message: "Slider deleted successfully" });
  } catch (error) {
    console.error("Error deleting slider:", error);
    return errorResponse("Failed to delete slider");
  }
}
