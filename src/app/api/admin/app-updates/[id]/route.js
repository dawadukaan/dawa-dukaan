import { authenticateAdmin } from "@/lib/api/authMiddleware";
import { successResponse, errorResponse } from "@/lib/api/apiResponse";
import AppUpdate from "@/lib/db/models/AppUpdate";

export async function DELETE(request, { params }) {
  // Authenticate admin
  const { authenticated, response } = await authenticateAdmin(request);
  if (!authenticated) return response;

  try {
    const { id } = params;
    const deletedUpdate = await AppUpdate.findByIdAndDelete(id);

    if (!deletedUpdate) {
      return errorResponse("App update not found", 404);
    }

    return successResponse({ message: "App update deleted successfully" });
  } catch (error) {
    return errorResponse("Error deleting app update: " + error.message);
  }
} 