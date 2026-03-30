#!/bin/bash

# Remove existing folder
rm -rf exam-prep-platform

# Create base structure
mkdir -p exam-prep-platform/{backend/app/{middleware,models,schemas,routers,services,utils},backend/data/uploads/{profile_photos,question_files,violation_screenshots},backend/migrations,frontend-web/public/locales/{en,mr,hi},frontend-web/public/models,frontend-web/src/{api,store,hooks,components/{common,auth,exam,results,admin},pages/{auth,student,admin,superadmin},types,utils},frontend-mobile/src/{screens/{auth,student,admin},components,navigation,api,store}}

# Backend core files
touch exam-prep-platform/backend/app/{__init__.py,main.py,config.py,database.py,redis_client.py,dependencies.py}

# Middleware
touch exam-prep-platform/backend/app/middleware/{__init__.py,cors.py,logging.py}

# Models
touch exam-prep-platform/backend/app/models/{__init__.py,user.py,exam.py,question.py,assignment.py,submission.py,violation.py,payment.py,institute.py}

# Schemas
touch exam-prep-platform/backend/app/schemas/{__init__.py,user.py,exam.py,question.py,assignment.py,submission.py,violation.py,payment.py,auth.py}

# Routers
touch exam-prep-platform/backend/app/routers/{__init__.py,auth.py,users.py,institutes.py,courses.py,questions.py,assignments.py,submissions.py,violations.py,payments.py,uploads.py,gpt.py,analytics.py,admin.py}

# Services
touch exam-prep-platform/backend/app/services/{__init__.py,auth_service.py,otp_service.py,storage_service.py,gpt_service.py,payment_service.py,score_service.py,cleanup_service.py}

# Utils
touch exam-prep-platform/backend/app/utils/{__init__.py,jwt_utils.py,file_utils.py,validators.py}

# Backend root files
touch exam-prep-platform/backend/migrations/schema.sql
touch exam-prep-platform/backend/{requirements.txt,Dockerfile,.env.example}

# Frontend web files
touch exam-prep-platform/frontend-web/public/locales/en/translation.json
touch exam-prep-platform/frontend-web/public/locales/mr/translation.json
touch exam-prep-platform/frontend-web/public/locales/hi/translation.json

touch exam-prep-platform/frontend-web/src/{main.tsx,App.tsx,i18n.ts}

# Frontend API
touch exam-prep-platform/frontend-web/src/api/{client.ts,auth.ts,users.ts,assignments.ts,questions.ts,submissions.ts,payments.ts,gpt.ts}

# Store
touch exam-prep-platform/frontend-web/src/store/{index.ts,authSlice.ts,examSlice.ts,uiSlice.ts}

# Hooks
touch exam-prep-platform/frontend-web/src/hooks/{useAuth.ts,useFaceDetection.ts,useExamTimer.ts,useViolation.ts}

# Components
touch exam-prep-platform/frontend-web/src/components/common/{Button.tsx,Input.tsx,Modal.tsx,Loader.tsx,Badge.tsx,Card.tsx,Navbar.tsx,Sidebar.tsx,LanguageToggle.tsx}
touch exam-prep-platform/frontend-web/src/components/auth/{OTPInput.tsx,PhoneInput.tsx}
touch exam-prep-platform/frontend-web/src/components/exam/{FaceVerification.tsx,QuestionCard.tsx,Timer.tsx,ViolationOverlay.tsx,ProgressBar.tsx,ExamNavigation.tsx}
touch exam-prep-platform/frontend-web/src/components/results/{ScoreCard.tsx,ReviewQuestion.tsx,GPTExplanation.tsx,Confetti.tsx}
touch exam-prep-platform/frontend-web/src/components/admin/{QuestionForm.tsx,BulkUpload.tsx,StudentTable.tsx,AnalyticsChart.tsx}

# Pages
touch exam-prep-platform/frontend-web/src/pages/auth/{LoginPage.tsx,OTPPage.tsx}
touch exam-prep-platform/frontend-web/src/pages/student/{DashboardPage.tsx,ProfileSetupPage.tsx,AssignmentsPage.tsx,ExamPage.tsx,ResultsPage.tsx}
touch exam-prep-platform/frontend-web/src/pages/admin/{AdminDashboard.tsx,StudentsPage.tsx,QuestionsPage.tsx,AssignmentsAdminPage.tsx,ViolationLogsPage.tsx}
touch exam-prep-platform/frontend-web/src/pages/superadmin/{SuperAdminDashboard.tsx,InstitutesPage.tsx,PlansPage.tsx,PaymentSettingsPage.tsx}

# Types & Utils
touch exam-prep-platform/frontend-web/src/types/index.ts
touch exam-prep-platform/frontend-web/src/utils/{faceApi.ts,examSecurity.ts,formatters.ts}

# Frontend web root
touch exam-prep-platform/frontend-web/{tailwind.config.js,tsconfig.json,vite.config.ts,package.json}

# Frontend mobile
touch exam-prep-platform/frontend-mobile/src/screens/auth/{LoginScreen.tsx,OTPScreen.tsx}
touch exam-prep-platform/frontend-mobile/src/screens/student/{DashboardScreen.tsx,ProfileSetupScreen.tsx,AssignmentsScreen.tsx,ExamScreen.tsx,ResultsScreen.tsx}
touch exam-prep-platform/frontend-mobile/src/screens/admin/{AdminDashboardScreen.tsx,StudentsScreen.tsx}

touch exam-prep-platform/frontend-mobile/src/components/{OTPInput.tsx,QuestionCard.tsx,Timer.tsx,ScoreCard.tsx}
touch exam-prep-platform/frontend-mobile/src/navigation/{RootNavigator.tsx,AuthNavigator.tsx,MainNavigator.tsx}
touch exam-prep-platform/frontend-mobile/src/api/client.ts
touch exam-prep-platform/frontend-mobile/src/store/index.ts
touch exam-prep-platform/frontend-mobile/src/i18n.ts

# Mobile root
touch exam-prep-platform/frontend-mobile/{app.json,package.json,eas.json}

# Root files
touch exam-prep-platform/{docker-compose.yml,README.md}

echo "✅ Project structure created successfully!"