import { authenticateAdmin } from "@/lib/api/authMiddleware";
import { successResponse, errorResponse } from "@/lib/api/apiResponse";
import AppUpdate from "@/lib/db/models/AppUpdate";

export async function GET(request) {
  // Authenticate admin
  const { authenticated, response } = await authenticateAdmin(request);
  if (!authenticated) return response;

  try {
    const updates = await AppUpdate.find()
      .sort({ releaseDate: -1 });

    return successResponse(updates);
  } catch (error) {
    return errorResponse("Error fetching app updates: " + error.message);
  }
}

export async function POST(request) {
  // Authenticate admin
  const { authenticated, response } = await authenticateAdmin(request);
  if (!authenticated) return response;

  try {
    const data = await request.json();
    
    // Validate required fields
    const requiredFields = ['version', 'releaseNotes', 'apkUrl', 'instructions'];
    for (const field of requiredFields) {
      if (!data[field]) {
        return errorResponse(`${field} is required`);
      }
    }

    // Create new app update
    const newUpdate = new AppUpdate({
      version: data.version,
      releaseNotes: data.releaseNotes,
      apkUrl: data.apkUrl,
      instructions: data.instructions,
      releaseDate: data.releaseDate || new Date()
    });

    await newUpdate.save();
    return successResponse(newUpdate, 201);
  } catch (error) {
    if (error.code === 11000) {
      return errorResponse("Version already exists");
    }
    return errorResponse("Error creating app update: " + error.message);
  }
} 