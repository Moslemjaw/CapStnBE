# Get All Analyses Endpoint - Summary

## Overview

Created a new endpoint to fetch all AI analyses for the authenticated user, useful for displaying analysis history in the frontend.

---

## Changes Made

### 1. **Controller** (`src/api/AiAnalysis/analyse.controller.ts`)

**Location:** Lines 617-651 (after `getAnalysisStatus` function)

**Added Function:**

```typescript
const getAllAnalyses = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const customReq = req as customRequestType;
    const ownerId = customReq.user?.id;

    if (!ownerId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const analyses = await AiAnalysis.find({
      ownerId: new mongoose.Types.ObjectId(ownerId),
    }).sort({ createdAt: -1 }); // Sort by newest first

    res.status(200).json({
      message: "Analyses fetched successfully",
      analyses: analyses.map((analysis) => ({
        analysisId: analysis._id,
        surveyIds: analysis.surveyIds,
        type: analysis.type,
        status: analysis.status,
        progress: analysis.progress,
        data: analysis.status === "ready" ? analysis.data : null,
        createdAt: analysis.createdAt,
        updatedAt: analysis.updatedAt,
      })),
      count: analyses.length,
    });
  } catch (error) {
    console.error("=== Get All Analyses Error ===");
    console.error(error);
    next(error);
  }
};
```

**Key Features:**

- ✅ Filters by authenticated user's `ownerId`
- ✅ Sorts by newest first (`createdAt: -1`)
- ✅ Returns `data` only for analyses with `status: "ready"`
- ✅ Includes count of total analyses

---

### 2. **Route** (`src/api/AiAnalysis/analyse.routes.ts`)

**Location:** Line 13

**Added Route:**

```typescript
aiRouter.get("/", authorize, getAllAnalyses);
```

**Important:** This route is placed **before** the `/:analysisId` route to avoid route conflicts.

**Route Order:**

```typescript
aiRouter.post("/test", testAI);
aiRouter.post("/", authorize, createAnalysis);
aiRouter.get("/", authorize, getAllAnalyses); // ← New: Must be before /:analysisId
aiRouter.get("/:analysisId", authorize, getAnalysisStatus);
```

---

### 3. **Documentation** (`README.md`)

**Location:** Lines 1180-1242 (in AI Analysis APIs section)

**Added Documentation:**

- Endpoint description
- Request/response format
- Example response with multiple analyses
- Notes about sorting and data availability
- Error responses

---

## API Endpoint Details

### **GET /analyse**

**Authentication:** Required (Bearer token)

**Description:** Fetches all AI analyses for the authenticated user

**Request Headers:**

```
Authorization: Bearer <your-jwt-token>
```

**Success Response (200):**

```json
{
  "message": "Analyses fetched successfully",
  "analyses": [
    {
      "analysisId": "507f1f77bcf86cd799439017",
      "surveyIds": ["507f1f77bcf86cd799439012"],
      "type": "single",
      "status": "ready",
      "progress": 100,
      "data": {
        "overview": "Overall analysis summary...",
        "surveys": [
          {
            "surveyId": "6942ff483725212c049e18cf",
            "responseCountUsed": 150,
            "findings": [...],
            "insights": [...]
          }
        ],
        "dataQualityNotes": {...}
      },
      "createdAt": "2024-01-20T10:00:00.000Z",
      "updatedAt": "2024-01-20T10:05:00.000Z"
    },
    {
      "analysisId": "507f1f77bcf86cd799439018",
      "surveyIds": ["507f1f77bcf86cd799439013", "507f1f77bcf86cd799439014"],
      "type": "multi",
      "status": "processing",
      "progress": 45,
      "data": null,
      "createdAt": "2024-01-20T11:00:00.000Z",
      "updatedAt": "2024-01-20T11:02:00.000Z"
    }
  ],
  "count": 2
}
```

**Error Responses:**

- `401`: Unauthorized (missing/invalid token)
- `500`: Server error

---

## Use Cases

### 1. **Analysis History Dashboard**

Display all analyses for the logged-in user:

```javascript
const fetchAnalyses = async () => {
  const response = await fetch("http://localhost:8000/analyse", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  const data = await response.json();
  return data.analyses;
};
```

### 2. **Filter by Status**

Frontend can filter analyses by status:

```javascript
const readyAnalyses = analyses.filter((a) => a.status === "ready");
const processingAnalyses = analyses.filter((a) => a.status === "processing");
const failedAnalyses = analyses.filter((a) => a.status === "failed");
```

### 3. **Display Recent Activity**

Analyses are sorted by newest first, perfect for "Recent Analyses" section:

```javascript
const recentAnalyses = analyses.slice(0, 5); // Get 5 most recent
```

---

## Frontend Integration Example

```javascript
import React, { useEffect, useState } from "react";

const AnalysisHistory = () => {
  const [analyses, setAnalyses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalyses = async () => {
      try {
        const response = await fetch("http://localhost:8000/analyse", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        const data = await response.json();
        setAnalyses(data.analyses);
      } catch (error) {
        console.error("Failed to fetch analyses:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalyses();
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <h2>Analysis History ({analyses.length})</h2>
      {analyses.map((analysis) => (
        <div key={analysis.analysisId}>
          <h3>Analysis {analysis.analysisId}</h3>
          <p>Type: {analysis.type}</p>
          <p>Status: {analysis.status}</p>
          <p>Progress: {analysis.progress}%</p>
          {analysis.status === "ready" && (
            <button onClick={() => viewResults(analysis.analysisId)}>
              View Results
            </button>
          )}
        </div>
      ))}
    </div>
  );
};
```

---

## Testing

### Using cURL:

```bash
curl -X GET http://localhost:8000/analyse \
  -H "Authorization: Bearer your-jwt-token-here"
```

### Using Postman:

1. Method: `GET`
2. URL: `http://localhost:8000/analyse`
3. Headers:
   - Key: `Authorization`
   - Value: `Bearer <your-token>`
4. Send Request

### Expected Behavior:

- Returns all analyses for the authenticated user
- Newest analyses appear first
- Processing analyses show `data: null`
- Ready analyses include full `data` object with real IDs

---

## Files Modified

1. `src/api/AiAnalysis/analyse.controller.ts` - Added `getAllAnalyses` function
2. `src/api/AiAnalysis/analyse.routes.ts` - Added GET route
3. `README.md` - Added endpoint documentation

## Total Lines Added: ~55 lines
