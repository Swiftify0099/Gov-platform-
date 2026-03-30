import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface ExamAnswer {
  question_id: string;
  selected_options: number[];
  time_spent_seconds: number;
}

interface ExamState {
  submissionId: string | null;
  answers: Record<string, ExamAnswer>;
  currentQuestionIndex: number;
  violationCount: number;
  isSubmitted: boolean;
  startedAt: string | null;
}

const initialState: ExamState = {
  submissionId: null,
  answers: {},
  currentQuestionIndex: 0,
  violationCount: 0,
  isSubmitted: false,
  startedAt: null,
};

const examSlice = createSlice({
  name: 'exam',
  initialState,
  reducers: {
    startExam: (state, action: PayloadAction<{ submissionId: string }>) => {
      state.submissionId = action.payload.submissionId;
      state.startedAt = new Date().toISOString();
      state.isSubmitted = false;
      state.answers = {};
      state.violationCount = 0;
      state.currentQuestionIndex = 0;
    },
    setAnswer: (state, action: PayloadAction<{ questionId: string; options: number[] }>) => {
      const { questionId, options } = action.payload;
      state.answers[questionId] = {
        question_id: questionId,
        selected_options: options,
        time_spent_seconds: 0,
      };
    },
    incrementViolation: (state) => {
      state.violationCount += 1;
    },
    setCurrentQuestion: (state, action: PayloadAction<number>) => {
      state.currentQuestionIndex = action.payload;
    },
    submitExam: (state) => {
      state.isSubmitted = true;
    },
    resetExam: () => initialState,
  },
});

export const {
  startExam,
  setAnswer,
  incrementViolation,
  setCurrentQuestion,
  submitExam,
  resetExam,
} = examSlice.actions;
export default examSlice.reducer;
