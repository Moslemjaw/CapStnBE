# ID Mapping Changes Summary

## Overview

Added functionality to convert AI-generated short IDs (s1, q1, etc.) back to real MongoDB ObjectIds, making the analysis results directly usable by the frontend.

---

## Changes Made

### 1. **Model Changes** (`src/models/AiAnalysis.ts`)

**Location:** Lines 142-152 (after `progress` field)

**What Changed:**

- Added `idMapping` field to store the mapping between short IDs and real IDs

```typescript
idMapping: {
  type: {
    surveys: {
      type: Map,
      of: String,
    },
    questions: {
      type: Map,
      of: String,
    },
  },
  required: false,
},
```

**Why:**

- Persists the ID mapping in the database
- Allows recovery of real IDs even if server restarts
- Useful for debugging and data integrity

---

### 2. **Controller Changes** (`src/api/AiAnalysis/analyse.controller.ts`)

#### A. Created Reverse ID Maps

**Location:** Lines 186-203

**What Changed:**

- Added `reverseSurveyIdMap` and `reverseQuestionIdMap`
- These maps go from short IDs → real IDs (opposite of the original maps)

**Before:**

```typescript
const surveyIdMap = new Map<string, string>(); // realId -> shortId
const questionIdMap = new Map<string, string>(); // realId -> shortId

surveys.forEach((survey, index) => {
  const shortId = `s${index + 1}`;
  surveyIdMap.set(survey._id.toString(), shortId);
});
```

**After:**

```typescript
const surveyIdMap = new Map<string, string>(); // realId -> shortId
const questionIdMap = new Map<string, string>(); // realId -> shortId
const reverseSurveyIdMap = new Map<string, string>(); // shortId -> realId
const reverseQuestionIdMap = new Map<string, string>(); // shortId -> realId

surveys.forEach((survey, index) => {
  const shortId = `s${index + 1}`;
  const realId = survey._id.toString();
  surveyIdMap.set(realId, shortId);
  reverseSurveyIdMap.set(shortId, realId); // ← New: reverse mapping
});
```

---

#### B. Return Reverse Maps from Data Transformation

**Location:** Lines 268-285

**What Changed:**

- Added reverse maps to the returned data structure
- Converted Maps to plain objects using `Object.fromEntries()` for better serialization

**Before:**

```typescript
const result = {
  surveys: surveysFormatted,
  questions: questionsFormatted,
  responseAlignment: {...},
  responsesByQuestion: responsesByQuestion,
  responseCount: responseCount,
};
```

**After:**

```typescript
const result = {
  surveys: surveysFormatted,
  questions: questionsFormatted,
  responseAlignment: {...},
  responsesByQuestion: responsesByQuestion,
  responseCount: responseCount,
  // ← New: Include reverse maps for converting back to real IDs
  reverseSurveyIdMap: Object.fromEntries(reverseSurveyIdMap),
  reverseQuestionIdMap: Object.fromEntries(reverseQuestionIdMap),
};
```

---

#### C. Added Conversion Function

**Location:** Lines 295-313 (after `mapQuestionType` function)

**What Changed:**

- Created `convertShortIdsToRealIds()` function
- Converts AI response from short IDs to real MongoDB ObjectIds

```typescript
const convertShortIdsToRealIds = (
  aiResponse: any,
  reverseSurveyMap: { [key: string]: string },
  reverseQuestionMap: { [key: string]: string }
) => {
  // Clone the response to avoid mutation
  const converted = JSON.parse(JSON.stringify(aiResponse));

  // Convert survey IDs in the surveys array
  if (converted.surveys && Array.isArray(converted.surveys)) {
    converted.surveys = converted.surveys.map((survey: any) => ({
      ...survey,
      surveyId: reverseSurveyMap[survey.surveyId] || survey.surveyId,
    }));
  }

  return converted;
};
```

**Purpose:**

- Takes AI response with short IDs (s1, q1)
- Replaces them with real ObjectIds
- Returns frontend-ready data

---

#### D. Use Conversion in Analysis Function

**Location:** Lines 397-412 (in `analyzeSurveyData` function)

**What Changed:**

- Convert AI response before returning it
- Use the reverse maps from `surveyData`

**Before:**

```typescript
const response = completion.choices[0]?.message?.content;
const parsedResponse = JSON.parse(response || "{}");

await AiAnalysis.findByIdAndUpdate(analysisId, { progress: 90 });

console.log("=== OpenAI Analysis Response ===");
console.log(JSON.stringify(parsedResponse, null, 2));

return parsedResponse;
```

**After:**

```typescript
const response = completion.choices[0]?.message?.content;
const parsedResponse = JSON.parse(response || "{}");

// ← New: Convert short IDs back to real IDs
const convertedResponse = convertShortIdsToRealIds(
  parsedResponse,
  surveyData.reverseSurveyIdMap,
  surveyData.reverseQuestionIdMap
);

await AiAnalysis.findByIdAndUpdate(analysisId, { progress: 90 });

console.log("=== OpenAI Analysis Response (with real IDs) ===");
console.log(JSON.stringify(convertedResponse, null, 2));

return convertedResponse; // ← Return converted instead of original
```

---

#### E. Store ID Mapping in Database

**Location:** Lines 500-517 (in `createAnalysis` function)

**What Changed:**

- Store the ID mapping when creating the AiAnalysis document

**Before:**

```typescript
const aiAnalysis = await AiAnalysis.create({
  ownerId: ownerObjectId,
  surveyIds: surveyObjectIds,
  type,
  status: "processing",
  progress: 0,
  data: {...},
});
```

**After:**

```typescript
const aiAnalysis = await AiAnalysis.create({
  ownerId: ownerObjectId,
  surveyIds: surveyObjectIds,
  type,
  status: "processing",
  progress: 0,
  idMapping: { // ← New: Store the mapping
    surveys: surveyData.reverseSurveyIdMap,
    questions: surveyData.reverseQuestionIdMap,
  },
  data: {...},
});
```

---

## How It Works

### Data Flow:

1. **Frontend sends request**: `{ surveyIds: ["6942ff...", "6942ff..."] }`
2. **Backend creates maps**:

   - Forward: `"6942ff..." → "s1"`
   - Reverse: `"s1" → "6942ff..."`

3. **AI receives short IDs**: Saves tokens/costs

   ```json
   { "surveyId": "s1", "findings": [...] }
   ```

4. **Backend converts back**: Before storing

   ```json
   { "surveyId": "6942ff483725212c049e18cf", "findings": [...] }
   ```

5. **Frontend receives real IDs**: Directly usable
   - No need to manually map IDs
   - Can directly query surveys/questions with these IDs

---

## Benefits

✅ **Frontend Integration**: Real IDs can be used directly without additional mapping

✅ **Cost Optimization**: AI still uses short IDs to save tokens

✅ **Data Persistence**: ID mapping stored in database for recovery

✅ **Type Safety**: TypeScript ensures proper ID handling

✅ **Debugging**: Easier to trace data with real IDs in analysis results

---

## Example Response

### Before (with short IDs):

```json
{
  "data": {
    "surveys": [
      {
        "surveyId": "s1",
        "findings": [...]
      }
    ]
  }
}
```

### After (with real IDs):

```json
{
  "data": {
    "surveys": [
      {
        "surveyId": "6942ff483725212c049e18cf",
        "findings": [...]
      }
    ]
  },
  "idMapping": {
    "surveys": { "s1": "6942ff483725212c049e18cf" },
    "questions": { "q1": "6942ff483725212c049e18d1" }
  }
}
```

---

## Testing

To test the changes:

1. Create an analysis:

   ```bash
   POST /analyse/analyze
   {
     "surveyIds": ["6942ff483725212c049e18cf"]
   }
   ```

2. Check the response - `surveyId` should be the real ObjectId, not "s1"

3. Verify in database that `idMapping` field is populated

---

## Files Modified

1. `src/models/AiAnalysis.ts` - Added idMapping field
2. `src/api/AiAnalysis/analyse.controller.ts` - Added conversion logic

## Total Lines Changed: ~40 lines added/modified
