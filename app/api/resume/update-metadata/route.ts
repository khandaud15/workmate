import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route";
import { db } from "@/lib/firebase";

// Force dynamic rendering for this route
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userEmail = session.user.email;
    const formData = await req.formData();
    const fileName = formData.get("fileName") as string;
    const resumeName = formData.get("resumeName") as string;
    const isTargetedStr = formData.get("isTargeted") as string;
    const isTargeted = isTargetedStr === "true";

    console.log("Received metadata update request:", {
      fileName,
      resumeName,
      isTargetedStr,
      isTargeted
    });

    if (!fileName) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    console.log("Updating resume metadata", {
      userEmail,
      fileName,
      resumeName,
      isTargeted,
    });

    // Get the user document reference
    const userRef = db.collection("users").doc(userEmail);
    
    // Get current user data to avoid overwriting existing entries
    const userDoc = await userRef.get();
    const userData = userDoc.exists ? userDoc.data() || {} : {};
    
    // Get existing resumeNames and targetedResumes
    const currentResumeNames = userData.resumeNames || {};
    const currentTargeted = userData.targetedResumes || {};
    
    // Update with new values - ensure unique resume names
    let finalResumeName = resumeName || fileName;
    
    // Check if this name already exists for a different file
    const existingFileWithSameName = Object.entries(currentResumeNames).find(([key, value]) => 
      value === finalResumeName && key !== fileName
    );
    
    if (existingFileWithSameName) {
      // Make the name unique by adding a number
      let counter = 1;
      let uniqueName = `${finalResumeName} (${counter})`;
      
      // Keep incrementing until we find a unique name
      while (Object.values(currentResumeNames).includes(uniqueName)) {
        counter++;
        uniqueName = `${finalResumeName} (${counter})`;
      }
      
      finalResumeName = uniqueName;
      console.log(`Made resume name unique: ${resumeName} → ${finalResumeName}`);
    }
    
    // Update resumeNames with the new name ONLY for this specific file
    // First, create a copy of the current resume names
    const updatedResumeNames = { ...currentResumeNames };
    
    // Then, only update the name for this specific file
    updatedResumeNames[fileName] = finalResumeName;
    
    console.log("[UPDATE-METADATA] Updating ONLY this resume's name:", {
      specificFile: fileName,
      newName: finalResumeName,
      allNames: updatedResumeNames
    });
    
    // Handle targeted resumes - only one can be targeted at a time
    let updatedTargeted: Record<string, boolean> = {};
    
    if (isTargeted) {
      // If this resume is being targeted, untarget all others
      Object.keys(currentTargeted).forEach(key => {
        updatedTargeted[key] = false;
      });
      // Then set only this resume to targeted
      updatedTargeted[fileName] = true;
      console.log("Setting as the only targeted resume:", fileName);
    } else {
      // If not targeted, preserve other targeted statuses
      updatedTargeted = {
        ...currentTargeted,
        [fileName]: false
      };
    }
    
    // Force convert any string values to boolean
    Object.keys(updatedTargeted).forEach(key => {
      const value = updatedTargeted[key];
      if (typeof value === 'string') {
        updatedTargeted[key] = value === 'true';
      }
    });
    
    console.log("Updating targetedResumes:", {
      [fileName]: isTargeted,
      current: currentTargeted,
      updated: updatedTargeted
    });
    
    // Log what we're about to save to the database
    console.log("Final data to save:", {
      resumeNames: updatedResumeNames,
      targetedResumes: updatedTargeted,
      targetedForThisFile: updatedTargeted[fileName]
    });
    
    // Defensive: Log what we are about to write
    console.log('[UPDATE-METADATA] About to save:', {
      resumeNames: updatedResumeNames,
      targetedResumes: updatedTargeted,
      fileName,
      finalResumeName,
      isTargeted,
      allKeys: Object.keys(updatedResumeNames)
    });

    // Actually update the resumeNames and targetedResumes objects
    await userRef.set(
      {
        resumeNames: updatedResumeNames,
        targetedResumes: updatedTargeted,
      },
      { merge: true }
    );

    // Defensive: Read back and log what was saved
    const updatedDoc = await userRef.get();
    const updatedData = updatedDoc.exists ? updatedDoc.data() || {} : {};
    console.log('[UPDATE-METADATA] Verification after save:', {
      resumeNames: updatedData.resumeNames,
      targetedResumes: updatedData.targetedResumes,
      targetedForThisFile: updatedData.targetedResumes?.[fileName],
      allKeys: updatedData.resumeNames ? Object.keys(updatedData.resumeNames) : []
    });

    console.log("Resume metadata updated successfully", {
      userEmail,
      fileName,
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error updating resume metadata", {
      error: error.message,
    });
    return NextResponse.json(
      { error: "Failed to update resume metadata" },
      { status: 500 }
    );
  }
}
