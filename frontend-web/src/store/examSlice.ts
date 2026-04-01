import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Question, Submission, Assignment } from '../types';

interface ExamState {
  currentAssignment: Assignment | null;
  currentSubmission: Submission | null;
  questions: Question[];
  currentQuestionIndex: number;
  answers: Record<string, number[]>;
  timeSpent: Record<string, number>;
  violationCount: number;
  isExamActive: boolean;
  faceVerified: boolean;
  violationLogs: Array<{ type: string; timestamp: string; screenshot?: string }>;
}

const initialState: ExamState = {
  currentAssignment: null,
  currentSubmission: null,
  questions: [],
  currentQuestionIndex: 0,
  answers: {},
  timeSpent: {},
  violationCount: 0,
  isExamActive: false,
  faceVerified: false,
  violationLogs: [],
};

const examSlice = createSlice({
  name: 'exam',
  initialState,
  reducers: {
    startExam: (state, action: PayloadAction<{
      assignment: Assignment;
      submission: Submission;
      questions: Question[];
    }>) => {
      state.currentAssignment = action.payload.assignment;
      state.currentSubmission = action.payload.submission;
      state.questions = action.payload.questions;
      state.currentQuestionIndex = 0;
      state.answers = {};
      state.timeSpent = {};
      state.violationCount = 0;
      state.isExamActive = true;
    },
    setAnswer: (state, action: PayloadAction<{ questionId: string; options: number[] }>) => {
      state.answers[action.payload.questionId] = action.payload.options;
    },
    setCurrentQuestion: (state, action: PayloadAction<number>) => {
      state.currentQuestionIndex = action.payload;
    },
    incrementViolation: (state) => {
      state.violationCount += 1;
    },
    setFaceVerified: (state, action: PayloadAction<boolean>) => {
      state.faceVerified = action.payload;
    },
    endExam: (state) => {
      state.isExamActive = false;
    },
    resetExam: () => initialState,
    addViolationLog: (state, action: PayloadAction<{ type: string; timestamp: string; screenshot?: string }>) => {
      state.violationLogs.push(action.payload);
    },
  },
});

export const {
  startExam, setAnswer, setCurrentQuestion,
  incrementViolation, setFaceVerified, endExam, resetExam, addViolationLog
} = examSlice.actions;
export default examSlice.reducer;
