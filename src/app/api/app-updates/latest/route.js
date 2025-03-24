import { authenticateUser } from "@/lib/api/authMiddleware";
import { successResponse, errorResponse } from "@/lib/api/apiResponse";
import AppUpdate from "@/lib/db/models/AppUpdate";

export async function GET(request) {
  // Authenticate user
  const { authenticated, response } = await authenticateUser(request);
  if (!authenticated) return response;

  try {
    // Get the latest update by sorting on releaseDate
    const latestUpdate = await AppUpdate.findOne()
      .sort({ releaseDate: -1 })
      .select('version releaseNotes releaseDate apkUrl instructions');

    if (!latestUpdate) {
      return errorResponse("No updates found", 404);
    }

    return successResponse(latestUpdate);
  } catch (error) {
    return errorResponse("Error fetching app update: " + error.message);
  }
} 