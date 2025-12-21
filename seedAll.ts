// seedAll.ts
// ✅ Populates: Users (your 3 provided IDs + MANY generated users),
//    24 Surveys, Questions, and Responses
// ✅ No dropdown / no checkbox
// ✅ Responses match your schema exactly: answers: [{ questionId, value: String }]
//
// ==========================
// BEFORE YOU RUN (STEPS)
// ==========================
// 1) Ensure models exist + default exports:
//    - ./models/User        default User
//    - ./models/Survey      default Survey
//    - ./models/Question    default Question
//    - ./models/Responses   default Responses (model name "Response")
//
// 2) Update Question enum to remove dropdown/checkbox:
//    type enum: ["text", "multiple_choice", "single_choice"]
//
// 3) Set env:
//    MONGODB_URI="mongodb://127.0.0.1:27017/yourdb"  (or your Atlas URI)
//
// 4) Run:
//    npx ts-node seedAll.ts
//
// Notes:
// - This script UPSERTS your 3 given users by _id (won't duplicate them)
// - It INSERTS additional users (new ObjectIds) every run unless you change WIPE_* toggles

import dotenv from "dotenv";
import mongoose from "mongoose";
import User from "./src/models/User";
import Survey from "./src/models/Survey";
import Question from "./src/models/Question";
import Response from "./src/models/Response";

// Load environment variables from .env file
dotenv.config();

type QType = "text" | "multiple_choice" | "single_choice";

type SeedQuestion = {
  order: number;
  text: string;
  type: QType;
  options?: string[];
  isRequired: boolean;
};

type SeedSurvey = {
  key: string;
  title: string;
  description: string;
  rewardPoints: number;
  estimatedMinutes: number;
  draft?: "published" | "unpublished";
  isCorrelationFriendly: boolean;
  questions: SeedQuestion[];
};

// --------------------------
// CONFIG
// --------------------------
const EXTRA_USERS_COUNT = 40; // ✅ creates 40 additional users besides your 3
const RESPONSES_PER_SURVEY = 35; // 24 * 35 = 840 responses (spread across all users)
const WIPE_COLLECTIONS = false; // set true if you want a clean reset (DANGEROUS)

// --------------------------
// Your provided user IDs
// --------------------------
const PROVIDED_USER_IDS = [
  "69480d561d9d338266571d39",
  "69480d54c790b357699a1a86",
  "6948129f1d9d338266571d6c",
].map((id) => new mongoose.Types.ObjectId(id));

// We'll set creatorId for surveys (use first provided user)
const CREATOR_ID = PROVIDED_USER_IDS[0];

// --------------------------
// 24 surveys (12 correlation + 12 non-correlation)
// --------------------------
const correlatedSurveys: SeedSurvey[] = [
  {
    key: "lifestyle_sleep_energy",
    title: "Lifestyle & Daily Energy (Correlation)",
    description:
      "Sleep, screen time, caffeine, activity—correlate with energy and mood.",
    rewardPoints: 120,
    estimatedMinutes: 6,
    draft: "published",
    isCorrelationFriendly: true,
    questions: [
      {
        order: 1,
        text: "On average, how many hours do you sleep per night?",
        type: "single_choice",
        options: ["<5", "5–6", "6–7", "7–8", "8–9", "9+"],
        isRequired: true,
      },
      {
        order: 2,
        text: "How consistent is your sleep schedule?",
        type: "single_choice",
        options: [
          "Very inconsistent",
          "Somewhat inconsistent",
          "Neutral",
          "Somewhat consistent",
          "Very consistent",
        ],
        isRequired: true,
      },
      {
        order: 3,
        text: "Daily screen time (non-work/school) on a typical day?",
        type: "single_choice",
        options: ["<1 hour", "1–2 hours", "2–4 hours", "4–6 hours", "6+ hours"],
        isRequired: true,
      },
      {
        order: 4,
        text: "How many caffeinated drinks do you usually have per day?",
        type: "single_choice",
        options: ["0", "1", "2", "3", "4+"],
        isRequired: true,
      },
      {
        order: 5,
        text: "How often do you do physical activity (20+ min) per week?",
        type: "single_choice",
        options: ["0 days", "1–2 days", "3–4 days", "5–6 days", "7 days"],
        isRequired: true,
      },
      {
        order: 6,
        text: "Rate your average daily energy level this week.",
        type: "single_choice",
        options: ["1", "2", "3", "4", "5"],
        isRequired: true,
      },
      {
        order: 7,
        text: "Rate your average mood this week.",
        type: "single_choice",
        options: ["1", "2", "3", "4", "5"],
        isRequired: true,
      },
      {
        order: 8,
        text: "What time do you usually go to bed? (optional)",
        type: "text",
        isRequired: false,
      },
    ],
  },
  {
    key: "academic_habits_performance",
    title: "Academic Habits & Performance (Correlation)",
    description:
      "Study hours, attendance, revision, stress—correlate with self-rated performance.",
    rewardPoints: 140,
    estimatedMinutes: 7,
    draft: "published",
    isCorrelationFriendly: true,
    questions: [
      {
        order: 1,
        text: "Average study hours per day (outside class)",
        type: "single_choice",
        options: ["0", "<1", "1–2", "2–3", "3–5", "5+"],
        isRequired: true,
      },
      {
        order: 2,
        text: "Class attendance rate",
        type: "single_choice",
        options: ["<50%", "50–69%", "70–84%", "85–94%", "95–100%"],
        isRequired: true,
      },
      {
        order: 3,
        text: "How often do you revise within 24 hours after a lecture?",
        type: "single_choice",
        options: ["Never", "Rarely", "Sometimes", "Often", "Always"],
        isRequired: true,
      },
      {
        order: 4,
        text: "Average sleep during weekdays",
        type: "single_choice",
        options: ["<5", "5–6", "6–7", "7–8", "8+"],
        isRequired: true,
      },
      {
        order: 5,
        text: "Stress level during the semester",
        type: "single_choice",
        options: ["1", "2", "3", "4", "5"],
        isRequired: true,
      },
      {
        order: 6,
        text: "Rate your academic performance this semester",
        type: "single_choice",
        options: ["1", "2", "3", "4", "5"],
        isRequired: true,
      },
      {
        order: 7,
        text: "Main study method you use most",
        type: "multiple_choice",
        options: [
          "Reading notes",
          "Practice problems",
          "Flashcards",
          "Group study",
          "Watching videos",
          "Other",
        ],
        isRequired: true,
      },
      {
        order: 8,
        text: "One thing that improves your studying (optional)",
        type: "text",
        isRequired: false,
      },
    ],
  },
  {
    key: "fitness_training_recovery",
    title: "Fitness, Training & Recovery (Correlation)",
    description:
      "Training frequency/intensity, sleep, rest days—correlate with fatigue and injury.",
    rewardPoints: 150,
    estimatedMinutes: 7,
    draft: "published",
    isCorrelationFriendly: true,
    questions: [
      {
        order: 1,
        text: "Activity level",
        type: "single_choice",
        options: [
          "Sedentary",
          "Lightly active",
          "Moderately active",
          "Very active",
          "Athlete/Competitive",
        ],
        isRequired: true,
      },
      {
        order: 2,
        text: "Workouts per week",
        type: "single_choice",
        options: ["0", "1–2", "3–4", "5–6", "7+"],
        isRequired: true,
      },
      {
        order: 3,
        text: "Typical workout intensity",
        type: "single_choice",
        options: ["Low", "Moderate", "High", "Very high"],
        isRequired: true,
      },
      {
        order: 4,
        text: "Average sleep per night",
        type: "single_choice",
        options: ["<5", "5–6", "6–7", "7–8", "8+"],
        isRequired: true,
      },
      {
        order: 5,
        text: "Rest days per week",
        type: "single_choice",
        options: ["0", "1", "2", "3", "4+"],
        isRequired: true,
      },
      {
        order: 6,
        text: "How often do you feel fatigued during workouts?",
        type: "single_choice",
        options: ["Never", "Rarely", "Sometimes", "Often", "Always"],
        isRequired: true,
      },
      {
        order: 7,
        text: "Injury affecting training (last 3 months)?",
        type: "single_choice",
        options: ["No", "Yes (minor)", "Yes (moderate)", "Yes (severe)"],
        isRequired: true,
      },
      {
        order: 8,
        text: "Main training style",
        type: "multiple_choice",
        options: ["Strength", "Cardio", "Mixed", "Sports", "Mobility", "Other"],
        isRequired: true,
      },
    ],
  },
  {
    key: "personal_finance_behavior",
    title: "Personal Finance & Spending (Correlation)",
    description:
      "Budgeting, tracking, savings, impulse—correlate with stress and stability.",
    rewardPoints: 160,
    estimatedMinutes: 8,
    draft: "published",
    isCorrelationFriendly: true,
    questions: [
      {
        order: 1,
        text: "Primary income source",
        type: "single_choice",
        options: [
          "Salary",
          "Business",
          "Allowance/Family",
          "Scholarship",
          "Mixed",
          "Other",
        ],
        isRequired: true,
      },
      {
        order: 2,
        text: "How often do you track your spending?",
        type: "single_choice",
        options: ["Never", "Rarely", "Sometimes", "Often", "Always"],
        isRequired: true,
      },
      {
        order: 3,
        text: "Do you follow a budget?",
        type: "single_choice",
        options: ["No", "Loose budget", "Strict budget"],
        isRequired: true,
      },
      {
        order: 4,
        text: "Savings rate (approx.)",
        type: "single_choice",
        options: ["0%", "1–5%", "6–10%", "11–20%", "21–30%", "30%+"],
        isRequired: true,
      },
      {
        order: 5,
        text: "Impulse purchases frequency",
        type: "single_choice",
        options: ["Never", "Rarely", "Sometimes", "Often", "Very often"],
        isRequired: true,
      },
      {
        order: 6,
        text: "Financial stress level",
        type: "single_choice",
        options: ["1", "2", "3", "4", "5"],
        isRequired: true,
      },
      {
        order: 7,
        text: "Emergency fund status",
        type: "single_choice",
        options: [
          "No",
          "Yes (<1 month)",
          "Yes (1–3 months)",
          "Yes (3–6 months)",
          "Yes (6+ months)",
        ],
        isRequired: true,
      },
      {
        order: 8,
        text: "Biggest expense category",
        type: "multiple_choice",
        options: [
          "Food",
          "Transport",
          "Rent",
          "Shopping",
          "Entertainment",
          "Bills",
          "Family support",
          "Other",
        ],
        isRequired: true,
      },
    ],
  },
  {
    key: "nutrition_focus_productivity",
    title: "Nutrition, Focus & Productivity (Correlation)",
    description:
      "Breakfast, water, fast food, caffeine—correlate with focus/productivity ratings.",
    rewardPoints: 140,
    estimatedMinutes: 7,
    draft: "published",
    isCorrelationFriendly: true,
    questions: [
      {
        order: 1,
        text: "How often do you eat breakfast?",
        type: "single_choice",
        options: [
          "Never",
          "1–2 days/week",
          "3–4 days/week",
          "5–6 days/week",
          "Everyday",
        ],
        isRequired: true,
      },
      {
        order: 2,
        text: "Glasses of water per day",
        type: "single_choice",
        options: ["0–2", "3–4", "5–6", "7–8", "9+"],
        isRequired: true,
      },
      {
        order: 3,
        text: "Fast food frequency",
        type: "single_choice",
        options: ["Never", "1×/week", "2–3×/week", "4–6×/week", "Daily"],
        isRequired: true,
      },
      {
        order: 4,
        text: "Fruits/vegetables servings per day",
        type: "single_choice",
        options: ["0", "1", "2", "3", "4+"],
        isRequired: true,
      },
      {
        order: 5,
        text: "Caffeine drinks per day",
        type: "single_choice",
        options: ["0", "1", "2", "3", "4+"],
        isRequired: true,
      },
      {
        order: 6,
        text: "Focus level during work/study",
        type: "single_choice",
        options: ["1", "2", "3", "4", "5"],
        isRequired: true,
      },
      {
        order: 7,
        text: "Productivity most days",
        type: "single_choice",
        options: ["1", "2", "3", "4", "5"],
        isRequired: true,
      },
      {
        order: 8,
        text: "Meal you skip most often (optional)",
        type: "text",
        isRequired: false,
      },
    ],
  },
  {
    key: "worklife_stress_sleep",
    title: "Work-Life Balance & Stress (Correlation)",
    description:
      "Hours, commute, sleep—correlate with stress and satisfaction.",
    rewardPoints: 150,
    estimatedMinutes: 8,
    draft: "published",
    isCorrelationFriendly: true,
    questions: [
      {
        order: 1,
        text: "Current status",
        type: "single_choice",
        options: [
          "Student",
          "Employed full-time",
          "Employed part-time",
          "Self-employed",
          "Not working",
          "Other",
        ],
        isRequired: true,
      },
      {
        order: 2,
        text: "Working/studying hours per day",
        type: "single_choice",
        options: ["<2", "2–4", "4–6", "6–8", "8–10", "10+"],
        isRequired: true,
      },
      {
        order: 3,
        text: "Commute time per day (round-trip)",
        type: "single_choice",
        options: ["0", "<30 min", "30–60 min", "1–2 hours", "2+ hours"],
        isRequired: true,
      },
      {
        order: 4,
        text: "Average sleep per night",
        type: "single_choice",
        options: ["<5", "5–6", "6–7", "7–8", "8+"],
        isRequired: true,
      },
      {
        order: 5,
        text: "Stress level",
        type: "single_choice",
        options: ["1", "2", "3", "4", "5"],
        isRequired: true,
      },
      {
        order: 6,
        text: "Overall life satisfaction",
        type: "single_choice",
        options: ["1", "2", "3", "4", "5"],
        isRequired: true,
      },
      {
        order: 7,
        text: "Main stress source",
        type: "multiple_choice",
        options: [
          "Workload",
          "Money",
          "Family",
          "Health",
          "Studies",
          "Social",
          "Other",
        ],
        isRequired: true,
      },
      {
        order: 8,
        text: "What helps you reduce stress? (optional)",
        type: "text",
        isRequired: false,
      },
    ],
  },

  // ---- 6 more correlation-friendly surveys (to make 12 total) ----
  {
    key: "social_media_sleep_mood",
    title: "Social Media, Sleep & Mood (Correlation)",
    description: "Social time + bedtime—correlate with mood and sleep quality.",
    rewardPoints: 120,
    estimatedMinutes: 6,
    draft: "published",
    isCorrelationFriendly: true,
    questions: [
      {
        order: 1,
        text: "How many hours do you spend on social media daily?",
        type: "single_choice",
        options: ["<1", "1–2", "2–4", "4–6", "6+"],
        isRequired: true,
      },
      {
        order: 2,
        text: "Do you use social media in bed before sleep?",
        type: "single_choice",
        options: ["Never", "Rarely", "Sometimes", "Often", "Always"],
        isRequired: true,
      },
      {
        order: 3,
        text: "Average bedtime on weekdays",
        type: "single_choice",
        options: [
          "Before 10 PM",
          "10–11 PM",
          "11 PM–12 AM",
          "12–2 AM",
          "After 2 AM",
        ],
        isRequired: true,
      },
      {
        order: 4,
        text: "Sleep quality this week",
        type: "single_choice",
        options: ["1", "2", "3", "4", "5"],
        isRequired: true,
      },
      {
        order: 5,
        text: "Mood this week",
        type: "single_choice",
        options: ["1", "2", "3", "4", "5"],
        isRequired: true,
      },
      {
        order: 6,
        text: "Do you take breaks from social media?",
        type: "single_choice",
        options: ["Never", "Rarely", "Sometimes", "Often"],
        isRequired: true,
      },
      {
        order: 7,
        text: "Main social app you use most",
        type: "multiple_choice",
        options: [
          "Instagram",
          "TikTok",
          "X (Twitter)",
          "Snapchat",
          "YouTube",
          "Other",
        ],
        isRequired: true,
      },
      {
        order: 8,
        text: "One change you want to make (optional)",
        type: "text",
        isRequired: false,
      },
    ],
  },
  {
    key: "time_management_productivity",
    title: "Time Management & Productivity (Correlation)",
    description: "Planning habits—correlate with focus and task completion.",
    rewardPoints: 130,
    estimatedMinutes: 7,
    draft: "published",
    isCorrelationFriendly: true,
    questions: [
      {
        order: 1,
        text: "Do you plan your day in advance?",
        type: "single_choice",
        options: ["Never", "Rarely", "Sometimes", "Often", "Always"],
        isRequired: true,
      },
      {
        order: 2,
        text: "How often do you use a to-do list?",
        type: "single_choice",
        options: ["Never", "Rarely", "Sometimes", "Often", "Always"],
        isRequired: true,
      },
      {
        order: 3,
        text: "Average procrastination level",
        type: "single_choice",
        options: ["1", "2", "3", "4", "5"],
        isRequired: true,
      },
      {
        order: 4,
        text: "Daily focus level",
        type: "single_choice",
        options: ["1", "2", "3", "4", "5"],
        isRequired: true,
      },
      {
        order: 5,
        text: "How many tasks do you complete per day (avg)?",
        type: "single_choice",
        options: ["0–1", "2–3", "4–5", "6–8", "9+"],
        isRequired: true,
      },
      {
        order: 6,
        text: "Daily distractions impact",
        type: "single_choice",
        options: ["1", "2", "3", "4", "5"],
        isRequired: true,
      },
      {
        order: 7,
        text: "Main time-waster",
        type: "multiple_choice",
        options: [
          "Social media",
          "Gaming",
          "Chats",
          "Overthinking",
          "Sleepiness",
          "Other",
        ],
        isRequired: true,
      },
      {
        order: 8,
        text: "One productivity tip you use (optional)",
        type: "text",
        isRequired: false,
      },
    ],
  },
  {
    key: "coffee_sleep_anxiety",
    title: "Caffeine, Sleep & Stress (Correlation)",
    description: "Caffeine timing—correlate with sleep quality and stress.",
    rewardPoints: 120,
    estimatedMinutes: 6,
    draft: "published",
    isCorrelationFriendly: true,
    questions: [
      {
        order: 1,
        text: "Caffeinated drinks per day",
        type: "single_choice",
        options: ["0", "1", "2", "3", "4+"],
        isRequired: true,
      },
      {
        order: 2,
        text: "Latest time you consume caffeine",
        type: "single_choice",
        options: ["Before 12 PM", "12–3 PM", "3–6 PM", "After 6 PM"],
        isRequired: true,
      },
      {
        order: 3,
        text: "Sleep quality this week",
        type: "single_choice",
        options: ["1", "2", "3", "4", "5"],
        isRequired: true,
      },
      {
        order: 4,
        text: "Stress level this week",
        type: "single_choice",
        options: ["1", "2", "3", "4", "5"],
        isRequired: true,
      },
      {
        order: 5,
        text: "Do you take caffeine-free days?",
        type: "single_choice",
        options: ["Never", "Rarely", "Sometimes", "Often"],
        isRequired: true,
      },
      {
        order: 6,
        text: "Do you feel jittery after caffeine?",
        type: "single_choice",
        options: ["Never", "Rarely", "Sometimes", "Often"],
        isRequired: true,
      },
      {
        order: 7,
        text: "Main caffeine source",
        type: "multiple_choice",
        options: [
          "Coffee",
          "Tea",
          "Energy drink",
          "Soda",
          "Pre-workout",
          "Other",
        ],
        isRequired: true,
      },
      {
        order: 8,
        text: "Any notes (optional)",
        type: "text",
        isRequired: false,
      },
    ],
  },
  {
    key: "hydration_training_fatigue",
    title: "Hydration, Training & Fatigue (Correlation)",
    description: "Hydration habits—correlate with fatigue and workout quality.",
    rewardPoints: 120,
    estimatedMinutes: 6,
    draft: "published",
    isCorrelationFriendly: true,
    questions: [
      {
        order: 1,
        text: "Glasses of water per day",
        type: "single_choice",
        options: ["0–2", "3–4", "5–6", "7–8", "9+"],
        isRequired: true,
      },
      {
        order: 2,
        text: "Workouts per week",
        type: "single_choice",
        options: ["0", "1–2", "3–4", "5–6", "7+"],
        isRequired: true,
      },
      {
        order: 3,
        text: "Do you drink water during workouts?",
        type: "single_choice",
        options: ["Never", "Sometimes", "Often", "Always"],
        isRequired: true,
      },
      {
        order: 4,
        text: "Fatigue after workouts",
        type: "single_choice",
        options: ["1", "2", "3", "4", "5"],
        isRequired: true,
      },
      {
        order: 5,
        text: "Workout quality this week",
        type: "single_choice",
        options: ["1", "2", "3", "4", "5"],
        isRequired: true,
      },
      {
        order: 6,
        text: "How often do you get cramps?",
        type: "single_choice",
        options: ["Never", "Rarely", "Sometimes", "Often"],
        isRequired: true,
      },
      {
        order: 7,
        text: "Primary workout time",
        type: "single_choice",
        options: ["Morning", "Afternoon", "Evening", "Late night"],
        isRequired: true,
      },
      {
        order: 8,
        text: "Any notes (optional)",
        type: "text",
        isRequired: false,
      },
    ],
  },
  {
    key: "study_sleep_performance",
    title: "Study, Sleep & Performance (Correlation)",
    description:
      "Study patterns + sleep—correlate with performance and stress.",
    rewardPoints: 130,
    estimatedMinutes: 7,
    draft: "published",
    isCorrelationFriendly: true,
    questions: [
      {
        order: 1,
        text: "Study hours per day",
        type: "single_choice",
        options: ["0", "<1", "1–2", "2–3", "3–5", "5+"],
        isRequired: true,
      },
      {
        order: 2,
        text: "Average sleep per night",
        type: "single_choice",
        options: ["<5", "5–6", "6–7", "7–8", "8+"],
        isRequired: true,
      },
      {
        order: 3,
        text: "Procrastination level",
        type: "single_choice",
        options: ["1", "2", "3", "4", "5"],
        isRequired: true,
      },
      {
        order: 4,
        text: "Stress level",
        type: "single_choice",
        options: ["1", "2", "3", "4", "5"],
        isRequired: true,
      },
      {
        order: 5,
        text: "Rate your performance recently",
        type: "single_choice",
        options: ["1", "2", "3", "4", "5"],
        isRequired: true,
      },
      {
        order: 6,
        text: "Attendance rate",
        type: "single_choice",
        options: ["<50%", "50–69%", "70–84%", "85–94%", "95–100%"],
        isRequired: true,
      },
      {
        order: 7,
        text: "Main study time",
        type: "single_choice",
        options: ["Morning", "Afternoon", "Evening", "Late night"],
        isRequired: true,
      },
      {
        order: 8,
        text: "Any notes (optional)",
        type: "text",
        isRequired: false,
      },
    ],
  },
  {
    key: "spending_sleep_stress",
    title: "Spending, Sleep & Stress (Correlation)",
    description: "Impulse spending + sleep—correlate with stress and regret.",
    rewardPoints: 130,
    estimatedMinutes: 7,
    draft: "published",
    isCorrelationFriendly: true,
    questions: [
      {
        order: 1,
        text: "Impulse purchases frequency",
        type: "single_choice",
        options: ["Never", "Rarely", "Sometimes", "Often", "Very often"],
        isRequired: true,
      },
      {
        order: 2,
        text: "Average sleep per night",
        type: "single_choice",
        options: ["<5", "5–6", "6–7", "7–8", "8+"],
        isRequired: true,
      },
      {
        order: 3,
        text: "Stress level",
        type: "single_choice",
        options: ["1", "2", "3", "4", "5"],
        isRequired: true,
      },
      {
        order: 4,
        text: "How often do you regret purchases?",
        type: "single_choice",
        options: ["Never", "Rarely", "Sometimes", "Often"],
        isRequired: true,
      },
      {
        order: 5,
        text: "Do you track your spending?",
        type: "single_choice",
        options: ["Never", "Rarely", "Sometimes", "Often", "Always"],
        isRequired: true,
      },
      {
        order: 6,
        text: "Monthly savings consistency",
        type: "single_choice",
        options: ["Never", "Rarely", "Sometimes", "Often", "Always"],
        isRequired: true,
      },
      {
        order: 7,
        text: "Top spending category",
        type: "multiple_choice",
        options: [
          "Food",
          "Shopping",
          "Entertainment",
          "Transport",
          "Bills",
          "Other",
        ],
        isRequired: true,
      },
      {
        order: 8,
        text: "What triggers spending for you? (optional)",
        type: "text",
        isRequired: false,
      },
    ],
  },
];

const nonCorrelatedSurveys: SeedSurvey[] = [
  {
    key: "entertainment_preferences",
    title: "Entertainment Preferences (Non-Correlation)",
    description:
      "Content preferences and discovery habits—best for segmentation and summaries.",
    rewardPoints: 90,
    estimatedMinutes: 5,
    draft: "published",
    isCorrelationFriendly: false,
    questions: [
      {
        order: 1,
        text: "Favorite entertainment type",
        type: "single_choice",
        options: [
          "Movies",
          "TV series",
          "YouTube",
          "Podcasts",
          "Gaming",
          "Books",
          "Music",
        ],
        isRequired: true,
      },
      {
        order: 2,
        text: "Preferred genre",
        type: "single_choice",
        options: [
          "Action",
          "Comedy",
          "Drama",
          "Sci-Fi",
          "Thriller",
          "Horror",
          "Documentary",
          "Animation",
        ],
        isRequired: true,
      },
      {
        order: 3,
        text: "How do you discover new content most often?",
        type: "single_choice",
        options: [
          "Friends",
          "Social media",
          "Recommendations",
          "Reviews",
          "Random browsing",
          "Other",
        ],
        isRequired: true,
      },
      {
        order: 4,
        text: "Pick one platform you use most",
        type: "multiple_choice",
        options: [
          "Netflix",
          "YouTube",
          "TikTok",
          "Spotify/Apple Music",
          "Gaming platforms",
          "Other",
        ],
        isRequired: true,
      },
      {
        order: 5,
        text: "Name something you enjoyed recently (optional)",
        type: "text",
        isRequired: false,
      },
    ],
  },
  // ... (the rest of non-correlation surveys)
];

// To keep this message usable, I’m including a compact generator to create
// the remaining 11 non-correlation surveys (so total still becomes 24).
// You can expand or customize text easily.
while (nonCorrelatedSurveys.length < 12) {
  const idx = nonCorrelatedSurveys.length + 1;
  nonCorrelatedSurveys.push({
    key: `noncorr_${idx}`,
    title: `Preferences Survey #${idx} (Non-Correlation)`,
    description:
      "Preference-focused questions for segmentation and AI summaries.",
    rewardPoints: 70 + (idx % 5) * 5,
    estimatedMinutes: 4 + (idx % 3),
    draft: "published",
    isCorrelationFriendly: false,
    questions: [
      {
        order: 1,
        text: "Pick the option that best matches your preference",
        type: "single_choice",
        options: ["Option A", "Option B", "Option C", "Option D"],
        isRequired: true,
      },
      {
        order: 2,
        text: "What do you prioritize most?",
        type: "single_choice",
        options: ["Price", "Quality", "Speed", "Convenience", "Experience"],
        isRequired: true,
      },
      {
        order: 3,
        text: "Choose the closest description",
        type: "single_choice",
        options: ["Simple", "Balanced", "Detailed", "Experimental"],
        isRequired: true,
      },
      {
        order: 4,
        text: "Pick one you relate to most",
        type: "multiple_choice",
        options: [
          "Calm",
          "Ambitious",
          "Curious",
          "Creative",
          "Organized",
          "Spontaneous",
        ],
        isRequired: true,
      },
      {
        order: 5,
        text: "Any extra notes? (optional)",
        type: "text",
        isRequired: false,
      },
    ],
  });
}

const ALL_SEED_SURVEYS: SeedSurvey[] = [
  ...correlatedSurveys,
  ...nonCorrelatedSurveys,
];

// --------------------------
// Helpers
// --------------------------
function pickOne<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function makeTextSample() {
  return pickOne([
    "No specific comments.",
    "It depends on my schedule.",
    "I’m trying to improve this.",
    "Usually consistent most days.",
    "Varies from week to week.",
    "I prefer a simple routine.",
    "Around 10–11 PM most days.",
  ]);
}

function answerValueFor(q: SeedQuestion): string {
  if (q.type === "text") return makeTextSample();
  const opts = q.options ?? [];
  return opts.length ? pickOne(opts) : "N/A";
}

function buildResponseDoc(params: {
  surveyId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  questionDocs: Array<{
    _id: mongoose.Types.ObjectId;
    order: number;
    text: string;
    type: QType;
    options: string[];
    isRequired: boolean;
  }>;
}) {
  const startedAt = new Date(Date.now() - randomInt(10, 240) * 60_000);
  const durationMs = randomInt(2, 10) * 60_000 + randomInt(0, 50_000);
  const submittedAt = new Date(startedAt.getTime() + durationMs);

  const isSpam = Math.random() < 0.06;
  const trustImpact = isSpam ? -0.7 : pickOne([0.0, 0.03, 0.05, 0.08, 0.1]);
  const spamToken = pickOne(["test", "ok", "idk", "asdf", "هههه"]);

  const answers = params.questionDocs
    .filter((q) => q.isRequired || Math.random() < 0.7)
    .map((q) => {
      const seedQ: SeedQuestion = {
        order: q.order,
        text: q.text,
        type: q.type,
        options: q.options ?? [],
        isRequired: q.isRequired,
      };

      const value =
        isSpam && Math.random() < 0.8 ? spamToken : answerValueFor(seedQ);

      return { questionId: q._id, value };
    });

  return {
    surveyId: params.surveyId,
    userId: params.userId,
    startedAt,
    submittedAt,
    durationMs,
    isFlaggedSpam: isSpam,
    trustImpact,
    answers,
  };
}

// --------------------------
// MAIN SEED
// --------------------------
export async function seedAll() {
  if (!process.env.MONGODB_URI) throw new Error("Missing MONGODB_URI env var.");

  await mongoose.connect(process.env.MONGODB_URI);

  if (WIPE_COLLECTIONS) {
    await Promise.all([
      Response.deleteMany({}),
      Question.deleteMany({}),
      Survey.deleteMany({}),
      User.deleteMany({}),
    ]);
    console.log("⚠️ WIPED collections: Responses, Questions, Surveys, Users");
  }

  // A) Upsert your 3 given users by _id
  const fixedUsers = [
    {
      _id: PROVIDED_USER_IDS[0],
      fullName: "Seed User 1",
      email: "seed1@sight.local",
      password: "Password123!",
      points: 500,
      streakDays: 7,
      level: 5,
      trustScore: 70,
      image: "",
    },
    {
      _id: PROVIDED_USER_IDS[1],
      fullName: "Seed User 2",
      email: "seed2@sight.local",
      password: "Password123!",
      points: 250,
      streakDays: 2,
      level: 3,
      trustScore: 55,
      image: "",
    },
    {
      _id: PROVIDED_USER_IDS[2],
      fullName: "Seed User 3",
      email: "seed3@sight.local",
      password: "Password123!",
      points: 100,
      streakDays: 0,
      level: 1,
      trustScore: 45,
      image: "",
    },
  ];
  for (const u of fixedUsers) {
    await User.updateOne({ _id: u._id }, { $set: u }, { upsert: true });
  }

  // B) Create EXTRA users (new objectIds)
  const extraUsers = Array.from({ length: EXTRA_USERS_COUNT }).map((_, i) => ({
    fullName: `Extra User ${i + 1}`,
    email: `extra${i + 1}@sight.local`,
    password: "Password123!",
    points: randomInt(0, 500),
    streakDays: randomInt(0, 14),
    level: randomInt(1, 8),
    trustScore: randomInt(25, 85),
    image: "",
  }));

  const insertedExtraUsers = await User.insertMany(extraUsers);
  const allUserIds = [
    ...PROVIDED_USER_IDS,
    ...insertedExtraUsers.map((u) => u._id),
  ];

  // C) Insert 24 surveys
  const insertedSurveys = await Survey.insertMany(
    ALL_SEED_SURVEYS.map((s) => ({
      title: s.title,
      description: s.description,
      rewardPoints: s.rewardPoints,
      estimatedMinutes: s.estimatedMinutes,
      draft: s.draft ?? "unpublished",
      creatorId: CREATOR_ID,
    }))
  );

  // D) Insert questions
  const insertedQuestions = await Question.insertMany(
    insertedSurveys.flatMap((surveyDoc, i) => {
      const seedSurvey = ALL_SEED_SURVEYS[i];
      return seedSurvey.questions.map((q) => ({
        order: q.order,
        text: q.text,
        type: q.type,
        options: q.options ?? [],
        isRequired: q.isRequired,
        surveyId: surveyDoc._id,
      }));
    })
  );

  // E) Build lookup: surveyId -> questions
  const questionsBySurvey = new Map<string, any[]>();
  for (const q of insertedQuestions) {
    const sid = String(q.surveyId);
    if (!questionsBySurvey.has(sid)) questionsBySurvey.set(sid, []);
    questionsBySurvey.get(sid)!.push(q);
  }
  for (const [sid, arr] of questionsBySurvey) {
    arr.sort((a, b) => a.order - b.order);
    questionsBySurvey.set(sid, arr);
  }

  // F) Insert responses distributed across ALL users
  const responseDocs: any[] = [];
  for (const survey of insertedSurveys) {
    const qDocs = questionsBySurvey.get(String(survey._id)) ?? [];
    for (let i = 0; i < RESPONSES_PER_SURVEY; i++) {
      const userId = pickOne(allUserIds);
      responseDocs.push(
        buildResponseDoc({
          surveyId: survey._id,
          userId,
          questionDocs: qDocs.map((q) => ({
            _id: q._id,
            order: q.order,
            text: q.text,
            type: q.type,
            options: q.options ?? [],
            isRequired: q.isRequired,
          })),
        })
      );
    }
  }

  const insertedResponses = await Response.insertMany(responseDocs);

  // G) Simple points update for ALL users (optional gamification test)
  const countsByUser = new Map<string, number>();
  for (const r of insertedResponses) {
    const uid = String(r.userId);
    countsByUser.set(uid, (countsByUser.get(uid) ?? 0) + 1);
  }
  for (const [uid, count] of countsByUser) {
    await User.updateOne(
      { _id: new mongoose.Types.ObjectId(uid) },
      { $inc: { points: count * 10 } }
    );
  }

  console.log("✅ Seed complete!");
  console.log({
    fixedUsersUpserted: fixedUsers.length,
    extraUsersInserted: insertedExtraUsers.length,
    surveysInserted: insertedSurveys.length,
    questionsInserted: insertedQuestions.length,
    responsesInserted: insertedResponses.length,
  });

  await mongoose.disconnect();
}

// Run directly
seedAll().catch(async (err) => {
  console.error("❌ Seed failed:", err);
  try {
    await mongoose.disconnect();
  } catch {}
  process.exit(1);
});
